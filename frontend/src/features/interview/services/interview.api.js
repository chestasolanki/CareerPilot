import axios from 'axios'
const api=axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true
})

export const generateInterviewReport=async({jobDescription,selfDescription,resumeFile})=>{
    const formData=new FormData()
    formData.append("jobDescription",jobDescription)
    formData.append("selfDescriptionn",selfDescription)
    formData.append("resume",resumeFilen)

    const response= await api.post("/api/interview/",formData)({
    headers:{
        "Content-type":"multipart/form-data"
    }
})

return response.data
}


export const generateInterviewReportById= async(interviewId)=>{
    const response= await api.get(`api/interview/report/${interviewId}`)
    return response.data
}

export const getAllInterview=async()=>{
    const response=await api.get(`api/interview/`)
    return response.data
}