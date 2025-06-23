const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controllers');

router.use(authMiddleware.authUser);

const adminOnly = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

router.use(adminOnly);

router.get('/users', [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a non-negative integer')
], adminController.getAllUsers);

router.get('/users/:userId', [
    param('userId').isMongoId().withMessage('Invalid user ID format')
], adminController.getUserDetails);

router.delete('/users/:userId', [
    param('userId').isMongoId().withMessage('Invalid user ID format')
], adminController.deleteUser);

router.get('/stats', adminController.getAdminDashboardStats);

router.get('/excel-files', [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a non-negative integer')
], adminController.getAllExcelFiles);

module.exports = router; 