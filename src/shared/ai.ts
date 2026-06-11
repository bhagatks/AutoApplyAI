import { ResumeRules, BaseProfile } from './types';

export const SYSTEM_INSTRUCTION = `You are an expert executive career strategist. Your purpose is to output tailored resume blocks and matching cover letters that comprehensively match a job description. You must thoroughly fill out the top sections of the document so they look substantive and executive-grade, while ensuring the total resume does not spill onto a second page.

CRITICAL SYNTAX RULES:
1. Output raw, copy-pasteable LaTeX strings that match standard document environments.
2. Never use a raw ampersand (&) in body text—always spell out 'and'.
3. Every single percentage sign must be explicitly escaped as '\\%'.
4. Do not output markdown wrappers or code block markers (like \`\`\`latex).
5. Use natural, warm, human-focused phrasing. Frame career growth as a 'journey', never a 'trajectory'.
6. The 'summary' field MUST contain only the raw paragraph text. Do NOT wrap it in LaTeX environments (like \\begin{quote}, \\begin{itemize}, or \\begin{center}) and do NOT include any section titles or headers (like \\section{Executive Summary}, \\section*{Summary}, or \\textbf{Executive Summary}).
7. The 'competencies' field MUST contain only a flat sequence of LaTeX \\item bullet points (e.g., \\item \\textbf{Title:} Description). Do NOT wrap the list in a \\begin{itemize} and \\end{itemize} block, and do NOT include any section titles or headers (like \\section*{Core Competencies} or \\textbf{Core Competencies}) within the field.
8. The 'cover_letter' field MUST contain the formatted cover letter text. Do NOT wrap it in LaTeX environments, and let double newlines represent paragraph breaks. You MUST structure the cover letter EXACTLY as follows (separated by double newlines):
   - Recipient line: e.g., 'Hiring Team Moonshot Labs' (or the specific hiring manager and team if named, e.g. 'Andrew Phelan and the Moonshot Labs Hiring Team')
   - Location line: e.g., 'Dallas-Fort Worth Metroplex, TX' (or matching job city/state)
   - Subject line: e.g., 'Subject: Application for AI Development Manager'
   - Salutation line: e.g., 'Dear Andrew Phelan and the Moonshot Labs Hiring Team,'
   - Body paragraphs: 3 to 4 tailored paragraphs.
   - Sign-off: 'Sincerely,\\n\\nBhagath Siddi'

CONTENT FILL BOUNDS:
- Provide a detailed, robust Executive Summary block (exactly 4 to 5 lines of text).
- Do NOT include any ATS target block, keywords block, or metadata under the summary.
- Generate exactly 7 to 8 highly descriptive, technical core competency items that thoroughly expand on matching methodologies.
- Write a highly tailored, compelling 3-4 paragraph Cover Letter body that connects the candidate's journey (e.g., 7-Eleven tech leadership, CVS health manager, MIT Agentic AI program) directly to the target role's mission and challenges.`;

export const BASE_PROFILE: BaseProfile = {
  firstName: "Bhagath",
  lastName: "Siddi",
  email: "bhagathsiddi@gmail.com",
  phone: "989-312-3420",
  location: "Prosper, TX 75078",
  linkedin: "linkedin.com/in/bhagathsiddi",
  role: "DIRECTOR OF AI ENGINEERING | STRATEGY & ENTERPRISE ML LIFE-CYCLE",
  summary: "Visionary, truth-driven Engineering Leader with 20 plus years of software experience, specializing in building and scaling high-performing AI/ML teams from the ground up. Proven track record of executing strategic technical roadmaps, driving rapid proof-of-concept development, and deploying production-grade agentic workflows and LLM applications at scale. Grounded in logic and a collaborative culture of inclusion, balancing aggressive execution timelines with a customer-centric focus on humanity and clinical operational excellence.",
  competencies: [
    "AI Strategy & Vision Execution: Expert at translating complex executive business objectives into executable engineering roadmaps, setting the technical vision for ML/LLM systems, and maintaining architectural governance.",
    "Advanced AI & Agentic Workflows: Deep technical expertise across LLM technologies including prompt engineering, Retrieval-Augmented Generation (RAG), vector embeddings, fine-tuning, multi-step reasoning, and tool-use orchestration agents.",
    "Lifecycle & Enterprise MLOps: End-to-end ownership from research and rapid prototyping through production deployment, experiment tracking, reproducibility, automated testing, drift detection, and cloud-native observability.",
    "Cloud Infrastructure & Big Data: Advanced proficiency with cloud-native ML ecosystems across Azure (Azure ML, Azure DevOps pipelines, Databricks) and AWS serverless computing alongside Python, Spark, Delta Lake, and SQL data architectures.",
    "Team Scaling, Culture & Ethics: Dedicated to cultivating a healthy, generative, and inclusive team culture focused on technical excellence, talent mentorship, diversity, and responsible AI principles covering fairness, transparency, and clinical data governance."
  ]
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    jobTitle: { type: "STRING" },
    companyName: { type: "STRING" },
    atsScore: { type: "INTEGER" },
    analysis: { type: "STRING" },
    summary: { type: "STRING" },
    competencies: { type: "STRING" },
    cover_letter: { type: "STRING" },
    keywords: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["jobTitle", "companyName", "atsScore", "analysis", "summary", "competencies", "cover_letter", "keywords"]
};

