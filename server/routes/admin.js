const express = require("express");
const router = express.Router();

const db = require("../config/db");

/*
=========================================================
HELPER
Convert db.query callback into Promise
=========================================================
*/

const query = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


/*
=========================================================
ADMIN AUTHORIZATION
=========================================================
*/

const requireAdmin = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please login."
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only."
    });
  }

  next();
};


/*
=========================================================
GET ADMIN DASHBOARD STATISTICS
=========================================================
*/

router.get("/stats", requireAdmin, async (req, res) => {

  try {

    /*
    -----------------------------------------------------
    TOTAL STUDENTS
    -----------------------------------------------------
    */

    const studentResult = await query(`
      SELECT COUNT(*) AS totalStudents
      FROM users
      WHERE role = 'student'
    `);


    /*
    -----------------------------------------------------
    TOTAL FACULTY
    -----------------------------------------------------
    */

    const facultyResult = await query(`
      SELECT COUNT(*) AS totalFaculty
      FROM users
      WHERE role = 'faculty'
    `);


    /*
    -----------------------------------------------------
    TOTAL STUDENT PROFILE PHOTOS
    -----------------------------------------------------
    */

    const profilePhotoResult = await query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE profile_pic IS NOT NULL
      AND profile_pic != ''
    `);


    /*
    -----------------------------------------------------
    TOTAL MEMORY PHOTOS
    -----------------------------------------------------
    */

    const memoryPhotoResult = await query(`
      SELECT COUNT(*) AS total
      FROM memories
      WHERE image IS NOT NULL
      AND image != ''
    `);


    /*
    -----------------------------------------------------
    TOTAL MEMORIES
    -----------------------------------------------------
    */

    const memoriesResult = await query(`
      SELECT COUNT(*) AS totalMemories
      FROM memories
    `);


    /*
    -----------------------------------------------------
    PENDING MEMORIES
    -----------------------------------------------------
    */

    const pendingMemoriesResult = await query(`
      SELECT COUNT(*) AS pendingMemories
      FROM memories
      WHERE status = 'pending'
    `);


    /*
    -----------------------------------------------------
    DRAFT YEARBOOKS
    -----------------------------------------------------
    */

    const draftYearbooksResult = await query(`
      SELECT COUNT(*) AS draftYearbooks
      FROM yearbooks
      WHERE status = 'draft'
    `);


    /*
    -----------------------------------------------------
    PUBLISHED YEARBOOKS
    -----------------------------------------------------
    */

    const publishedYearbooksResult = await query(`
      SELECT COUNT(*) AS publishedYearbooks
      FROM yearbooks
      WHERE status = 'published'
    `);


    /*
    -----------------------------------------------------
    YEARBOOK COUNT
    -----------------------------------------------------
    */

    const yearbookResult = await query(`
      SELECT COUNT(*) AS totalYearbooks
      FROM yearbooks
    `);


    /*
    -----------------------------------------------------
    TOTAL PHOTOS
    -----------------------------------------------------

    We currently count:

    1. Student profile photos
    2. Memory photos

    If you have a dedicated photos table later,
    we can change this to use that table instead.
    -----------------------------------------------------
    */

    const totalPhotos =
      Number(profilePhotoResult[0].total || 0) +
      Number(memoryPhotoResult[0].total || 0);


    /*
    -----------------------------------------------------
    RESPONSE
    -----------------------------------------------------
    */

    res.json({

      success: true,

      totalStudents:
        Number(studentResult[0].totalStudents || 0),

      totalFaculty:
        Number(facultyResult[0].totalFaculty || 0),

      totalPhotos:
        totalPhotos,

      totalMemories:
        Number(memoriesResult[0].totalMemories || 0),

      pendingMemories:
        Number(pendingMemoriesResult[0].pendingMemories || 0),

      draftYearbooks:
        Number(draftYearbooksResult[0].draftYearbooks || 0),

      publishedYearbooks:
        Number(publishedYearbooksResult[0].publishedYearbooks || 0),

      totalYearbooks:
        Number(yearbookResult[0].totalYearbooks || 0)

    });

  } catch (error) {

    console.error(
      "❌ ADMIN DASHBOARD STATS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
      error: error.message
    });

  }

});


/*
=========================================================
GET CURRENT YEARBOOK PROGRESS
=========================================================
*/

router.get("/yearbook-progress", requireAdmin, async (req, res) => {

  try {

    /*
    -----------------------------------------------------
    FIND MOST RECENT YEARBOOK
    -----------------------------------------------------
    */

    const yearbooks = await query(`
      SELECT
        id,
        title,
        batch_name,
        academic_year,
        status,
        pages,
        created_at
      FROM yearbooks
      ORDER BY id DESC
      LIMIT 1
    `);


    if (yearbooks.length === 0) {

      return res.json({
        success: true,
        yearbook: null,
        progress: {
          studentProfiles: 0,
          studentPhotos: 0,
          memories: 0,
          design: 0
        }
      });

    }


    const yearbook = yearbooks[0];


    /*
    -----------------------------------------------------
    TOTAL STUDENTS
    -----------------------------------------------------
    */

    const studentCountResult = await query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'student'
    `);

    const totalStudents =
      Number(studentCountResult[0].total || 0);


    /*
    -----------------------------------------------------
    STUDENTS WITH PROFILE INFORMATION
    -----------------------------------------------------
    */

    const profileResult = await query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'student'
      AND full_name IS NOT NULL
      AND full_name != ''
    `);

    const studentsWithProfiles =
      Number(profileResult[0].total || 0);


    /*
    -----------------------------------------------------
    STUDENTS WITH PHOTOS
    -----------------------------------------------------
    */

    const photoResult = await query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'student'
      AND profile_pic IS NOT NULL
      AND profile_pic != ''
    `);

    const studentsWithPhotos =
      Number(photoResult[0].total || 0);


    /*
    -----------------------------------------------------
    MEMORY PROGRESS
    -----------------------------------------------------
    */

    const memoryTotalResult = await query(`
      SELECT COUNT(*) AS total
      FROM memories
    `);

    const memoryApprovedResult = await query(`
      SELECT COUNT(*) AS total
      FROM memories
      WHERE status = 'approved'
    `);

    const totalMemories =
      Number(memoryTotalResult[0].total || 0);

    const approvedMemories =
      Number(memoryApprovedResult[0].total || 0);


    /*
    -----------------------------------------------------
    DESIGN PROGRESS
    -----------------------------------------------------
    */

    let designProgress = 0;

    try {

      const pages = yearbook.pages
        ? JSON.parse(yearbook.pages)
        : [];

      if (Array.isArray(pages) && pages.length > 0) {

        /*
        Basic design completion.

        10 pages = approximately 100%

        You can change this target later.
        */

        designProgress = Math.min(
          Math.round((pages.length / 10) * 100),
          100
        );

      }

    } catch (error) {

      console.log(
        "⚠️ Unable to parse yearbook pages"
      );

      designProgress = 0;

    }


    /*
    -----------------------------------------------------
    CALCULATE PERCENTAGES
    -----------------------------------------------------
    */

    const studentProfiles =
      totalStudents > 0
        ? Math.round(
            (studentsWithProfiles / totalStudents) * 100
          )
        : 0;


    const studentPhotos =
      totalStudents > 0
        ? Math.round(
            (studentsWithPhotos / totalStudents) * 100
          )
        : 0;


    const memories =
      totalMemories > 0
        ? Math.round(
            (approvedMemories / totalMemories) * 100
          )
        : 0;


    /*
    -----------------------------------------------------
    RESPONSE
    -----------------------------------------------------
    */

    res.json({

      success: true,

      yearbook: {
        id: yearbook.id,
        title: yearbook.title,
        batch_name: yearbook.batch_name,
        academic_year: yearbook.academic_year,
        status: yearbook.status
      },

      progress: {
        studentProfiles,
        studentPhotos,
        memories,
        design: designProgress
      }

    });

  } catch (error) {

    console.error(
      "❌ YEARBOOK PROGRESS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load yearbook progress.",
      error: error.message
    });

  }

});


