import os
import json
import re
import subprocess
import requests
import asyncio
import time
import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from config import SYSTEM_INSTRUCTION

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS for the Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONFIG_FILE = 'config.json'
HISTORY_FILE = 'jobs.json'
BASE_TEMPLATE_PATH = 'base_template.tex'
RULES_FILE = 'resume_rules.json'

# Async lock for jobs.json read/writes
history_lock = asyncio.Lock()
# Asynchronous local queue
job_queue = asyncio.Queue()

async def read_history_safe():
    async with history_lock:
        if not os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, 'w') as f:
                json.dump([], f)
        try:
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
            # Ensure status exists for legacy items
            modified = False
            for item in history:
                if "status" not in item:
                    item["status"] = "completed"
                    modified = True
            if modified:
                with open(HISTORY_FILE, 'w') as f:
                    json.dump(history, f, indent=2)
            return history
        except Exception as e:
            print(f"Error reading history safely: {e}")
            return []

async def write_history_safe(history):
    async with history_lock:
        try:
            with open(HISTORY_FILE, 'w') as f:
                json.dump(history, f, indent=2)
            return True
        except Exception as e:
            print(f"Error writing history safely: {e}")
            return False

async def update_job_status(job_id: str, status: str, error_msg: str = None, updates: dict = None):
    history = await read_history_safe()
    for item in history:
        if item.get("id") == job_id:
            item["status"] = status
            if error_msg:
                item["error"] = error_msg
            else:
                # Clear previous error if succeeded
                item.pop("error", None)
            if updates:
                for k, v in updates.items():
                    item[k] = v
            break
    if len(history) > 50:
        history = history[:50]
    await write_history_safe(history)

# Base candidate details to avoid hallucination
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

# Helper: Load rules dynamically
def load_rules():
    if not os.path.exists(RULES_FILE):
        raise FileNotFoundError(f"Rules file not found at: {RULES_FILE}")
    with open(RULES_FILE, 'r') as f:
        return json.load(f)

# Helper: Load API Config
def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print("Error reading config:", e)
    return {
        "geminiApiKey": os.getenv("GEMINI_API_KEY", "")
    }

# Helper: Save API Config
def save_config(api_key):
    with open(CONFIG_FILE, 'w') as f:
        json.dump({"geminiApiKey": api_key}, f, indent=2)
    
    # Save to .env
    env_content = ""
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            env_content = f.read()
            
    lines = env_content.split("\n")
    found = False
    new_lines = []
    for line in lines:
        if line.startswith("GEMINI_API_KEY="):
            found = True
            new_lines.append(f"GEMINI_API_KEY={api_key}")
        else:
            new_lines.append(line)
            
    if not found:
        new_lines.append(f"GEMINI_API_KEY={api_key}")
        
    with open(".env", "w") as f:
        f.write("\n".join(new_lines))
        
    os.environ["GEMINI_API_KEY"] = api_key

# Helper: Determine dynamic titles for 7-Eleven and CVS Health based on seniority of the target jobTitle
def get_historical_titles(target_title):
    if not target_title:
        return (
            "Senior Engineering Manager | Head of Technology - 7Now Delivery Platform",
            "Director | Engineering Manager - Digital Applications and Regulated Infrastructure"
        )
    
    title_lower = target_title.lower()
    
    # 1. Senior Director or Director
    if "director" in title_lower:
        return (
            "Head of Technology - 7Now Delivery Platform",
            "Director | Engineering Manager - Digital Applications and Regulated Infrastructure"
        )
    
    # 2. Senior Manager (contains 'manager' and either 'senior' or 'sr')
    elif "manager" in title_lower and ("senior" in title_lower or "sr" in title_lower):
        return (
            "Sr. Engineering Manager - 7Now Delivery Platform",
            "Engineering Manager - Digital Applications and Regulated Infrastructure"
        )
    
    # 3. Engineering Manager (contains 'manager')
    elif "manager" in title_lower:
        return (
            "Engineering Manager - 7Now Delivery Platform",
            "Engineering Manager - Digital Applications and Regulated Infrastructure"
        )
    
    # Fallback
    else:
        return (
            "Senior Engineering Manager | Head of Technology - 7Now Delivery Platform",
            "Director | Engineering Manager - Digital Applications and Regulated Infrastructure"
        )

