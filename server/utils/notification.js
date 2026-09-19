const db = require("../config/db");

function createNotification(
  io,
  userId,
  type,
  message,
  link = null
) {
  if (!userId) {
    console.error(
      "❌ createNotification: userId is required"
    );

    return;
  }

  const normalizedType = String(
    type || ""
  ).toLowerCase();

  db.query(
    `
    INSERT INTO notifications
    (
      user_id,
      type,
      message,
      link
    )
    VALUES (?, ?, ?, ?)
    `,
    [
      userId,
      normalizedType,
      message,
      link,
    ],
    (err, result) => {
      if (err) {
        console.error(
          "❌ CREATE NOTIFICATION ERROR:",
          err
        );

        return;
      }

      const notificationId =
        result.insertId;

      console.log(
        "🔔 Notification created:",
        notificationId
      );

      // =====================================================
      // GET COMPLETE NOTIFICATION
      // =====================================================

      db.query(
        `
        SELECT
          id,
          user_id,
          type,
          message,
          link,
          is_read,
          created_at
        FROM notifications
        WHERE id = ?
        LIMIT 1
        `,
        [notificationId],
        (selectErr, rows) => {
          if (selectErr) {
            console.error(
              "❌ GET CREATED NOTIFICATION ERROR:",
              selectErr
            );

            return;
          }

          if (
            !rows ||
            rows.length === 0
          ) {
            console.error(
              "❌ Created notification not found:",
              notificationId
            );

            return;
          }

          const notification =
            rows[0];

          console.log(
            "📡 Sending notification to room:",
            `user_${userId}`
          );

          // =================================================
          // SEND REAL-TIME NOTIFICATION
          // =================================================

          if (io) {
            io.to(
              `user_${userId}`
            ).emit(
              "notification",
              notification
            );

            console.log(
              "✅ Notification emitted:",
              notification
            );
          }
        }
      );
    }
  );
}

module.exports = {
  createNotification,
};