require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");
const {
  createNotification,
} = require("./utils/notification");
const {
  buildNotificationMessage,
  buildNotificationLink,
} = require("./utils/notificationText");

const {
  verifyEmailTransporter,
} = require("./utils/email");

const db = require("./config/db");
const upload = require("./middleware/upload");

const facultyRoutes = require("./routes/faculty");
const yearbookRoutes = require("./routes/yearbooks");
const adminRoutes = require("./routes/admin");
const app = express();



/* ======================
   CREATE HTTP + SOCKET SERVER
====================== */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://192.168.150.118:3000",
      "http://192.168.253.118:3000"
    ],
    credentials: true,
  },
});

app.set("io", io);

/* ======================
   SOCKET CONNECTION
====================== */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const joinUserRoom = (userId) => {
    const safeUserId = Number(userId);

    if (!safeUserId || Number.isNaN(safeUserId)) {
      console.error("❌ Invalid userId for socket room join:", userId);
      return;
    }

    const roomName = `user_${safeUserId}`;
    socket.join(roomName);
    console.log("📡 Socket joined room:", roomName);
  };

  socket.on("join", (userId) => {
    joinUserRoom(userId);
  });

  socket.on("joinUser", (userId) => {
    joinUserRoom(userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ======================
   MIDDLEWARES
====================== */
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://192.168.150.118:3000",
    "http://192.168.253.118:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options(/(.*)/, cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body too large",
    });
  }

  next(err);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

require("./config/passport")(passport);


app.use("/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/studentProfileRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/faculty", facultyRoutes);
app.use("/api/yearbooks", yearbookRoutes);
app.use("/api/admin", adminRoutes);
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

// ============================================================
// STUDENT ANNOUNCEMENTS
// ============================================================

app.get("/api/announcements/student/:userId", (req, res) => {
  const userId = Number(req.params.userId);

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.role,
      sp.user_id AS profile_exists,
      (
        SELECT COUNT(*)
        FROM memories m
        WHERE m.user_id = u.id
      ) AS memory_count
    FROM users u
    LEFT JOIN student_profiles sp
      ON sp.user_id = u.id
    WHERE u.id = ?
      AND u.role = 'student'
    LIMIT 1
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Announcement check error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to load announcements",
      });
    }

    if (!results || results.length === 0) {
      return res.json([]);
    }

    const student = results[0];
    const announcements = [];

    // ========================================================
    // PROFILE REMINDER
    // ========================================================

    if (!student.profile_exists) {
      announcements.push({
        id: "profile-reminder",
        title: "Complete Your Yearbook Profile",
        message:
          "Your yearbook profile is not complete yet. Please add your profile information so you can be included in the digital yearbook.",
        type: "automatic",
        priority: "important",
        created_at: new Date(),
      });
    }

    // ========================================================
    // MEMORY REMINDER
    // ========================================================

    if (Number(student.memory_count) === 0) {
      announcements.push({
        id: "memory-reminder",
        title: "Share Your Memories",
        message:
          "You haven't submitted a memory yet. Share a special moment, photo, or message with your batch.",
        type: "automatic",
        priority: "normal",
        created_at: new Date(),
      });
    }

    return res.json(announcements);
  });
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
  "INSERT INTO posts (user_id, content, image, created_at) VALUES (?, ?, ?, NOW())",
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
  const userId = req.user?.id || req.query.user_id || 0;

  db.query(
    `
    SELECT
      posts.*,
      users.full_name,
      users.profile_pic,
      users.batch,

      COUNT(post_reactions.id) AS likes,

      MAX(
        CASE
          WHEN post_reactions.user_id = ? THEN 1
          ELSE 0
        END
      ) AS liked

    FROM posts

    JOIN users
      ON users.id = posts.user_id

    LEFT JOIN post_reactions
      ON post_reactions.post_id = posts.id

    GROUP BY posts.id

    ORDER BY posts.id DESC
    `,
    [userId],
    (err, results) => {
      if (err) {
        console.error("❌ FETCH POSTS ERROR:", err);
        return res.status(500).json({
          message: "Failed to fetch posts",
          error: err,
        });
      }

      const formattedPosts = results.map((post) => ({
        ...post,
        likes: Number(post.likes || 0),
        liked: Boolean(Number(post.liked || 0)),
      }));

      res.json(formattedPosts);
    }
  );
});