# Helper: Dynamic LaTeX escaping using loaded rules profile
def clean_latex(text, rules, is_competencies=False, is_cover_letter=False):
    if not text:
        return ""
    
    # Strip any \section, \subsection, \subsubsection commands and their contents
    text = re.sub(r'\\(?:sub){0,2}section\*?\{[^}]*\}', '', text, flags=re.IGNORECASE)
    
    # Strip common environment begin/end lines
    text = re.sub(r'\\begin\{(?:itemize|quote|enumerate|center|flushleft|flushright)\}', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\\end\{(?:itemize|quote|enumerate|center|flushleft|flushright)\}', '', text, flags=re.IGNORECASE)
    
    # Strip common spacing and alignment commands
    text = re.sub(r'\\(?:v|h)space\*?\{[^}]*\}', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\\(?:v|h)fill', '', text, flags=re.IGNORECASE)
    
    # Strip specific bold headers the LLM might prepend
    text = re.sub(r'\\textbf\{Executive\s+Summary\}', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\\textbf\{Core\s+Competencies\}', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\\textbf\{Core\s+AI\s+Competencies\s+\&\s+Technical\s+Leadership\}', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\\textbf\{Core\s+AI\s+Competencies\s+and\s+Technical\s+Leadership\}', '', text, flags=re.IGNORECASE)
    
    # Strip plain text headers at the start of the string (case-insensitive)
    text = re.sub(r'^\s*Executive\s+Summary\s*[:\-]?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'^\s*Core\s+Competencies\s*[:\-]?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'^\s*Core\s+AI\s+Competencies\s+and\s+Technical\s+Leadership\s*[:\-]?\s*', '', text, flags=re.IGNORECASE)
    
    if is_competencies:
        # Strip any \item \textbf{Core Competencies} or \item \textbf{Executive Summary} that might have slipped through
        text = re.sub(r'\\item\s*\\textbf\{Executive\s+Summary\}', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\\item\s*\\textbf\{Core\s+Competencies\}', '', text, flags=re.IGNORECASE)
    else:
        # For summary, strip any leading \item commands or bullet formatting the LLM might have used
        text = re.sub(r'^\s*\\item\s*\\textbf\{[^}]*\}\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'^\s*\\item\s*', '', text, flags=re.IGNORECASE)

    # 1. Substitute forbidden characters based on resume_rules.json
    forbidden_chars = rules.get("syntax_constraints", {}).get("forbidden_characters", {})
    
    # Process & and % strictly according to the json rules
    if "&" in forbidden_chars:
        # e.g., substitute with "and"
        text = text.replace("&", " and ")
        
    if "%" in forbidden_chars:
        # e.g., escape percent symbol (negative lookbehind to avoid double-escaping)
        text = re.sub(r'(?<!\\)%', r'\%', text)

    # 2. Apply standard safety escape codes for other breaking LaTeX characters
    text = re.sub(r'(?<!\\)_', r'\_', text)
    text = re.sub(r'(?<!\\)\$', r'\$', text)
    text = re.sub(r'(?<!\\)#', r'\#', text)
    
    # 3. Clean up spacing
    if is_cover_letter:
        # Normalize double newlines to paragraph breaks, collapse other spacing
        text = re.sub(r'\r\n', '\n', text)
        text = re.sub(r'\n{2,}', ' <PARAGRAPH_BREAK> ', text)
        text = re.sub(r'\s+', ' ', text)
        text = text.replace('<PARAGRAPH_BREAK>', '\n\n')
    elif not is_competencies:
        text = re.sub(r'\s+', ' ', text)
    else:
        # Normalize bullet formatting
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        cleaned_lines = []
        for line in lines:
            if not line or line.strip() == r"\item" or line.strip() == r"\item \textbf{}":
                continue
            cleaned_lines.append(line)
        text = "\n".join(cleaned_lines)
        
    return text.strip()

# Helper: Tone and voice substitutions
def substitute_forbidden_words(text, rules):
    forbidden_words = rules.get("tone_and_voice", {}).get("forbidden_words", {})
    for word, desc in forbidden_words.items():
        # Match word inside single quotes from the description text (e.g. 'journey')
        match = re.search(r"'(.*?)'", desc)
        replacement = match.group(1) if match else "journey"
        # Case-insensitive replacement
        text = re.sub(re.escape(word), replacement, text, flags=re.IGNORECASE)
    return text

# Helper: Normalize names for output file name
def normalize_name(text):
    text = text.lower().strip()
    # Remove non-alphanumeric (except spaces and dashes)
    text = re.sub(r'[^a-z0-9\s\-]', '', text)
    # Replace spaces and dashes with a single underscore
    text = re.sub(r'[\s\-]+', '_', text)
    return text.strip('_')

# Endpoints
@app.get("/api/config")
async def get_config():
    config = load_config()
    api_key = config.get("geminiApiKey", "")
    try:
        rules = load_rules()
        output_dir = rules.get("file_naming", {}).get("output_dir", "output")
    except Exception:
        output_dir = "output"
    return {"geminiApiKey": api_key, "outputDir": output_dir}

@app.post("/api/config")
async def post_config(request: Request):
    data = await request.json()
    api_key = data.get("geminiApiKey")
    output_dir = data.get("outputDir")
    if not api_key:
        raise HTTPException(status_code=400, detail="API Key is required")
    save_config(api_key)
    if output_dir:
        try:
            rules = load_rules()
            if "file_naming" not in rules:
                rules["file_naming"] = {}
            rules["file_naming"]["output_dir"] = output_dir
            with open(RULES_FILE, 'w') as f:
                json.dump(rules, f, indent=2)
        except Exception as e:
            print("Error saving output_dir to rules:", e)
    return {"success": True, "message": "Settings saved successfully"}

@app.post("/api/select-folder")
async def select_folder():
    script = 'POSIX path of (choose folder with prompt "Select Resume Output Folder:")'
    try:
        result = subprocess.run(
            ['osascript', '-e', script],
            capture_output=True,
            text=True,
            check=True
        )
        selected_path = result.stdout.strip()
        return {"success": True, "path": selected_path}
    except subprocess.CalledProcessError as e:
        # Typically means the user clicked cancel or closed the window
        return {"success": False, "cancelled": True}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.get("/api/history")
async def get_history():
    return await read_history_safe()

@app.delete("/api/history/{job_id}")
async def delete_history_item(job_id: str):
    history = await read_history_safe()
    new_history = [job for job in history if job.get("id") != job_id]
    
    if len(new_history) == len(history):
        raise HTTPException(status_code=404, detail="Item not found")
        
    await write_history_safe(new_history)
    return {"success": True, "message": "Item deleted successfully"}

@app.get("/api/job-status/{job_id}")
async def get_job_status(job_id: str):
    history = await read_history_safe()
    for item in history:
        if item.get("id") == job_id:
            return {
                "success": True,
                "status": item.get("status", "completed"),
                "jobTitle": item.get("jobTitle"),
                "companyName": item.get("companyName"),
                "atsScore": item.get("atsScore"),
                "analysis": item.get("analysis"),
                "summary": item.get("summary"),
                "competencies": item.get("competencies"),
                "coverLetter": item.get("coverLetter"),
                "error": item.get("error", "")
            }
    raise HTTPException(status_code=404, detail="Job not found")

@app.post("/api/open-folder")
async def open_folder():
    rules = load_rules()
    # Get output dir from naming rules (default to 'output')
    output_dir = rules.get("file_naming", {}).get("output_dir", "output")
    if os.path.exists("/.dockerenv"):
        output_dir = "output"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        
    if not os.path.exists("/.dockerenv"):
        subprocess.run(["open", output_dir])
    return {"success": True}

# Helper to run blocking function in executor
async def run_blocking(func, *args):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, func, *args)

async def queue_worker():
    print("Background queue worker started.")
    while True:
        try:
            job_data = await job_queue.get()
            job_id = job_data["job_id"]
            job_description = job_data["job_description"]
            job_url = job_data["job_url"]
            
            print(f"Queue worker picked up job {job_id}. Status set to 'processing'.")
            await update_job_status(job_id, "processing", updates={
                "jobTitle": "Processing...",
                "companyName": "Analyzing JD..."
            })
            
            await process_job_tailoring(job_id, job_description, job_url)
            
        except Exception as e:
            print(f"Error in queue worker execution: {e}")
        finally:
            job_queue.task_done()

async def process_job_tailoring(job_id: str, job_description: str, job_url: str):
    try:
        # Load API key dynamically
        config = load_config()
        api_key = config.get("geminiApiKey") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            await update_job_status(job_id, "failed", error_msg="Gemini API Key is not configured. Please set it in the settings panel.")
            return

        # Load dynamic rules
        rules = load_rules()
        output_dir = rules.get("file_naming", {}).get("output_dir", "output")
        if os.path.exists("/.dockerenv"):
            output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)

        summary_sentences_max = rules.get("page_defense_layout", {}).get("macro_content_limits", {}).get("summary_sentences_max", 4)
        competencies_count = rules.get("page_defense_layout", {}).get("macro_content_limits", {}).get("core_competencies_count", 6)

        # Verify job still exists in history (was not deleted while in queue)
        history = await read_history_safe()
        if not any(item.get("id") == job_id for item in history):
            print(f"Job {job_id} was deleted from history before processing. Skipping.")
            return

        # Prompt design
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
   - Keep the description of each competency extremely concise (at most 1-2 sentences, ~20-25 words each) to strictly respect the absolute 1-page budget.

3. Write a highly tailored, compelling Cover Letter body connecting the candidate's background (7-Eleven, CVS Health, MIT Agentic AI credentials) directly to the target role's mission and challenges.
   - You MUST structure the cover letter EXACTLY as follows, using double newlines for paragraph breaks:
     Recipient Line: Hiring Team [Company Name] (or specific hiring manager and team if named, e.g., Andrew Phelan and the Moonshot Labs Hiring Team)
     Location Line: [Location context from the JD, e.g. Dallas-Fort Worth Metroplex, TX]
     Subject Line: Subject: Application for [Job Title]
     Salutation Line: Dear [Hiring Manager and/or Hiring Team, e.g. Dear Andrew Phelan and the Moonshot Labs Hiring Team,]
     Body Paragraphs: 3-4 paragraphs of tailored body text.
     Sign-off: Sincerely,\n\nBhagath Siddi
   - Output this formatting directly inside the "cover_letter" JSON property.

4. Compute an ATS Match Score (0 to 100) reflecting the match percentage. Since your task is to successfully tailor the resume, your final tailored content should achieve a score of 90 or higher.
5. Extract the jobTitle and companyName from the job description or page details.
6. Provide a list of at most 10-15 most critical matching keywords (an array of strings) and a detailed match analysis explaining how the candidate's transferable skills were mapped to the job requirements.

Format the output strictly as a JSON object matching this schema:
{{
  "jobTitle": "string",
  "companyName": "string",
  "atsScore": number,
  "analysis": "string detailing matches and gaps",
  "summary": "LaTeX summary text",
  "competencies": "LaTeX competencies block containing the items",
  "cover_letter": "formatted cover letter text",
  "keywords": ["string"]
}}
"""

        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        def post_pass1():
            return requests.post(
                gemini_url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt_text}]}],
                    "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
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
                                "cover_letter": {"type": "STRING"},
                                "keywords": {
                                    "type": "ARRAY",
                                    "items": {"type": "STRING"}
                                }
                            },
                            "required": ["jobTitle", "companyName", "atsScore", "analysis", "summary", "competencies", "cover_letter", "keywords"]
                        }
                    }
                }
            )

        response = await run_blocking(post_pass1)

        if response.status_code != 200:
            error_details = f"Gemini API returned error: {response.status_code} {response.text}"
            await update_job_status(job_id, "failed", error_msg=error_details)
            return

        data = response.json()
        result_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
        
        if not result_text:
            await update_job_status(job_id, "failed", error_msg="Gemini API returned empty content.")
            return

        parsed_result = json.loads(result_text)
        
        # Update job details to actual parsed values immediately to give user visual feedback!
        await update_job_status(job_id, "processing", updates={
            "jobTitle": parsed_result.get("jobTitle"),
            "companyName": parsed_result.get("companyName")
        })

        # PASS 2: Double-Validation and Optimization Sweep
        print("--- Initiating Pass 2: Strict Double-Validation Sweep ---")
        
        draft_summary = clean_latex(parsed_result.get("summary", ""), rules, is_competencies=False)
        draft_summary = substitute_forbidden_words(draft_summary, rules)
        
        draft_competencies = clean_latex(parsed_result.get("competencies", ""), rules, is_competencies=True)
        draft_competencies = substitute_forbidden_words(draft_competencies, rules)

        draft_cover_letter = clean_latex(parsed_result.get("cover_letter", ""), rules, is_cover_letter=True)
        draft_cover_letter = substitute_forbidden_words(draft_cover_letter, rules)

        prompt_pass2 = f"""
You are a strict ATS compliance editor, resume optimizer, and cover letter writer. Your task is to perform a second validation pass on the draft resume summary, competencies, and cover letter to ensure they are fully tailored to the target job and that the ATS Match Score is 90% or higher.

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
{draft_summary}
\"\"\"

DRAFT Tailored Competencies:
\"\"\"
{draft_competencies}
\"\"\"

DRAFT Tailored Cover Letter:
\"\"\"
{draft_cover_letter}
\"\"\"


Your tasks:
1. Audit the draft summary and competencies against the target job description. Identify any missing keywords or requirements (e.g., specific technologies like Node.js, React, AWS, GCP, or domains like e-commerce, loyalty, CRM).
2. Rewrite, refine, and optimize the summary and competencies to weave in those missing elements as transferable skills, leadership competencies, or architectural governance, maximizing the tailoring density.
3. Ensure that any irrelevant domain jargon (like 'clinical' or 'healthcare') is completely stripped out unless the target job is in the healthcare industry.
4. Verify that the summary is a single cohesive paragraph of no more than {summary_sentences_max} sentences.
5. Verify that there are exactly {competencies_count} core competency items, and that their descriptions are highly concise (at most 1-2 sentences each) to respect the absolute 1-page budget.
6. Review and optimize the cover letter text, keeping it highly tailored, professional, free of ampersands, and correctly structured with recipient, location, subject, salutation, body paragraphs, and professional closing sign-off. Ensure the recipient line, location line, subject line, and salutation line are each separated by double newlines at the start.
7. Re-evaluate the ATS match score (0-100). The final score must be 90 or higher, reflecting the optimized alignment.
8. Verify and preserve the jobTitle: "{parsed_result.get("jobTitle")}" and companyName: "{parsed_result.get("companyName")}".
9. Provide a list of at most 10-15 most critical matching keywords (an array of strings) to keep the appended ATS target block concise and prevent layout overflow.

Format the output strictly as a JSON object matching this schema:
{{
  "jobTitle": "string",
  "companyName": "string",
  "atsScore": number,
  "analysis": "string detailing finalized matches and gaps",
  "summary": "LaTeX summary text",
  "competencies": "LaTeX competencies block containing the items",
  "cover_letter": "formatted cover letter text",
  "keywords": ["string"]
}}
"""

        def post_pass2():
            return requests.post(
                gemini_url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt_pass2}]}],
                    "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
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
                                "cover_letter": {"type": "STRING"},
                                "keywords": {
                                    "type": "ARRAY",
                                    "items": {"type": "STRING"}
                                }
                            },
                            "required": ["jobTitle", "companyName", "atsScore", "analysis", "summary", "competencies", "cover_letter", "keywords"]
                        }
                    }
                }
            )

        response_pass2 = await run_blocking(post_pass2)

        if response_pass2.status_code == 200:
            data_pass2 = response_pass2.json()
            result_pass2_text = data_pass2.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
            if result_pass2_text:
                parsed_result = json.loads(result_pass2_text)
                print("--- Pass 2 completed successfully. Resume blocks double-validated. ---")
            else:
                print("--- Pass 2 failed to return content, falling back to Pass 1 draft ---")
        else:
            print(f"--- Pass 2 failed with status code {response_pass2.status_code}, falling back to Pass 1 draft ---")

        # Escape characters and replace forbidden words dynamically
        summary = clean_latex(parsed_result.get("summary", ""), rules, is_competencies=False)
        summary = substitute_forbidden_words(summary, rules)
        
        competencies = clean_latex(parsed_result.get("competencies", ""), rules, is_competencies=True)
        competencies = substitute_forbidden_words(competencies, rules)

        cover_letter = clean_latex(parsed_result.get("cover_letter", ""), rules, is_cover_letter=True)
        cover_letter = substitute_forbidden_words(cover_letter, rules)

        keywords = parsed_result.get("keywords", [])

        # Read template
        if not os.path.exists(BASE_TEMPLATE_PATH):
            await update_job_status(job_id, "failed", error_msg=f"Base template not found at {BASE_TEMPLATE_PATH}")
            return
            
        with open(BASE_TEMPLATE_PATH, 'r') as f:
            template_content = f.read()

        # DYNAMIC PAGE DEFENSE LAYOUT ADJUSTMENTS
        layout = rules.get("page_defense_layout", {})
        
        # 1. Update geometry margins
        geometry_margins = layout.get("geometry_margins")
        if geometry_margins:
            template_content = re.sub(
                r'\\usepackage\[[^\]]*\]\{geometry\}',
                f'\\\\usepackage[{geometry_margins}]{{geometry}}',
                template_content
            )

        # 2. Update section spacing
        section_spacing = layout.get("section_spacing")
        if section_spacing:
            template_content = re.sub(
                r'\\titlespacing\{\\section\}[^%\n]*',
                section_spacing.replace('\\', '\\\\'),
                template_content
            )

        # 3. Update list spacing
        list_spacing = layout.get("list_spacing")
        if list_spacing:
            template_content = re.sub(
                r'\\setlist\[itemize\]\{[^\}]*\}',
                f'\\\\setlist[itemize]{{{list_spacing}}}',
                template_content
            )

        # 4. Scrub forbidden environments
        forbidden_envs = layout.get("forbidden_environments", [])
        for env in forbidden_envs:
            template_content = template_content.replace(f"\\begin{{{env}}}", "{")
            template_content = template_content.replace(f"\\end{{{env}}}", "\\par}")

        # 5. Inject role, summary, competencies & dynamic historical experience titles
        role_title = parsed_result.get("jobTitle", "DIRECTOR OF AI ENGINEERING | STRATEGY & ENTERPRISE ML LIFE-CYCLE").upper()
        role_title_escaped = clean_latex(role_title, rules)
        role_title_escaped = substitute_forbidden_words(role_title_escaped, rules)
        template_content = template_content.replace('%TOKEN_ROLE_ZONE%', role_title_escaped)
        template_content = template_content.replace('%TOKEN_SUMMARY_ZONE%', summary)
        template_content = template_content.replace('%TOKEN_COMPETENCIES_ZONE%', competencies)

        title_7eleven, title_cvs = get_historical_titles(role_title)
        title_7eleven_escaped = clean_latex(title_7eleven, rules)
        title_7eleven_escaped = substitute_forbidden_words(title_7eleven_escaped, rules)
        title_cvs_escaped = clean_latex(title_cvs, rules)
        title_cvs_escaped = substitute_forbidden_words(title_cvs_escaped, rules)
        
        template_content = template_content.replace('%TOKEN_7ELEVEN_TITLE_ZONE%', title_7eleven_escaped)
        template_content = template_content.replace('%TOKEN_CVS_TITLE_ZONE%', title_cvs_escaped)

        # 6. Inject ATS Strategy target block
        ats_target = rules.get("ats_target_block", {})
        if ats_target.get("required", False):
            format_string = ats_target.get("format_string", "")
            safe_kw_str = clean_latex(", ".join(keywords), rules)
            ats_block = format_string.replace("{keywords}", safe_kw_str)
            template_content = template_content.replace("\\end{document}", ats_block + "\n\\end{document}")

        # DYNAMIC FILE NAMING CONVENTION
        company_name_norm = normalize_name(parsed_result.get("companyName", "company"))
        job_title_norm = normalize_name(parsed_result.get("jobTitle", "role"))
        
        base_filename = f"bhagath_resume_{company_name_norm}_{job_title_norm}"
        
        # Create subfolder for resume .tex files
        resume_tex_dir = os.path.join(output_dir, "resume_tex")
        os.makedirs(resume_tex_dir, exist_ok=True)
        
        tex_path = os.path.join(resume_tex_dir, f"{base_filename}.tex")
        pdf_path = os.path.join(output_dir, f"{base_filename}.pdf")

        # Save LaTeX file
        with open(tex_path, 'w') as f:
            f.write(template_content)
        print(f"Saved LaTeX output to: {tex_path}")

        # Compile with tectonic
        tectonic_exec = "tectonic"
        if os.path.exists("/opt/homebrew/bin/tectonic"):
            tectonic_exec = "/opt/homebrew/bin/tectonic"
        tectonic_cmd = f'{tectonic_exec} -o "{output_dir}" "{tex_path}"'
        print(f"Executing compilation: {tectonic_cmd}")
        
        result = await run_blocking(lambda: subprocess.run(tectonic_cmd, shell=True, capture_output=True, text=True))
        
        # Compile cover letter if generated
        cl_pdf_path = ""
        cl_tex_path = ""
        if cover_letter:
            cover_letter_template_path = "cover_letter_template.tex"
            if os.path.exists(cover_letter_template_path):
                with open(cover_letter_template_path, 'r') as f:
                    cl_content = f.read()
                
                cl_content = cl_content.replace('%TOKEN_COVER_LETTER_ZONE%', cover_letter)
                
                cl_base_filename = f"cover_letter_{company_name_norm}_{job_title_norm}"
                
                # Create subfolder for coverletter .tex files
                coverletter_tex_dir = os.path.join(output_dir, "coverletter_tex")
                os.makedirs(coverletter_tex_dir, exist_ok=True)
                
                cl_tex_path = os.path.join(coverletter_tex_dir, f"{cl_base_filename}.tex")
                cl_pdf_path = os.path.join(output_dir, f"{cl_base_filename}.pdf")
                
                with open(cl_tex_path, 'w') as f:
                    f.write(cl_content)
                print(f"Saved Cover Letter LaTeX output to: {cl_tex_path}")
                
                cl_cmd = f'{tectonic_exec} -o "{output_dir}" "{cl_tex_path}"'
                print(f"Executing Cover Letter compilation: {cl_cmd}")
                cl_res = await run_blocking(lambda: subprocess.run(cl_cmd, shell=True, capture_output=True, text=True))
                if cl_res.returncode == 0:
                    print("Cover Letter compiled successfully.")
                else:
                    print("Cover Letter compilation failed:")
                    print("Stdout:", cl_res.stdout)
                    print("Stderr:", cl_res.stderr)

        if result.returncode != 0:
            print("LaTeX compilation failed:")
            print("Stdout:", result.stdout)
            print("Stderr:", result.stderr)
            await update_job_status(job_id, "failed", error_msg=f"LaTeX compilation failed: {result.stderr or result.stdout}")
            return

        print("LaTeX compilation completed successfully.")
        
        # Auto-open output folder
        if not os.path.exists("/.dockerenv"):
            await run_blocking(lambda: subprocess.run(["open", output_dir]))

        # Update status to completed and save all results!
        await update_job_status(job_id, "completed", updates={
            "jobTitle": parsed_result.get("jobTitle"),
            "companyName": parsed_result.get("companyName"),
            "atsScore": parsed_result.get("atsScore"),
            "analysis": parsed_result.get("analysis"),
            "summary": summary,
            "competencies": competencies,
            "coverLetter": cover_letter,
            "pdfPath": pdf_path,
            "clPdfPath": cl_pdf_path
        })

    except Exception as e:
        print(f"Exception during background tailoring of job {job_id}: {e}")
        import traceback
        traceback.print_exc()
        await update_job_status(job_id, "failed", error_msg=str(e))

@app.post("/api/analyze-job")
async def analyze_job(request: Request):
    payload = await request.json()
    job_description = payload.get("jobDescription")
    job_url = payload.get("jobUrl", "")

    if not job_description:
        raise HTTPException(status_code=400, detail="Job description is required")

    config = load_config()
    api_key = config.get("geminiApiKey") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is not configured. Please set it in the settings panel.")

    job_id = f"{int(time.time())}_{int(time.time_ns() % 1000000):06d}"

    new_job = {
        "id": job_id,
        "jobTitle": "Queued...",
        "companyName": "Pending...",
        "jobUrl": job_url or "Manual Input",
        "atsScore": 0,
        "analysis": "Job is currently queued in the local background processing pool. It will be analyzed sequentially.",
        "summary": "",
        "competencies": "",
        "coverLetter": "",
        "jobDescription": job_description,
        "date": datetime.datetime.now().astimezone().isoformat(timespec='seconds'),
        "status": "pending"
    }

    # Save to history safely
    history = await read_history_safe()
    history.insert(0, new_job)
    await write_history_safe(history)

    # Queue the job
    await job_queue.put({
        "job_id": job_id,
        "job_description": job_description,
        "job_url": job_url
    })

    return {
        "success": True,
        "jobId": job_id,
        "status": "pending"
    }

@app.on_event("startup")
async def startup_event():
    # Start the queue worker
    asyncio.create_task(queue_worker())
    
    # Scan jobs.json for pending or processing tasks and re-queue them
    history = await read_history_safe()
    requeued_count = 0
    # Process oldest first to preserve FIFO order (history is newest first, so we reverse it!)
    for item in reversed(history):
        status = item.get("status", "completed")
        if status in ("pending", "processing"):
            # Set status back to pending to be clean
            item["status"] = "pending"
            await job_queue.put({
                "job_id": item["id"],
                "job_description": item["jobDescription"],
                "job_url": item["jobUrl"]
            })
            requeued_count += 1
            
    if requeued_count > 0:
        print(f"Re-queued {requeued_count} pending/processing jobs on startup.")
        await write_history_safe(history)
# Helper: Clean raw HTML text
def clean_html(html):
    # Strip script and style tags and their contents
    html = re.sub(r'<(script|style)\b[^>]*>([\s\S]*?)<\/\1>', '', html, flags=re.IGNORECASE)
    # Strip comments
    html = re.sub(r'<!--[\s\S]*?-->', '', html)
    # Strip all other HTML tags
    text = re.sub(r'<[^>]+>', ' ', html)
    # Normalize whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

@app.get("/api/scrape-url")
async def scrape_url_endpoint(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    }
    
    try:
        # Check if URL starts with http
        if not url.startswith("http"):
            url = "https://" + url

        # Fetch page content
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        
        # Check if redirected to login page or restricted
        final_url = response.url.lower()
        if "login" in final_url or "signup" in final_url or "auth" in final_url or "checkpoint" in final_url:
            return {"success": False, "login_wall": True, "error": "LOGIN_WALL"}

        if response.status_code != 200:
            return {"success": False, "error": f"Failed to load page. Status code: {response.status_code}"}

        # Clean HTML
        clean_text = clean_html(response.text)
        
        # Limit clean text length to avoid token limit issues (e.g. 20,000 characters)
        clean_text = clean_text[:20000]

        # Use Gemini to extract clean job description if API key is configured
        config = load_config()
        api_key = config.get("geminiApiKey") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"success": True, "description": clean_text[:3000]} # Fallback if no API key

        # Prompt Gemini to parse job description
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        prompt = f"""
You are an expert content extractor. Your task is to extract only the clean job description (including Job Title, Company Name, key responsibilities, and qualifications) from the raw webpage text provided below.

Rules:
1. Strip all navigation menus, footers, login/signup prompts, cookies warnings, sidebar ads, and irrelevant company boilerplate.
2. If the text appears to be a login wall, CAPTCHA page, signup form, or access blocked notification, return exactly the string "ERROR: LOGIN_WALL".
3. Return only the extracted job description text. Do not add any conversational markdown headers or text around it.

Raw webpage text:
\"\"\"
{clean_text}
\"\"\"
"""
        res = requests.post(
            gemini_url,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}]
            }
        )

        if res.status_code == 200:
            gemini_data = res.json()
            extracted = gemini_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
            
            if "ERROR: LOGIN_WALL" in extracted:
                return {"success": False, "login_wall": True, "error": "LOGIN_WALL"}
                
            return {"success": True, "description": extracted}
        else:
            # Fallback if Gemini request fails
            return {"success": True, "description": clean_text[:5000]}

    except Exception as e:
        return {"success": False, "error": str(e)}

# Serving static dashboard files
@app.get("/")
async def read_index():
    return FileResponse("public/index.html")


@app.get("/resume_template.tex")
async def read_template():
    return FileResponse(BASE_TEMPLATE_PATH)

app.mount("/", StaticFiles(directory="public"), name="public")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=3000, reload=True)
