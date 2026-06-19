const { pool } = require('../config/db');

async function checkDuplicateReport(user_id, listing_id) {
  const { rows } = await pool.query(
    `SELECT report_id FROM listing_reports WHERE reported_by = $1 AND listing_id = $2 LIMIT 1`,
    [user_id, listing_id]
  );

  return rows.length > 0;
}

async function createReport(listing_id, reported_by, reason) {
  const { rows } = await pool.query(
    `INSERT INTO listing_reports (listing_id, reported_by, reason, status, created_at)
     VALUES ($1, $2, $3, 'OPEN', NOW())
     RETURNING report_id, listing_id, reported_by, reviewed_by, reason, status, created_at, resolved_at`,
    [listing_id, reported_by, reason]
  );

  return rows[0];
}

async function getReportsByUser(user_id) {
  const { rows } = await pool.query(
    `SELECT report_id, listing_id, reported_by, reviewed_by, reason, status, created_at, resolved_at
     FROM listing_reports
     WHERE reported_by = $1
     ORDER BY created_at DESC`,
    [user_id]
  );

  return rows;
}

module.exports = {
  checkDuplicateReport,
  createReport,
  getReportsByUser,
};
