const mongoose = require('mongoose');

const excelSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    excelData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    uploadTime: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const excelModel = mongoose.model('excel', excelSchema);

module.exports = excelModel; 