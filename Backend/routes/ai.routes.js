const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const aiController = require('../controllers/ai.controllers');

router.use(authMiddleware.authUser);

// Generate (or fetch cached) AI summary for an Excel file
router.post('/summary/:fileId', [
    param('fileId').isMongoId().withMessage('Invalid file ID format')
], aiController.generateAISummary);

// Clear the cached AI summary to force regeneration
router.delete('/summary/:fileId', [
    param('fileId').isMongoId().withMessage('Invalid file ID format')
], aiController.clearAISummary);

module.exports = router;
