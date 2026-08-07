require('dotenv').config()
const app=require('./src/app')
const connectDB=require('./src/config/database')



process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message || err);
});

connectDB().catch(err => console.error('Database connection error:', err.message));

app.listen(3000, "0.0.0.0", () => {
    console.log('server is running on port 3000')
})
 