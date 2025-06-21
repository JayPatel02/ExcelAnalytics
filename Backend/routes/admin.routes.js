const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controllers');

// Apply authentication middleware to all routes
router.use(authMiddleware.authUser);

// Admin-only middleware - check if user is admin
const adminOnly = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Apply admin-only middleware to all admin routes
router.use(adminOnly);

// Get all users
router.get('/users', [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a non-negative integer')
], adminController.getAllUsers);

// Get specific user details
router.get('/users/:userId', [
    param('userId').isMongoId().withMessage('Invalid user ID format')
], adminController.getUserDetails);

// Delete user
router.delete('/users/:userId', [
    param('userId').isMongoId().withMessage('Invalid user ID format')
], adminController.deleteUser);

// Get admin dashboard stats
router.get('/stats', adminController.getAdminDashboardStats);

// Get all Excel files from all users
router.get('/excel-files', [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a non-negative integer')
], adminController.getAllExcelFiles);

module.exports = router; 