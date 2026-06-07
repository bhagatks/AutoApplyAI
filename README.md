# Resume Auto Apply

An automated resume tailoring system powered by Python/FastAPI, Google Gemini API, and Tectonic LaTeX typesetting. It enables 1-click tailored resume generation and PDF compilation directly from job listings (LinkedIn, Indeed) via a Chrome Extension and an elegant glassmorphic dashboard.

---

## Key Features

1. **Dashboard UI**: A 3-pane responsive layout showcasing your application history, manual job inputs, and result details.
2. **Chrome Extension**: Auto-scrapes job descriptions (detecting login walls defensively) and triggers tailoring with a single click.
3. **Double-Pass Tailoring**: Uses Gemini API to draft a tailored profile, followed by a second-pass compliance audit to maximize ATS keyword alignment.
4. **Dynamic Page Defense**: Uses LaTeX rubber vertical springs (`\vfill`) and custom configuration parameters to format your resume dynamically and defend the absolute 1-page budget.
5. **Dynamic Rules Configuration**: Centralized constraints (margins, word substitutions, forbidden characters, content limits) configured in `resume_rules.json` and `config.py`.

---

## Project Structure

```
├── server.py              # FastAPI server (handles APIs, scraping, and compiling)
├── config.py              # System prompt and LLM instructions configuration
├── resume_rules.json      # Dynamic layout, tone, character escaping, and file naming rules
├── base_template.tex      # LaTeX resume template configured with rubber length springs
├── public/                # Dashboard frontend resources (HTML, CSS, JS)
├── extension/             # Chrome Extension source (manifest, content scripts, popup)
├── requirements.txt       # Python package dependencies
└── Dockerfile             # Alpine-based container builder with tectonic pre-installed
```

## Setting up on another Mac (Installation)

Follow these steps to clone, configure, and launch the system on any other Mac machine. You can choose either the **Docker Setup (Easiest)** or the **Native macOS Setup**.

### Step 1: Clone the Repository
Open your **Terminal** app and execute:
```bash
git clone https://github.com/bhagatks/antigravity-apply-bot.git
cd antigravity-apply-bot
```

---

### Method A: Docker Setup (Easiest & Portable)
This method runs the application containerized. It automatically handles the installation of the Python server and the LaTeX Tectonic compiler so you don't have to install them on the host Mac.

#### 1. Install Docker Desktop
* Download and install [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) (select the Apple Silicon version for M1/M2/M3/M4 chips, or Intel version otherwise).
* Open Docker Desktop and ensure the engine is active.

#### 2. Build the Docker Image
```bash
docker build -t resume-pipeline-bot .
```

#### 3. Run the Container
Start the container, passing your Gemini API Key as an environment variable and mapping the host's `Downloads` folder to receive the generated resume PDFs:
```bash
docker run -d \
  -p 8000:8000 \
  -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY" \
  -v ~/Downloads:/app/output \
  --name resume-bot-instance \
  resume-pipeline-bot
```
*Note: The server automatically detects that it is running inside Docker, sets output targets to the mapped volume `/app/output`, and safely bypasses native Mac folder-opening alerts.*

---

### Method B: Native macOS Setup
Use this method if you prefer to run the server directly on your host Mac's Python environment.

#### 1. Install Homebrew and Tectonic (LaTeX Compiler)
* Install [Homebrew](https://brew.sh/) if it's not already installed.
* Install Tectonic:
  ```bash
  brew install tectonic
  ```

#### 2. Configure API Key
Create a `config.json` in the root of the project with your Gemini API Key:
```json
{
  "geminiApiKey": "YOUR_GEMINI_API_KEY"
}
```
*Alternatively, you can save this key using the settings modal (gear icon) in the web dashboard.*

#### 3. Run the FastAPI Server
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 server.py
```
The server will start at [http://localhost:3000](http://localhost:3000).

---

## Chrome Extension Setup

1. Open Google Chrome on the target Mac and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top-right toggle switch).
3. Click **Load unpacked** (top-left button).
4. Select the `extension` folder inside the cloned `antigravity-apply-bot` directory.

### Port Configuration
* **If using Method A (Docker)**: The extension communicates on port `8000`. Ensure that the fetch URL in `extension/popup.js` is set to `http://localhost:8000/api/...`.
* **If using Method B (Native)**: The extension communicates on port `3000`. Ensure that the fetch URL in `extension/popup.js` is set to `http://localhost:3000/api/...`.

---

## Step-by-Step Usage

1. Open the Dashboard at [http://localhost:3000](http://localhost:3000) (or `http://localhost:8000` for Docker).
2. Browse a job description page on LinkedIn or Indeed.
3. Click the **Resume Auto Apply** extension icon in your Chrome toolbar.
4. Click **Tailor & Compile Resume**.
5. The extension will automatically extract job metadata, connect to the local server, run the dual-pass optimization, and compile the tailored resume.
6. Find your newly formatted LaTeX files and PDFs (naming format: `bhagath_resume_{company}_{title}.pdf`) inside your local configured output folder or `~/Downloads`!

