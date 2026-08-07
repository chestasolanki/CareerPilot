const { OpenAI } = require("openai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer=require("puppeteer")
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe("The overall resume-to-job-description match score as a percentage from 0 to 100."),

  technicalQuestions: z
    .array(
      z.object({
        question: z.string().describe("The technical question can be asked in the interview."),
        intention: z.string().describe("The intention of interviewer behind asking this question."),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc."),
      })
    )
    .describe("Technical questions that can be asked in interview along with their intention and answer"),

  behavioralQuestions: z
    .array(
      z.object({
        question: z.string().describe("The behavioral question can be asked in the interview."),
        intention: z.string().describe("The intention of interviewer behind asking this question."),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc."),
      })
    )
    .describe("Behavioral questions that can be asked in interview along with their intention and answer"),

  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap"),
      })
    )
    .describe("List of skill gaps in the candidate's profile along with their severity"),

  preprationPlan: z
    .array(
      z.object({
        day: z.number().describe("The day number in the preparation roadmap."),
        focus: z.string().describe("The main topic or objective for the day."),
        tasks: z.array(z.string()).describe("Specific actionable tasks to complete."),
      })
    )
    .describe(
      "A day-wise preparation roadmap tailored to the candidate's current skills, job description, and identified skill gaps."
    ),
    title:z.string().describe("The title of the job for which the interview report is generated")
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const prompt = `Generate a comprehensive interview preparation report for a candidate based on the following details:
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription || "Not provided"}

Respond strictly with a single JSON object. Do not include any explanations, markdown code blocks, or extra text.

You MUST follow this exact JSON structure:
{
  "matchScore": 85,
  "technicalQuestions": [
    {
      "question": "Example technical question",
      "intention": "Why the interviewer asks this",
      "answer": "How the candidate should answer"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Example behavioral question",
      "intention": "Interviewer intention",
      "answer": "STAR framework answer strategy"
    }
  ],
  "skillGaps": [
    {
      "skill": "Identified missing skill",
      "severity": "high"
    }
  ],
  "preprationPlan": [
    {
      "day": 1,
      "focus": "Topic focus for the day",
      "tasks": ["Task 1", "Task 2"]
    }
  ],
  "title": "Software Engineer"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", 
    messages: [
      {
        role: "system",
        content: "You are an expert technical interview coach. You strictly output valid JSON matching the requested structure.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0].message.content;

  let parsedJson;
  try {
    parsedJson = JSON.parse(raw);
  } catch (err) {
    throw new Error("Groq did not return valid JSON: " + err.message + "\nRaw output:\n" + raw);
  }

  function extractReportObject(data) {
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch (e) {}
    }
    if (!data || typeof data !== "object") return data;

    if (data.matchScore !== undefined || data.technicalQuestions !== undefined) return data;

    const candidates = [
      data.properties,
      data.report,
      data.interviewReport,
      data.interview_report,
      data.data,
      data.result
    ];

    for (const candidate of candidates) {
      if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
        if (candidate.matchScore !== undefined || candidate.technicalQuestions !== undefined) {
          return candidate;
        }
      }
    }

    for (const val of Object.values(data)) {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        if (val.matchScore !== undefined || val.technicalQuestions !== undefined) {
          return val;
        }
      }
    }

    return data;
  }

  const dataToValidate = extractReportObject(parsedJson);

  const result = interviewReportSchema.safeParse(dataToValidate);
  if (!result.success) {
    console.error("Groq Raw Response:", raw);
    console.error("Parsed Data to Validate:", dataToValidate);
    throw new Error("Groq output failed schema validation: " + JSON.stringify(result.error.issues, null, 2));
  }

  return result.data;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `Generate HTML content of resume for a candidate based on the following details:
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription || "Not provided"}

The response must be a JSON object with a single field "html" containing the full HTML content of the resume suitable for conversion to PDF using Puppeteer.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are an expert resume builder. You strictly output valid JSON with an 'html' string property.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;
  return JSON.parse(raw);
}

module.exports = { generateInterviewReport, generateResumePdf };