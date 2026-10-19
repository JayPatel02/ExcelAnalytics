const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const excelController = require('../controllers/excel.controllers');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authMiddleware.authUser);

router.post('/upload', upload.single('file'), excelController.uploadSingleExcel);

router.get('/file', excelController.getUserExcelFile);

router.get('/data-for-charts', excelController.getExcelDataForCharts);

router.get('/history', excelController.getUserUploadHistory);

router.get('/file/:fileId', [
    param('fileId').isMongoId().withMessage('Invalid file ID format')
], excelController.getExcelFileById);

router.delete('/file/:fileId', [
    param('fileId').isMongoId().withMessage('Invalid file ID format')
], excelController.deleteExcelFile);

router.get('/dashboard-stats', excelController.getUserDashboardStats);

module.exports = router; 