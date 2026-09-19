const db = require("./config/db");

const sql = `
UPDATE yearbooks y
JOIN themes t ON y.theme_id = t.id
SET y.pages = COALESCE(y.pages, t.pages),
    y.thumbnail = COALESCE(y.thumbnail, t.thumbnail)
WHERE y.pages IS NULL OR y.thumbnail IS NULL;
`;

db.query(sql, (err, result) => {
  if (err) {
    console.error("Repair failed:", err);
    process.exit(1);
  }

  console.log("Repair complete:", result.affectedRows, "rows updated");
  db.end();
});
