const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("✅ studentRoutes.js LOADED");
/*
|--------------------------------------------------------------------------
| GET ALL STUDENTS FOR THE YEARBOOK DESIGN PANEL
|--------------------------------------------------------------------------
| Example:
| GET /api/students/yearbook
|
| Returns the student roster used by the yearbook editor.
|--------------------------------------------------------------------------
*/

router.get("/yearbook", (req, res) => {
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
    WHERE u.role = 'student'
    ORDER BY u.full_name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Get yearbook students list error:", err);

      return res.status(500).json({
        message: "Failed to load students.",
      });
    }

    return res.json(
      (results || []).map((student) => ({
        ...student,
        name: student.full_name || student.name || "Student",
        program:
          student.department_program ||
          student.program ||
          "",
        year:
          student.batch ||
          student.year ||
          student.batch_name ||
          student.academic_year ||
          "",
      }))
    );
  });
});

/*
|--------------------------------------------------------------------------
| GET STUDENTS FOR A SPECIFIC YEARBOOK
|--------------------------------------------------------------------------
| Example:
| GET /api/yearbooks/1/students
|
| The selected yearbook's academic_year is matched
| against users.batch.
|--------------------------------------------------------------------------
*/

router.get("/:yearbookId/students", (req, res) => {
  const { yearbookId } = req.params;

  console.log("📚 GET YEARBOOK STUDENTS");
  console.log("   Yearbook ID:", yearbookId);

  if (!yearbookId || isNaN(yearbookId)) {
    return res.status(400).json({
      message: "Invalid yearbook ID.",
    });
  }

  const yearbookSql = `
    SELECT
      id,
      title,
      batch_name,
      department_program,
      academic_year,
      status
    FROM yearbooks
    WHERE id = ?
    LIMIT 1
  `;

  db.query(
    yearbookSql,
    [yearbookId],
    (yearbookErr, yearbookResults) => {
      if (yearbookErr) {
        console.error("❌ Yearbook lookup error:", yearbookErr);

        return res.status(500).json({
          message: "Failed to load yearbook.",
        });
      }

      if (!yearbookResults.length) {
        console.log("❌ Yearbook not found:", yearbookId);

        return res.status(404).json({
          message: "Yearbook not found.",
        });
      }

      const yearbook = yearbookResults[0];

      console.log("📖 Yearbook found:");
      console.log("   ID:", yearbook.id);
      console.log("   Title:", yearbook.title);
      console.log("   Academic Year:", yearbook.academic_year);
      console.log(
        "   Academic Year Type:",
        typeof yearbook.academic_year
      );
      console.log("   Status:", yearbook.status);

      if (yearbook.status !== "published") {
        return res.status(403).json({
          message: "This yearbook is not published.",
        });
      }

      const academicYear = String(
        yearbook.academic_year
      ).trim();

      const studentsSql = `
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
          ON u.id = sp.user_id
        WHERE
          u.role = 'student'
          AND TRIM(CAST(u.batch AS CHAR)) = ?
        ORDER BY
          u.full_name ASC
      `;

      console.log(
        "🔎 Searching students with batch:",
        academicYear
      );

      db.query(
        studentsSql,
        [academicYear],
        (studentsErr, students) => {
          if (studentsErr) {
            console.error(
              "❌ Yearbook students query error:",
              studentsErr
            );

            return res.status(500).json({
              message: "Failed to load students.",
            });
          }

          console.log(
            "👨‍🎓 Students found:",
            students.length
          );

          console.table(students);

          return res.json({
            yearbook: {
              id: yearbook.id,
              title: yearbook.title,
              batch_name: yearbook.batch_name,
              department_program:
                yearbook.department_program,
              academic_year: yearbook.academic_year,
            },
            students: students,
            studentCount: students.length,
          });
        }
      );
    }
  );
});

module.exports = router;