// Internal helper to run a streaming generate call to Gemini
async function runStreamingGeminiCall(
  apiKey: string,
  promptText: string,
  onProgress?: (rawText: string) => void
): Promise<any> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API returned error status ${response.status}: ${errText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  if (reader) {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            fullText += chunkText;
            if (onProgress) {
              onProgress(fullText);
            }
          } catch (e) {
            // Keep going if chunk line boundaries cut off JSON objects
          }
        }
      }
    }
  }

  // Parse final accumulated text
  try {
    return JSON.parse(fullText);
  } catch (err) {
    console.error("Failed to parse final JSON string:", fullText);
    throw new Error("Gemini returned invalid or truncated JSON response.");
  }
}

// Pass 1: Generates candidate tailored resume and cover letter Draft
export async function runPass1Generate(
  apiKey: string,
  jobDescription: string,
  rules: ResumeRules,
  profile: BaseProfile,
  onProgress?: (rawText: string) => void
): Promise<any> {
  const summarySentencesMax = rules.page_defense_layout?.macro_content_limits?.summary_sentences_max || 4;
  const competenciesCount = rules.page_defense_layout?.macro_content_limits?.core_competencies_count || 6;
  const firstName = profile.firstName || "Bhagath";
  const lastName = profile.lastName || "Siddi";

  const promptText = `You are an expert ATS optimization resume writer. Your goal is to tailor the candidate's resume summary and competencies to match the target job description so perfectly that the ATS Match Score is above 90%.

Candidate Base Resume Profile:
- Name: ${firstName} ${lastName}
- Target Role: ${profile.role}
- Base Summary: ${profile.summary}
- Base Competencies:
${profile.competencies.map(c => `  * ${c}`).join('\n')}

Job Description to target:
"""
${jobDescription}
"""

Your tasks:
1. Tailor the candidate's professional summary. It must be a concise paragraph (no more than ${summarySentencesMax} sentences).
   - Frame the candidate's 20+ years of software experience and engineering leadership to align with the target job's domain.
   - Highlight transferable skills: e.g., if the job is about E-Commerce/loyalty/CRM, emphasize high-scale customer-facing systems, cloud architectures (AWS/GCP), loyalty personalization, and leading full-stack or backend teams.
   - Cleanse and omit irrelevant domain-specific buzzwords (such as 'clinical', 'healthcare', 'medical') unless the target job description explicitly mentions healthcare.
   - Contextualize their technology stack to match the job description's keywords (such as Node.js, React, React Native, CI/CD, GCP, AWS) by framing it as environments they have architected, systems they integrated, or cross-functional teams they have supervised.
   - Format the summary as raw LaTeX.

2. Tailor exactly ${competenciesCount} core competencies. Format them as exactly ${competenciesCount} LaTeX items:
   \\item \\textbf{Competency Title:} Competency description highlighting direct alignment with the job.
   - Map each of the ${competenciesCount} competencies directly to key requirements in the job description (e.g. engineering leadership, cloud computing, frontend/backend architecture, agile delivery, system scalability).
   - Weave in the exact keywords from the job description (e.g. Node.js, React, AWS, GCP, e-commerce, CRM, agile).
   - Ensure the titles and descriptions reflect keywords from the job description but remain grounded in the candidate's real capabilities as a senior director/leader.
   - Keep the description of each competency extremely concise (at most 1-2 sentences, ~20-25 words each) to strictly respect the absolute 1-page budget.

3. Write a highly tailored, compelling Cover Letter body connecting the candidate's background (7-Eleven, CVS Health, MIT Agentic AI credentials) directly to the target role's mission and challenges.
   - You MUST structure the cover letter EXACTLY as follows, using double newlines for paragraph breaks:
     Recipient Line: Hiring Team [Company Name] (or specific hiring manager and team if named, e.g., Andrew Phelan and the Moonshot Labs Hiring Team)
     Location Line: [Location context from the JD, e.g. Dallas-Fort Worth Metroplex, TX]
     Subject Line: Subject: Application for [Job Title]
     Salutation Line: Dear [Hiring Manager and/or Hiring Team, e.g. Dear Andrew Phelan and the Moonshot Labs Hiring Team,]
     Body Paragraphs: 3-4 paragraphs of tailored body text.
     Sign-off: Sincerely,\\n\\n${firstName} ${lastName}
   - Output this formatting directly inside the "cover_letter" JSON property.

4. Compute an ATS Match Score (0 to 100) reflecting the match percentage. Since your task is to successfully tailor the resume, your final tailored content should achieve a score of 90 or higher.
5. Extract the jobTitle and companyName from the job description or page details.
6. Provide a list of at most 10-15 most critical matching keywords (an array of strings) and a detailed match analysis explaining how the candidate's transferable skills were mapped to the job requirements.

Format the output strictly as a JSON object matching this schema.`;

  return runStreamingGeminiCall(apiKey, promptText, onProgress);
}