/*
=========================================================
GET RECENT ADMIN ACTIVITY
=========================================================
*/

router.get("/activity", requireAdmin, async (req, res) => {

  try {

    /*
    -----------------------------------------------------
    MEMORY ACTIVITY
    -----------------------------------------------------
    */

    const memoryActivities = await query(`
      SELECT
        memories.id,
        memories.created_at,
        users.full_name
      FROM memories
      JOIN users
        ON users.id = memories.user_id
      ORDER BY memories.created_at DESC
      LIMIT 5
    `);


    /*
    -----------------------------------------------------
    YEARBOOK ACTIVITY
    -----------------------------------------------------
    */

    const yearbookActivities = await query(`
      SELECT
        id,
        title,
        created_at
      FROM yearbooks
      ORDER BY created_at DESC
      LIMIT 5
    `);


    /*
    -----------------------------------------------------
    THEME ACTIVITY
    -----------------------------------------------------
    */

    const themeActivities = await query(`
      SELECT
        id,
        theme_name,
        created_at
      FROM themes
      ORDER BY created_at DESC
      LIMIT 5
    `);


    const activities = [];


    /*
    MEMORY ACTIVITIES
    */

    memoryActivities.forEach((item) => {

      activities.push({

        type: "memory",

        title:
          `${item.full_name} submitted a memory`,

        description:
          "Student Memories",

        created_at:
          item.created_at

      });

    });


    /*
    YEARBOOK ACTIVITIES
    */

    yearbookActivities.forEach((item) => {

      activities.push({

        type: "yearbook",

        title:
          `Yearbook "${item.title}" was created`,

        description:
          "Yearbook Management",

        created_at:
          item.created_at

      });

    });


    /*
    THEME ACTIVITIES
    */

    themeActivities.forEach((item) => {

      activities.push({

        type: "theme",

        title:
          `Theme "${item.theme_name}" was created`,

        description:
          "Design Studio",

        created_at:
          item.created_at

      });

    });


    /*
    SORT EVERYTHING BY DATE
    */

    activities.sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );


    /*
    ONLY RETURN LATEST 10
    */

    res.json({

      success: true,

      activities:
        activities.slice(0, 10)

    });

  } catch (error) {

    console.error(
      "❌ ADMIN ACTIVITY ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to load recent activity.",

      error:
        error.message

    });

  }

});


module.exports = router;