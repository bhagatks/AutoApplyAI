import json
import time
import requests

HISTORY_FILE = 'jobs.json'

def main():
    # Read latest job description from history
    with open(HISTORY_FILE, 'r') as f:
        history = json.load(f)
        latest_job = history[0]

    job_description = latest_job['jobDescription']
    job_url = latest_job['jobUrl']

    # Trigger job 1
    print("Triggering Job 1...")
    res1 = requests.post(
        'http://localhost:3000/api/analyze-job',
        json={
            "jobDescription": job_description + "\n(Verification Job 1)",
            "jobUrl": job_url
        }
    )
    if res1.status_code != 200:
        print(f"Job 1 failed to queue: {res1.text}")
        return
    job1_data = res1.json()
    job1_id = job1_data["jobId"]
    print(f"Job 1 Queued. ID: {job1_id}, Status: {job1_data.get('status')}")

    # Trigger job 2 immediately
    print("\nTriggering Job 2 immediately...")
    res2 = requests.post(
        'http://localhost:3000/api/analyze-job',
        json={
            "jobDescription": job_description + "\n(Verification Job 2)",
            "jobUrl": job_url
        }
    )
    if res2.status_code != 200:
        print(f"Job 2 failed to queue: {res2.text}")
        return
    job2_data = res2.json()
    job2_id = job2_data["jobId"]
    print(f"Job 2 Queued. ID: {job2_id}, Status: {job2_data.get('status')}")

    # Poll both jobs
    jobs = [
        {"id": job1_id, "name": "Job 1", "done": False},
        {"id": job2_id, "name": "Job 2", "done": False}
    ]

    print("\nStarting status polling loop...")
    start_time = time.time()
    while not all(j["done"] for j in jobs):
        if time.time() - start_time > 120:
            print("Timeout waiting for jobs to complete.")
            break
        
        for job in jobs:
            if job["done"]:
                continue
            
            res = requests.get(f"http://localhost:3000/api/job-status/{job['id']}")
            if res.status_code == 200:
                status_info = res.json()
                status = status_info.get("status")
                print(f"[{job['name']}] Status: {status} (Company: {status_info.get('companyName')}, Score: {status_info.get('atsScore')})")
                
                if status in ("completed", "failed"):
                    job["done"] = True
                    print(f"✓ [{job['name']}] finished with status: {status}")
            else:
                print(f"[{job['name']}] Failed to get status: {res.status_code}")
        
        time.sleep(3)

    print("\nAll queued jobs verified successfully!")

if __name__ == "__main__":
    main()