app.get("/api/posts/:id", (req, res) => {
  const postId = Number(req.params.id);
  const userId = Number(req.query.user_id || 0);

  if (!postId) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID",
    });
  }

  db.query(
    `
    SELECT
      posts.id,
      posts.user_id,
      posts.content,
      posts.image,
      posts.created_at,
      users.full_name,
      users.profile_pic,

      COUNT(DISTINCT post_reactions.id) AS likes,

      MAX(
        CASE
          WHEN post_reactions.user_id = ? THEN 1
          ELSE 0
        END
      ) AS liked

    FROM posts

    INNER JOIN users
      ON users.id = posts.user_id

    LEFT JOIN post_reactions
      ON post_reactions.post_id = posts.id

    WHERE posts.user_id = ?

    GROUP BY posts.id

    ORDER BY posts.id DESC
    `,
    [userId, postId],
    (err, results) => {
      if (err) {
        console.error(
          "❌ FETCH PROFILE POSTS ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch posts",
          error: err,
        });
      }

      const formattedPosts = (results || []).map(
        (post) => ({
          ...post,
          likes: Number(post.likes || 0),
          liked: Boolean(Number(post.liked || 0)),
        })
      );

      res.json(formattedPosts);
    }
  );
});

app.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result) => {

      if (err) {
        console.error("LOGIN DATABASE ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Server Error"
        });
      }

      if (result.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid Email"
        });
      }

      const user = result[0];

      // Only admin and faculty can use password login
      if (user.role !== "admin" && user.role !== "faculty") {
        return res.status(403).json({
          success: false,
          message: "Students must use Google login"
        });
      }

      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: "Account not configured"
        });
      }

      bcrypt.compare(
        password,
        user.password,
        (err, isMatch) => {

          if (err) {
            console.error("PASSWORD COMPARE ERROR:", err);

            return res.status(500).json({
              success: false,
              message: "Server Error"
            });
          }

          if (!isMatch) {
            return res.status(401).json({
              success: false,
              message: "Invalid Password"
            });
          }

          /*
          ============================================
          CREATE PASSPORT SESSION
          ============================================
          */

          req.login(user, (loginError) => {

            if (loginError) {
              console.error(
                "PASSPORT LOGIN ERROR:",
                loginError
              );

              return next(loginError);
            }

            console.log(
              "✅ Login successful:",
              user.email,
              "| Role:",
              user.role,
              "| Session:",
              req.sessionID
            );

            return res.json({
              success: true,
              role: user.role,
              user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                profile_pic: user.profile_pic
              }
            });

          });

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

app.post("/api/posts/:id/react", (req, res) => {
  const postId = req.params.id;
  const { user_id } = req.body;

  // =========================================================
  // VALIDATION
  // =========================================================

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "user_id is required",
    });
  }

  // =========================================================
  // CHECK EXISTING REACTION
  // =========================================================

  db.query(
    `
    SELECT *
    FROM post_reactions
    WHERE post_id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [postId, user_id],
    (err, result) => {
      if (err) {
        console.error(
          "❌ CHECK REACTION ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to check reaction",
          error: err,
        });
      }

      // =====================================================
      // UNLIKE
      // =====================================================

      if (result.length > 0) {
        db.query(
          `
          DELETE FROM post_reactions
          WHERE post_id = ?
            AND user_id = ?
          `,
          [postId, user_id],
          (deleteErr) => {
            if (deleteErr) {
              console.error(
                "❌ DELETE REACTION ERROR:",
                deleteErr
              );

              return res.status(500).json({
                success: false,
                message: "Failed to remove reaction",
                error: deleteErr,
              });
            }

            // ===============================================
            // GET TOTAL LIKES
            // ===============================================

            db.query(
              `
              SELECT COUNT(*) AS likes
              FROM post_reactions
              WHERE post_id = ?
              `,
              [postId],
              (countErr, countResult) => {
                if (countErr) {
                  console.error(
                    "❌ COUNT REACTION ERROR:",
                    countErr
                  );

                  return res.status(500).json({
                    success: false,
                    message: "Failed to count reactions",
                    error: countErr,
                  });
                }

                return res.json({
                  success: true,
                  liked: false,
                  likes: Number(
                    countResult[0]?.likes || 0
                  ),
                });
              }
            );
          }
        );

        return;
      }

      // =====================================================
      // LIKE
      // =====================================================

      db.query(
        `
        INSERT INTO post_reactions
          (post_id, user_id, reaction)
        VALUES
          (?, ?, 'heart')
        `,
        [postId, user_id],
        (insertErr) => {
          if (insertErr) {
            console.error(
              "❌ INSERT REACTION ERROR:",
              insertErr
            );

            return res.status(500).json({
              success: false,
              message: "Failed to add reaction",
              error: insertErr,
            });
          }

          // ===============================================
          // GET TOTAL LIKES
          // ===============================================

          db.query(
            `
            SELECT COUNT(*) AS likes
            FROM post_reactions
            WHERE post_id = ?
            `,
            [postId],
            (countErr, countResult) => {
              if (countErr) {
                console.error(
                  "❌ COUNT REACTION ERROR:",
                  countErr
                );

                return res.status(500).json({
                  success: false,
                  message: "Failed to count reactions",
                  error: countErr,
                });
              }

              // =============================================
              // GET POST OWNER
              // =============================================

              db.query(
                `
                SELECT user_id
                FROM posts
                WHERE id = ?
                LIMIT 1
                `,
                [postId],
                (ownerErr, ownerResult) => {
                  if (ownerErr) {
                    console.error(
                      "❌ OWNER QUERY ERROR:",
                      ownerErr
                    );

                    return res.json({
                      success: true,
                      liked: true,
                      likes: Number(
                        countResult[0]?.likes || 0
                      ),
                    });
                  }

                  // =========================================
                  // POST FOUND
                  // =========================================

                  if (ownerResult.length > 0) {
                    const postOwnerId =
                      ownerResult[0].user_id;

                    console.log(
                      "👤 POST OWNER:",
                      postOwnerId
                    );

                    console.log(
                      "👤 LIKER:",
                      user_id
                    );

                    // =======================================
                    // DON'T NOTIFY YOURSELF
                    // =======================================

                    if (
                      Number(postOwnerId) !==
                      Number(user_id)
                    ) {
                      // =====================================
                      // GET LIKER NAME
                      // =====================================

                      db.query(
                        `
                        SELECT full_name
                        FROM users
                        WHERE id = ?
                        LIMIT 1
                        `,
                        [user_id],
                        (likerErr, likerResult) => {
                          if (likerErr) {
                            console.error(
                              "❌ LIKER QUERY ERROR:",
                              likerErr
                            );

                            return res.json({
                              success: true,
                              liked: true,
                              likes: Number(
                                countResult[0]?.likes || 0
                              ),
                            });
                          }

                          const likerName =
                            likerResult.length > 0 &&
                            likerResult[0].full_name
                              ? likerResult[0].full_name.trim()
                              : "Someone";

                          console.log(
                            "❤️ LIKER NAME:",
                            likerName
                          );

                          const io =
                            req.app.get("io");

                          // =================================
                          // CREATE LIKE NOTIFICATION
                          // =================================

                          createNotification(
                            io,
                            postOwnerId,
                            "like",
                            `${likerName} liked your post`,
                            buildNotificationLink(
                              postId
                            )
                          );

                          console.log(
                            "🔔 Like notification sent to:",
                            postOwnerId
                          );

                          return res.json({
                            success: true,
                            liked: true,
                            likes: Number(
                              countResult[0]?.likes || 0
                            ),
                          });
                        }
                      );

                      return;
                    }

                    console.log(
                      "ℹ️ User liked their own post. No notification."
                    );
                  }

                  return res.json({
                    success: true,
                    liked: true,
                    likes: Number(
                      countResult[0]?.likes || 0
                    ),
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});


// ============================================================
// CREATE COMMENT / REPLY
// ============================================================
app.post("/api/posts/:id/comment", (req, res) => {
  const postId = Number(req.params.id);

  const {
    user_id,
    comment,
    parent_comment_id,
  } = req.body;

  const currentUserId = Number(user_id);

  if (!postId || !currentUserId || !comment?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Post, user, and comment are required.",
    });
  }

  // ============================================================
  // GET SENDER INFORMATION
  // ============================================================
  db.query(
    `
    SELECT
      id,
      full_name,
      profile_pic
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [currentUserId],
    (userErr, userResult) => {
      if (userErr) {
        console.error(
          "❌ GET COMMENT USER ERROR:",
          userErr
        );

        return res.status(500).json({
          success: false,
          message: "Failed to get user information.",
        });
      }

      if (
        !userResult ||
        userResult.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      const sender = userResult[0];

      const senderName =
        sender.full_name || "Someone";

      // ========================================================
      // ROOT COMMENT
      // ========================================================
      if (
        parent_comment_id === null ||
        parent_comment_id === undefined ||
        parent_comment_id === "" ||
        Number(parent_comment_id) === 0
      ) {
        db.query(
          `
          INSERT INTO comments
          (
            post_id,
            user_id,
            parent_comment_id,
            comment
          )
          VALUES (?, ?, NULL, ?)
          `,
          [
            postId,
            currentUserId,
            comment.trim(),
          ],
          (insertErr, result) => {
            if (insertErr) {
              console.error(
                "❌ CREATE COMMENT ERROR:",
                insertErr
              );

              return res.status(500).json({
                success: false,
                message: "Failed to create comment.",
              });
            }

            const commentId =
              result.insertId;

            console.log(
              "=========================================="
            );
            console.log(
              "📝 NEW COMMENT"
            );
            console.log(
              "Post ID:",
              postId
            );
            console.log(
              "User ID:",
              currentUserId
            );
            console.log(
              "Comment ID:",
              commentId
            );
            console.log(
              "Comment:",
              comment.trim()
            );
            console.log(
              "=========================================="
            );

            // ==================================================
            // GET POST OWNER
            // ==================================================
            db.query(
              `
              SELECT
                user_id
              FROM posts
              WHERE id = ?
              LIMIT 1
              `,
              [postId],
              (postErr, postResult) => {
                if (postErr) {
                  console.error(
                    "❌ GET POST OWNER ERROR:",
                    postErr
                  );
                }

                if (
                  !postErr &&
                  postResult &&
                  postResult.length > 0
                ) {
                  const postOwnerId =
                    Number(
                      postResult[0].user_id
                    );

                  // ==========================================
                  // DO NOT NOTIFY YOURSELF
                  // ==========================================
                  if (
                    postOwnerId !==
                    currentUserId
                  ) {
                    createNotification(
                      io,
                      postOwnerId,
                      "comment",
                      buildNotificationMessage(
                        senderName,
                        "comment"
                      ),
                      buildNotificationLink(
                        postId
                      )
                    );
                  } else {
                    console.log(
                      "ℹ️ User commented on their own post. No notification."
                    );
                  }
                }
              }
            );

            return res.status(201).json({
              success: true,
              id: commentId,
              post_id: postId,
              user_id: currentUserId,
              parent_comment_id: null,
              comment: comment.trim(),
              full_name: senderName,
              profile_pic:
                sender.profile_pic,
            });
          }
        );

        return;
      }

      // ========================================================
      // REPLY
      // ========================================================

      const parentId =
        Number(parent_comment_id);

      if (!parentId) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent comment.",
        });
      }

      // ========================================================
      // GET PARENT COMMENT
      // ========================================================
      db.query(
        `
        SELECT
          comments.id,
          comments.post_id,
          comments.user_id,
          comments.parent_comment_id,
          comments.comment,
          users.full_name
        FROM comments
        INNER JOIN users
          ON users.id = comments.user_id
        WHERE comments.id = ?
          AND comments.post_id = ?
        LIMIT 1
        `,
        [
          parentId,
          postId,
        ],
        (parentErr, parentResult) => {
          if (parentErr) {
            console.error(
              "❌ GET PARENT COMMENT ERROR:",
              parentErr
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to get parent comment.",
            });
          }

          if (
            !parentResult ||
            parentResult.length === 0
          ) {
            return res.status(404).json({
              success: false,
              message:
                "Parent comment not found.",
            });
          }

          const parentComment =
            parentResult[0];

          const parentUserId =
            Number(
              parentComment.user_id
            );

          const parentUserName =
            parentComment.full_name ||
            "Someone";

          console.log(
            "=========================================="
          );

          console.log(
            "🔎 REPLY INFORMATION"
          );

          console.log(
            "Reply Sender:",
            senderName,
            `(ID: ${currentUserId})`
          );

          console.log(
            "Parent Comment ID:",
            parentId
          );

          console.log(
            "Parent Comment Owner:",
            parentUserName,
            `(ID: ${parentUserId})`
          );

          console.log(
            "Same User?:",
            currentUserId ===
              parentUserId
          );

          console.log(
            "=========================================="
          );

          // ======================================================
          // 🚫 IMPORTANT:
          // BLOCK SELF-REPLY BEFORE INSERT
          // ======================================================
          if (
            currentUserId ===
            parentUserId
          ) {
            console.log(
              "🚫 BLOCKED: User attempted to reply to their own comment."
            );

            return res.status(400).json({
              success: false,
              message:
                "You cannot reply to your own comment.",
            });
          }

          // ======================================================
          // INSERT REPLY
          // ======================================================
          db.query(
            `
            INSERT INTO comments
            (
              post_id,
              user_id,
              parent_comment_id,
              comment
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              postId,
              currentUserId,
              parentId,
              comment.trim(),
            ],
            (insertErr, result) => {
              if (insertErr) {
                console.error(
                  "❌ CREATE REPLY ERROR:",
                  insertErr
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to create reply.",
                });
              }

              const replyId =
                result.insertId;

              console.log(
                "=========================================="
              );

              console.log(
                "✅ REPLY INSERTED:",
                replyId
              );

              console.log(
                "Reply Sender:",
                senderName,
                `(ID: ${currentUserId})`
              );

              console.log(
                "Parent Comment:",
                parentId
              );

              console.log(
                "Parent Owner:",
                parentUserName,
                `(ID: ${parentUserId})`
              );

              console.log(
                "=========================================="
              );

              // ==================================================
              // NOTIFY PARENT COMMENT OWNER
              // ==================================================
if (parentUserId !== currentUserId) {
  createNotification(
    io,
    parentUserId,
    "reply",
    buildNotificationMessage(
      senderName,
      "reply"
    ),
    buildNotificationLink(postId)
  );
}

              return res.status(201).json({
                success: true,
                id: replyId,
                post_id: postId,
                user_id: currentUserId,
                parent_comment_id:
                  parentId,
                comment:
                  comment.trim(),
                full_name:
                  senderName,
                profile_pic:
                  sender.profile_pic,
                created_at:
                  new Date().toISOString(),
              });
            }
          );
        }
      );
    }
  );
});


// ============================================================
// GET COMMENTS FOR POST
// ============================================================
app.get(
  "/api/posts/:id/comments",
  (req, res) => {
    const postId =
      Number(req.params.id);

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    db.query(
      `
      SELECT
        comments.id,
        comments.post_id,
        comments.user_id,
        comments.parent_comment_id,
        comments.comment,
        comments.created_at,
        users.full_name,
        users.profile_pic
      FROM comments
      INNER JOIN users
        ON users.id = comments.user_id
      WHERE comments.post_id = ?
      ORDER BY comments.created_at ASC
      `,
      [postId],
      (err, results) => {
        if (err) {
          console.error(
            "❌ GET COMMENTS ERROR:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load comments.",
          });
        }

        return res.json({
          success: true,
          comments: results || [],
        });
      }
    );
  }
);


// =========================================================
// CREATE STUDENT MEMORY / FACULTY MESSAGE
// =========================================================
app.post(
  "/api/memories",
  upload.array("images", 20),
  (req, res) => {

    // -----------------------------------------------------
    // AUTHENTICATION
    // -----------------------------------------------------
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const userId = Number(req.user.id);
    const userRole = String(req.user.role || "").toLowerCase();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user.",
      });
    }

    // -----------------------------------------------------
    // MESSAGE
    // -----------------------------------------------------
    const message =
      typeof req.body.message === "string"
        ? req.body.message.trim()
        : "";

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please write a message.",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message must not exceed 500 characters.",
      });
    }

    // =====================================================
    // FACULTY
    // FACULTY CAN ONLY SUBMIT A MESSAGE
    // =====================================================
    if (userRole === "faculty") {

      console.log("==========================================");
      console.log("💬 NEW FACULTY MESSAGE");
      console.log("👤 USER ID:", userId);
      console.log("👤 ROLE:", userRole);
      console.log("💬 MESSAGE:", message);
      console.log("🖼️ IMAGES RECEIVED:", req.files?.length || 0);
      console.log("==========================================");

      // ---------------------------------------------------
      // SECURITY:
      // Faculty should never save uploaded images.
      // If an image was somehow submitted, ignore it.
      // ---------------------------------------------------

      db.query(
        `
          INSERT INTO memories
          (
            user_id,
            message,
            image,
            status
          )
          VALUES (?, ?, NULL, 'pending')
        `,
        [
          userId,
          message,
        ],
        (err, result) => {

          if (err) {
            console.error(
              "❌ FACULTY MESSAGE INSERT ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message: "Failed to save faculty message.",
              error: err.message,
            });
          }

          console.log(
            "✅ FACULTY MESSAGE SAVED:",
            result.insertId
          );

          return res.status(201).json({
            success: true,
            message:
              "Your faculty message has been submitted successfully and is waiting for approval.",
            count: 1,
            memories: [
              {
                id: result.insertId,
                user_id: userId,
                message,
                image: null,
                status: "pending",
              },
            ],
          });
        }
      );

      return;
    }

    // =====================================================
    // STUDENT
    // STUDENT MUST HAVE AT LEAST ONE IMAGE
    // =====================================================

    if (userRole === "student") {

      // ---------------------------------------------------
      // CHECK FILES
      // ---------------------------------------------------
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one image.",
        });
      }

      if (req.files.length > 20) {
        return res.status(400).json({
          success: false,
          message: "You can upload a maximum of 20 images.",
        });
      }

      console.log("==========================================");
      console.log("📸 NEW STUDENT MEMORY UPLOAD");
      console.log("👤 USER ID:", userId);
      console.log("👤 ROLE:", userRole);
      console.log(
        "🖼️ NUMBER OF IMAGES:",
        req.files.length
      );
      console.log("💬 MESSAGE:", message);
      console.log("==========================================");

      // ---------------------------------------------------
      // CREATE ONE DATABASE ROW PER IMAGE
      // ---------------------------------------------------
      const values = req.files.map((file) => [
        userId,
        message,
        file.path,
        "pending",
      ]);

      const placeholders = values
        .map(() => "(?, ?, ?, ?)")
        .join(", ");

      const flatValues = values.flat();

      const sql = `
        INSERT INTO memories
        (
          user_id,
          message,
          image,
          status
        )
        VALUES ${placeholders}
      `;

      // ---------------------------------------------------
      // INSERT STUDENT MEMORIES
      // ---------------------------------------------------
      db.query(
        sql,
        flatValues,
        (err, result) => {

          if (err) {
            console.error(
              "❌ MULTIPLE MEMORY INSERT ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message: "Failed to save memories.",
              error: err.message,
            });
          }

          console.log(
            "✅ MEMORIES INSERTED:",
            result.affectedRows
          );

          const insertedMemories =
            req.files.map((file) => ({
              user_id: userId,
              message,
              image: file.path,
              status: "pending",
            }));

          return res.status(201).json({
            success: true,

            message: `${result.affectedRows} ${
              result.affectedRows === 1
                ? "memory"
                : "memories"
            } uploaded successfully and are waiting for approval.`,

            count: result.affectedRows,

            memories: insertedMemories,
          });
        }
      );

      return;
    }

    // =====================================================
    // INVALID / UNKNOWN ROLE
    // =====================================================
    return res.status(403).json({
      success: false,
      message:
        "Your account is not allowed to submit memories.",
    });
  }
);



// ============================================================
// GET CURRENT STUDENT'S MEMORIES
// ============================================================

app.get("/api/memories", (req, res) => {

  // ----------------------------------------------------------
  // CHECK LOGIN
  // ----------------------------------------------------------

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // ----------------------------------------------------------
  // GET STUDENT ID FROM SESSION
  // ----------------------------------------------------------

  const userId = Number(req.user.id);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Invalid user.",
    });
  }

  // ----------------------------------------------------------
  // FETCH MEMORIES
  // ----------------------------------------------------------

  db.query(
    `
      SELECT
        memories.id,
        memories.user_id,
        memories.message,
        memories.image,
        memories.status,
        memories.created_at,

        users.full_name,
        users.profile_pic

      FROM memories

      INNER JOIN users
        ON users.id = memories.user_id

      WHERE memories.user_id = ?

      ORDER BY memories.id DESC
    `,
    [userId],

    (err, results) => {

      if (err) {

        console.error(
          "❌ FETCH STUDENT MEMORIES ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch memories.",
        });
      }

      return res.json(results || []);
    }
  );
});


// ============================================================
// APPROVE MEMORY
// ============================================================

app.put("/api/memories/:id/approve", (req, res) => {

  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid memory ID.",
    });
  }

  db.query(
    `
      UPDATE memories
      SET status = 'approved'
      WHERE id = ?
    `,
    [id],

    (err, result) => {

      if (err) {

        console.error(
          "❌ APPROVE MEMORY ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to approve memory.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Memory not found.",
        });
      }

      return res.json({
        success: true,
        message: "Memory approved successfully.",
      });
    }
  );
});


// ============================================================
// REJECT MEMORY
// ============================================================

app.put("/api/memories/:id/reject", (req, res) => {

  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid memory ID.",
    });
  }

  db.query(
    `
      UPDATE memories
      SET status = 'rejected'
      WHERE id = ?
    `,
    [id],

    (err, result) => {

      if (err) {

        console.error(
          "❌ REJECT MEMORY ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to reject memory.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Memory not found.",
        });
      }

      return res.json({
        success: true,
        message: "Memory rejected successfully.",
      });
    }
  );
});



// ============================================================
// ADMIN - GET ALL STUDENT MEMORIES ONLY
// ============================================================

app.get("/api/admin/memories", (req, res) => {
  db.query(
    `
      SELECT
        memories.id,
        memories.user_id,
        memories.message,
        memories.image,
        memories.status,
        memories.created_at,
        users.full_name,
        users.profile_pic,
        users.role,
        users.department_program,
        users.batch,
        users.batch_name
      FROM memories
      INNER JOIN users
        ON users.id = memories.user_id
      WHERE users.role = 'student'
      ORDER BY memories.id DESC
    `,
    (err, results) => {
      if (err) {
        console.error(
          "❌ FETCH ADMIN MEMORIES ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch memories.",
          error: err.message,
        });
      }

      return res.json(results || []);
    }
  );
});





app.get("/api/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not logged in"
    });
  }

  res.json(req.user);
});

app.get("/api/notifications", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  db.query(
    `
    SELECT *
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json(err);

      res.json(results);
    }
  );
});

