document.addEventListener('DOMContentLoaded', async () => {
  const currentUrlEl = document.getElementById('currentUrl');
  const runBtn = document.getElementById('runBtn');
  const statusArea = document.getElementById('statusArea');
  const stepExtract = document.getElementById('step-extract');
  const stepAi = document.getElementById('step-ai');
  const stepCompile = document.getElementById('step-compile');
  const stepDone = document.getElementById('step-done');

  let activeTab = null;

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;

    if (activeTab && activeTab.url) {
      // Clean up URL display
      let displayUrl = activeTab.url;
      if (displayUrl.length > 35) {
        displayUrl = displayUrl.substring(0, 35) + '...';
      }
      currentUrlEl.innerText = displayUrl;
      
      // Enable run button if it is a regular HTTP/HTTPS web page
      if (activeTab.url.startsWith('http://') || activeTab.url.startsWith('https://')) {
        runBtn.removeAttribute('disabled');
      } else {
        currentUrlEl.innerText = 'Cannot run on system pages';
      }
    } else {
      currentUrlEl.innerText = 'No active tab found';
    }
  } catch (err) {
    console.error('Error fetching tab info:', err);
    currentUrlEl.innerText = 'Error getting tab info';
  }

  // Scraper function to run in the context of the webpage
  function scrapeJobPage() {
    const selectors = [
      '.jobs-description__content', // LinkedIn description container
      '.jobs-box__html-content',
      '#jobDescriptionText',         // Indeed description container
      '.jobsearch-JobComponent-description',
      '#content',
      '.section-wrapper',
      'main',
      'article'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim().length > 200) {
        return el.innerText.trim();
      }
    }
    
    // Fallback to full body text
    return document.body.innerText.trim();
  }

  // Handle run button click
  runBtn.addEventListener('click', async () => {
    if (!activeTab) return;

    // Reset and show status UI
    runBtn.setAttribute('disabled', 'true');
    runBtn.innerText = 'Processing...';
    statusArea.style.display = 'flex';
    
    // Step 1: Extracting
    stepExtract.classList.add('active');

    let jobDescription = '';
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: scrapeJobPage
      });

      jobDescription = result;
      
      if (!jobDescription || jobDescription.length < 50) {
        throw new Error('Could not extract meaningful job description text from the page.');
      }

      stepExtract.classList.remove('active');
      stepExtract.classList.add('success');
      stepExtract.innerText = '✓ Extracted job details';
    } catch (err) {
      stepExtract.classList.remove('active');
      stepExtract.style.color = 'var(--danger-color)';
      stepExtract.innerText = '✗ Scrape failed: ' + err.message;
      resetBtn();
      return;
    }

    // Step 2: Tailoring via Gemini API
    stepAi.classList.add('active');

    try {
      const res = await fetch('http://localhost:3000/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription,
          jobUrl: activeTab.url
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server returned an error');
      }

      stepAi.classList.remove('active');
      stepAi.classList.add('success');
      stepAi.innerText = `✓ Tailored for ${data.companyName} (${data.atsScore}% ATS)`;

      // Step 3: Compiling
      stepCompile.classList.add('active');

      if (data.success === false && data.error && data.error.includes('compilation')) {
        // Tectonic failed
        stepCompile.classList.remove('active');
        stepCompile.style.color = 'var(--warning-color)';
        stepCompile.innerText = '⚠ Compile failed, check dashboard';
        
        stepDone.classList.add('active');
        stepDone.innerText = 'LaTeX saved. Check browser dashboard.';
      } else {
        // Tectonic succeeded
        stepCompile.classList.remove('active');
        stepCompile.classList.add('success');
        stepCompile.innerText = '✓ Compiled LaTeX to PDF';

        // Step 4: Done
        stepDone.classList.add('success');
        stepDone.innerText = '✓ Completed! PDF opened in Finder';
      }

      runBtn.innerText = 'Tailored Successfully!';
    } catch (err) {
      stepAi.classList.remove('active');
      stepAi.style.color = 'var(--danger-color)';
      stepAi.innerText = '✗ Tailor failed: ' + err.message;
      resetBtn();
    }
  });

  function resetBtn() {
    runBtn.removeAttribute('disabled');
    runBtn.innerText = 'Tailor & Compile Resume';
  }
});
