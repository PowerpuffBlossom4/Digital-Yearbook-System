const router = require("express").Router();
const db = require("../config/db");
const uploadProfile = require("../middleware/profileUpload");

/*
=========================================================
GET PROFILE
Students + Faculty
=========================================================
*/

router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.department_program,
      u.batch,
      u.batch_name,
      u.profile_pic,

      /* STUDENT PROFILE */
      sp.nickname,
      sp.motto,

      /* OFFICIAL FACULTY INFORMATION */
      rr.position,

      /* FACULTY CUSTOM INFORMATION */
      fp.message

    FROM users u

    LEFT JOIN student_profiles sp
      ON u.id = sp.user_id

    LEFT JOIN registrar_records rr
      ON rr.email = u.email
      AND rr.role = 'faculty'

    LEFT JOIN faculty_profiles fp
      ON u.id = fp.user_id

    WHERE u.id = ?

    LIMIT 1
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("PROFILE ERROR:", err);

      return res.status(500).json({
        message: "Failed to load profile",
        error: err.message,
      });
    }

    if (!result.length) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const profile = result[0];

    res.json({
      ...profile,

      // Keep faculty message separate from student motto
      message: profile.message || "",

      // Position comes from registrar_records
      position: profile.position || "",
    });
  });
});


/*
UPLOAD PROFILE / YEARBOOK PHOTO

The uploaded image is automatically transformed
by Cloudinary to:

240 × 260
crop: fill
gravity: auto
*/
router.post(
  "/upload-avatar",
  uploadProfile.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded",
        });
      }

      console.log("PROFILE IMAGE:", req.file.path);

      res.json({
        success: true,
        imageUrl: req.file.path,
      });
    } catch (error) {
      console.error("AVATAR UPLOAD ERROR:", error);

      res.status(500).json({
        message: "Failed to upload profile picture",
        error: error.message,
      });
    }
  }
);



/*
=========================================================
SAVE PROFILE PHOTO URL
Students + Faculty
=========================================================
*/

router.put("/:id/avatar", (req, res) => {
  const { profile_pic } = req.body;
  const userId = req.params.id;

  if (!profile_pic) {
    return res.status(400).json({
      message: "Profile picture URL is required",
    });
  }

  // First update the main users table
  db.query(
    `
      UPDATE users
      SET profile_pic = ?
      WHERE id = ?
    `,
    [profile_pic, userId],
    (err) => {
      if (err) {
        console.error("UPDATE USER AVATAR ERROR:", err);

        return res.status(500).json({
          message: "Failed to update profile picture",
          error: err.message,
        });
      }

      // Check if this user is a faculty member
      db.query(
        `
          SELECT role
          FROM users
          WHERE id = ?
          LIMIT 1
        `,
        [userId],
        (roleErr, users) => {
          if (roleErr) {
            console.error("CHECK USER ROLE ERROR:", roleErr);

            return res.status(500).json({
              message: "Failed to check user role",
              error: roleErr.message,
            });
          }

          if (!users.length) {
            return res.status(404).json({
              message: "User not found",
            });
          }

          const role = users[0].role;

          // ==========================================
          // FACULTY
          // Also save photo to faculty_profiles
          // ==========================================
          if (role === "faculty") {
            db.query(
              `
                UPDATE faculty_profiles
                SET profile_photo = ?
                WHERE user_id = ?
              `,
              [profile_pic, userId],
              (facultyErr) => {
                if (facultyErr) {
                  console.error(
                    "UPDATE FACULTY PHOTO ERROR:",
                    facultyErr
                  );

                  return res.status(500).json({
                    message:
                      "Profile updated, but faculty photo could not be saved",
                    error: facultyErr.message,
                  });
                }

                return res.json({
                  success: true,
                  profile_pic,
                  message:
                    "Faculty profile picture updated successfully",
                });
              }
            );

            return;
          }

          // ==========================================
          // STUDENT
          // No faculty_profiles update needed
          // ==========================================
          return res.json({
            success: true,
            profile_pic,
            message: "Profile picture updated successfully",
          });
        }
      );
    }
  );
});




/*
=========================================================
CREATE / UPDATE PROFILE

Student:
  nickname
  motto

Faculty:
  message
=========================================================
*/

