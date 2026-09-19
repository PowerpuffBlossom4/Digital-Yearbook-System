const express = require("express");
const router = express.Router();

const db = require("../config/db");

const {
  sendYearbookPublishedEmail,
} = require("../utils/email");

const {
  createNotification,
} = require("../utils/notification");

/* =========================================================
   HELPERS
========================================================= */

function parsePages(yearbook) {
  if (!yearbook) return yearbook;

  let pages = yearbook.pages;

  if (typeof pages === "string") {
    try {
      pages = JSON.parse(pages);
    } catch (error) {
      pages = [];
    }
  }

  return {
    ...yearbook,
    pages: Array.isArray(pages) ? pages : [],
  };
}


/* =========================================================
   GET ALL YEARBOOKS
   ADMIN
========================================================= */

router.get("/", (req, res) => {
  const sql = `
    SELECT
      y.*,

      (
        SELECT COUNT(*)
        FROM yearbook_students ys
        WHERE ys.yearbook_id = y.id
      ) AS student_count

    FROM yearbooks y
    ORDER BY y.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Get yearbooks error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch yearbooks",
      });
    }

    const yearbooks = results.map(parsePages);

    res.json({
      success: true,
      yearbooks,
    });
  });
});


/* =========================================================
   GET PUBLISHED YEARBOOKS
   STUDENT YEARBOOK LIST
========================================================= */

router.get("/published", (req, res) => {
  const sql = `
    SELECT
      y.*,

      (
        SELECT COUNT(*)
        FROM yearbook_students ys
        WHERE ys.yearbook_id = y.id
      ) AS student_count

    FROM yearbooks y

    WHERE y.status = 'published'

    ORDER BY
      y.published_at DESC,
      y.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Get published yearbooks error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch published yearbooks",
      });
    }

    const yearbooks = results.map(parsePages);

    res.json({
      success: true,
      yearbooks,
    });
  });
});


/* =========================================================
   GET SINGLE YEARBOOK
========================================================= */

router.get("/:id", (req, res) => {
  const yearbookId = Number(req.params.id);

  if (!Number.isInteger(yearbookId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid yearbook ID",
    });
  }

  const sql = `
    SELECT
      y.*,

      (
        SELECT COUNT(*)
        FROM yearbook_students ys
        WHERE ys.yearbook_id = y.id
      ) AS student_count

    FROM yearbooks y
    WHERE y.id = ?
    LIMIT 1
  `;

  db.query(sql, [yearbookId], (err, results) => {
    if (err) {
      console.error("❌ Get yearbook error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch yearbook",
      });
    }

    if (!results.length) {
      return res.status(404).json({
        success: false,
        message: "Yearbook not found",
      });
    }

    res.json({
      success: true,
      yearbook: parsePages(results[0]),
    });
  });
});


/* =========================================================
   GET STUDENTS ASSIGNED TO YEARBOOK
========================================================= */

router.get("/:id/students", (req, res) => {
  const yearbookId = Number(req.params.id);

  if (!Number.isInteger(yearbookId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid yearbook ID",
    });
  }

  const yearbookSql = `
    SELECT
      batch_name,
      department_program
    FROM yearbooks
    WHERE id = ?
    LIMIT 1
  `;

  db.query(yearbookSql, [yearbookId], (yearbookErr, yearbookRows) => {
    if (yearbookErr) {
      console.error("❌ Get yearbook metadata error:", yearbookErr);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch yearbook metadata",
      });
    }

    const yearbook = yearbookRows?.[0] || {};
    const batchName = yearbook.batch_name || null;
    const programFilter = yearbook.department_program || null;

    const params = [yearbookId, batchName];
    const programClauses = [];

    if (programFilter) {
      params.push(programFilter);
      params.push(programFilter);
      programClauses.push(
        "AND u.department_program = ?"
      );
    }

    const sql = `
      SELECT DISTINCT
        u.id,
        u.full_name,
        u.email,
        u.department_program,
        u.batch,
        u.batch_name,
        u.profile_pic,

        sp.nickname,
        sp.motto

      FROM (
        SELECT ys.student_id AS student_id
        FROM yearbook_students ys
        WHERE ys.yearbook_id = ?

        UNION

        SELECT u2.id AS student_id
        FROM users u2
        WHERE u2.role = 'student'
          AND u2.batch_name = ?
      ) matched_students

      INNER JOIN users u
        ON u.id = matched_students.student_id

      LEFT JOIN student_profiles sp
        ON sp.user_id = u.id

      WHERE u.role = 'student'
        ${programClauses.join(" ")}

      ORDER BY u.full_name ASC
    `;

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("❌ Get yearbook students error:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch yearbook students",
        });
      }

      const students = results.map((student) => {
        const name = student.full_name || "";

        const initials = name
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join("");

        return {
          ...student,
          initials,
          image: student.profile_pic || null,
        };
      });

      res.json({
        success: true,
        students,
      });
    });
  });
});


