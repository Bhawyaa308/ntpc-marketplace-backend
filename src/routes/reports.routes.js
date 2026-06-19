const express = require('express');
const reportsController = require('../controllers/reports.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { createReportValidator } = require('../validators/reports.validator');

const router = express.Router();

// Create a new report
router.post('/', authMiddleware, createReportValidator, reportsController.createReport);

// Get reports created by current user
router.get('/my', authMiddleware, reportsController.getMyReports);

module.exports = router;
