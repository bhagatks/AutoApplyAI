// Resume Auto Apply Bot - Content Script
// Automatically detects job listings on LinkedIn/Indeed and triggers tailoring when Apply is clicked.

let isProcessing = false;

// Inject premium styling for the floating notification widget
const injectCSS = () => {
  if (document.getElementById('ag-widget-styles')) return;
  const style = document.createElement('style');
  style.id = 'ag-widget-styles';
  style.innerHTML = `
    .ag-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 340px;
      background: rgba(20, 20, 30, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 128, 0, 0.3);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
      z-index: 2147483647;
      color: #a9b1d6;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: translateY(20px);
    }
    .ag-widget.show {
      opacity: 1;
      transform: translateY(0);
    }
    .ag-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
    }
    .ag-logo {
      color: #ff8000;
      font-weight: 800;
      font-size: 18px;
      margin-right: 8px;
    }
    .ag-title {
      font-weight: 600;
      font-size: 14px;
      color: #c0caf5;
    }
    .ag-steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ag-step {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      opacity: 0.5;
      transition: opacity 0.3s;
    }
    .ag-step.active {
      opacity: 1;
      color: #ff8000;
    }
    .ag-step.success {
      opacity: 1;
      color: #9ece6a;
    }
    .ag-step.failed {
      opacity: 1;
      color: #f7768e;
    }
    .ag-bullet {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #565f89;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
    }
    .ag-step.active .ag-bullet {
      border-color: #ff8000;
      background: rgba(255, 128, 0, 0.2);
    }
    .ag-step.success .ag-bullet {
      border-color: #9ece6a;
      background: #9ece6a;
      color: #1a1b26;
    }
    .ag-step.failed .ag-bullet {
      border-color: #f7768e;
      background: #f7768e;
      color: #1a1b26;
    }
    .ag-spinner {
      width: 10px;
      height: 10px;
      border: 2px solid #ff8000;
      border-top-color: transparent;
      border-radius: 50%;
      animation: ag-spin 0.8s linear infinite;
    }
    @keyframes ag-spin {
      to { transform: rotate(360deg); }
    }
    .ag-footer {
      margin-top: 16px;
      font-size: 11px;
      color: #565f89;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 10px;
    }
  `;
  document.head.appendChild(style);
};

// Create and display the floating progress widget
const showWidget = () => {
  injectCSS();
  let widget = document.getElementById('ag-apply-widget');
  if (!widget) {
    widget = document.createElement('div');
    widget.id = 'ag-apply-widget';
    widget.className = 'ag-widget';
    widget.innerHTML = `
      <div class="ag-header">
        <span class="ag-logo">▲</span>
        <span class="ag-title">Resume Auto Apply Resume Tailor</span>
      </div>
      <div class="ag-steps">
        <div class="ag-step" id="ag-step-1">
          <span class="ag-bullet">1</span>
          <span>Extracting job details...</span>
        </div>
        <div class="ag-step" id="ag-step-2">
          <span class="ag-bullet">2</span>
          <span>Tailoring Summary & Competencies...</span>
        </div>
        <div class="ag-step" id="ag-step-3">
          <span class="ag-bullet">3</span>
          <span>Compiling PDF with Tectonic...</span>
        </div>
        <div class="ag-step" id="ag-step-4">
          <span class="ag-bullet">4</span>
          <span>Complete! Output folder opened</span>
        </div>
      </div>
      <div class="ag-footer">Running local agent service on Port 3000</div>
    `;
    document.body.appendChild(widget);
  }

  // Reset steps
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById(`ag-step-${i}`);
    step.className = 'ag-step';
    const desc = step.querySelector('span:nth-child(2)');
    if (i === 1) desc.innerText = 'Extracting job details...';
    if (i === 2) desc.innerText = 'Tailoring Summary & Competencies...';
    if (i === 3) desc.innerText = 'Compiling PDF with Tectonic...';
    if (i === 4) desc.innerText = 'Complete! Output folder opened';
  }

  setTimeout(() => widget.classList.add('show'), 50);
  return widget;
};

