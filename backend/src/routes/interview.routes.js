const express=require('express')
const authMiddleware=require("../middlewares/auth.middleware")
const interviewController=require("../controllers/interview.controller")
const upload=require("../middlewares/file.middleware")
const interviewRouter=express.Router()



/**
 * @route POST /api/interview/
 * @escriotion generate new interview report on the basis of user self description resume pdf and job description
 * @access private
 */
interviewRouter.post(
    "/",
    authMiddleware.authUser,
    upload.fields([
        { name: "resume", maxCount: 1 },
        { name: "jobDescriptionFile", maxCount: 1 }
    ]),
    interviewController.generateInterviewReportController
)

/**
 * @route GET /api/interview/:interviewId
 * @description get interview report by interviewID
 * @access private
 */
interviewRouter.get("/report/:interviewId",authMiddleware.authUser,interviewController.generateReportByIdController)

/**
 * @route GET /api/interview/
 * @escriotion get all interview reports
 * @access private
 */
interviewRouter.get("/",authMiddleware.authUser,interviewController.getAllTheInterviewReportController)

/**
 * @route DELETE /api/interview/report/:interviewId
 * @description delete interview report by interviewID
 * @access private
 */
interviewRouter.delete("/report/:interviewId",authMiddleware.authUser,interviewController.deleteInterviewReportController)

/**
 * @route GET /api/interview/resume/pdf/:interviewReportId
 * @description generate resume PDF
 * @access private
 */
interviewRouter.get("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)

/**
 * @route POST /api/interview/:interviewReportId/evaluate
 * @description evaluate a mock interview answer and update the preparation plan
 * @access private
 */
interviewRouter.post("/:interviewReportId/evaluate", authMiddleware.authUser, interviewController.evaluateMockAnswerController)

module.exports = interviewRouter
