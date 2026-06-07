import json
import os
import requests
import subprocess

HISTORY_FILE = 'jobs.json'

# Load latest job from history
with open(HISTORY_FILE, 'r') as f:
    history = json.load(f)
    latest_job = history[0]

print(f"Triggering tailoring for: {latest_job['jobTitle']} at {latest_job['companyName']}")

res = requests.post(
    'http://localhost:3000/api/analyze-job',
    json={
        "jobDescription": latest_job['jobDescription'],
        "jobUrl": latest_job['jobUrl']
    }
)

if res.status_code != 200:
    print(f"Error: {res.status_code} - {res.text}")
    exit(1)

data = res.json()
print("Response keys:", list(data.keys()))
print("ATS Score:", data.get("atsScore"))

# Check PDF page count using pdfinfo
pdf_path = data.get("pdfPath")
if not pdf_path:
    # Try locating it in output folder
    import glob
    pdfs = glob.glob("output/bhagath_resume_*.pdf")
    if pdfs:
        pdf_path = pdfs[0]

if pdf_path and os.path.exists(pdf_path):
    print("Found compiled PDF at:", pdf_path)
    try:
        info = subprocess.check_output(f'pdfinfo "{pdf_path}"', shell=True).decode()
        for line in info.split('\n'):
            if line.startswith('Pages:'):
                print(f"Compilation page verification: {line.strip()}")
                pages = int(line.split(':')[1].strip())
                if pages == 1:
                    print("✓ [PASSED] Resume is exactly 1 page!")
                else:
                    print(f"✗ [FAILED] Resume is {pages} pages!")
    except Exception as e:
        print("Could not run pdfinfo:", e)
else:
    print("PDF not found at:", pdf_path)
