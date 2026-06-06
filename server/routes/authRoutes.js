const router = require("express").Router();
const passport = require("passport");

/*
   GOOGLE LOGIN
*/

router.get(
  "/google",

  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/*
   GOOGLE CALLBACK
*/

router.get(
  "/google/callback",

  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000",
  }),

  (req, res) => {

    /*
       ROLE-BASED REDIRECT
    */

    if (req.user.role === "admin") {

      res.redirect("http://localhost:3000/admin");

    } else if (req.user.role === "faculty") {

      res.redirect("http://localhost:3000/faculty");

    } else {

      res.redirect("http://localhost:3000/student");
    }
  }
);

/*
   CURRENT USER
*/

router.get("/user", (req, res) => {

  if (req.user) {

    res.json(req.user);

  } else {

    res.status(401).json({
      message: "Unauthorized",
    });
  }
});

/*
   LOGOUT
*/

router.get("/logout", (req, res) => {

  req.logout((err) => {

    if (err) {
      return res.status(500).json({
        message: "Logout Failed",
      });
    }

    req.session.destroy(() => {

      res.clearCookie("connect.sid");

      res.json({
        message: "Logout Success",
      });

    });

  });

});

module.exports = router;