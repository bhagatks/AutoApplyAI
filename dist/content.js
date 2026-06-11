(function(){"use strict";let p=!1;const g=()=>{var e;try{return!!((e=chrome.runtime)!=null&&e.getManifest())}catch{return!1}},y=()=>{if(document.getElementById("ag-widget-styles"))return;const e=document.createElement("style");e.id="ag-widget-styles",e.innerHTML=`
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
  `,document.head.appendChild(e)},v=()=>{y();let e=document.getElementById("ag-apply-widget");e||(e=document.createElement("div"),e.id="ag-apply-widget",e.className="ag-widget",e.innerHTML=`
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
    `,document.body.appendChild(e));for(let o=1;o<=4;o++){const t=document.getElementById(`ag-step-${o}`);if(t){t.className="ag-step";const n=t.querySelector("span:nth-child(2)");o===1&&(n.innerText="Extracting job details..."),o===2&&(n.innerText="Tailoring & Optimizing Resume..."),o===3&&(n.innerText="Saving results to Firestore..."),o===4&&(n.innerText="Complete! Check your side panel")}}return setTimeout(()=>e==null?void 0:e.classList.add("show"),50),e},c=(e,o,t=null)=>{const n=document.getElementById(`ag-step-${e}`);if(!n)return;n.className=`ag-step ${o}`;const a=n.querySelector(".ag-bullet"),l=n.querySelector("span:nth-child(2)");t&&(l.innerText=t),o==="active"?a.innerHTML='<div class="ag-spinner"></div>':o==="success"?a.innerHTML="✓":o==="failed"?a.innerHTML="✗":a.innerHTML=String(e)},x=()=>{const e=[".jobs-description__content",".jobs-box__html-content",".job-details-jobs-unified-top-card","#jobDescriptionText",".jobsearch-JobComponent-description",'[data-automation-id="jobDescriptionText"]',"#content",".section-wrapper","main","article"];for(const o of e){const t=document.querySelector(o);if(t&&t.innerText.trim().length>200)return t.innerText.trim()}return document.body.innerText.trim()},j=async()=>{if(!g()||p)return;p=!0,v(),c(1,"active");const e=x(),o=window.location.href;if(!e||e.length<50){c(1,"failed","Extraction failed: Empty content"),p=!1,b();return}c(1,"success","✓ Job details extracted"),c(2,"active");try{chrome.runtime.sendMessage({action:"TAILOR_JOB",jobDescription:e,jobUrl:o},t=>{if(chrome.runtime.lastError){console.error("Runtime error communicating with background:",chrome.runtime.lastError),c(2,"failed","✗ Extension background inactive"),p=!1,b();return}t&&!t.success&&(c(2,"failed",`✗ Tailor failed: ${t.error||"Unknown error"}`),p=!1,b())})}catch(t){console.error("Failed to send message to background worker:",t),c(2,"failed","✗ Extension context invalidated"),p=!1,b()}};try{chrome.runtime.onMessage.addListener((e,o,t)=>{if(g()){if(e.action==="GET_JOB_DETAILS"){const n=x();t({success:!0,jobDescription:n,url:window.location.href});return}if(e.action==="UPDATE_WIDGET"){const{step:n,state:a,labelText:l}=e;c(n,a,l),n===4&&(a==="success"||a==="failed")&&(p=!1,b())}}})}catch(e){console.warn("AutoApplyAI: Failed to register message listener:",e)}const b=()=>{setTimeout(()=>{const e=document.getElementById("ag-apply-widget");e&&!p&&e.classList.remove("show")},8e3)};document.body.addEventListener("click",e=>{if(!g())return;const o=e.target;if(!o)return;o.closest('.jobs-apply-button, .jobs-s-apply button, button[aria-label*="Apply"], button[aria-label*="Easy Apply"], .jobsearch-CallToActionButton, .icl-Button--primary')&&(console.log("AutoApplyAI Bot: Detected click on Apply button, launching tailoring..."),j())});const E=()=>{const e=window.location.href.toLowerCase();if(["linkedin.com/jobs","indeed.com","greenhouse.io","lever.co","workday","smartrecruiters.com","ziprecruiter.com","monster.com","glassdoor.com"].some(i=>e.includes(i)))return!0;let t=0;["/job/","/jobs/","/career","/careers","/vacancy","/posting","/apply","viewjob","showjob"].some(i=>e.includes(i))&&(t+=2);const a=Array.from(document.querySelectorAll('button, a.btn, a.button, .button, .btn, [role="button"]')),l=/^(apply|apply now|easy apply|submit application|apply to this job|quick apply)$/i;a.some(i=>{var w;const d=((w=i.textContent)==null?void 0:w.trim())||"";return l.test(d)||d.toLowerCase().includes("apply")&&d.length<25})&&(t+=2);const m=document.body.innerText.toLowerCase(),r=["requirements","responsibilities","qualifications","who you are","what you will do","about the role","key responsibilities"];let s=0;for(const i of r)m.includes(i)&&s++;return s>=2&&(t+=2),t>=3},I=()=>{var t;const e=[".jobs-s-apply",".jobs-apply-button",".jobsearch-CallToActionButton","#applyButtonLinkContainer",".jobsearch-IndeedApplyButton",".page-apply-button",".submit-application-btn","#apply-button",'[data-automation-id="apply-button"]',".postings-btn",".apply-btn",'a[href*="/apply"]','button[id*="apply"]','a[id*="apply"]'];for(const n of e){const a=document.querySelector(n);if(a&&a.offsetWidth>0&&a.offsetHeight>0)return a}const o=Array.from(document.querySelectorAll('button, a.btn, a.button, [role="button"]'));for(const n of o){const a=((t=n.textContent)==null?void 0:t.trim().toLowerCase())||"";if((a==="apply"||a.includes("apply now")||a.includes("easy apply")||a.includes("apply on")||a.includes("apply to")||a.includes("submit application"))&&n.offsetWidth>0&&n.offsetHeight>0)return n}return null};let h=null;const A=()=>{var t,n,a,l,u,m;if(!g()){if(f){try{f.disconnect()}catch{}f=null}h&&clearInterval(h),(t=document.getElementById("autoapplyai-injected-btn"))==null||t.remove(),(n=document.getElementById("autoapplyai-floating-btn"))==null||n.remove();return}if(!E()){(a=document.getElementById("autoapplyai-injected-btn"))==null||a.remove(),(l=document.getElementById("autoapplyai-floating-btn"))==null||l.remove();return}const e=x();if(!e||e.length<50)return;const o=I();if(o){(u=document.getElementById("autoapplyai-floating-btn"))==null||u.remove();const r=document.getElementById("autoapplyai-injected-btn"),s=o.parentNode;if(s){if(r&&r.parentNode===s&&r.nextSibling===o)return;r==null||r.remove();const i=document.createElement("button");i.id="autoapplyai-injected-btn",i.className="autoapplyai-injected-btn",i.innerHTML=`
        <img src="${chrome.runtime.getURL("icon-128.png")}" alt="A" />
        <span>Apply with AI</span>
      `,i.addEventListener("click",d=>{if(d.preventDefault(),d.stopPropagation(),!g()){alert("AutoApplyAI: Extension was updated/reloaded. Please refresh the page to use the extension.");return}console.log("AutoApplyAI: Custom inline button clicked. Opening side panel..."),chrome.runtime.sendMessage({action:"OPEN_SIDEPANEL"},()=>{chrome.runtime.lastError&&console.error("Failed to open sidepanel:",chrome.runtime.lastError)})}),y();try{s.insertBefore(i,o),console.log('AutoApplyAI: Successfully injected custom inline "Apply with AI" button.')}catch(d){console.warn("AutoApplyAI: DOM race during insertion, will retry:",d)}}}else{(m=document.getElementById("autoapplyai-injected-btn"))==null||m.remove();const r=document.getElementById("autoapplyai-floating-btn");if(r){if(r.parentElement===document.body)return;r.remove()}const s=document.createElement("button");s.id="autoapplyai-floating-btn",s.className="autoapplyai-floating-btn",s.innerHTML=`
      <img src="${chrome.runtime.getURL("icon-128.png")}" alt="A" />
      <span>Apply with AI</span>
    `,s.addEventListener("click",i=>{if(i.preventDefault(),i.stopPropagation(),!g()){alert("AutoApplyAI: Extension was updated/reloaded. Please refresh the page to use the extension.");return}console.log("AutoApplyAI: Custom floating button clicked. Opening side panel..."),chrome.runtime.sendMessage({action:"OPEN_SIDEPANEL"},()=>{chrome.runtime.lastError&&console.error("Failed to open sidepanel:",chrome.runtime.lastError)})}),y(),document.body.appendChild(s),console.log('AutoApplyAI: Successfully injected custom floating side tab "Apply with AI" button.')}};let f=null;const T=()=>{f||(f=new MutationObserver(e=>{let o=!1;for(const t of e){const n=t.target;if(!(n.id==="autoapplyai-injected-btn"||n.id==="autoapplyai-floating-btn")&&(t.addedNodes.length>0||t.removedNodes.length>0)&&!Array.from(t.addedNodes).concat(Array.from(t.removedNodes)).every(l=>{const u=l;return u.id==="autoapplyai-injected-btn"||u.id==="autoapplyai-floating-btn"||u.id==="ag-widget-styles"})){o=!0;break}}o&&A()}),f.observe(document.body,{childList:!0,subtree:!0}))};A(),T(),h=setInterval(A,2e3),console.log("AutoApplyAI Bot: Content Script loaded successfully.")})();