/* =========================================================
   GET AVAILABLE STUDENTS
   ADMIN STUDENT SELECTION
========================================================= */

router.get("/:id/available-students", (req, res) => {
  const yearbookId = Number(req.params.id);

  if (!Number.isInteger(yearbookId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid yearbook ID",
    });
  }

  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.department_program,
      u.batch,
      u.batch_name,
      u.profile_pic,

      sp.nickname,
      sp.motto

    FROM users u

    LEFT JOIN student_profiles sp
      ON sp.user_id = u.id

    WHERE
      u.role = 'student'

      AND NOT EXISTS (
        SELECT 1
        FROM yearbook_students ys
        WHERE
          ys.yearbook_id = ?
          AND ys.student_id = u.id
      )

    ORDER BY
      u.full_name ASC
  `;

  db.query(sql, [yearbookId], (err, results) => {
    if (err) {
      console.error("❌ Get available students error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch available students",
      });
    }

    res.json({
      success: true,
      students: results,
    });
  });
});


/* =========================================================
   ADD STUDENTS TO YEARBOOK
=========================================================

Expected body:

{
  "student_ids": [1, 2, 3, 4]
}

========================================================= */

router.post("/:id/students", (req, res) => {
  const yearbookId = Number(req.params.id);

  let studentIds = req.body.student_ids;

  if (!Number.isInteger(yearbookId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid yearbook ID",
    });
  }

  if (!Array.isArray(studentIds)) {
    return res.status(400).json({
      success: false,
      message: "student_ids must be an array",
    });
  }

  studentIds = [
    ...new Set(
      studentIds
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];

  if (!studentIds.length) {
    return res.status(400).json({
      success: false,
      message: "No valid students were provided",
    });
  }

  db.query(
    `SELECT id FROM yearbooks WHERE id = ? LIMIT 1`,
    [yearbookId],
    (yearbookErr, yearbookResults) => {
      if (yearbookErr) {
        console.error(
          "❌ Check yearbook error:",
          yearbookErr
        );

        return res.status(500).json({
          success: false,
          message: "Failed to check yearbook",
        });
      }

      if (!yearbookResults.length) {
        return res.status(404).json({
          success: false,
          message: "Yearbook not found",
        });
      }

      const placeholders = studentIds
        .map(() => "?")
        .join(",");

      const verifyStudentsSql = `
        SELECT id
        FROM users
        WHERE
          role = 'student'
          AND id IN (${placeholders})
      `;

      db.query(
        verifyStudentsSql,
        studentIds,
        (studentErr, studentResults) => {
          if (studentErr) {
            console.error(
              "❌ Verify students error:",
              studentErr
            );

            return res.status(500).json({
              success: false,
              message: "Failed to verify students",
            });
          }

          const validIds = studentResults.map(
            (student) => student.id
          );

          if (!validIds.length) {
            return res.status(400).json({
              success: false,
              message: "No valid student accounts found",
            });
          }

          const values = validIds.map((studentId) => [
            yearbookId,
            studentId,
          ]);

          const insertSql = `
            INSERT IGNORE INTO yearbook_students
              (yearbook_id, student_id)
            VALUES ?
          `;

          db.query(
            insertSql,
            [values],
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error(
                  "❌ Add yearbook students error:",
                  insertErr
                );

                return res.status(500).json({
                  success: false,
                  message: "Failed to add students",
                });
              }

              res.json({
                success: true,
                message: "Students added to yearbook",
                added: insertResult.affectedRows,
              });
            }
          );
        }
      );
    }
  );
});


/* =========================================================
   REMOVE STUDENT FROM YEARBOOK
========================================================= */

router.delete("/:id/students/:studentId", (req, res) => {
  const yearbookId = Number(req.params.id);
  const studentId = Number(req.params.studentId);

  if (
    !Number.isInteger(yearbookId) ||
    !Number.isInteger(studentId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid yearbook or student ID",
    });
  }

  const sql = `
    DELETE FROM yearbook_students

    WHERE
      yearbook_id = ?
      AND student_id = ?
  `;

  db.query(
    sql,
    [yearbookId, studentId],
    (err, result) => {
      if (err) {
        console.error(
          "❌ Remove yearbook student error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to remove student",
        });
      }

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Student is not assigned to this yearbook",
        });
      }

      res.json({
        success: true,
        message: "Student removed from yearbook",
      });
    }
  );
});


// =========================================================
// NOTIFY YEARBOOK RECIPIENTS
// =========================================================

async function notifyYearbookRecipients(req, yearbookId, title) {
  const io = req.app.get("io");

  try {
    // =====================================================
    // GET YEARBOOK
    // =====================================================

    const yearbookResults = await new Promise((resolve, reject) => {
      db.query(
        `
          SELECT
            id,
            title,
            batch_name,
            department_program,
            academic_year
          FROM yearbooks
          WHERE id = ?
          LIMIT 1
        `,
        [yearbookId],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    if (!yearbookResults.length) {
      console.log(
        "⚠️ Yearbook not found for notifications:",
        yearbookId
      );
      return;
    }

    const yearbook = yearbookResults[0];

    const yearbookTitle = title || yearbook.title;

    console.log("========================================");
    console.log("📚 YEARBOOK NOTIFICATION");
    console.log("========================================");
    console.log("Yearbook ID:", yearbookId);
    console.log("Title:", yearbookTitle);
    console.log("Batch:", yearbook.batch_name);
    console.log("Program:", yearbook.department_program);
    console.log("Academic Year:", yearbook.academic_year);
    console.log("========================================");


    // =====================================================
    // GET STUDENTS
    //
    // A student is included if:
    //
    // 1. They were explicitly assigned in
    //    yearbook_students
    //
    // OR
    //
    // 2. Their batch_name matches the yearbook batch
    //
    // =====================================================

    const students = await new Promise((resolve, reject) => {
      let sql = `
        SELECT DISTINCT
          u.id,
          u.full_name,
          u.email,
          u.batch,
          u.batch_name,
          u.department_program
        FROM users u
        WHERE
          u.role = 'student'
          AND u.email IS NOT NULL
          AND TRIM(u.email) <> ''
          AND (
            EXISTS (
              SELECT 1
              FROM yearbook_students ys
              WHERE
                ys.yearbook_id = ?
                AND ys.student_id = u.id
            )
      `;

      const params = [yearbookId];

      // ===================================================
      // ALSO MATCH YEARBOOK BATCH
      // ===================================================

      if (yearbook.batch_name) {
        sql += `
            OR u.batch_name = ?
        `;

        params.push(yearbook.batch_name);
      }

      sql += `
          )
      `;

      // ===================================================
      // OPTIONAL PROGRAM FILTER
      // ===================================================

      if (yearbook.department_program) {
        sql += `
          AND u.department_program = ?
        `;

        params.push(yearbook.department_program);
      }

      sql += `
        ORDER BY u.full_name ASC
      `;

      console.log("📋 Student notification SQL params:", params);

      db.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });


    // =====================================================
    // DISPLAY STUDENTS FOUND
    // =====================================================

    console.log("========================================");
    console.log("👨‍🎓 STUDENTS FOUND FOR EMAIL");
    console.log("========================================");
    console.log("Total students:", students.length);

    students.forEach((student, index) => {
      console.log(
        `${index + 1}. ${student.full_name} | ${student.email} | ID: ${student.id}`
      );
    });

    console.log("========================================");


    // =====================================================
    // GET FACULTY
    // =====================================================

    const faculty = await new Promise((resolve, reject) => {
      db.query(
        `
          SELECT
            id,
            full_name,
            email
          FROM users
          WHERE
            role = 'faculty'
            AND email IS NOT NULL
            AND TRIM(email) <> ''
        `,
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });


    // =====================================================
    // NOTIFICATION MESSAGE
    // =====================================================

    const notificationMessage =
      `The yearbook "${yearbookTitle}" has been published.`;


    // =====================================================
    // STUDENT NOTIFICATIONS
    // =====================================================

    let studentSuccessCount = 0;
    let studentErrorCount = 0;
    const emailedRecipients = new Set();

    for (const student of students) {
      try {

        // -------------------------------------------------
        // IN-APP NOTIFICATION
        // -------------------------------------------------

        if (io) {
          createNotification(
            io,
            student.id,
            "Yearbook Published",
            notificationMessage,
            `/yearbooks/${yearbookId}`
          );
        }


        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        const recipientEmail = String(student.email)
          .trim()
          .toLowerCase();

        if (emailedRecipients.has(recipientEmail)) {
          console.log(
            `ℹ️ Duplicate student email skipped: ${student.email}`
          );
          continue;
        }

        const emailResult =
          await sendYearbookPublishedEmail({
            email: recipientEmail,
            name: student.full_name,
            title: yearbookTitle,
            batchName: yearbook.batch_name,
            academicYear: yearbook.academic_year,
            yearbookId: yearbookId,
          });

        emailedRecipients.add(recipientEmail);


        if (
          emailResult &&
          emailResult.success !== false
        ) {
          studentSuccessCount++;

          console.log(
            `✅ Student email sent: ${student.full_name} <${student.email}>`
          );
        } else {
          studentErrorCount++;

          console.log(
            `⚠️ Student email was not confirmed: ${student.email}`
          );
        }

      } catch (notificationError) {

        studentErrorCount++;

        console.error(
          `❌ Student notification error for ${student.email}:`,
          notificationError
        );
      }
    }


    // =====================================================
    // FACULTY NOTIFICATIONS
    // =====================================================

    let facultySuccessCount = 0;
    let facultyErrorCount = 0;

    for (const member of faculty) {
      try {

        // -------------------------------------------------
        // IN-APP NOTIFICATION
        // -------------------------------------------------

        if (io) {
          createNotification(
            io,
            member.id,
            "Yearbook Published",
            notificationMessage,
            `/yearbooks/${yearbookId}`
          );
        }


        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        const recipientEmail = String(member.email)
          .trim()
          .toLowerCase();

        if (emailedRecipients.has(recipientEmail)) {
          console.log(
            `ℹ️ Duplicate faculty email skipped: ${member.email}`
          );
          continue;
        }

        const emailResult =
          await sendYearbookPublishedEmail({
            email: recipientEmail,
            name: member.full_name,
            title: yearbookTitle,
            batchName: yearbook.batch_name,
            academicYear: yearbook.academic_year,
            yearbookId: yearbookId,
          });

        emailedRecipients.add(recipientEmail);


        if (
          emailResult &&
          emailResult.success !== false
        ) {
          facultySuccessCount++;

          console.log(
            `✅ Faculty email sent: ${member.full_name} <${member.email}>`
          );
        } else {
          facultyErrorCount++;

          console.log(
            `⚠️ Faculty email was not confirmed: ${member.email}`
          );
        }

      } catch (notificationError) {

        facultyErrorCount++;

        console.error(
          `❌ Faculty notification error for ${member.email}:`,
          notificationError
        );
      }
    }


    // =====================================================
    // FINAL SUMMARY
    // =====================================================

    console.log("");
    console.log("========================================");
    console.log("📧 YEARBOOK EMAIL SUMMARY");
    console.log("========================================");

    console.log(
      `👨‍🎓 Students found: ${students.length}`
    );

    console.log(
      `✅ Student emails sent: ${studentSuccessCount}`
    );

    console.log(
      `❌ Student email errors: ${studentErrorCount}`
    );

    console.log(
      `👩‍🏫 Faculty found: ${faculty.length}`
    );

    console.log(
      `✅ Faculty emails sent: ${facultySuccessCount}`
    );

    console.log(
      `❌ Faculty email errors: ${facultyErrorCount}`
    );

    console.log("========================================");
    console.log(
      `✅ Notifications completed for yearbook ${yearbookId}`
    );
    console.log("========================================");


  } catch (error) {

    console.error(
      "❌ notifyYearbookRecipients error:",
      error
    );
  }
}


/* =========================================================
   PUBLISH EXISTING YEARBOOK
========================================================= */

router.put("/publish/:id", (req, res) => {
  const yearbookId = Number(req.params.id);

  const {
    title,
    batch_name,
    academic_year,
    description,
    pages,
    thumbnail,
    theme_id,
    student_ids,
  } = req.body;

  if (!Number.isInteger(yearbookId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid yearbook ID",
    });
  }

  const pagesJson =
    typeof pages === "string"
      ? pages
      : JSON.stringify(pages || []);

  const updateSql = `
    UPDATE yearbooks

    SET
      title = ?,
      batch_name = ?,
      academic_year = ?,
      description = ?,
      pages = ?,
      thumbnail = ?,
      theme_id = ?,
      status = 'published',
      published_at = NOW()

    WHERE id = ?
  `;

  db.query(
    updateSql,
    [
      title || null,
      batch_name || null,
      academic_year || null,
      description || null,
      pagesJson,
      thumbnail || null,
      theme_id || null,
      yearbookId,
    ],
    (err, result) => {
      if (err) {
        console.error(
          "❌ Publish yearbook error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to publish yearbook",
          error: err.message,
        });
      }

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Yearbook not found",
        });
      }

      /* -----------------------------------------------
         OPTIONAL STUDENT ASSIGNMENT
      ------------------------------------------------ */

      if (Array.isArray(student_ids)) {
        const cleanedIds = [
          ...new Set(
            student_ids
              .map(Number)
              .filter(
                (id) =>
                  Number.isInteger(id) && id > 0
              )
          ),
        ];

        if (cleanedIds.length) {
          const values = cleanedIds.map(
            (studentId) => [
              yearbookId,
              studentId,
            ]
          );

          db.query(
            `
              INSERT IGNORE INTO yearbook_students
                (yearbook_id, student_id)
              VALUES ?
            `,
            [values],
            (assignmentErr) => {
              if (assignmentErr) {
                console.error(
                  "❌ Student assignment error:",
                  assignmentErr
                );
              }

              res.json({
                success: true,
                message: "Yearbook published successfully",
                yearbookId,
              });

              notifyYearbookRecipients(
                req,
                yearbookId,
                title
              );
            }
          );

          return;
        }
      }

      res.json({
        success: true,
        message: "Yearbook published successfully",
        yearbookId,
      });

      notifyYearbookRecipients(
        req,
        yearbookId,
        title
      );
    }
  );
});


/* =========================================================
   SAVE NEW DRAFT
========================================================= */

router.post("/save-draft", (req, res) => {
  const {
    title,
    batch_name,
    department_program,
    academic_year,
    description,
    pages,
    thumbnail,
    theme_id,
  } = req.body;

  const pagesJson =
    typeof pages === "string"
      ? pages
      : JSON.stringify(pages || []);

  const sql = `
    INSERT INTO yearbooks
    (
      title,
      batch_name,
      department_program,
      academic_year,
      description,
      pages,
      thumbnail,
      theme_id,
      status
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')
  `;

  db.query(
    sql,
    [
      title || null,
      batch_name || null,
      department_program || null,
      academic_year || null,
      description || null,
      pagesJson,
      thumbnail || null,
      theme_id || null,
    ],
    (err, result) => {
      if (err) {
        console.error(
          "❌ Save draft error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to save draft",
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Draft saved successfully",
        yearbookId: result.insertId,
      });
    }
  );
});


/* =========================================================
   UPDATE EXISTING DRAFT
========================================================= */

router.put("/save-draft/:id", (req, res) => {
  const yearbookId = Number(req.params.id);

  const {
    title,
    batch_name,
    department_program,
    academic_year,
    description,
    pages,
    thumbnail,
    theme_id,
  } = req.body;

  if (!Number.isInteger(yearbookId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid yearbook ID",
    });
  }

  const pagesJson =
    typeof pages === "string"
      ? pages
      : JSON.stringify(pages || []);

  const sql = `
    UPDATE yearbooks

    SET
      title = ?,
      batch_name = ?,
      department_program = ?,
      academic_year = ?,
      description = ?,
      pages = ?,
      thumbnail = ?,
      theme_id = ?,
      status = 'draft',
      published_at = NULL

    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title || null,
      batch_name || null,
      department_program || null,
      academic_year || null,
      description || null,
      pagesJson,
      thumbnail || null,
      theme_id || null,
      yearbookId,
    ],
    (err, result) => {
      if (err) {
        console.error(
          "❌ Update draft error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to update draft",
          error: err.message,
        });
      }

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Yearbook not found",
        });
      }

      res.json({
        success: true,
        message: "Draft updated successfully",
        yearbookId,
      });
    }
  );
});


