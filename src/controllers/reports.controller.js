const reportsService = require('../services/reports.service');

async function createReport(req, res, next) {
  try {
    const report = await reportsService.createReport(req.user.user_id, req.body);
    return res.status(201).json(report);
  } catch (err) {
    return next(err);
  }
}

async function getMyReports(req, res, next) {
  try {
    const reports = await reportsService.getReportsByUser(req.user.user_id);
    return res.status(200).json(reports);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createReport,
  getMyReports,
};
