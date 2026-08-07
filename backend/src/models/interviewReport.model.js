const mongoose=require('mongoose')


const technicalQuestionSchema=mongoose.Schema({
    question:{
        type:String,
        required:[true,'Technical ques is required']
    },
    intention:{
        type:String,
        required:[true,'Intention s is required']
    },
    answer:{
        type:String,
        required:[true,'Answer is required']
    },
},{
    _id:false
})

const behavioralQuestionSchema=mongoose.Schema({
    question:{
        type:String,
        required:[true,'Technical ques is required']
    },
    intention:{
        type:String,
        required:[true,'Intention s is required']
    },
    answer:{
        type:String,
        required:[true,'Answer is required']
    },
},{
    _id:false
})

const skillGapsSchema=mongoose.Schema({
    skill:{
        type:String,
        required:[true,"skill is required"]
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        required:[true,"severity is required"]
    }
},{
    _id:false
})

const preprationPlanSchema=mongoose.Schema({
    day:{
        type:Number,
        required:[true,"Day is required"]
    },
    focus:{
        type:String,
        required:[true,"focus is required"]
    },
    tasks:[{
        type:String
    }]
},{
    _id:false
})

const interviewReportSchema=new mongoose.Schema({
    jobDescription: {
        type:String,
        required: [true,"Job description is required"]
    },
    resume:{
        type:String
    },
    selfDescription:{
        type:String
    },
    matchScore:{
        type:Number,
        min:0,
        max:100
    },
    technicalQuestions:[technicalQuestionSchema],
    behavioralQuestions:[behavioralQuestionSchema],
    skillGaps:[skillGapsSchema],
    preprationPlan:[preprationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    title:{
        type:String,
        required:[true,"Job title is required"]
    }
},{
    timestamps:true
})

const interviewReportModel=mongoose.model("InterviewReport",interviewReportSchema)

module.exports=interviewReportModel;