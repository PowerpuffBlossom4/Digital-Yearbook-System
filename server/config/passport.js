const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db");
const allowedDomain = "@adssu.edu.ph";


module.exports = function(passport) {

  passport.use(

    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },

      async (accessToken, refreshToken, profile, done) => {

        try {

          const googleId = profile.id;
          const fullName = profile.displayName;
          const email = profile.emails[0].value;
          const profilePic = profile.photos[0].value;

          /*
             SCHOOL EMAIL VALIDATION
          */

         if (!email.endsWith(allowedDomain)) {
  return done(null, false, {
    message: "Only school accounts are allowed",
  });
}

          /*
             CHECK REGISTRAR RECORDS
          */

db.query(
  "SELECT * FROM registrar_records WHERE email = ?",
  [email],

  (err, registrarResult) => {

    if (err) {
      return done(err, null);
    }

    if (registrarResult.length === 0) {
      return done(null, false, {
        message: "Access denied. You are not registered in the system.",
      });
    }

    const registrarUser = registrarResult[0];

    /*
       CHECK IF USER ALREADY EXISTS
    */

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],

      (err, userResult) => {

        if (err) {
          return done(err, null);
        }

        if (userResult.length > 0) {
          return done(null, userResult[0]);
        }

        /*
           INSERT NEW USER
        */

 db.query(
  `INSERT INTO users
  (google_id, full_name, email, role, department_program, batch, profile_pic)
  VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    googleId,
    fullName,
    email,
    registrarUser.role,
    registrarUser.department_program,
    registrarUser.batch,
    profilePic,
  ],

          (err, insertResult) => {

            if (err) {
              return done(err, null);
            }

            const newUser = {
              id: insertResult.insertId,
              google_id: googleId,
              full_name: fullName,
              email,
              role: registrarUser.role,
              profile_pic: profilePic,
            };

            return done(null, newUser);
          }
        );
      }
    );
  }
);

        } catch (error) {

          console.log(error);

        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {

    db.query(
      "SELECT * FROM users WHERE id = ?",
      [id],

      (err, result) => {

        if (err) throw err;

        done(null, result[0]);
      }
    );
  });

};