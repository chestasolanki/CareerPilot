const mongoose=require('mongoose')

async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 })
        console.log('database connected successfully')
    } catch (err) {
        console.error('Database connection notice:', err.message)
    }
}

module.exports=connectDB