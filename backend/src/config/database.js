const mongoose=require('mongoose')

async function connectDB(){
    try {
        // 2000ms was too tight for a cold connection from some hosts/regions
        // to MongoDB Atlas, causing intermittent connection failures right
        // after deploy or cold start. Bumped to a safer default.
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
        console.log('database connected successfully')
    } catch (err) {
        console.error('Database connection notice:', err.message)
    }
}

module.exports=connectDB