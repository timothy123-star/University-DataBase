const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Endpoint to compare query performance
router.get("/performance-demo", async (req, res) => {
  const { mode } = req.query; // 'with_index' or 'no_index'
  const lastName = "Okonkwo"; // pick a last name that exists in your data

  try {
    let sql = "SELECT * FROM Student WHERE LastName = ?";
    if (mode === "no_index") {
      // Force MySQL to ignore any index on LastName
      sql =
        "SELECT * FROM Student IGNORE INDEX (idx_lastname) WHERE LastName = ?";
    }

    // Measure execution time
    const start = Date.now();
    const [rows] = await db.query(sql, [lastName]);
    const duration = Date.now() - start;

    // Get EXPLAIN output (without execution)
    const [explainRows] = await db.query(`EXPLAIN ${sql}`, [lastName]);

    res.json({
      mode,
      duration,
      rowCount: rows.length,
      explain: explainRows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
