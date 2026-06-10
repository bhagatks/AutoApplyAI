import requests
import os
import json

# Setup mock payload
mock_jd = """
AI Development Manager - Moonshot Labs
Location: Dallas-Fort Worth Metroplex, TX (Hybrid/Onsite)

About Moonshot Labs:
At Moonshot Labs, we are turning AI inward to accelerate manufacturing workflows from the shop floor to leadership. We build practical, production-ready AI agents and workflows rather than theoretical frameworks.

Role Overview:
We are seeking an AI Development Manager to lead our software development team. You will be a player-coach technology executive who can make definitive architecture calls, set the technical bar, and lead high-scale engineering teams.

Key Responsibilities:
- Manage the roadmap and handle shifting priorities in a fast-paced environment.
- Act as the single point of contact for leaders across Operations, Procurement, and Finance.
- Build, deploy, and scale production-ready AI agents (LLMs, function calling, agentic workflows, retrieval systems).
- Lead a team of software developers using Agile/Scrum sprint structures, CI/CD pipelines, and staging disciplines.

Qualifications:
- 5+ years of engineering management experience, with 10+ years in software engineering.
- Deep expertise in distributed systems, backend architectures, and Agile delivery.
- Hands-on capability and interest in applied AI, LLMs, and agentic workflows.
- Excellent communication and interpersonal skills.
- Hiring manager: Andrew Phelan (CTO)
"""

payload = {
    "jobDescription": mock_jd,
    "jobUrl": "https://moonshotlabs.com/careers/ai-development-manager"
}

url = "http://127.0.0.1:3000/api/analyze-job"
print(f"Sending POST request to {url}...")
res = requests.post(url, json=payload)

if res.status_code == 200:
    print("\n✓ [SUCCESS] Server responded with status 200")
    data = res.json()
    print("Success status in response:", data.get("success"))
    print("ATS Score:", data.get("atsScore"))
    print("Job Title:", data.get("jobTitle"))
    print("Company Name:", data.get("companyName"))
    
    # Verify outputs exist
    output_dir = "/Users/bstar/Downloads/resume_backup/"
    
    import re
    def normalize_name(text):
        text = text.lower().strip()
        text = re.sub(r'[^a-z0-9\s\-]', '', text)
        text = re.sub(r'[\s\-]+', '_', text)
        return text.strip('_')
        
    company_name_norm = normalize_name(data.get("companyName", "company"))
    job_title_norm = normalize_name(data.get("jobTitle", "role"))
    
    expected_resume_pdf = os.path.join(output_dir, f"bhagath_resume_{company_name_norm}_{job_title_norm}.pdf")
    expected_cl_pdf = os.path.join(output_dir, f"cover_letter_{company_name_norm}_{job_title_norm}.pdf")
    
    resume_exists = os.path.exists(expected_resume_pdf)
    cl_exists = os.path.exists(expected_cl_pdf)
    
    print(f"\nChecking outputs in {output_dir}:")
    print(f"Resume PDF exists: {resume_exists} ({expected_resume_pdf})")
    print(f"Cover Letter PDF exists: {cl_exists} ({expected_cl_pdf})")
    
    if resume_exists and cl_exists:
        print("\nALL TAILORED FILES COMPILED AND SAVED SUCCESSFULLY!")
    else:
        print("\n✗ ERROR: Missing compiled outputs!")
        if resume_exists:
            print("   Only resume compiled successfully.")
        elif cl_exists:
            print("   Only cover letter compiled successfully.")
        else:
            print("   Both resume and cover letter failed to compile.")
            
else:
    print(f"\n✗ [FAILED] Server returned status code {res.status_code}: {res.text}")