app.put("/api/notifications/:id/read", (req, res) => {
  const id = req.params.id;

  db.query(
    `UPDATE notifications SET is_read = 1 WHERE id = ?`,
    [id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ success: true });
    }
  );
});

app.get("/api/notifications/unread-count", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  db.query(
    `
    SELECT COUNT(*) AS count
    FROM notifications
    WHERE user_id = ? AND is_read = 0
    `,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json(err);

      res.json({ count: results[0].count });
    }
  );
});


app.post("/api/themes/save", (req, res) => {
  const { theme_name, description, created_by, pages } = req.body;

  db.query(
    `INSERT INTO themes (theme_name, description, created_by, pages)
     VALUES (?, ?, ?, ?)`,
    [
      theme_name,
      description,
      created_by,
      JSON.stringify(pages)
    ],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ success: true });
    }
  );
});

app.get("/api/themes", (req, res) => {
  db.query(
    "SELECT * FROM themes ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json(err);

      res.json(results);
    }
  );
});

app.post("/api/yearbooks/create-from-theme", (req, res) => {
  const { title, theme_id } = req.body;

  // 1. get theme design
  db.query(
    "SELECT * FROM themes WHERE id = ?",
    [theme_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: "Theme not found" });
      }

      const theme = result[0];

      // 2. create yearbook COPY (editable) with initial pages from theme
      const themePages = theme.pages ? JSON.parse(theme.pages) : [];
      const themeThumbnail = theme.thumbnail || null;

      db.query(
        `INSERT INTO yearbooks (title, theme_id, status, pages, thumbnail)
         VALUES (?, ?, 'draft', ?, ?)`,
        [title, theme_id, JSON.stringify(themePages), themeThumbnail],
        (err2, result2) => {
          if (err2) return res.status(500).json(err2);

          res.json({
            success: true,
            yearbook_id: result2.insertId,
            theme_pages: themePages,
            thumbnail: themeThumbnail,
          });
        }
      );
    }
  );
});



app.post("/api/themes/save-template", (req, res) => {
  const { theme_name, description, pages, created_by, thumbnail } = req.body;

  db.query(
    `INSERT INTO themes (theme_name, description, created_by, pages, thumbnail)
     VALUES (?, ?, ?, ?, ?)`,
    [
      theme_name,
      description || "",
      created_by || null,
      JSON.stringify(pages),
      thumbnail || null,
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        success: true,
        theme_id: result.insertId,
        thumbnail,
      });
    }
  );
});


app.post("/api/upload-thumbnail", upload.single("image"), (req, res) => {
  res.json({
    url: req.file.path,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`========================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`========================================`);

  await verifyEmailTransporter();
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} is already in use.`
    );
    process.exit(1);
  }

  throw err;
});
