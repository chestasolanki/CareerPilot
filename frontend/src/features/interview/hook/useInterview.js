import {getAllInterview,generateInterviewReport,generateInterviewReportById} from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../Interview.context"

export const useInterview=()=>{
    const context=useContext(InterviewContext)
    
    if(!context){
        throw new Error("use.Interview must be used within an Interview Provider")
    }

    const {loading, setLoading, report, setReport, reports, setReports}=context

    const generateReport=async({jobDescription,selfDescription,resumeFile})=>{
        setLoading(true)
         try{
            const response=await generateInterviewReport({jobDescription,selfDescription,resumeFile})
            setReport(response.interviewReport)
         }catch(err){
            console.log(err)
         }finally{
            setLoading(false)
         }
    }

    const getReportById=async(interviewId)=>{
        setLoading(true)
          try{
            const response=await generateInterviewReportById(interviewId)
            setReport(response.interviewReport)
         }catch(err){
            console.log(err)
         }finally{
            setLoading(false)
         }
    }

    const getAllReports=async()=>{
         setLoading(true)
          try{
            const response=await getAllInterview()
            setReports(response.interviewReports || response.interviewReport || [])
         }catch(err){
            console.log(err)
         }finally{
            setLoading(false)
         }
    }

    return {loading, report, reports, generateReport,getReportById,getAllReports}
}