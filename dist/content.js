(function() {
  "use strict";
  let isProcessing = false;
  const isContextValid = () => {
    var _a;
    try {
      return !!((_a = chrome.runtime) == null ? void 0 : _a.getManifest());
    } catch (e) {
      return false;
    }
  };
  const injectCSS = () => {
    if (document.getElementById("ag-widget-styles")) return;
    const style = document.createElement("style");
    style.id = "ag-widget-styles";
    style.innerHTML = `
    .ag-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 340px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      z-index: 2147483647;
      color: #0f172a;
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
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      padding-bottom: 10px;
    }
    .ag-logo {
      width: 24px;
      height: 24px;
      object-fit: contain;
      margin-right: 8px;
      border-radius: 4px;
    }
    .ag-title {
      font-weight: 600;
      font-size: 14px;
      color: #1e293b;
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
      color: #2563eb;
    }
    .ag-step.success {
      opacity: 1;
      color: #10b981;
    }
    .ag-step.failed {
      opacity: 1;
      color: #ef4444;
    }
    .ag-bullet {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
    }
    .ag-step.active .ag-bullet {
      border-color: #2563eb;
      background: rgba(37, 99, 235, 0.1);
    }
    .ag-step.success .ag-bullet {
      border-color: #10b981;
      background: #10b981;
      color: #ffffff;
    }
    .ag-step.failed .ag-bullet {
      border-color: #ef4444;
      background: #ef4444;
      color: #ffffff;
    }
    .ag-spinner {
      width: 10px;
      height: 10px;
      border: 2px solid #2563eb;
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
      color: #64748b;
      text-align: center;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      padding-top: 10px;
    }
    .autoapplyai-injected-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(135deg, #ff8000 0%, #ff5500 100%);
      color: #ffffff !important;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 24px;
      padding: 10px 20px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(255, 128, 0, 0.3);
      transition: all 0.2s ease;
      margin-right: 12px;
      height: 40px;
      vertical-align: middle;
      z-index: 9999;
    }
    .autoapplyai-injected-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(255, 128, 0, 0.4);
      background: linear-gradient(135deg, #ff9426 0%, #ff661a 100%);
    }
    .autoapplyai-injected-btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(255, 128, 0, 0.2);
    }
    .autoapplyai-injected-btn img {
      width: 18px;
      height: 18px;
      object-fit: contain;
    }
    .autoapplyai-floating-btn {
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(135deg, #ff8000 0%, #ff5500 100%);
      color: #ffffff !important;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 600;
      border: none;
      border-radius: 24px 0 0 24px;
      padding: 12px 18px 12px 14px;
      cursor: pointer;
      box-shadow: -4px 4px 20px rgba(0, 0, 0, 0.15);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      height: 44px;
      z-index: 2147483646;
    }
    .autoapplyai-floating-btn:hover {
      transform: translateY(-50%) translateX(-4px);
      box-shadow: -6px 6px 25px rgba(255, 128, 0, 0.4);
      background: linear-gradient(135deg, #ff9426 0%, #ff661a 100%);
    }
    .autoapplyai-floating-btn:active {
      transform: translateY(-50%) translateX(-2px);
    }
    .autoapplyai-floating-btn img {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }
  `;
    document.head.appendChild(style);
  };
  const showWidget = () => {
    injectCSS();
    let widget = document.getElementById("ag-apply-widget");
    if (!widget) {
      widget = document.createElement("div");
      widget.id = "ag-apply-widget";
      widget.className = "ag-widget";
      widget.innerHTML = `
      <div class="ag-header">
        <img class="ag-logo" src="${chrome.runtime.getURL("logo.png")}" alt="Logo" />
        <span class="ag-title">AutoApplyAI Resume Tailor</span>
      </div>
      <div class="ag-steps">
        <div class="ag-step" id="ag-step-1">
          <span class="ag-bullet">1</span>
          <span>Extracting job details...</span>
        </div>
        <div class="ag-step" id="ag-step-2">
          <span class="ag-bullet">2</span>
          <span>Tailoring & Optimizing Resume...</span>
        </div>
        <div class="ag-step" id="ag-step-3">
          <span class="ag-bullet">3</span>
          <span>Saving results to Firestore...</span>
        </div>
        <div class="ag-step" id="ag-step-4">
          <span class="ag-bullet">4</span>
          <span>Complete! Check your side panel</span>
        </div>
      </div>
      <div class="ag-footer">Serverless Client-Side Processing</div>
    `;
      document.body.appendChild(widget);
    }
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`ag-step-${i}`);
      if (step) {
        step.className = "ag-step";
        const desc = step.querySelector("span:nth-child(2)");
        if (i === 1) desc.innerText = "Extracting job details...";
        if (i === 2) desc.innerText = "Tailoring & Optimizing Resume...";
        if (i === 3) desc.innerText = "Saving results to Firestore...";
        if (i === 4) desc.innerText = "Complete! Check your side panel";
      }
    }
    setTimeout(() => widget == null ? void 0 : widget.classList.add("show"), 50);
    return widget;
  };
  const setStepState = (stepNum, state, message = null) => {
    const step = document.getElementById(`ag-step-${stepNum}`);
    if (!step) return;
    step.className = `ag-step ${state}`;
    const bullet = step.querySelector(".ag-bullet");
    const label = step.querySelector("span:nth-child(2)");
    if (message) {
      label.innerText = message;
    }
    if (state === "active") {
      bullet.innerHTML = '<div class="ag-spinner"></div>';
    } else if (state === "success") {
      bullet.innerHTML = "✓";
    } else if (state === "failed") {
      bullet.innerHTML = "✗";
    } else {
      bullet.innerHTML = String(stepNum);
    }
  };
  const extractJobDescription = () => {
    const selectors = [
      ".jobs-description__content",
      // LinkedIn Description
      ".jobs-box__html-content",
      ".job-details-jobs-unified-top-card",
      // LinkedIn top card
      "#jobDescriptionText",
      // Indeed Description
      ".jobsearch-JobComponent-description",
      '[data-automation-id="jobDescriptionText"]',
      // Workday Description
      "#content",
      ".section-wrapper",
      "main",
      "article"
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim().length > 200) {
        return el.innerText.trim();
      }
    }
    return document.body.innerText.trim();
  };
  const triggerAutomaticTailoring = async () => {
    if (!isContextValid()) return;
    if (isProcessing) return;
    isProcessing = true;
    showWidget();
    setStepState(1, "active");
    const jd = extractJobDescription();
    const url = window.location.href;
    if (!jd || jd.length < 50) {
      setStepState(1, "failed", "Extraction failed: Empty content");
      isProcessing = false;
      scheduleWidgetHide();
      return;
    }
    setStepState(1, "success", "✓ Job details extracted");
    setStepState(2, "active");
    try {
      chrome.runtime.sendMessage(
        { action: "TAILOR_JOB", jobDescription: jd, jobUrl: url },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Runtime error communicating with background:", chrome.runtime.lastError);
            setStepState(2, "failed", "✗ Extension background inactive");
            isProcessing = false;
            scheduleWidgetHide();
            return;
          }
          if (response && !response.success) {
            setStepState(2, "failed", `✗ Tailor failed: ${response.error || "Unknown error"}`);
            isProcessing = false;
            scheduleWidgetHide();
          }
        }
      );
    } catch (err) {
      console.error("Failed to send message to background worker:", err);
      setStepState(2, "failed", "✗ Extension context invalidated");
      isProcessing = false;
      scheduleWidgetHide();
    }
  };
  try {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!isContextValid()) return;
      if (message.action === "GET_JOB_DETAILS") {
        const jd = extractJobDescription();
        sendResponse({ success: true, jobDescription: jd, url: window.location.href });
        return;
      }
      if (message.action === "UPDATE_WIDGET") {
        const { step, state, labelText } = message;
        setStepState(step, state, labelText);
        if (step === 4 && (state === "success" || state === "failed")) {
          isProcessing = false;
          scheduleWidgetHide();
        }
        return;
      }
      if (message.action === "SIGN_OUT") {
        window.postMessage({ action: "EXT_SIGNOUT" }, "*");
        sendResponse({ success: true });
        return;
      }
    });
  } catch (err) {
    console.warn("AutoApplyAI: Failed to register message listener:", err);
  }
  const scheduleWidgetHide = () => {
    setTimeout(() => {
      const widget = document.getElementById("ag-apply-widget");
      if (widget && !isProcessing) {
        widget.classList.remove("show");
      }
    }, 8e3);
  };
  document.body.addEventListener("click", (e) => {
    if (!isContextValid()) return;
    const target = e.target;
    if (!target) return;
    const applyButton = target.closest(
      '.jobs-apply-button, .jobs-s-apply button, button[aria-label*="Apply"], button[aria-label*="Easy Apply"], .jobsearch-CallToActionButton, .icl-Button--primary'
    );
    if (applyButton) {
      console.log("AutoApplyAI Bot: Detected click on Apply button, launching tailoring...");
      triggerAutomaticTailoring();
    }
  });
  const isJobPage = () => {
    const url = window.location.href.toLowerCase();
    const jobDomains = [
      "linkedin.com/jobs",
      "indeed.com",
      "greenhouse.io",
      "lever.co",
      "workday",
      "smartrecruiters.com",
      "ziprecruiter.com",
      "monster.com",
      "glassdoor.com"
    ];
    if (jobDomains.some((domain) => url.includes(domain))) {
      return true;
    }
    let score = 0;
    const urlKeywords = ["/job/", "/jobs/", "/career", "/careers", "/vacancy", "/posting", "/apply", "viewjob", "showjob"];
    if (urlKeywords.some((kw) => url.includes(kw))) {
      score += 2;
    }
    const buttons = Array.from(document.querySelectorAll('button, a.btn, a.button, .button, .btn, [role="button"]'));
    const applyTextRegex = /^(apply|apply now|easy apply|submit application|apply to this job|quick apply)$/i;
    const hasApplyButton = buttons.some((btn) => {
      var _a;
      const text = ((_a = btn.textContent) == null ? void 0 : _a.trim()) || "";
      return applyTextRegex.test(text) || text.toLowerCase().includes("apply") && text.length < 25;
    });
    if (hasApplyButton) {
      score += 2;
    }
    const pageText = document.body.innerText.toLowerCase();
    const jdSections = ["requirements", "responsibilities", "qualifications", "who you are", "what you will do", "about the role", "key responsibilities"];
    let foundSections = 0;
    for (const sec of jdSections) {
      if (pageText.includes(sec)) foundSections++;
    }
    if (foundSections >= 2) {
      score += 2;
    }
    return score >= 3;
  };
  const findNativeApplyButton = () => {
    var _a;
    const commonSelectors = [
      ".jobs-s-apply",
      ".jobs-apply-button",
      // LinkedIn
      ".jobsearch-CallToActionButton",
      "#applyButtonLinkContainer",
      ".jobsearch-IndeedApplyButton",
      // Indeed
      ".page-apply-button",
      ".submit-application-btn",
      // Generic
      "#apply-button",
      '[data-automation-id="apply-button"]',
      // Workday
      ".postings-btn",
      ".apply-btn",
      // Lever / Greenhouse
      'a[href*="/apply"]',
      'button[id*="apply"]',
      'a[id*="apply"]'
      // General patterns
    ];
    for (const sel of commonSelectors) {
      const el = document.querySelector(sel);
      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
        return el;
      }
    }
    const buttons = Array.from(document.querySelectorAll('button, a.btn, a.button, [role="button"]'));
    for (const btn of buttons) {
      const text = ((_a = btn.textContent) == null ? void 0 : _a.trim().toLowerCase()) || "";
      if (text === "apply" || text.includes("apply now") || text.includes("easy apply") || text.includes("apply on") || text.includes("apply to") || text.includes("submit application")) {
        if (btn.offsetWidth > 0 && btn.offsetHeight > 0) {
          return btn;
        }
      }
    }
    return null;
  };
  let checkInterval = null;
  const injectButton = () => {
    var _a, _b, _c, _d, _e, _f;
    if (!isContextValid()) {
      if (observer) {
        try {
          observer.disconnect();
        } catch (err) {
        }
        observer = null;
      }
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      (_a = document.getElementById("autoapplyai-injected-btn")) == null ? void 0 : _a.remove();
      (_b = document.getElementById("autoapplyai-floating-btn")) == null ? void 0 : _b.remove();
      return;
    }
    if (!isJobPage()) {
      (_c = document.getElementById("autoapplyai-injected-btn")) == null ? void 0 : _c.remove();
      (_d = document.getElementById("autoapplyai-floating-btn")) == null ? void 0 : _d.remove();
      return;
    }
    const jd = extractJobDescription();
    if (!jd || jd.length < 50) return;
    const nativeApplyBtn = findNativeApplyButton();
    if (nativeApplyBtn) {
      (_e = document.getElementById("autoapplyai-floating-btn")) == null ? void 0 : _e.remove();
      const inlineBtn = document.getElementById("autoapplyai-injected-btn");
      const targetParent = nativeApplyBtn.parentNode;
      if (targetParent) {
        if (inlineBtn && inlineBtn.parentNode === targetParent && inlineBtn.nextSibling === nativeApplyBtn) {
          return;
        }
        inlineBtn == null ? void 0 : inlineBtn.remove();
        const btn = document.createElement("button");
        btn.id = "autoapplyai-injected-btn";
        btn.className = "autoapplyai-injected-btn";
        btn.innerHTML = `
        <img src="${chrome.runtime.getURL("icon-128.png")}" alt="A" />
        <span>Apply with AI</span>
      `;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isContextValid()) {
            alert("AutoApplyAI: Extension was updated/reloaded. Please refresh the page to use the extension.");
            return;
          }
          console.log("AutoApplyAI: Custom inline button clicked. Opening side panel...");
          chrome.runtime.sendMessage({ action: "OPEN_SIDEPANEL" }, () => {
            if (chrome.runtime.lastError) {
              console.error("Failed to open sidepanel:", chrome.runtime.lastError);
            }
          });
        });
        injectCSS();
        try {
          targetParent.insertBefore(btn, nativeApplyBtn);
          console.log('AutoApplyAI: Successfully injected custom inline "Apply with AI" button.');
        } catch (err) {
          console.warn("AutoApplyAI: DOM race during insertion, will retry:", err);
        }
      }
    } else {
      (_f = document.getElementById("autoapplyai-injected-btn")) == null ? void 0 : _f.remove();
      const floatingBtn = document.getElementById("autoapplyai-floating-btn");
      if (floatingBtn) {
        if (floatingBtn.parentElement === document.body) {
          return;
        }
        floatingBtn.remove();
      }
      const btn = document.createElement("button");
      btn.id = "autoapplyai-floating-btn";
      btn.className = "autoapplyai-floating-btn";
      btn.innerHTML = `
      <img src="${chrome.runtime.getURL("icon-128.png")}" alt="A" />
      <span>Apply with AI</span>
    `;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isContextValid()) {
          alert("AutoApplyAI: Extension was updated/reloaded. Please refresh the page to use the extension.");
          return;
        }
        console.log("AutoApplyAI: Custom floating button clicked. Opening side panel...");
        chrome.runtime.sendMessage({ action: "OPEN_SIDEPANEL" }, () => {
          if (chrome.runtime.lastError) {
            console.error("Failed to open sidepanel:", chrome.runtime.lastError);
          }
        });
      });
      injectCSS();
      document.body.appendChild(btn);
      console.log('AutoApplyAI: Successfully injected custom floating side tab "Apply with AI" button.');
    }
  };
  let observer = null;
  const startObserver = () => {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      let shouldInject = false;
      for (const mutation of mutations) {
        const target = mutation.target;
        if (target.id === "autoapplyai-injected-btn" || target.id === "autoapplyai-floating-btn") {
          continue;
        }
        if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
          const isSelfMutation = Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)).every((node) => {
            const el = node;
            return el.id === "autoapplyai-injected-btn" || el.id === "autoapplyai-floating-btn" || el.id === "ag-widget-styles";
          });
          if (!isSelfMutation) {
            shouldInject = true;
            break;
          }
        }
      }
      if (shouldInject) {
        injectButton();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  injectButton();
  startObserver();
  checkInterval = setInterval(injectButton, 2e3);
  console.log("AutoApplyAI Bot: Content Script loaded successfully.");
})();
//# sourceMappingURL=content.js.map
