const { OpenAI } = require("openai");
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const { z } = require("zod");

const groqConfig = {
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
};

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const RATE_LIMIT_RETRY_DELAY_MS = 8000;

let groqClient;
let careerCoachModel;

function getGroqClient() {
  if (!groqConfig.apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  if (!groqClient) {
    groqClient = new OpenAI(groqConfig);
  }

  return groqClient;
}

function getCareerCoachModel() {
  if (!groqConfig.apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  if (!careerCoachModel) {
    careerCoachModel = new ChatOpenAI({
      apiKey: groqConfig.apiKey,
      model: GROQ_MODEL,
      temperature: 0.25,
      maxTokens: 1200,
      configuration: {
        baseURL: groqConfig.baseURL,
      },
    });
  }

  return careerCoachModel;
}

function isRateLimitError(err) {
  return err?.status === 429 || err?.code === "rate_limit_exceeded" || /rate limit/i.test(err?.message || "");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRateLimitRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    if (!isRateLimitError(err)) {
      throw err;
    }

    await sleep(RATE_LIMIT_RETRY_DELAY_MS);
    return fn();
  }
}

function getMessageText(message) {
  return typeof message?.content === "string" ? message.content : String(message?.content || "");
}

function stripJsonCodeFence(value) {
  return String(value || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseJsonText(value) {
  return JSON.parse(stripJsonCodeFence(value));
}

const candidateProfileSchema = z.object({
  name: z.string().optional().describe("Candidate name if present."),
  skills: z.array(z.string()).describe("Technical, domain, and soft skills found in the resume or self-description."),
  experience: z.array(z.string()).describe("Concise work experience highlights with years, roles, companies, or responsibilities when present."),
  projects: z.array(z.string()).describe("Relevant projects, products, research, or portfolio work."),
  education: z.array(z.string()).describe("Degrees, certifications, coursework, or training."),
  strengths: z.array(z.string()).describe("Candidate strengths that should be emphasized in interview preparation."),
});

const jobAnalysisSchema = z.object({
  title: z.string().describe("Best inferred target job title."),
  requiredSkills: z.array(z.string()).describe("Must-have skills and technologies from the JD."),
  preferredSkills: z.array(z.string()).describe("Nice-to-have skills, tools, and background."),
  responsibilities: z.array(z.string()).describe("Primary responsibilities from the JD."),
  senioritySignals: z.array(z.string()).describe("Signals about level, ownership, years of experience, or leadership expectations."),
  keywords: z.array(z.string()).describe("ATS and interview-relevant keywords from the JD."),
});

const skillGapAnalysisSchema = z.object({
  matchScore: z.number().min(0).max(100).describe("Overall fit percentage from 0 to 100."),
  matchedSkills: z.array(z.string()).describe("JD skills the candidate already appears to have."),
  skillGaps: z.array(
    z.object({
      skill: z.string().describe("Missing or weak skill."),
      severity: z.enum(["low", "medium", "high"]).describe("How important this gap is for the JD."),
      priority: z.number().min(1).max(10).describe("Learning priority where 10 is most urgent."),
      reason: z.string().describe("Why this gap matters for the target role."),
    })
  ),
});

const interviewQuestionsSchema = z.object({
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),
});

const preparationPlanSchema = z.object({
  preprationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ),
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe("The overall resume-to-job-description match score as a percentage from 0 to 100."),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),
  preprationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ),
  title: z.string(),
});

const answerEvaluationSchema = z.object({
  score: z.number().min(0).max(100).describe("Answer quality score."),
  strengths: z.array(z.string()).describe("What the answer did well."),
  weakAreas: z.array(z.string()).describe("Specific weak areas to improve."),
  suggestedAnswer: z.string().describe("A stronger answer outline."),
  updatedPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ).describe("Updated day-by-day plan, preserving useful existing tasks and adding remediation for weak areas."),
});

