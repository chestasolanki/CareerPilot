import { getAllInterview, generateInterviewReport, generateInterviewReportById, deleteInterview, downloadResumePdf, evaluateMockAnswer } from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../Interview.context"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    
    if (!context) {
        throw new Error("useInterview must be used within an Interview Provider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile, jobDescriptionFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile, jobDescriptionFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await generateInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const getAllReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterview()
            setReports(response.interviewReports || response.interviewReport || [])
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const downloadPdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const blob = await downloadResumePdf(interviewReportId)
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Tailored_Resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error("Error downloading PDF:", err)
        } finally {
            setLoading(false)
        }
    }

    const deleteReport = async (interviewId) => {
        try {
            await deleteInterview(interviewId)
            setReports(prevReports => prevReports.filter(item => item._id !== interviewId))
            if (report?._id === interviewId) {
                setReport(null)
            }
        } catch (err) {
            console.error("Error deleting report:", err)
            throw err
        }
    }

    const evaluateAnswer = async ({ interviewReportId, question, answer, questionType }) => {
        try {
            const response = await evaluateMockAnswer({ interviewReportId, question, answer, questionType })
            setReport(response.interviewReport)
            return response.evaluation
        } catch (err) {
            console.error("Error evaluating answer:", err)
            throw err
        }
    }

    return { loading, report, reports, generateReport, getReportById, getAllReports, deleteReport, downloadPdf, evaluateAnswer }
}
