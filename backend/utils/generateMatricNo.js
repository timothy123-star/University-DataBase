// utils/generateMatricNo.js
const db = require("../config/db"); // adjust the path as needed

/**
 * Generate a new matriculation number in format YYYY/XXXX
 * Example: 2026/0001
 * @returns {Promise<string>}
 */
async function generateMatricNo() {
  const currentYear = new Date().getFullYear();

  // Find the highest MatricNo for this year
  const [rows] = await db.query(
    `SELECT MatricNo FROM Student WHERE MatricNo LIKE ? ORDER BY MatricNo DESC LIMIT 1`,
    [`${currentYear}/%`],
  );

  let nextSerial = 1;
  if (rows.length > 0) {
    const lastMatric = rows[0].MatricNo;
    const lastSerial = parseInt(lastMatric.split("/")[1], 10);
    nextSerial = lastSerial + 1;
  }

  // Format serial as 4-digit with leading zeros
  const serialFormatted = String(nextSerial).padStart(4, "0");
  return `${currentYear}/${serialFormatted}`;
}

module.exports = generateMatricNo;