function extractReportObject(data) {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {}
  }
  if (!data || typeof data !== "object") return data;

  if (data.matchScore !== undefined || data.technicalQuestions !== undefined) return data;

  const candidates = [
    data.properties,
    data.report,
    data.interviewReport,
    data.interview_report,
    data.data,
    data.result,
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

function normalizeReport(dataToValidate) {
  const result = interviewReportSchema.safeParse(dataToValidate);
  if (result.success) {
    return result.data;
  }

  console.warn("Interview report schema validation notice:", result.error.issues);

  return {
    matchScore: typeof dataToValidate?.matchScore === "number" ? dataToValidate.matchScore : 80,
    technicalQuestions: Array.isArray(dataToValidate?.technicalQuestions) ? dataToValidate.technicalQuestions : [],
    behavioralQuestions: Array.isArray(dataToValidate?.behavioralQuestions) ? dataToValidate.behavioralQuestions : [],
    skillGaps: Array.isArray(dataToValidate?.skillGaps) ? dataToValidate.skillGaps.map(sg => ({
      skill: sg.skill || "Technical Concept",
      severity: ["low", "medium", "high"].includes(String(sg.severity || "").toLowerCase())
        ? String(sg.severity).toLowerCase()
        : "medium",
    })) : [],
    preprationPlan: Array.isArray(dataToValidate?.preprationPlan) ? dataToValidate.preprationPlan : [],
    title: typeof dataToValidate?.title === "string" ? dataToValidate.title : "Target Role Strategy",
  };
}

async function runStructuredAgent({ name, role, schema, task, input }) {
  const parser = StructuredOutputParser.fromZodSchema(schema);
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `${role}

You are one agent in an interview-preparation multi-agent workflow.
Return only structured JSON that matches the requested schema.
{formatInstructions}`],
    ["human", "{task}\n\nInput:\n{input}"],
  ]);

  try {
    const formattedPrompt = await prompt.formatMessages({
      task,
      input: JSON.stringify(input, null, 2),
      formatInstructions: parser.getFormatInstructions(),
    });
    const response = await withRateLimitRetry(() => getCareerCoachModel().invoke(formattedPrompt));
    return schema.parse(parseJsonText(getMessageText(response)));
  } catch (err) {
    throw new Error(`${name} failed: ${err.message}`);
  }
}

async function generateInterviewReportWithAgents({ resume, selfDescription, jobDescription }) {
  const candidateProfile = await runStructuredAgent({
    name: "Resume Analyzer Agent",
    role: "You are a resume analyzer agent. Extract the candidate's skills, experience, projects, education, and strengths without inventing facts.",
    schema: candidateProfileSchema,
    task: "Analyze the candidate material and return a concise candidate profile.",
    input: {
      resume: resume || "Not provided",
      selfDescription: selfDescription || "Not provided",
    },
  });

  const jobAnalysis = await runStructuredAgent({
    name: "Job Analysis Agent",
    role: "You are a job description analysis agent. Identify the role, required skills, preferred skills, responsibilities, seniority signals, and keywords.",
    schema: jobAnalysisSchema,
    task: "Analyze this job description for interview preparation.",
    input: { jobDescription },
  });

  const gapAnalysis = await runStructuredAgent({
    name: "Skill Gap Agent",
    role: "You are a skill gap agent. Compare the candidate profile against the job analysis and prioritize gaps by interview impact.",
    schema: skillGapAnalysisSchema,
    task: "Compare candidate vs target job. Be fair: do not mark skills as missing if the candidate clearly has adjacent experience.",
    input: { candidateProfile, jobAnalysis },
  });

  const interviewQuestions = await runStructuredAgent({
    name: "Interview Agent",
    role: "You are an interview agent. Generate targeted technical and behavioral questions based on the JD, candidate strengths, and highest-priority gaps.",
    schema: interviewQuestionsSchema,
    task: "Create 6 technical questions and 4 behavioral questions. Each answer should be a practical strategy, not a memorized script.",
    input: { candidateProfile, jobAnalysis, gapAnalysis },
  });

  const learningPlan = await runStructuredAgent({
    name: "Learning/Planning Agent",
    role: "You are a learning-planning agent. Build a day-by-day preparation plan that teaches the highest-priority gaps first.",
    schema: preparationPlanSchema,
    task: "Create a 7-day plan. Each day needs a clear focus and 3 to 5 actionable tasks.",
    input: { candidateProfile, jobAnalysis, gapAnalysis, interviewQuestions },
  });

  const report = normalizeReport({
    title: jobAnalysis.title || "Target Role Strategy",
    matchScore: gapAnalysis.matchScore,
    technicalQuestions: interviewQuestions.technicalQuestions,
    behavioralQuestions: interviewQuestions.behavioralQuestions,
    skillGaps: gapAnalysis.skillGaps.map(({ skill, severity }) => ({ skill, severity })),
    preprationPlan: learningPlan.preprationPlan,
  });

  return {
    ...report,
    agentInsights: {
      candidateProfile,
      jobAnalysis,
      matchedSkills: gapAnalysis.matchedSkills,
      prioritizedGaps: gapAnalysis.skillGaps,
    },
  };
}

async function generateInterviewReportFallback({ resume, selfDescription, jobDescription }) {
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

  try {
    const completion = await withRateLimitRetry(() => getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert technical interview coach. You strictly output valid JSON matching the requested structure.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 1800,
    }));

    const raw = completion.choices[0].message.content;
    return normalizeReport(extractReportObject(parseJsonText(raw)));
  } catch (err) {
    throw new Error("Groq did not return valid report JSON: " + err.message);
  }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  try {
    return await generateInterviewReportWithAgents({ resume, selfDescription, jobDescription });
  } catch (err) {
    console.warn("LangChain agent workflow failed. Falling back to single-pass report generation:", err.message);
    return generateInterviewReportFallback({ resume, selfDescription, jobDescription });
  }
}

