(function() {
  "use strict";
  const HIGHLIGHT_CLASS = "autoapplyai-ai-filled";
  function setNativeValue(el, value) {
    var _a;
    const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = (_a = Object.getOwnPropertyDescriptor(proto, "value")) == null ? void 0 : _a.set;
    setter == null ? void 0 : setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function highlightField(el) {
    el.classList.add(HIGHLIGHT_CLASS);
    el.style.outline = "2px solid #2563EB";
    el.style.outlineOffset = "2px";
  }
  function injectHighlightStyles() {
    if (document.getElementById("autoapplyai-apply-styles")) return;
    const style = document.createElement("style");
    style.id = "autoapplyai-apply-styles";
    style.textContent = `
    .${HIGHLIGHT_CLASS} { background: rgba(37, 99, 235, 0.08) !important; }
    #autoapplyai-review-banner {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      z-index: 2147483646; background: #172033; color: #fff; padding: 12px 18px;
      border-radius: 12px; font: 13px/1.4 system-ui, sans-serif; box-shadow: 0 8px 32px rgba(0,0,0,.35);
      border: 1px solid rgba(37,99,235,.5); max-width: min(420px, 92vw); text-align: center;
    }
  `;
    document.documentElement.appendChild(style);
  }
  function showReviewBanner() {
    injectHighlightStyles();
    if (document.getElementById("autoapplyai-review-banner")) return;
    const banner = document.createElement("div");
    banner.id = "autoapplyai-review-banner";
    banner.textContent = "AutoApplyAI prefilled this form — review AI answers, then submit when ready.";
    document.documentElement.appendChild(banner);
  }
  function findLabelText(input) {
    const id = input.getAttribute("id");
    if (id) {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (label == null ? void 0 : label.textContent) return label.textContent.trim();
    }
    const aria = input.getAttribute("aria-label");
    if (aria) return aria.trim();
    const labelledBy = input.getAttribute("aria-labelledby");
    if (labelledBy) {
      const el = document.getElementById(labelledBy);
      if (el == null ? void 0 : el.textContent) return el.textContent.trim();
    }
    const parentLabel = input.closest("label");
    if (parentLabel == null ? void 0 : parentLabel.textContent) return parentLabel.textContent.trim();
    return "";
  }
  function collectGenericQuestions() {
    const fields = Array.from(
      document.querySelectorAll(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]), textarea, select'
      )
    );
    return fields.filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden" && !el.disabled;
    }).map((el, index) => {
      const tag = el.tagName.toLowerCase();
      const type = tag === "textarea" ? "textarea" : tag === "select" ? "select" : el.type === "checkbox" ? "checkbox" : "text";
      const label = findLabelText(el) || `field_${index}`;
      const id = el.id || el.getAttribute("name") || `q_${index}`;
      return {
        id,
        label,
        type,
        required: el.required
      };
    });
  }
  function fillBasicContact(payload) {
    let count = 0;
    const highlighted = [];
    const { profile, customAnswers } = payload;
    const mappings = [
      { patterns: [/first.?name/i, /given.?name/i, /fname/i], value: profile.firstName },
      { patterns: [/last.?name/i, /family.?name/i, /lname/i, /surname/i], value: profile.lastName },
      { patterns: [/email/i, /e-mail/i], value: profile.email },
      { patterns: [/phone/i, /mobile/i, /tel/i], value: profile.phone },
      { patterns: [/linkedin/i], value: profile.linkedin || "" },
      { patterns: [/location/i, /city/i, /address/i], value: profile.location || "" }
    ];
    const inputs = Array.from(
      document.querySelectorAll("input, textarea")
    );
    for (const input of inputs) {
      if (input.type === "hidden" || input.type === "file" || input.type === "submit") continue;
      const haystack = `${findLabelText(input)} ${input.name || ""} ${input.id || ""} ${input.placeholder || ""}`.toLowerCase();
      for (const map of mappings) {
        if (!map.value || input.value.trim()) continue;
        if (map.patterns.some((p) => p.test(haystack))) {
          setNativeValue(input, map.value);
          highlightField(input);
          highlighted.push(map.value);
          count += 1;
          break;
        }
      }
    }
    for (const [questionId, answer] of Object.entries(customAnswers)) {
      const el = document.getElementById(questionId) || document.querySelector(`[name="${CSS.escape(questionId)}"]`);
      if (el && answer && !el.value.trim()) {
        setNativeValue(el, answer);
        highlightField(el);
        highlighted.push(questionId);
        count += 1;
      }
    }
    return { count, highlighted };
  }
  const linkedInAdapter = {
    platform: "linkedin",
    detect: () => /linkedin\.com/i.test(window.location.href),
    collectQuestions: collectGenericQuestions,
    assistApply: async (payload) => {
      injectHighlightStyles();
      showReviewBanner();
      const easyApplyBtn = Array.from(document.querySelectorAll("button, a")).find(
        (btn) => /easy apply/i.test(btn.textContent || "") || /easy apply/i.test(btn.getAttribute("aria-label") || "")
      );
      if (easyApplyBtn && !document.querySelector('.jobs-easy-apply-modal, [data-test-modal-id="easy-apply-modal"]')) {
        easyApplyBtn.click();
        await new Promise((r) => setTimeout(r, 1200));
      }
      const { count, highlighted } = fillBasicContact(payload);
      const unanswered = collectGenericQuestions().filter((q) => {
        var _a, _b;
        const el = document.getElementById(q.id) || document.querySelector(`[name="${CSS.escape(q.id)}"]`);
        if (!el) return false;
        const val = ((_b = (_a = el.value) == null ? void 0 : _a.trim) == null ? void 0 : _b.call(_a)) || "";
        return !val && (q.type === "textarea" || q.type === "text");
      });
      return {
        success: true,
        prefilledCount: count,
        highlightedFields: highlighted,
        unansweredQuestions: unanswered,
        message: count > 0 ? `Prefilled ${count} field(s). Review highlighted fields, then submit.` : "Opened apply flow — complete fields manually if needed."
      };
    }
  };
  const greenhouseAdapter = {
    platform: "greenhouse",
    detect: () => /boards\.greenhouse\.io/i.test(window.location.href) || !!document.querySelector("#application_form, .application--container"),
    collectQuestions: collectGenericQuestions,
    assistApply: async (payload) => {
      injectHighlightStyles();
      showReviewBanner();
      const applyBtn = document.querySelector('#apply_button, a[href="#app"], button[data-source="apply"]');
      applyBtn == null ? void 0 : applyBtn.click();
      await new Promise((r) => setTimeout(r, 800));
      const { count, highlighted } = fillBasicContact(payload);
      const unanswered = collectGenericQuestions().filter((q) => {
        var _a, _b;
        const el = document.getElementById(q.id) || document.querySelector(`[name="${CSS.escape(q.id)}"]`);
        if (!el) return false;
        const val = ((_b = (_a = el.value) == null ? void 0 : _a.trim) == null ? void 0 : _b.call(_a)) || "";
        return !val && (q.type === "textarea" || q.type === "text");
      });
      return {
        success: true,
        prefilledCount: count,
        highlightedFields: highlighted,
        unansweredQuestions: unanswered,
        message: `Prefilled ${count} Greenhouse field(s). Upload resume PDF if required, then submit.`
      };
    }
  };
  const genericAdapter = {
    platform: "generic",
    detect: () => true,
    collectQuestions: collectGenericQuestions,
    assistApply: async (payload) => {
      injectHighlightStyles();
      showReviewBanner();
      const { count, highlighted } = fillBasicContact(payload);
      return {
        success: count > 0,
        prefilledCount: count,
        highlightedFields: highlighted,
        unansweredQuestions: collectGenericQuestions(),
        message: count > 0 ? `Prefilled ${count} generic field(s).` : "No matching fields found on this page."
      };
    }
  };
  function pickAdapter(platform) {
    if (platform === "linkedin") return linkedInAdapter;
    if (platform === "greenhouse") return greenhouseAdapter;
    return genericAdapter;
  }
  if (window.top !== window.self) ;
  else {
    const HOST_ID = "autoapplyai-launcher-host";
    const STORAGE_KEY = "launcher_position_v1";
    const LAUNCHER_SIZE = 52;
    const isContextValid = () => {
      var _a;
      try {
        return !!((_a = chrome.runtime) == null ? void 0 : _a.getManifest());
      } catch {
        return false;
      }
    };
    const VIEWPORT_MARGIN = 12;
    const defaultPosition = () => ({
      x: window.innerWidth - LAUNCHER_SIZE - 16,
      y: window.innerHeight - LAUNCHER_SIZE - 16
    });
    const clampPosition = (pos) => ({
      x: Math.max(VIEWPORT_MARGIN, Math.min(pos.x, window.innerWidth - LAUNCHER_SIZE - VIEWPORT_MARGIN)),
      y: Math.max(VIEWPORT_MARGIN, Math.min(pos.y, window.innerHeight - LAUNCHER_SIZE - VIEWPORT_MARGIN))
    });
    const loadPosition = () => new Promise((resolve) => {
      if (!isContextValid()) {
        resolve(clampPosition(defaultPosition()));
        return;
      }
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        const saved = res[STORAGE_KEY];
        if (saved && typeof saved.x === "number" && typeof saved.y === "number") {
          resolve(clampPosition(saved));
        } else {
          resolve(clampPosition(defaultPosition()));
        }
      });
    });
    const savePosition = (pos) => {
      if (!isContextValid()) return;
      chrome.storage.local.set({ [STORAGE_KEY]: clampPosition(pos) });
    };
    const JOB_DESCRIPTION_SELECTORS = [
      ".jobs-description__content",
      ".jobs-box__html-content",
      ".jobs-description-content__text",
      "#jobDescriptionText",
      ".jobsearch-JobComponent-description",
      '[data-automation-id="jobDescriptionText"]',
      ".posting-page",
      ".content .posting-headline",
      ".job-post",
      ".job-description",
      ".section.page-centered",
      /* Ashby */
      '[class*="JobPosting"]',
      '[class*="jobPosting"]',
      '[class*="Description"]',
      'div[class*="ashby"] section',
      /* Lever */
      ".content .section-wrapper",
      ".posting-categories"
    ];
    const extractJobDescription = () => {
      for (const sel of JOB_DESCRIPTION_SELECTORS) {
        const el = document.querySelector(sel);
        if (el && el.innerText.trim().length > 80) {
          return el.innerText.trim();
        }
      }
      return "";
    };
    const hasJobDescriptionOnPage = () => extractJobDescription().length >= 80;
    const hasApplyActionOnPage = () => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const applyPattern = /^(apply|apply now|easy apply|quick apply|submit application|apply for this job)$/i;
      return buttons.some((btn) => {
        var _a, _b;
        const text = ((_a = btn.textContent) == null ? void 0 : _a.trim()) || "";
        const aria = ((_b = btn.getAttribute("aria-label")) == null ? void 0 : _b.trim()) || "";
        return applyPattern.test(text) || /apply/i.test(aria);
      });
    };
    const hasJobSectionKeywords = () => {
      var _a, _b;
      const text = ((_b = (_a = document.body) == null ? void 0 : _a.innerText) == null ? void 0 : _b.toLowerCase()) || "";
      const keywords = [
        "job description",
        "responsibilities",
        "qualifications",
        "requirements",
        "what you will do",
        "about the role"
      ];
      return keywords.filter((kw) => text.includes(kw)).length >= 2;
    };
    const isJobPage = () => {
      const url = window.location.href.toLowerCase();
      const highConfidencePatterns = [
        /linkedin\.com\/jobs\/view/,
        /linkedin\.com\/jobs\/collections/,
        /indeed\.com\/viewjob/,
        /indeed\.com\/rc\/clk/,
        /boards\.greenhouse\.io\/[^/]+\/jobs\//,
        /jobs\.lever\.co\/[^/]+/,
        /jobs\.ashbyhq\.com\/[^/]+/,
        /smartrecruiters\.com\/[^/]+\/[^/]+/,
        /glassdoor\.com\/job-listing/,
        /glassdoor\.com\/partners\/job\/listing/,
        /ziprecruiter\.com\/jobs\//,
        /monster\.com\/job-openings/,
        /myworkdayjobs\.com\/[^/]+\/job\//,
        /careers\.[^/]+\/jobs\//
      ];
      if (highConfidencePatterns.some((pattern) => pattern.test(url))) {
        return hasJobDescriptionOnPage() || hasApplyActionOnPage() || hasJobSectionKeywords();
      }
      const jobBoardHosts = [
        "linkedin.com/jobs",
        "indeed.com",
        "greenhouse.io",
        "lever.co",
        "workday",
        "smartrecruiters.com",
        "ziprecruiter.com",
        "glassdoor.com",
        "ashbyhq.com"
      ];
      const onJobBoard = jobBoardHosts.some((host) => url.includes(host));
      if (onJobBoard) {
        return hasJobDescriptionOnPage() || hasApplyActionOnPage() && hasJobSectionKeywords();
      }
      const urlLooksLikeJob = /\/(job|jobs|career|careers|vacancy|posting|position|opening)s?\//i.test(url) || /[?&](job|jobid|posting)=/i.test(url);
      if (!urlLooksLikeJob) return false;
      let score = 0;
      if (urlLooksLikeJob) score += 2;
      if (hasApplyActionOnPage()) score += 2;
      if (hasJobDescriptionOnPage()) score += 3;
      if (hasJobSectionKeywords()) score += 2;
      return score >= 5;
    };
    const syncLauncherPositionFromStorage = async () => {
      const saved = await loadPosition();
      if (launcherHost) {
        launcherHost.position.x = saved.x;
        launcherHost.position.y = saved.y;
        applyPosition(launcherHost.host, saved);
      }
      return saved;
    };
    const hideLauncherForSidepanel = () => {
      if (launcherHost) savePosition(launcherHost.position);
      hiddenForSidepanel = true;
      setLauncherVisible(false);
    };
    const showLauncherAfterSidepanel = () => {
      hiddenForSidepanel = false;
      void (async () => {
        await syncLauncherPositionFromStorage();
        if (launcherHost) {
          setLauncherVisible(true);
        } else {
          await updateLauncher();
        }
      })();
    };
    const checkSidepanelClosedAndShowLauncher = () => {
      if (!hiddenForSidepanel || !isContextValid()) return;
      chrome.runtime.sendMessage({ action: "IS_SIDEPANEL_OPEN" }, (response) => {
        if (chrome.runtime.lastError) return;
        if (!(response == null ? void 0 : response.open)) showLauncherAfterSidepanel();
      });
    };
    const openSidepanel = () => {
      if (!isContextValid()) {
        alert("AutoApplyAI was updated. Please refresh this page and try again.");
        return;
      }
      chrome.runtime.sendMessage({ action: "OPEN_SIDEPANEL" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("AutoApplyAI: failed to open sidepanel:", chrome.runtime.lastError);
          return;
        }
        if ((response == null ? void 0 : response.success) !== false) {
          hideLauncherForSidepanel();
        }
      });
    };
    let launcherHost = null;
    let hiddenForSidepanel = false;
    let dragState = null;
    const applyPosition = (host, pos) => {
      host.style.left = `${pos.x}px`;
      host.style.top = `${pos.y}px`;
    };
    const buildLauncherStyles = () => `
  .launcher {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${LAUNCHER_SIZE}px;
    height: ${LAUNCHER_SIZE}px;
    margin: 0;
    padding: 0;
    border: 1px solid rgba(96, 165, 250, 0.35);
    border-radius: 12px;
    background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
    cursor: grab;
    user-select: none;
    touch-action: none;
    animation: launcher-glow 2.4s ease-in-out infinite;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .launcher:hover {
    box-shadow: 0 8px 22px rgba(37, 99, 235, 0.45);
    transform: translateY(-1px);
  }

  .launcher.dragging {
    cursor: grabbing;
    animation: none;
    transform: scale(1.04);
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.5);
  }

  .launcher img {
    width: 30px;
    height: 30px;
    object-fit: contain;
    display: block;
    pointer-events: none;
  }

  @keyframes launcher-glow {
    0%, 100% {
      border-color: rgba(96, 165, 250, 0.35);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
    }
    50% {
      border-color: rgba(147, 197, 253, 0.75);
      box-shadow: 0 6px 22px rgba(37, 99, 235, 0.4);
    }
  }
`;
    const mountLauncherHost = async () => {
      if (launcherHost) return launcherHost;
      const position = await loadPosition();
      const host = document.createElement("div");
      host.id = HOST_ID;
      host.setAttribute("data-autoapplyai", "launcher");
      host.style.cssText = [
        "all: initial",
        "position: fixed",
        "z-index: 2147483647",
        "margin: 0",
        "padding: 0",
        "border: none",
        "background: transparent",
        "pointer-events: auto",
        "width: auto",
        "height: auto"
      ].join(";");
      applyPosition(host, position);
      const shadow = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = buildLauncherStyles();
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "launcher";
      btn.setAttribute("aria-label", "Open AutoApplyAI sidepanel. Drag to reposition.");
      btn.innerHTML = `<img src="${chrome.runtime.getURL("icon-48.png")}" alt="" />`;
      const onPointerDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        dragState = {
          active: true,
          moved: false,
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          originX: position.x,
          originY: position.y
        };
        btn.classList.add("dragging");
        btn.setPointerCapture(e.pointerId);
      };
      const onPointerMove = (e) => {
        if (!(dragState == null ? void 0 : dragState.active) || e.pointerId !== dragState.pointerId) return;
        e.preventDefault();
        e.stopPropagation();
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.moved = true;
        const next = clampPosition({ x: dragState.originX + dx, y: dragState.originY + dy });
        position.x = next.x;
        position.y = next.y;
        applyPosition(host, next);
      };
      const onPointerUp = (e) => {
        if (!(dragState == null ? void 0 : dragState.active) || e.pointerId !== dragState.pointerId) return;
        e.preventDefault();
        e.stopPropagation();
        btn.classList.remove("dragging");
        btn.releasePointerCapture(e.pointerId);
        const wasDrag = dragState.moved;
        dragState = null;
        savePosition(position);
        if (!wasDrag) openSidepanel();
      };
      btn.addEventListener("pointerdown", onPointerDown);
      btn.addEventListener("pointermove", onPointerMove);
      btn.addEventListener("pointerup", onPointerUp);
      btn.addEventListener("pointercancel", onPointerUp);
      shadow.append(style, btn);
      document.documentElement.appendChild(host);
      launcherHost = { host, shadow, btn, position };
      return launcherHost;
    };
    const setLauncherVisible = (visible) => {
      if (!launcherHost) return;
      launcherHost.host.style.display = visible ? "block" : "none";
    };
    const removeLauncherHost = () => {
      launcherHost == null ? void 0 : launcherHost.host.remove();
      launcherHost = null;
    };
    let updateTimer = null;
    const updateLauncher = async () => {
      if (!isContextValid()) {
        removeLauncherHost();
        return;
      }
      if (!document.documentElement) return;
      if (!isJobPage()) {
        setLauncherVisible(false);
        return;
      }
      if (hiddenForSidepanel) {
        setLauncherVisible(false);
        return;
      }
      const mounted = await mountLauncherHost();
      const saved = await loadPosition();
      mounted.position.x = saved.x;
      mounted.position.y = saved.y;
      setLauncherVisible(true);
      applyPosition(mounted.host, clampPosition(mounted.position));
    };
    const scheduleLauncherUpdate = () => {
      if (updateTimer) clearTimeout(updateTimer);
      updateTimer = setTimeout(() => {
        void updateLauncher();
      }, 350);
    };
    const onViewportChange = () => {
      if (!launcherHost) return;
      launcherHost.position = clampPosition(launcherHost.position);
      applyPosition(launcherHost.host, launcherHost.position);
    };
    try {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (!isContextValid()) return;
        if (message.action === "GET_JOB_DETAILS") {
          const jd = extractJobDescription() || document.body.innerText.trim();
          sendResponse({ success: true, jobDescription: jd, url: window.location.href });
          return;
        }
        if (message.action === "COLLECT_APPLICATION_QUESTIONS") {
          const adapter = pickAdapter(message.platform || "generic");
          sendResponse({ success: true, questions: adapter.collectQuestions() });
          return;
        }
        if (message.action === "ASSIST_APPLY" && message.payload) {
          (async () => {
            try {
              const adapter = pickAdapter(message.payload.platform || "generic");
              const result = await adapter.assistApply(message.payload);
              sendResponse(result);
            } catch (err) {
              const error = err instanceof Error ? err.message : String(err);
              sendResponse({ success: false, prefilledCount: 0, highlightedFields: [], unansweredQuestions: [], error });
            }
          })();
          return true;
        }
        if (message.action === "HIDE_LAUNCHER") {
          hideLauncherForSidepanel();
          sendResponse({ success: true });
          return;
        }
        if (message.action === "SHOW_LAUNCHER") {
          showLauncherAfterSidepanel();
          sendResponse({ success: true });
          return;
        }
        if (message.action === "SIGN_OUT") {
          window.postMessage({ action: "EXT_SIGNOUT" }, "*");
          sendResponse({ success: true });
          return;
        }
      });
    } catch (err) {
      console.warn("AutoApplyAI: failed to register message listener:", err);
    }
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        hiddenForSidepanel = false;
        scheduleLauncherUpdate();
      }
    });
    const domObserver = new MutationObserver((mutations) => {
      const touchedLauncher = mutations.some((mutation) => {
        const nodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)];
        return nodes.some((node) => {
          var _a;
          const el = node;
          return el.id === HOST_ID || ((_a = el.getAttribute) == null ? void 0 : _a.call(el, "data-autoapplyai")) === "launcher";
        });
      });
      if (!touchedLauncher) scheduleLauncherUpdate();
    });
    const boot = () => {
      if (!document.documentElement) return;
      void updateLauncher();
      domObserver.observe(document.body, { childList: true, subtree: true });
      urlObserver.observe(document.documentElement, { childList: true, subtree: true });
      window.addEventListener("popstate", scheduleLauncherUpdate);
      window.addEventListener("hashchange", scheduleLauncherUpdate);
      window.addEventListener("resize", onViewportChange);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          checkSidepanelClosedAndShowLauncher();
        }
      });
      window.addEventListener("focus", checkSidepanelClosedAndShowLauncher);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
    console.log("AutoApplyAI: content script ready");
  }
})();
//# sourceMappingURL=content.js.map
