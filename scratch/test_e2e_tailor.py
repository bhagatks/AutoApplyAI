import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

HISTORY_FILE = 'jobs.json'
CONFIG_FILE = 'config.json'
RULES_FILE = 'resume_rules.json'

BASE_PROFILE = {
    "name": "BHAGATH SIDDI",
    "role": "DIRECTOR OF AI ENGINEERING | STRATEGY & ENTERPRISE ML LIFE-CYCLE",
    "summary": "Visionary, truth-driven Engineering Leader with 20 plus years of software experience, specializing in building and scaling high-performing AI/ML teams from the ground up. Proven track record of executing strategic technical roadmaps, driving rapid proof-of-concept development, and deploying production-grade agentic workflows and LLM applications at scale. Grounded in logic and a collaborative culture of inclusion, balancing aggressive execution timelines with a customer-centric focus on humanity and clinical operational excellence.",
    "competencies": [
        "AI Strategy & Vision Execution: Expert at translating complex executive business objectives into executable engineering roadmaps, setting the technical vision for ML/LLM systems, and maintaining architectural governance.",
        "Advanced AI & Agentic Workflows: Deep technical expertise across LLM technologies including prompt engineering, Retrieval-Augmented Generation (RAG), vector embeddings, fine-tuning, multi-step reasoning, and tool-use orchestration agents.",
        "Lifecycle & Enterprise MLOps: End-to-end ownership from research and rapid prototyping through production deployment, experiment tracking, reproducibility, automated testing, drift detection, and cloud-native observability.",
        "Cloud Infrastructure & Big Data: Advanced proficiency with cloud-native ML ecosystems across Azure (Azure ML, Azure DevOps pipelines, Databricks) and AWS serverless computing alongside Python, Spark, Delta Lake, and SQL data architectures.",
        "Team Scaling, Culture & Ethics: Dedicated to cultivating a healthy, generative, and inclusive team culture focused on technical excellence, talent mentorship, diversity, and responsible AI principles covering fairness, transparency, and clinical data governance."
    ]
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {"geminiApiKey": os.getenv("GEMINI_API_KEY", "")}

def load_rules():
    with open(RULES_FILE, 'r') as f:
        return json.load(f)

# Extract Brinker JD from history
with open(HISTORY_FILE, 'r') as f:
    history = json.load(f)
    brinker_job = [job for job in history if "Brinker" in job.get("companyName", "")][0]
    job_description = brinker_job["jobDescription"]

config = load_config()
api_key = config.get("geminiApiKey") or os.getenv("GEMINI_API_KEY")
rules = load_rules()

summary_sentences_max = rules.get("page_defense_layout", {}).get("macro_content_limits", {}).get("summary_sentences_max", 4)
competencies_count = rules.get("page_defense_layout", {}).get("macro_content_limits", {}).get("core_competencies_count", 6)

print("--- Running Pass 1 Prompt ---")
prompt_text = f"""
You are an expert ATS optimization resume writer. Your goal is to tailor the candidate's resume summary and competencies to match the target job description so perfectly that the ATS Match Score is above 90%.

Candidate Base Resume Profile:
- Name: {rules.get("profile", {}).get("candidate_name", "Bhagath Siddi")}
- Target Role: {BASE_PROFILE["role"]}
- Base Summary: {BASE_PROFILE["summary"]}
- Base Competencies:
{chr(10).join([f"  * {c}" for c in BASE_PROFILE["competencies"]])}

Job Description to target:
\"\"\"
{job_description}
\"\"\"

Your tasks:
1. Tailor the candidate's professional summary. It must be a concise paragraph (no more than {summary_sentences_max} sentences).
   - Frame the candidate's 20+ years of software experience and engineering leadership to align with the target job's domain.
   - Highlight transferable skills: e.g., if the job is about E-Commerce/loyalty/CRM, emphasize high-scale customer-facing systems, cloud architectures (AWS/GCP), loyalty personalization, and leading full-stack or backend teams.
   - Cleanse and omit irrelevant domain-specific buzzwords (such as 'clinical', 'healthcare', 'medical') unless the target job description explicitly mentions healthcare.
   - Contextualize their technology stack to match the job description's keywords (such as Node.js, React, React Native, CI/CD, GCP, AWS) by framing it as environments they have architected, systems they integrated, or cross-functional teams they have supervised.
   - Format the summary as raw LaTeX.

2. Tailor exactly {competencies_count} core competencies. Format them as exactly {competencies_count} LaTeX items:
   \\item \\textbf{{Competency Title:}} Competency description highlighting direct alignment with the job.
   - Map each of the {competencies_count} competencies directly to key requirements in the job description (e.g. engineering leadership, cloud computing, frontend/backend architecture, agile delivery, system scalability).
   - Weave in the exact keywords from the job description (e.g. Node.js, React, AWS, GCP, e-commerce, CRM, agile).
   - Ensure the titles and descriptions reflect keywords from the job description but remain grounded in the candidate's real capabilities as a senior director/leader.

3. Compute an ATS Match Score (0 to 100) reflecting the match percentage. Since your task is to successfully tailor the resume, your final tailored content should achieve a score of 90 or higher.
4. Extract the jobTitle and companyName from the job description or page details.
5. Provide a list of matching keywords (an array of strings) and a detailed match analysis explaining how the candidate's transferable skills were mapped to the job requirements.

Format the output strictly as a JSON object matching this schema:
{{
  "jobTitle": "string",
  "companyName": "string",
  "atsScore": number,
  "analysis": "string detailing matches and gaps",
  "summary": "LaTeX summary text",
  "competencies": "LaTeX competencies block containing the items",
  "keywords": ["string"]
}}
"""

gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
response = requests.post(
    gemini_url,
    headers={"Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": prompt_text}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "jobTitle": {"type": "STRING"},
                    "companyName": {"type": "STRING"},
                    "atsScore": {"type": "INTEGER"},
                    "analysis": {"type": "STRING"},
                    "summary": {"type": "STRING"},
                    "competencies": {"type": "STRING"},
                    "keywords": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                },
                "required": ["jobTitle", "companyName", "atsScore", "analysis", "summary", "competencies", "keywords"]
            }
        }
    }
)

