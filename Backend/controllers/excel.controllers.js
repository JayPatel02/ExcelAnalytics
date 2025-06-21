const ExcelModel = require('../models/excel.model');
const { validationResult } = require('express-validator');
const XLSX = require('xlsx');

// Upload single Excel file
const uploadSingleExcel = async (req, res) => {
    try {
        const userId = req.user._id;
        const fileName = req.file ? req.file.originalname : undefined;

        // Check if file is present
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Parse Excel file buffer
        let jsonData = [];
        let sheetName = '';
        try {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Failed to parse Excel file. Please upload a valid Excel file.'
            });
        }

        // Validate fileName and jsonData
        const errors = [];
        if (!fileName) errors.push({ msg: 'File name is required' });
        if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) errors.push({ msg: 'Excel data is required' });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        // Upsert: update if exists, otherwise insert
        const updatedFile = await ExcelModel.findOneAndUpdate(
            { user: userId, fileName },
            {
                fileName,
                excelData: {
                    sheetName,
                    data: jsonData,
                    headers: jsonData[0] || [],
                    rows: jsonData.slice(1) || []
                },
                user: userId
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({
            success: true,
            message: 'Excel file uploaded successfully',
            data: {
                id: updatedFile._id,
                fileName: updatedFile.fileName,
                uploadTime: updatedFile.uploadTime
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user's Excel file (single file per user)
const getUserExcelFile = async (req, res) => {
    try {
        const userId = req.user._id;

        const excelFile = await ExcelModel.findOne({ user: userId })
            .select('fileName uploadTime createdAt')
            .sort({ uploadTime: -1 });

        if (!excelFile) {
            return res.status(404).json({
                success: false,
                message: 'No Excel file found for this user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Excel file retrieved successfully',
            data: excelFile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Excel data for chart creation (sends full data to frontend)
const getExcelDataForCharts = async (req, res) => {
    try {
        const userId = req.user._id;

        const excelFile = await ExcelModel.findOne({ user: userId })
            .select('fileName excelData uploadTime');

        if (!excelFile) {
            return res.status(404).json({
                success: false,
                message: 'No Excel file found for this user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Excel data retrieved for chart creation',
            data: {
                id: excelFile._id,
                fileName: excelFile.fileName,
                excelData: excelFile.excelData,
                uploadTime: excelFile.uploadTime
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get specific Excel file by ID
const getExcelFileById = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user._id;

        const excelFile = await ExcelModel.findOne({ _id: fileId, user: userId });

        if (!excelFile) {
            return res.status(404).json({
                success: false,
                message: 'Excel file not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Excel file retrieved successfully',
            data: excelFile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete Excel file
const deleteExcelFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user._id;

        const excelFile = await ExcelModel.findOneAndDelete({ _id: fileId, user: userId });

        if (!excelFile) {
            return res.status(404).json({
                success: false,
                message: 'Excel file not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Excel file deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user dashboard stats
const getUserDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const excelFile = await ExcelModel.findOne({ user: userId })
            .select('fileName uploadTime');

        res.status(200).json({
            success: true,
            message: 'Dashboard stats retrieved successfully',
            data: {
                hasExcelFile: !!excelFile,
                fileName: excelFile ? excelFile.fileName : null,
                uploadTime: excelFile ? excelFile.uploadTime : null
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user's upload history
const getUserUploadHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const excelFiles = await ExcelModel.find({ user: userId })
            .select('fileName uploadTime createdAt')
            .sort({ uploadTime: -1 });

        res.status(200).json({
            success: true,
            message: 'Upload history retrieved successfully',
            data: excelFiles
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    uploadSingleExcel,
    getUserExcelFile,
    getExcelDataForCharts,
    getExcelFileById,
    deleteExcelFile,
    getUserDashboardStats,
    getUserUploadHistory
}; 