/* =========================================================
   CREATE + PUBLISH YEARBOOK
========================================================= */

router.post("/publish", (req, res) => {
  const {
    title,
    batch_name,
    department_program,
    academic_year,
    description,
    pages,
    thumbnail,
    theme_id,
    student_ids,
  } = req.body;

  const pagesJson =
    typeof pages === "string"
      ? pages
      : JSON.stringify(pages || []);

  const insertSql = `
    INSERT INTO yearbooks
    (
      title,
      batch_name,
      department_program,
      academic_year,
      description,
      pages,
      thumbnail,
      theme_id,
      status,
      published_at
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW())
  `;

  db.query(
    insertSql,
    [
      title || null,
      batch_name || null,
      department_program || null,
      academic_year || null,
      description || null,
      pagesJson,
      thumbnail || null,
      theme_id || null,
    ],
    (err, result) => {
      if (err) {
        console.error(
          "❌ Create published yearbook error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to publish yearbook",
          error: err.message,
        });
      }

      const yearbookId = result.insertId;

      const cleanedIds = Array.isArray(student_ids)
        ? [
            ...new Set(
              student_ids
                .map(Number)
                .filter(
                  (id) =>
                    Number.isInteger(id) &&
                    id > 0
                )
            ),
          ]
        : [];

      if (!cleanedIds.length) {
        res.status(201).json({
          success: true,
          message: "Yearbook published successfully",
          yearbookId,
        });

        notifyYearbookRecipients(
          req,
          yearbookId,
          title
        );

        return;
      }

      const values = cleanedIds.map(
        (studentId) => [
          yearbookId,
          studentId,
        ]
      );

      db.query(
        `
          INSERT IGNORE INTO yearbook_students
            (yearbook_id, student_id)
          VALUES ?
        `,
        [values],
        (assignmentErr) => {
          if (assignmentErr) {
            console.error(
              "❌ Publish student assignment error:",
              assignmentErr
            );

            return res.status(500).json({
              success: false,
              message:
                "Yearbook was created but students could not be assigned",
              yearbookId,
            });
          }

          res.status(201).json({
            success: true,
            message:
              "Yearbook published successfully",
            yearbookId,
          });

          notifyYearbookRecipients(
            req,
            yearbookId,
            title
          );
        }
      );
    }
  );
});


/* =========================================================
   DELETE YEARBOOK
========================================================= */

router.delete("/:id", (req, res) => {
  const yearbookId = Number(req.params.id);

  if (!Number.isInteger(yearbookId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid yearbook ID",
    });
  }

  db.query(
    `DELETE FROM yearbooks WHERE id = ?`,
    [yearbookId],
    (err, result) => {
      if (err) {
        console.error(
          "❌ Delete yearbook error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to delete yearbook",
        });
      }

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Yearbook not found",
        });
      }

      res.json({
        success: true,
        message: "Yearbook deleted successfully",
      });
    }
  );
});


module.exports = router;