if response.status_code != 200:
    print(f"Error querying Gemini: {response.text}")
    exit(1)

parsed_result = json.loads(response.json()["candidates"][0]["content"]["parts"][0]["text"])
print(f"Pass 1 ATS Score: {parsed_result['atsScore']}")
print(f"Pass 1 Summary: {parsed_result['summary']}")
print(f"Pass 1 Competencies: {parsed_result['competencies']}")

print("\n--- Running Pass 2 Prompt ---")
prompt_pass2 = f"""
You are a strict ATS compliance editor and resume optimizer. Your task is to perform a second validation pass on the draft resume summary and competencies to ensure they are fully tailored to the target job and that the ATS Match Score is 90% or higher.

Job Description:
\"\"\"
{job_description}
\"\"\"

Candidate Base Resume Profile:
- Name: {rules.get("profile", {}).get("candidate_name", "Bhagath Siddi")}
- Target Role: {BASE_PROFILE["role"]}
- Base Summary: {BASE_PROFILE["summary"]}
- Base Competencies:
{chr(10).join([f"  * {c}" for c in BASE_PROFILE["competencies"]])}

DRAFT Tailored Summary:
\"\"\"
{parsed_result.get("summary")}
\"\"\"

DRAFT Tailored Competencies:
\"\"\"
{parsed_result.get("competencies")}
\"\"\"

Your tasks:
1. Audit the draft summary and competencies against the target job description. Identify any missing keywords or requirements (e.g., specific technologies like Node.js, React, AWS, GCP, or domains like e-commerce, loyalty, CRM).
2. Rewrite, refine, and optimize the summary and competencies to weave in those missing elements as transferable skills, leadership competencies, or architectural governance, maximizing the tailoring density.
3. Ensure that any irrelevant domain jargon (like 'clinical' or 'healthcare') is completely stripped out unless the target job is in the healthcare industry.
4. Verify that the summary is a single cohesive paragraph of no more than {summary_sentences_max} sentences.
5. Verify that there are exactly {competencies_count} core competency items.
6. Re-evaluate the ATS match score (0-100). The final score must be 90 or higher, reflecting the optimized alignment.
7. Verify and preserve the jobTitle: "{parsed_result.get("jobTitle")}" and companyName: "{parsed_result.get("companyName")}".

Format the output strictly as a JSON object matching this schema:
{{
  "jobTitle": "string",
  "companyName": "string",
  "atsScore": number,
  "analysis": "string detailing finalized matches and gaps",
  "summary": "LaTeX summary text",
  "competencies": "LaTeX competencies block containing the items",
  "keywords": ["string"]
}}
"""

response_pass2 = requests.post(
    gemini_url,
    headers={"Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": prompt_pass2}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "jobTitle": {"type": "STRING"},
                    "companyName": {"type": "STRING"},
                    "atsScore": {"type": "INTEGER"},
                    "analysis": {"type": "STRING"},
                    "summary": {"type": "STRING"},
                    "competencies": {"type": "STRING"},
                    "keywords": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                },
                "required": ["jobTitle", "companyName", "atsScore", "analysis", "summary", "competencies", "keywords"]
            }
        }
    }
)

if response_pass2.status_code != 200:
    print(f"Error querying Pass 2: {response_pass2.text}")
    exit(1)

parsed_pass2 = json.loads(response_pass2.json()["candidates"][0]["content"]["parts"][0]["text"])
print(f"Pass 2 ATS Score: {parsed_pass2['atsScore']}")
print(f"Pass 2 Summary: {parsed_pass2['summary']}")
print(f"Pass 2 Competencies: {parsed_pass2['competencies']}")
print(f"Pass 2 Analysis: {parsed_pass2['analysis']}")
print(f"Pass 2 Keywords: {parsed_pass2['keywords']}")
