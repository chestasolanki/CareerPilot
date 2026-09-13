const pdfParseModule = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, evaluateMockInterviewAnswer } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const puppeteer = require("puppeteer")

async function extractTextFromPDF(buffer) {
    if (typeof pdfParseModule === 'function') {
        const result = await pdfParseModule(buffer)
        return result.text || ""
    } else if (pdfParseModule && pdfParseModule.PDFParse) {
        const parser = new pdfParseModule.PDFParse(Uint8Array.from(buffer))
        const result = await parser.getText()
        return result.text || ""
    } else if (typeof pdfParseModule?.default === 'function') {
        const result = await pdfParseModule.default(buffer)
        return result.text || ""
    } else {
        throw new Error("Unable to parse PDF: unsupported pdf-parse module format")
    }
}

async function generateInterviewReportController(req,res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User authentication required. Please log in again." })
        }

        const { selfDescription, jobDescription } = req.body
        const resumeFile = req.files?.resume?.[0]
        const jobDescriptionFile = req.files?.jobDescriptionFile?.[0]

        if (!resumeFile && (!selfDescription || !selfDescription.trim())) {
            return res.status(400).json({ message: "Resume file or Self Description is required" })
        }

        let resumeText = ""
        if (resumeFile && resumeFile.buffer) {
            try {
                resumeText = await extractTextFromPDF(resumeFile.buffer)
            } catch (pdfErr) {
                console.error("Resume PDF Parsing Warning:", pdfErr)
            }
        }

        let jobDescriptionText = jobDescription || ""
        if (jobDescriptionFile && jobDescriptionFile.buffer) {
            try {
                const extractedJobDescription = await extractTextFromPDF(jobDescriptionFile.buffer)
                jobDescriptionText = [jobDescriptionText, extractedJobDescription]
                    .filter(Boolean)
                    .join("\n\n")
            } catch (pdfErr) {
                console.error("Job Description PDF Parsing Warning:", pdfErr)
                return res.status(400).json({ message: "Unable to extract text from job description PDF" })
            }
        }

        if (!jobDescriptionText || !jobDescriptionText.trim()) {
            return res.status(400).json({ message: "Job description text or PDF is required" })
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescriptionText
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescriptionText,
            title: interviewReportByAi?.title || "Target Role Strategy",
            ...interviewReportByAi
        })

        res.status(201).json({
            message: "interview report generated successfully",
            interviewReport
        })
    } catch (err) {
        console.error("Generate Report Controller Error:", err)
        res.status(500).json({
            message: err.message || "Failed to generate interview report"
        })
    }
}

async function generateReportByIdController(req,res){
    const  {interviewId}=req.params
    const interviewReport=await interviewReportModel.findOne({
        _id:interviewId,
        user:req.user.id
    })

    if(!interviewReport){
        return res.status(404).json({
            message:"interview report not found"
        })
    }
    res.status(201).json({
        message:"Interview report fetched successfully",
        interviewReport
    })
}

async function getAllTheInterviewReportController(req,res){
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preprationPlan")

        res.status(200).json({
            message: "fetched all reports successfully",
            interviewReports
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: err.message || "Failed to fetch interview reports" })
    }
}

async function deleteInterviewReportController(req,res){
    try {
        const { interviewId } = req.params
        const deletedReport = await interviewReportModel.findOneAndDelete({
            _id: interviewId,
            user: req.user.id
        })

        if(!deletedReport){
            return res.status(404).json({
                message:"interview report not found"
            })
        }

        res.status(200).json({
            message:"Interview report deleted successfully",
            interviewId
        })
    } catch (err) {
        console.error("Delete Report Controller Error:", err)
        res.status(500).json({ message: err.message || "Failed to delete interview report" })
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview Report not found"
            })
        }
        const { resume, jobDescription, selfDescription } = interviewReport

        const { html } = await generateResumePdf({ resume, jobDescription, selfDescription })

        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        })
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
        await browser.close()

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })
        res.send(pdfBuffer)
    } catch (err) {
        console.error("Error generating resume PDF:", err)
        res.status(500).json({
            message: err.message || "Failed to generate resume PDF"
        })
    }
}

async function evaluateMockAnswerController(req, res) {
    try {
        const { interviewReportId } = req.params
        const { question, answer, questionType } = req.body

        if (!question || !question.trim()) {
            return res.status(400).json({ message: "Question is required" })
        }

        if (!answer || !answer.trim()) {
            return res.status(400).json({ message: "Answer is required" })
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview Report not found"
            })
        }

        const evaluation = await evaluateMockInterviewAnswer({
            interviewReport,
            question,
            answer,
            questionType
        })

        if (Array.isArray(evaluation.updatedPlan) && evaluation.updatedPlan.length > 0) {
            interviewReport.preprationPlan = evaluation.updatedPlan
        }

        interviewReport.evaluations.push({
            question,
            answer,
            questionType: questionType === "behavioral" ? "behavioral" : "technical",
            score: evaluation.score,
            strengths: evaluation.strengths || [],
            weakAreas: evaluation.weakAreas || [],
            suggestedAnswer: evaluation.suggestedAnswer || ""
        })

        await interviewReport.save()

        res.status(200).json({
            message: "Mock answer evaluated successfully",
            evaluation,
            interviewReport
        })
    } catch (err) {
        console.error("Error evaluating mock answer:", err)
        res.status(500).json({
            message: err.message || "Failed to evaluate mock answer"
        })
    }
}

module.exports = {
    generateInterviewReportController,
    generateReportByIdController,
    getAllTheInterviewReportController,
    deleteInterviewReportController,
    generateResumePdfController,
    evaluateMockAnswerController
}
