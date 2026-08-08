require('dotenv').config()
const app=require('./src/app')
const connectDB=require('./src/config/database')



process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message || err);
});

connectDB().catch(err => console.error('Database connection error:', err.message));

// Most hosts (Render/Railway/Heroku/etc.) inject their own PORT and route
// traffic to it — hardcoding 3000 can break deployment on those platforms.
const PORT = process.env.PORT || 3000

app.listen(PORT, "0.0.0.0", () => {
    console.log(`server is running on port ${PORT}`)
})