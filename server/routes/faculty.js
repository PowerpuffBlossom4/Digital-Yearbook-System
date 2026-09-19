
const express = require("express");

const router = express.Router();

const db = require("../config/db");

router.get("/yearbook", (req, res) => {
  const sql = `
    SELECT
      fp.id,

      u.full_name AS name,

      /* Use faculty photo first, then user profile photo */
      COALESCE(
        fp.profile_photo,
        u.profile_pic
      ) AS photo,

      /* Position comes from faculty profile first,
         then registrar record */
      COALESCE(
        fp.position,
        rr.position
      ) AS position,

      /* Department comes from users first,
         then registrar record */
      COALESCE(
        u.department_program,
        rr.department_program
      ) AS department_program,

      /* Faculty yearbook message */
      fp.message

    FROM faculty_profiles fp

    INNER JOIN users u
      ON fp.user_id = u.id

    LEFT JOIN registrar_records rr
      ON LOWER(TRIM(u.email)) =
         LOWER(TRIM(rr.email))

    ORDER BY u.full_name ASC
  `;

  db.query(sql, (err, faculty) => {
    if (err) {
      console.error(
        "❌ Get faculty yearbook error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch faculty list",
      });
    }

    console.log(
      "✅ Faculty yearbook data:",
      faculty
    );

    res.json(faculty);
  });
});

module.exports = router;

