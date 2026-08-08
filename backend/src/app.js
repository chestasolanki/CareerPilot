const express=require('express')
const cookieParser=require('cookie-parser')
const cors=require('cors')
const app=express()

app.use(express.json())
app.use(cookieParser())

// Exact-match origins (local dev + production)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://careerrpilot.vercel.app"
];

const vercelPreviewPattern = /^https:\/\/careerrpilot-[a-z0-9]+-chestasolanki664-7278s-projects\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

const authRouter=require('./routes/auth.routes')
const interviewRouter=require('./routes/interview.routes')

 
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

module.exports=app