// Set state of a step
const setStepState = (stepNum, state, message = null) => {
  const step = document.getElementById(`ag-step-${stepNum}`);
  if (!step) return;

  step.className = `ag-step ${state}`;
  const bullet = step.querySelector('.ag-bullet');
  const label = step.querySelector('span:nth-child(2)');

  if (message) {
    label.innerText = message;
  }

  if (state === 'active') {
    bullet.innerHTML = '<div class="ag-spinner"></div>';
  } else if (state === 'success') {
    bullet.innerHTML = '✓';
  } else if (state === 'failed') {
    bullet.innerHTML = '✗';
  } else {
    bullet.innerHTML = stepNum;
  }
};

// Extract job details from page
const extractJobDescription = () => {
  const selectors = [
    '.jobs-description__content',          // LinkedIn Description
    '.jobs-box__html-content',
    '.job-details-jobs-unified-top-card',  // LinkedIn top card
    '#jobDescriptionText',                  // Indeed Description
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
  return document.body.innerText.trim();
};

// Main trigger function
const triggerAutomaticTailoring = async () => {
  if (isProcessing) return;
  isProcessing = true;

  showWidget();
  setStepState(1, 'active');

  const jd = extractJobDescription();
  const url = window.location.href;

  if (!jd || jd.length < 50) {
    setStepState(1, 'failed', 'Extraction failed: Empty content');
    isProcessing = false;
    scheduleWidgetHide();
    return;
  }

  setStepState(1, 'success', '✓ Job details extracted');
  setStepState(2, 'active');

  try {
    let res;
    try {
      res = await fetch('http://localhost:3000/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jd,
          jobUrl: url
        })
      });
    } catch (fetchErr) {
      console.log('Port 3000 fetch failed, trying port 8000 (Docker)...', fetchErr);
      res = await fetch('http://localhost:8000/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jd,
          jobUrl: url
        })
      });
    }

    const data = await res.json();

    if (res.ok) {
      if (data.success === false && data.error && data.error.includes('compilation')) {
        setStepState(2, 'success', `✓ Tailored: ${data.companyName} (${data.atsScore}% Match)`);
        setStepState(3, 'failed', '✗ Compilation failed');
        setStepState(4, 'failed', 'LaTeX saved, check syntax errors.');
      } else {
        setStepState(2, 'success', `✓ Tailored: ${data.companyName} (${data.atsScore}% Match)`);
        setStepState(3, 'success', '✓ Compiled PDF successfully');
        setStepState(4, 'success', '✓ Finished! PDF opened in Finder');
      }
    } else {
      setStepState(2, 'failed', '✗ Tailoring failed: ' + (data.detail || data.error || 'Server error'));
      setStepState(3, 'failed');
      setStepState(4, 'failed');
    }
  } catch (err) {
    setStepState(2, 'failed', '✗ Connection failed');
    setStepState(3, 'failed');
    setStepState(4, 'failed', 'Is local server running on Port 3000?');
  } finally {
    isProcessing = false;
    scheduleWidgetHide();
  }
};

// Schedule fading out the widget
const scheduleWidgetHide = () => {
  setTimeout(() => {
    const widget = document.getElementById('ag-apply-widget');
    if (widget && !isProcessing) {
      widget.classList.remove('show');
    }
  }, 6000);
};

// Delegated click event listener on document body to capture apply button clicks
document.body.addEventListener('click', (e) => {
  // Selectors matching LinkedIn "Apply" and "Easy Apply" buttons, and Indeed apply buttons
  const applyButton = e.target.closest(
    '.jobs-apply-button, ' +
    '.jobs-s-apply button, ' +
    'button[aria-label*="Apply"], ' +
    'button[aria-label*="Easy Apply"], ' +
    '.jobsearch-CallToActionButton, ' +
    '.icl-Button--primary'
  );

  if (applyButton) {
    console.log('Resume Auto Apply Bot: Detected click on Apply button, launching tailoring...');
    triggerAutomaticTailoring();
  }
});

console.log('Resume Auto Apply Bot: Content Script loaded successfully.');
