const pdfParseModule = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
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
        const { selfDescription, jobDescription } = req.body
        
        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({ message: "Job description is required" })
        }

        if (!req.file && (!selfDescription || !selfDescription.trim())) {
            return res.status(400).json({ message: "Resume file or Self Description is required" })
        }

        let resumeText = ""
        if (req.file && req.file.buffer) {
            try {
                resumeText = await extractTextFromPDF(req.file.buffer)
            } catch (pdfErr) {
                console.error("PDF Parsing Warning:", pdfErr)
            }
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription,
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

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

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

module.exports = { generateInterviewReportController, generateReportByIdController, getAllTheInterviewReportController, generateResumePdfController }