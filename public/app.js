document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const configForm = document.getElementById('configForm');
  const apiKeyInput = document.getElementById('apiKey');
  const manualJobUrl = document.getElementById('manualJobUrl');
  const fetchUrlBtn = document.getElementById('fetchUrlBtn');
  const manualJobDesc = document.getElementById('manualJobDesc');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const historyList = document.getElementById('historyList');
  const welcomeCard = document.getElementById('welcomeCard');
  const outputPanel = document.getElementById('outputPanel');
  const processingCard = document.getElementById('processingCard');

  // Settings Modal Elements
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const outputDirInput = document.getElementById('outputDir');
  const browseOutputDirBtn = document.getElementById('browseOutputDirBtn');
  const toggleApiKeyVisibilityBtn = document.getElementById('toggleApiKeyVisibilityBtn');

  // Output Panel Elements
  const scoreProgress = document.getElementById('scoreProgress');
  const scoreText = document.getElementById('scoreText');
  const resJobTitle = document.getElementById('resJobTitle');
  const resCompanyName = document.getElementById('resCompanyName');
  const openFolderBtn = document.getElementById('openFolderBtn');
  const analysisContent = document.getElementById('analysisContent');
  const summaryText = document.getElementById('summaryText');
  const competenciesText = document.getElementById('competenciesText');
  const coverLetterText = document.getElementById('coverLetterText');
  const latexText = document.getElementById('latexText');
  
  // Tab Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Copy Buttons
  const copyButtons = document.querySelectorAll('.copy-btn');

  // History Card & Collapse Elements
  const historyCard = document.getElementById('historyCard');
  const toggleHistoryHeader = document.getElementById('toggleHistoryHeader');
  const collapseHistoryBtn = document.getElementById('collapseHistoryBtn');

  // Current Session Elements
  const currentSessionItem = document.getElementById('currentSessionItem');
  const currentSessionTitle = document.getElementById('currentSessionTitle');
  const currentSessionCompany = document.getElementById('currentSessionCompany');
  const currentSessionBadge = document.getElementById('currentSessionBadge');

  // Global State
  let activeHistoryItem = null;
  let historyPollInterval = null;

  // Initialize
  loadConfig();
  loadHistory();

  // Tab Swapping
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`tab-${tabName}`).classList.add('active');
    });
  });

  // Collapsible History Pane Logic
  const appBody = document.querySelector('.app-body');

  const toggleHistoryCollapse = () => {
    appBody.classList.toggle('history-collapsed');
    const isCollapsed = appBody.classList.contains('history-collapsed');
    localStorage.setItem('historyCollapsed', isCollapsed ? 'true' : 'false');
  };

  if (localStorage.getItem('historyCollapsed') === 'true') {
    appBody.classList.add('history-collapsed');
  }

  toggleHistoryHeader.addEventListener('click', () => {
    toggleHistoryCollapse();
  });

  collapseHistoryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHistoryCollapse();
  });


  // Current Session Click Logic (Reset / Create New Draft)
  currentSessionItem.addEventListener('click', () => {
    // Reset Current option details to defaults
    currentSessionTitle.innerText = 'New';
    currentSessionCompany.innerText = 'New application draft';
    currentSessionBadge.innerText = 'Active';
    currentSessionBadge.className = 'hist-score current-badge';
    
    // Clear Input fields
    manualJobUrl.value = '';
    manualJobDesc.value = '';
    
    // Manage active highlights
    document.querySelectorAll('.history-item').forEach(item => item.classList.remove('active'));
    currentSessionItem.classList.add('active');
    activeHistoryItem = null;
    
    // Show welcome, hide output
    welcomeCard.classList.remove('hidden');
    outputPanel.classList.add('hidden');
  });

  // Helper to activate the New draft tab
  const activateNewDraft = () => {
    if (activeHistoryItem !== null) {
      document.querySelectorAll('.history-item').forEach(item => item.classList.remove('active'));
      currentSessionItem.classList.add('active');
      activeHistoryItem = null;
      
      // Ensure "New" tab is named default values
      currentSessionTitle.innerText = 'New';
      currentSessionCompany.innerText = 'New application draft';
      currentSessionBadge.innerText = 'Active';
      currentSessionBadge.className = 'hist-score current-badge';
    }
  };

  manualJobUrl.addEventListener('input', activateNewDraft);
  manualJobDesc.addEventListener('input', activateNewDraft);

  // Toggle Settings Modal
  openSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    loadConfig();
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });

  // Toggle Gemini API key visibility
  toggleApiKeyVisibilityBtn.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    
    // Update SVG icon
    if (isPassword) {
      // Eye-off icon
      toggleApiKeyVisibilityBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-off-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 10.07 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      `;
      toggleApiKeyVisibilityBtn.title = "Hide API Key";
    } else {
      // Eye icon
      toggleApiKeyVisibilityBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      `;
      toggleApiKeyVisibilityBtn.title = "Show API Key";
    }
  });

  // Copy buttons
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const targetEl = document.getElementById(targetId);
      
      let textToCopy = '';
      if (targetEl.tagName === 'CODE' || targetEl.tagName === 'PRE') {
        textToCopy = targetEl.textContent;
      } else {
        textToCopy = targetEl.innerText;
      }

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        btn.style.background = 'var(--success-color)';
        btn.style.color = 'white';
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 1500);
      }).catch(err => {
        console.error('Failed to copy text:', err);
      });
    });
  });

  // Save config
  configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveConfigBtn');
    const apiKey = apiKeyInput.value.trim();
    const outputDir = outputDirInput.value.trim();

    if (!apiKey) return;

    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: apiKey, outputDir: outputDir })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert('Configuration saved successfully!');
        loadConfig();
        settingsModal.classList.add('hidden');
      } else {
        alert('Error: ' + (data.error || data.detail));
      }
    } catch (err) {
      alert('Failed to save config: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = 'Save Settings';
    }
  });

  // Browse output directory using native mac folder picker
  if (browseOutputDirBtn) {
    browseOutputDirBtn.addEventListener('click', async () => {
      browseOutputDirBtn.disabled = true;
      const originalText = browseOutputDirBtn.innerText;
      browseOutputDirBtn.innerText = 'Selecting...';
      try {
        const res = await fetch('/api/select-folder', { method: 'POST' });
        const data = await res.json();
        if (data.success && data.path) {
          outputDirInput.value = data.path;
        } else if (data.cancelled) {
          console.log('Folder selection cancelled by user');
        } else {
          alert('Error selecting folder: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Failed to select folder: ' + err.message);
      } finally {
        browseOutputDirBtn.disabled = false;
        browseOutputDirBtn.innerText = originalText;
      }
    });
  }

  // Load config status
  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.geminiApiKey) {
        apiKeyInput.value = data.geminiApiKey;
      } else {
        apiKeyInput.value = '';
        apiKeyInput.placeholder = 'Enter your Gemini API key...';
      }
      if (data.outputDir) {
        outputDirInput.value = data.outputDir;
      } else {
        outputDirInput.value = 'output';
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  }

  // Load History list
  async function loadHistory() {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      
      // Clean up previous historical items only, keeping currentSessionItem intact
      const itemsToRemove = historyList.querySelectorAll('.history-item:not(.current-item), .empty-state');
      itemsToRemove.forEach(el => el.remove());
      
      if (data.length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'empty-state';
        emptyLi.innerText = 'No tailored resumes yet. Submit a job to start.';
        historyList.appendChild(emptyLi);
        
        // Stop polling if active
        if (historyPollInterval) {
          clearInterval(historyPollInterval);
          historyPollInterval = null;
        }
        return;
      }

      // If activeHistoryItem is currently selected and updated in background, refresh the preview
      if (activeHistoryItem) {
        const updatedJob = data.find(j => j.id === activeHistoryItem.id);
        if (updatedJob) {
          if (updatedJob.status !== activeHistoryItem.status || updatedJob.status === 'processing' || updatedJob.status === 'pending') {
            activeHistoryItem = updatedJob;
            displayJobResult(updatedJob);
          }
        }
      }

      // Setup/manage polling interval based on active jobs in the list
      const hasActiveJobs = data.some(job => job.status === 'pending' || job.status === 'processing');
      if (hasActiveJobs) {
        if (!historyPollInterval) {
          historyPollInterval = setInterval(loadHistory, 3000);
        }
      } else {
        if (historyPollInterval) {
          clearInterval(historyPollInterval);
          historyPollInterval = null;
        }
      }

      data.forEach(job => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.setAttribute('data-id', job.id);
        if (activeHistoryItem && activeHistoryItem.id === job.id) {
          li.classList.add('active');
        }
        
        let scoreOrBadge = '';
        if (job.status === 'pending') {
          scoreOrBadge = `<span class="hist-score pending">Pending</span>`;
        } else if (job.status === 'processing') {
          scoreOrBadge = `<span class="hist-score processing">Processing</span>`;
        } else if (job.status === 'failed') {
          scoreOrBadge = `<span class="hist-score failed">Failed</span>`;
        } else {
          const isHigh = job.atsScore >= 80;
          const scoreClass = isHigh ? 'hist-score high' : 'hist-score';
          scoreOrBadge = `<span class="${scoreClass}">${job.atsScore}%</span>`;
        }
        
        const dateStr = new Date(job.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        li.innerHTML = `
          <div class="hist-info">
            <span class="hist-title" title="${job.jobTitle}">${job.jobTitle}</span>
            <span class="hist-company">${job.companyName}</span>
            <span class="hist-date">${dateStr}</span>
          </div>
          <div class="hist-meta-right">
            ${scoreOrBadge}
            <button class="delete-history-btn" title="Delete Resume">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        `;

        li.addEventListener('click', () => {
          // Pre-populate input fields
          manualJobUrl.value = job.jobUrl === 'Manual Input' ? '' : job.jobUrl;
          manualJobDesc.value = job.jobDescription || '';

          displayJobResult(job);

          // Manage active highlights: only select the clicked history item, keep "New" inactive
          document.querySelectorAll('.history-item').forEach(item => item.classList.remove('active'));
          li.classList.add('active');
          activeHistoryItem = job;
        });

        // Delete button event listener
        const deleteBtn = li.querySelector('.delete-history-btn');
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation(); // Prevent loading details of the deleted job
          
          const confirmDelete = confirm(`Are you sure you want to delete the tailored resume for "${job.jobTitle}" at ${job.companyName}?`);
          if (!confirmDelete) return;
          
          try {
            const deleteRes = await fetch(`/api/history/${job.id}`, {
              method: 'DELETE'
            });
            const deleteData = await deleteRes.json();
            
            if (deleteRes.ok && deleteData.success) {
              // If the deleted item was currently active, reset the view to New draft
              if (activeHistoryItem && activeHistoryItem.id === job.id) {
                currentSessionItem.click();
              }
              // Reload history list
              loadHistory();
            } else {
              alert('Error deleting item: ' + (deleteData.error || 'Unknown error'));
            }
          } catch (err) {
            alert('Failed to delete item: ' + err.message);
          }
        });

        historyList.appendChild(li);
      });
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }

  // Auto-fetch job description from URL
  fetchUrlBtn.addEventListener('click', async () => {
    const url = manualJobUrl.value.trim();
    if (!url) {
      alert('Please enter a Job URL first.');
      return;
    }

    // Switch to new draft tab if we were viewing history
    activateNewDraft();

    // Update UI loading state
    fetchUrlBtn.disabled = true;
    fetchUrlBtn.innerText = 'Fetching...';
    manualJobDesc.placeholder = 'Auto-fetching job details from URL, please wait...';
    manualJobDesc.value = '';

    try {
      const res = await fetch(`/api/scrape-url?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        manualJobDesc.value = data.description;
        manualJobDesc.placeholder = 'Paste the job description text here...';
      } else if (data.login_wall) {
        alert('This website (e.g. LinkedIn) requires user authentication to view job postings.\n\nTo automate this easily, please open the job posting tab in your browser and click the "Resume Auto Apply Bot" Chrome extension in your toolbar instead!');
        manualJobDesc.placeholder = 'LinkedIn/Job Site requires login. Use the Chrome Extension to scrape this in 1-click, or paste the text manually here.';
      } else {
        alert('Could not auto-fetch the job details: ' + (data.error || 'Unknown error'));
        manualJobDesc.placeholder = 'Paste the job description text here...';
      }
    } catch (err) {
      alert('Failed to connect to local service for fetching: ' + err.message);
      manualJobDesc.placeholder = 'Paste the job description text here...';
    } finally {
      fetchUrlBtn.disabled = false;
      fetchUrlBtn.innerText = 'Fetch';
    }
  });

  // Trigger manually pasted job analysis
  analyzeBtn.addEventListener('click', async () => {
    const jobDescription = manualJobDesc.value.trim();
    const jobUrl = manualJobUrl.value.trim();

    if (!jobDescription) {
      alert('Please paste a job description.');
      return;
    }

    // Toggle button state
    const btnText = analyzeBtn.querySelector('.btn-text');
    const loader = analyzeBtn.querySelector('.loader');
    
    analyzeBtn.disabled = true;
    btnText.style.opacity = '0.5';
    loader.classList.remove('hidden');

    try {
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, jobUrl })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Refresh history to include the newly queued job
        await loadHistory();
        
        // Highlight and select the newly queued job
        const newJobId = data.jobId;
        const firstHistItem = historyList.querySelector(`[data-id="${newJobId}"]`);
        if (firstHistItem) {
          document.querySelectorAll('.history-item').forEach(item => item.classList.remove('active'));
          firstHistItem.classList.add('active');
          
          // Set activeHistoryItem state and fetch current status
          const resStatus = await fetch(`/api/job-status/${newJobId}`);
          const jobStatusData = await resStatus.json();
          if (jobStatusData.success) {
            activeHistoryItem = { id: newJobId, ...jobStatusData };
            displayJobResult(activeHistoryItem);
          }
        }
      } else {
        alert('Error: ' + (data.error || data.detail || 'Server error'));
      }
    } catch (err) {
      alert('Failed to analyze job: ' + err.message);
    } finally {
      analyzeBtn.disabled = false;
      btnText.style.opacity = '1';
      loader.classList.add('hidden');
    }
  });

  // Display Job Result in panel
  function displayJobResult(data) {
    // Hide welcome card
    welcomeCard.classList.add('hidden');

    const status = data.status || 'completed';

    if (status === 'pending' || status === 'processing') {
      // Show processing card, hide output panel
      outputPanel.classList.add('hidden');
      processingCard.classList.remove('hidden');

      const queueBadge = document.getElementById('queueBadge');
      const queueTitle = document.getElementById('queueTitle');
      const queueDescription = document.getElementById('queueDescription');
      const qStepPending = document.getElementById('qStepPending');
      const qStepProcessing = document.getElementById('qStepProcessing');
      const qStepCompiling = document.getElementById('qStepCompiling');
      const qStepLine1 = document.getElementById('qStepLine1');
      const qStepLine2 = document.getElementById('qStepLine2');
      const stepsContainer = processingCard.querySelector('.queue-status-steps');
      const spinnerContainer = processingCard.querySelector('.spinner-container');

      stepsContainer.classList.remove('hidden');
      spinnerContainer.classList.remove('hidden');

      if (status === 'pending') {
        queueBadge.innerText = 'Pending';
        queueBadge.className = 'hist-score pending';
        queueTitle.innerText = 'Job Queued';
        queueDescription.innerText = 'Your tailoring request is in the local background queue and will begin processing shortly.';

        qStepPending.className = 'q-step active';
        qStepProcessing.className = 'q-step';
        qStepCompiling.className = 'q-step';
        qStepLine1.className = 'q-step-line';
        qStepLine2.className = 'q-step-line';
      } else {
        queueBadge.innerText = 'Processing...';
        queueBadge.className = 'hist-score processing';
        queueTitle.innerText = 'Tailoring & Compiling';
        queueDescription.innerText = 'Gemini AI is analyzing the job description, adjusting keywords, and tailoring your resume. LaTeX PDF compilation will run next.';

        qStepPending.className = 'q-step completed';
        qStepLine1.className = 'q-step-line completed';
        qStepProcessing.className = 'q-step active';
        qStepLine2.className = 'q-step-line active';
        qStepCompiling.className = 'q-step active';
      }
    } else if (status === 'failed') {
      // Show error in processing card, hide output panel
      outputPanel.classList.add('hidden');
      processingCard.classList.remove('hidden');

      const queueBadge = document.getElementById('queueBadge');
      const queueTitle = document.getElementById('queueTitle');
      const queueDescription = document.getElementById('queueDescription');
      const stepsContainer = processingCard.querySelector('.queue-status-steps');
      const spinnerContainer = processingCard.querySelector('.spinner-container');

      queueBadge.innerText = 'Failed';
      queueBadge.className = 'hist-score failed';
      queueTitle.innerText = 'Tailoring Failed';
      queueDescription.innerHTML = `<span style="color: var(--danger-color); font-weight: 600;">Error:</span><br>${data.error || 'An unknown error occurred during tailoring.'}`;

      stepsContainer.classList.add('hidden');
      spinnerContainer.classList.add('hidden');
    } else {
      // Completed!
      processingCard.classList.add('hidden');
      outputPanel.classList.remove('hidden');

      // Populate Score & Meta
      resJobTitle.innerText = data.jobTitle || 'Lead AI Engineer';
      resCompanyName.innerText = data.companyName || 'Company';
      scoreText.innerText = data.atsScore || '0';

      // Animate circular progress ring
      const radius = 50;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - ((data.atsScore || 0) / 100) * circumference;
      scoreProgress.style.strokeDasharray = `${circumference}`;
      scoreProgress.style.strokeDashoffset = `${offset}`;

      // Color progress ring according to score
      if (data.atsScore >= 85) {
        scoreProgress.style.stroke = 'var(--success-color)';
      } else if (data.atsScore >= 70) {
        scoreProgress.style.stroke = 'var(--brand-color)';
      } else {
        scoreProgress.style.stroke = 'var(--danger-color)';
      }

      // Populate Gap Analysis
      analysisContent.innerHTML = formatMarkdown(data.analysis || '');

      // Populate text previews
      summaryText.innerText = data.summary || '';
      competenciesText.innerText = data.competencies || '';
      coverLetterText.innerText = data.coverLetter || '';

      // Assemble preview of compiled LaTeX
      assembleLaTeXPreview(data.summary, data.competencies);
    }
  }

  // Fetch full base template and show generated code preview
  async function assembleLaTeXPreview(summary, competencies) {
    try {
      // Fetch base template
      const res = await fetch('/resume_template.tex');
      if (res.ok) {
        let text = await res.text();
        // Insert tokens
        text = text.replace('%TOKEN_SUMMARY_ZONE%', summary || '');
        text = text.replace('%TOKEN_COMPETENCIES_ZONE%', competencies || '');
        latexText.innerText = text;
      }
    } catch (e) {
      latexText.innerText = `% Tailored LaTeX code:\n\n% Summary:\n${summary}\n\n% Competencies:\n${competencies}`;
    }
  }

  // Open output folder trigger
  openFolderBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/open-folder', {
        method: 'POST'
      });
    } catch (e) {
      console.error('Failed to request opening folder:', e);
    }
  });

  // Simple Markdown Parser for analysis content
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text;
    
    // Escape HTML tags to prevent XSS
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Bullet points: * item or - item
    // First group newlines and lists
    const lines = html.split('\n');
    let inList = false;
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemText = trimmed.substring(2);
        let prefix = '';
        if (!inList) {
          inList = true;
          prefix = '<ul>';
        }
        return `${prefix}<li>${itemText}</li>`;
      } else {
        let suffix = '';
        if (inList) {
          inList = false;
          suffix = '</ul>';
        }
        if (trimmed.length > 0) {
          return `${suffix}<h4>${trimmed}</h4>`;
        }
        return suffix;
      }
    });

    if (inList) {
      formattedLines.push('</ul>');
    }

    return formattedLines.join('\n');
  }
});
