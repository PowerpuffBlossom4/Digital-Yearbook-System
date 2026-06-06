require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const db = require("./config/db");
const upload = require("./middleware/upload");

const app = express();


require("./config/passport")(passport);

app.use(express.json());



;



app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://192.168.150.118:3000",
    "http://192.168.253.118:3000"
  ],
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if HTTPS
    sameSite: "lax"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/studentProfileRoutes"));


app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login-choice"
  }),
  (req, res) => {

    const user = req.user;

if (user.role === "student") {
  return res.redirect("http://localhost:3000/student");
}

if (user.role === "faculty") {
  return res.redirect("http://localhost:3000/faculty");
}

if (user.role === "admin") {
  return res.redirect("http://localhost:3000/admin");
}

return res.redirect("http://localhost:3000/login-choice");
});

app.post(
  "/api/upload",
  upload.single("image"),
  (req, res) => {

    res.json({
      imageUrl: req.file.path,
    });

  }
);

app.post("/api/posts", (req, res) => {

  const { user_id, content, image } = req.body;

  db.query(
    "INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)",
    [user_id, content, image],
    (err) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true,
      });

    }
  );
});

app.get("/api/posts", (req, res) => {

  db.query(`
    SELECT
  posts.*,
  users.full_name,
  users.profile_pic
    FROM posts
    JOIN users ON users.id = posts.user_id
    ORDER BY posts.id DESC
  `,
  (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);

  });

});

app.get("/api/posts/:id", (req, res) => {

  const userId = req.params.id;

  db.query(
    `
    SELECT
      posts.*,
      users.full_name,
      users.profile_pic
    FROM posts
    JOIN users
    ON users.id = posts.user_id
    WHERE posts.user_id = ?
    ORDER BY posts.id DESC
    `,
    [userId],
    (err, results) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(results);

    }
  );

});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    const user = result[0];

    // ONLY admin & faculty can use password login
    if (user.role !== "admin" && user.role !== "faculty") {
      return res.status(403).json({
        message: "Students must use Google login"
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Account not configured"
      });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid Password" });
      }

      return res.json({
        success: true,
        role: user.role
      });
    });
  });
});

app.get("/api/admin/stats", (req, res) => {

  const stats = {};

  // TOTAL STUDENTS
  db.query(
    "SELECT COUNT(*) AS totalStudents FROM users WHERE role = 'student'",
    (err, studentResult) => {

      if (err) return res.status(500).json(err);

      stats.totalStudents = studentResult[0].totalStudents;

      // TOTAL FACULTY
      db.query(
        "SELECT COUNT(*) AS totalFaculty FROM users WHERE role = 'faculty'",
        (err, facultyResult) => {

          if (err) return res.status(500).json(err);

          stats.totalFaculty = facultyResult[0].totalFaculty;

          // SEND RESPONSE
          return res.json(stats);
        }
      );
    }
  );
});

app.get("/api/admin/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", err });
    }

    res.json(results);
  });
});

app.post("/api/design/save", (req, res) => {

  const { data } = req.body;

  db.query(
    "INSERT INTO designs (design_data) VALUES (?)",
    [JSON.stringify(data)],
    (err) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true
      });
    }
  );
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