async function evaluateMockInterviewAnswer({ interviewReport, question, answer, questionType }) {
  return runStructuredAgent({
    name: "Evaluation Agent",
    role: "You are an evaluation agent. Score mock-interview answers, identify weak areas, and update the preparation plan.",
    schema: answerEvaluationSchema,
    task: "Evaluate the user's answer against the target role and update the preparation plan where needed.",
    input: {
      questionType: questionType || "technical",
      question,
      answer,
      reportContext: {
        title: interviewReport.title,
        jobDescription: interviewReport.jobDescription,
        skillGaps: interviewReport.skillGaps,
        preprationPlan: interviewReport.preprationPlan,
      },
    },
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeResumeHtml(rawHtml, source) {
  const html = String(rawHtml || "")
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  if (html.toLowerCase().includes("<html") && html.toLowerCase().includes("</html>")) {
    return html;
  }

  return buildFallbackResumeHtml(source);
}

function buildFallbackResumeHtml({ resume, selfDescription, jobDescription }) {
  const candidateText = escapeHtml([resume, selfDescription].filter(Boolean).join("\n\n") || "Candidate details not provided.");
  const targetText = escapeHtml(jobDescription || "Target job description not provided.");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      font-family: Arial, Helvetica, sans-serif;
      color: #111827;
      background: #ffffff;
      line-height: 1.45;
    }
    .header {
      border-bottom: 3px solid #111827;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    h1 {
      margin: 0;
      font-size: 28px;
      letter-spacing: 0;
      color: #111827;
    }
    .target {
      margin-top: 6px;
      color: #4b5563;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
    }
    section {
      margin-bottom: 18px;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 13px;
      letter-spacing: 0;
      text-transform: uppercase;
      color: #1f2937;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 4px;
    }
    p {
      margin: 0;
      font-size: 12px;
      white-space: pre-line;
    }
    ul {
      margin: 6px 0 0 18px;
      padding: 0;
      font-size: 12px;
    }
    li {
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Tailored Resume</h1>
    <div class="target">Target Role Alignment</div>
  </div>

  <section>
    <h2>Professional Summary</h2>
    <p>This resume draft is tailored toward the target role using the submitted candidate profile and job description.</p>
  </section>

  <section>
    <h2>Candidate Profile</h2>
    <p>${candidateText}</p>
  </section>

  <section>
    <h2>Target Job Keywords</h2>
    <p>${targetText}</p>
  </section>

  <section>
    <h2>Interview Positioning</h2>
    <ul>
      <li>Emphasize direct overlap between your experience and the target role requirements.</li>
      <li>Prepare examples that show ownership, problem solving, collaboration, and measurable impact.</li>
      <li>Use the generated interview plan to strengthen weaker skill areas before interviews.</li>
    </ul>
  </section>
</body>
</html>`;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `You are an elite executive resume writer and career strategist.
Generate an A4-sized, highly tailored professional HTML resume for a candidate aiming to land this specific job:

### Target Job Description:
${jobDescription || "Not provided"}

### Candidate Background & Experience:
Resume Details: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}

### Critical Instructions:
1. DO NOT simply copy the candidate's original resume text.
2. TAILOR and REWRITE the entire resume content specifically to match the keywords, required skills, tools, and key responsibilities outlined in the Target Job Description.
3. Frame work experience bullet points using strong action verbs and quantified achievements aligned with the Job Description's requirements.
4. Structure the resume with clear sections: Header (Name, Contact, Target Job Title), Professional Summary, Core Competencies & Technical Skills, Professional Experience, Key Projects, and Education.
5. Provide COMPLETE, self-contained HTML (with embedded CSS in a <style> tag) designed for A4 single-page printing. Use modern typography (font-family: 'Inter', sans-serif), sleek dark header accents (#1e293b / #0f172a), high contrast text, proper line height, and zero outer margin overflow so it prints cleanly to PDF via Puppeteer.

Respond with only the complete HTML document. Do not wrap it in JSON, markdown, or a code block.`;
  try {
    const completion = await withRateLimitRetry(() => getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert AI resume writer. You tailor candidate profiles to match target job descriptions and output complete, print-ready HTML only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_completion_tokens: 2200,
    }));

    const raw = completion.choices[0].message.content;
    return { html: normalizeResumeHtml(raw, { resume, selfDescription, jobDescription }) };
  } catch (err) {
    console.warn("Resume AI generation failed. Using fallback PDF HTML:", err.message);
    return { html: buildFallbackResumeHtml({ resume, selfDescription, jobDescription }) };
  }
}

module.exports = { generateInterviewReport, generateResumePdf, evaluateMockInterviewAnswer };
