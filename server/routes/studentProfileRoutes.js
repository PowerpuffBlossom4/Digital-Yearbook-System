const router = require("express").Router();
const db = require("../config/db");
const path = require("path");
/*
  GET PROFILE (join users + student_profiles)
*/


router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      u.full_name,
      u.email,
      u.department_program,
      u.batch,
      u.profile_pic,
      sp.nickname,
      sp.motto
    FROM users u
    LEFT JOIN student_profiles sp 
    ON u.id = sp.user_id
    WHERE u.id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log("PROFILE ERROR:", err); // IMPORTANT
      return res.status(500).json(err);
    }

    if (!result.length) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(result[0]);
  });
});
/*
  CREATE / UPDATE PROFILE
*/
router.post("/save", (req, res) => {
  const { user_id, nickname, motto } = req.body;

  db.query(
    "SELECT * FROM student_profiles WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      // UPDATE
      if (result.length > 0) {
        db.query(
          `UPDATE student_profiles 
           SET nickname = ?, motto = ?
           WHERE user_id = ?`,
          [nickname, motto, user_id],
          (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ message: "Profile updated" });
          }
        );
      }

      // INSERT
      else {
        db.query(
          `INSERT INTO student_profiles (user_id, nickname, motto)
           VALUES (?, ?, ?)`,
          [user_id, nickname, motto],
          (err3) => {
            if (err3) return res.status(500).json(err3);
            res.json({ message: "Profile created" });
          }
        );
      }
    }
  );
});

module.exports = router;