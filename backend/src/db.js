// Database connection factory
// Supports PostgreSQL and MySQL based on DB_ENGINE environment variable

const dbEngine = (process.env.DB_ENGINE || "postgresql").toLowerCase();

let pool;

if (dbEngine.includes("postgres")) {
  // PostgreSQL driver
  const { Pool } = require("pg");
  
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "app",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });

  // Normalize query interface
  pool.executeQuery = async (sql, params = []) => {
    const result = await pool.query(sql, params);
    return result.rows;
  };

} else if (dbEngine.includes("mysql")) {
  // MySQL driver
  const mysql = require("mysql2/promise");
  
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "app",
    ssl: process.env.DB_SSL === "true" ? {} : false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Normalize query interface
  pool.executeQuery = async (sql, params = []) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  };

} else {
  throw new Error(`Unsupported database engine: ${dbEngine}`);
}

module.exports = { pool, dbEngine };
