const mongoose = require('mongoose');

function connectToDb() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-analytics';

    mongoose.connect(mongoURI)
        .then(() => {
            console.log('✅ Connected to MongoDB successfully');
        })
        .catch((err) => {
            console.error('❌ Error connecting to MongoDB:', err.message);
        });
}

module.exports = connectToDb;