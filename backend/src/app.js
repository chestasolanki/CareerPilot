const express=require('express')
const cookieParser=require('cookie-parser')
const cors=require('cors')
const app=express()

app.use(express.json())
app.use(cookieParser())

// Allowed origins (local dev + production/preview Vercel deployments)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));

const authRouter=require('./routes/auth.routes')
const interviewRouter=require('./routes/interview.routes')

 
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

module.exports=app