// Pass 2: Optimization and compliance audit sweep
export async function runPass2Optimize(
  apiKey: string,
  jobDescription: string,
  rules: ResumeRules,
  profile: BaseProfile,
  draftData: {
    jobTitle: string;
    companyName: string;
    summary: string;
    competencies: string;
    cover_letter: string;
  },
  onProgress?: (rawText: string) => void
): Promise<any> {
  const summarySentencesMax = rules.page_defense_layout?.macro_content_limits?.summary_sentences_max || 4;
  const competenciesCount = rules.page_defense_layout?.macro_content_limits?.core_competencies_count || 6;
  const firstName = profile.firstName || "Bhagath";
  const lastName = profile.lastName || "Siddi";

  const promptText = `You are a strict ATS compliance editor, resume optimizer, and cover letter writer. Your task is to perform a second validation pass on the draft resume summary, competencies, and cover letter to ensure they are fully tailored to the target job and that the ATS Match Score is 90% or higher.

Job Description:
"""
${jobDescription}
"""

Candidate Base Resume Profile:
- Name: ${firstName} ${lastName}
- Target Role: ${profile.role}
- Base Summary: ${profile.summary}
- Base Competencies:
${profile.competencies.map(c => `  * ${c}`).join('\n')}

DRAFT Tailored Summary:
"""
${draftData.summary}
"""

DRAFT Tailored Competencies:
"""
${draftData.competencies}
"""

DRAFT Tailored Cover Letter:
"""
${draftData.cover_letter}
"""

Your tasks:
1. Audit the draft summary and competencies against the target job description. Identify any missing keywords or requirements (e.g., specific technologies like Node.js, React, AWS, GCP, or domains like e-commerce, loyalty, CRM).
2. Rewrite, refine, and optimize the summary and competencies to weave in those missing elements as transferable skills, leadership competencies, or architectural governance, maximizing the tailoring density.
3. Ensure that any irrelevant domain jargon (like 'clinical' or 'healthcare') is completely stripped out unless the target job is in the healthcare industry.
4. Verify that the summary is a single cohesive paragraph of no more than ${summarySentencesMax} sentences.
5. Verify that there are exactly ${competenciesCount} core competency items, and that their descriptions are highly concise (at most 1-2 sentences each) to respect the absolute 1-page budget.
6. Review and optimize the cover letter text, keeping it highly tailored, professional, free of ampersands, and correctly structured with recipient, location, subject, salutation, body paragraphs, and professional closing sign-off. Ensure the recipient line, location line, subject line, and salutation line are each separated by double newlines at the start. The cover letter closing sign-off must be exactly: Sincerely,\\n\\n${firstName} ${lastName}
7. Re-evaluate the ATS match score (0-100). The final score must be 90 or higher, reflecting the optimized alignment.
8. Verify and preserve the jobTitle: "${draftData.jobTitle}" and companyName: "${draftData.companyName}".
9. Provide a list of at most 10-15 most critical matching keywords (an array of strings) to keep the appended ATS target block concise and prevent layout overflow.

Format the output strictly as a JSON object matching this schema.`;

  return runStreamingGeminiCall(apiKey, promptText, onProgress);
}
