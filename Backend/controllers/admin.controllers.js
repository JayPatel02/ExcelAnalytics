const UserModel = require('../models/user.model');
const ExcelModel = require('../models/excel.model');
const { validationResult } = require('express-validator');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const { limit = 50, skip = 0 } = req.query;

        const users = await UserModel.find({})
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const totalUsers = await UserModel.countDocuments({});

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users,
                totalUsers,
                hasMore: totalUsers > skip + users.length
            }
        });

    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get specific user details with their Excel data
const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const excelFile = await ExcelModel.findOne({ user: userId })
            .select('fileName uploadTime excelData');

        res.status(200).json({
            success: true,
            message: 'User details retrieved successfully',
            data: {
                user,
                excelFile
            }
        });

    } catch (error) {
        console.error('Error retrieving user details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (req.user._id.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Delete user's Excel file first
        await ExcelModel.deleteMany({ user: userId });

        // Delete the user
        await UserModel.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get admin dashboard stats
const getAdminDashboardStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            totalUsers,
            totalExcelFiles,
            activeUsers,
            recentUsers,
            newUsers
        ] = await Promise.all([
            UserModel.countDocuments({}),
            ExcelModel.countDocuments({}),
            ExcelModel.distinct('user').then(users => users.length),
            UserModel.find({})
                .select('name email createdAt')
                .sort({ createdAt: -1 })
                .limit(5),
            UserModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
        ]);

        // Get user role distribution
        const roleStats = await UserModel.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const roleDistribution = {};
        roleStats.forEach(stat => {
            roleDistribution[stat._id] = stat.count;
        });

        res.status(200).json({
            success: true,
            message: 'Admin dashboard stats retrieved successfully',
            data: {
                totalUsers,
                totalExcelFiles,
                activeUsers,
                usersWithoutFiles: totalUsers - activeUsers,
                roleDistribution,
                recentUsers,
                newUsers
            }
        });

    } catch (error) {
        console.error('Error retrieving admin dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all Excel files from all users (admin only)
const getAllExcelFiles = async (req, res) => {
    try {
        const { limit = 50, skip = 0 } = req.query;

        const excelFiles = await ExcelModel.find({})
            .populate('user', 'name email')
            .select('fileName uploadTime createdAt')
            .sort({ uploadTime: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const totalFiles = await ExcelModel.countDocuments({});

        res.status(200).json({
            success: true,
            message: 'All Excel files retrieved successfully',
            data: {
                excelFiles,
                totalFiles,
                hasMore: totalFiles > skip + excelFiles.length
            }
        });

    } catch (error) {
        console.error('Error retrieving all Excel files:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserDetails,
    deleteUser,
    getAdminDashboardStats,
    getAllExcelFiles
}; 