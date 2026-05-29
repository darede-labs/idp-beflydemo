const express = require("express");
const cors = require("cors");
const { pool, dbEngine } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.executeQuery("SELECT NOW() as now");
    res.status(200).json({
      status: "ok",
      now: result[0].now,
      engine: dbEngine,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const result = await pool.executeQuery(
      "SELECT id, email, created_at FROM users ORDER BY id DESC LIMIT 50"
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const insertQuery = dbEngine.includes("postgres")
      ? "INSERT INTO users (email) VALUES ($1) RETURNING id, email, created_at"
      : "INSERT INTO users (email) VALUES (?)";

    const result = await pool.executeQuery(insertQuery, [email]);

    if (dbEngine.includes("postgres")) {
      res.status(201).json(result[0]);
    } else {
      const [created] = await pool.executeQuery(
        "SELECT id, email, created_at FROM users WHERE email = ? ORDER BY id DESC LIMIT 1",
        [email]
      );
      res.status(201).json(created);
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`backend listening on ${port}`);
});
