const mongoose=require('mongoose')

/**
 * -job description schema: String
 * -resume text: String
 * -self description: String
 * -Match Score: Number
 * 
 * Technical Questions: [{
 *          question:"",
 *          intention:"",
 *          answer:""
 *       }]
 * Behavioural Question:  [{
 *          question:"",
 *          intention:"",
 *          answer:""
 *       }]
 * Skill Gaps: [{
 *       skill:"",
 *      severity:{
 *          type:string,
 *          enum:["low","high","medium"]        
 *       }
 *        
 * }]
 * Prepration plan[{
 *        day: Number,
 *        focus:String,
 *         tasks:[String]
 * }]
 */

const interviewReportSchema=new mongoose.Schema({
    
})