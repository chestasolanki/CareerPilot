const pdfParseModule = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

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
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" })
        }

        const resumeText = await extractTextFromPDF(req.file.buffer)
        const {selfDescription, jobDescription} = req.body

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })

        res.status(201).json({
            message: "interview report generated successfully",
            interviewReport
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: err.message || "Failed to generate interview report"
        })
    }
}

module.exports={generateInterviewReportController}