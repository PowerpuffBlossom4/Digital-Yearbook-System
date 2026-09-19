const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "yearbook",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  connectTimeout: 10000,
  multipleStatements: false,
});

const testDatabaseConnection = () => {
  db.getConnection((err, connection) => {
    if (err) {
      console.log("Database is not ready yet:", err.message);
      setTimeout(testDatabaseConnection, 2000);
      return;
    }

    console.log("MySQL Connected");
    connection.release();
  });
};

db.on("error", (err) => {
  console.error("MySQL pool error:", err.code || err.message);

  if (
    err.code === "PROTOCOL_CONNECTION_LOST" ||
    err.code === "ECONNRESET" ||
    err.code === "ER_SERVER_SHUTDOWN"
  ) {
    console.log("MySQL connection lost. Pool will retry on next request.");
  }
});

testDatabaseConnection();

module.exports = db;