const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log('✅ Database connected successfully');
    } catch (err) {
        console.error('❌ Database connection failed:');
        console.error(err);
    }
}

module.exports = connectDB;