router.post("/save", (req, res) => {

  const {
    user_id,
    nickname,
    motto,
    message
  } = req.body;

  if (!user_id) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  // First determine the user's role
  db.query(
    `
      SELECT id, role
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [user_id],
    (roleErr, users) => {

      if (roleErr) {
        console.error(
          "PROFILE ROLE ERROR:",
          roleErr
        );

        return res.status(500).json({
          message: "Failed to verify user role",
        });
      }

      if (!users.length) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const role = users[0].role;


      /*
      =====================================================
      STUDENT
      =====================================================
      */

      if (role === "student") {

        db.query(
          `
            SELECT id
            FROM student_profiles
            WHERE user_id = ?
            LIMIT 1
          `,
          [user_id],
          (err, result) => {

            if (err) {
              console.error(
                "STUDENT PROFILE CHECK ERROR:",
                err
              );

              return res.status(500).json({
                message: "Failed to check student profile",
              });
            }


            // UPDATE
            if (result.length > 0) {

              db.query(
                `
                  UPDATE student_profiles
                  SET
                    nickname = ?,
                    motto = ?
                  WHERE user_id = ?
                `,
                [
                  nickname || "",
                  motto || "",
                  user_id
                ],
                (updateErr) => {

                  if (updateErr) {
                    console.error(
                      "STUDENT PROFILE UPDATE ERROR:",
                      updateErr
                    );

                    return res.status(500).json({
                      message: "Failed to update student profile",
                    });
                  }

                  return res.json({
                    success: true,
                    message: "Student profile updated",
                  });
                }
              );

            }

            // INSERT
            else {

              db.query(
                `
                  INSERT INTO student_profiles
                  (
                    user_id,
                    nickname,
                    motto
                  )
                  VALUES (?, ?, ?)
                `,
                [
                  user_id,
                  nickname || "",
                  motto || ""
                ],
                (insertErr) => {

                  if (insertErr) {
                    console.error(
                      "STUDENT PROFILE INSERT ERROR:",
                      insertErr
                    );

                    return res.status(500).json({
                      message: "Failed to create student profile",
                    });
                  }

                  return res.json({
                    success: true,
                    message: "Student profile created",
                  });
                }
              );
            }
          }
        );

        return;
      }


      /*
      =====================================================
      FACULTY
      =====================================================
      */

      if (role === "faculty") {

        db.query(
          `
            SELECT id
            FROM faculty_profiles
            WHERE user_id = ?
            LIMIT 1
          `,
          [user_id],
          (err, result) => {

            if (err) {
              console.error(
                "FACULTY PROFILE CHECK ERROR:",
                err
              );

              return res.status(500).json({
                message: "Failed to check faculty profile",
              });
            }


            // UPDATE
            if (result.length > 0) {

              db.query(
                `
                  UPDATE faculty_profiles
                  SET message = ?
                  WHERE user_id = ?
                `,
                [
                  message || "",
                  user_id
                ],
                (updateErr) => {

                  if (updateErr) {
                    console.error(
                      "FACULTY PROFILE UPDATE ERROR:",
                      updateErr
                    );

                    return res.status(500).json({
                      message: "Failed to update faculty profile",
                    });
                  }

                  return res.json({
                    success: true,
                    message: "Faculty profile updated",
                  });
                }
              );

            }

            // INSERT
            else {

              db.query(
                `
                  INSERT INTO faculty_profiles
                  (
                    user_id,
                    message
                  )
                  VALUES (?, ?)
                `,
                [
                  user_id,
                  message || ""
                ],
                (insertErr) => {

                  if (insertErr) {
                    console.error(
                      "FACULTY PROFILE INSERT ERROR:",
                      insertErr
                    );

                    return res.status(500).json({
                      message: "Failed to create faculty profile",
                    });
                  }

                  return res.json({
                    success: true,
                    message: "Faculty profile created",
                  });
                }
              );
            }
          }
        );

        return;
      }


      /*
      =====================================================
      OTHER ROLES
      =====================================================
      */

      return res.status(403).json({
        message: "This account cannot edit a profile.",
      });

    }
  );
});


module.exports = router;