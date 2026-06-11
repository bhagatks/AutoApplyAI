import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, S as Settings, U as User, a as Sparkles, s as saveCustomerConfig, b as auth, o as onAuthStateChanged, L as Loader, d as LogOut, P as Plus, T as Trash2, C as Copy, D as Download, n as normalizeName, e as Printer, g as getHistoricalTitles, E as EyeOff, f as Eye, G as GoogleAuthProvider, h as signInWithPopup, i as signOut, k as saveJobToDb, l as runPass1Generate, m as runPass2Optimize, p as cleanLatex, q as substituteForbiddenWords, t as deleteJobFromDb, u as injectTokensIntoTemplate, v as subscribeToJobs, w as getCustomerConfig, x as client, R as React } from "./style-BB2EFjjH.js";
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Chrome = createLucideIcon("Chrome", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["line", { x1: "21.17", x2: "12", y1: "8", y2: "8", key: "a0cw5f" }],
  ["line", { x1: "3.95", x2: "8.54", y1: "6.06", y2: "14", key: "1kftof" }],
  ["line", { x1: "10.88", x2: "15.46", y1: "21.94", y2: "14", key: "1ymyh8" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const FileText = createLucideIcon("FileText", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Folder = createLucideIcon("Folder", [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Key = createLucideIcon("Key", [
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }],
  ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }],
  ["path", { d: "m15.5 7.5 3 3L22 7l-3-3", key: "1rn1fs" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mail = createLucideIcon("Mail", [
  ["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Phone = createLucideIcon("Phone", [
  [
    "path",
    {
      d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
      key: "foiqr5"
    }
  ]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Upload = createLucideIcon("Upload", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
  ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }]
]);
function MicroOnboarding({ userId, onComplete, initialProfile }) {
  const [firstName, setFirstName] = reactExports.useState("");
  const [lastName, setLastName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [geminiApiKey, setGeminiApiKey] = reactExports.useState("");
  const [outputDir, setOutputDir] = reactExports.useState("/Users/bstar/Downloads/resume_backup/");
  const [resumeFile, setResumeFile] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (initialProfile) {
      if (initialProfile.firstName) setFirstName(initialProfile.firstName);
      if (initialProfile.lastName) setLastName(initialProfile.lastName);
      if (initialProfile.email) setEmail(initialProfile.email);
    }
  }, [initialProfile]);
  reactExports.useEffect(() => {
    const loadExisting = async () => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(["customer_config", "basic_user_config"], (res) => {
          if (res.customer_config) {
            try {
              const config = res.customer_config;
              if (config && config.candidateProfile) {
                setFirstName(config.candidateProfile.firstName || "");
                setLastName(config.candidateProfile.lastName || "");
                setEmail(config.candidateProfile.email || "");
                setPhone(config.candidateProfile.phone || "");
                setGeminiApiKey(config.geminiApiKey || "");
                setOutputDir(config.outputDir || "");
                setResumeFile(config.candidateProfile.resume || "");
              }
            } catch (err) {
              console.error("Failed to parse chrome storage customer_config:", err);
            }
          } else if (res.basic_user_config && res.basic_user_config.profile) {
            const profile = res.basic_user_config.profile;
            setFirstName((prev) => prev || profile.firstName || "");
            setLastName((prev) => prev || profile.lastName || "");
            setEmail((prev) => prev || profile.email || "");
          }
        });
      } else {
        const localData = localStorage.getItem("customer_config");
        if (localData) {
          try {
            const config = JSON.parse(localData);
            if (config && config.candidateProfile) {
              setFirstName(config.candidateProfile.firstName || "");
              setLastName(config.candidateProfile.lastName || "");
              setEmail(config.candidateProfile.email || "");
              setPhone(config.candidateProfile.phone || "");
              setGeminiApiKey(config.geminiApiKey || "");
              setOutputDir(config.outputDir || "");
              setResumeFile(config.candidateProfile.resume || "");
            }
          } catch (e) {
            console.error("Failed to parse local customer_config:", e);
          }
        }
      }
    };
    loadExisting();
  }, []);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        alert("Please select a valid PDF file.");
        return;
      }
      setResumeFile(file.name);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !geminiApiKey.trim() || !outputDir.trim() || !resumeFile) {
      alert("All fields, including selecting a PDF resume, are mandatory.");
      return;
    }
    setLoading(true);
    const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const customerId = `customer_${cleanFirst}_${cleanLast}`;
    const customerConfig = {
      customerId,
      geminiApiKey: geminiApiKey.trim(),
      outputDir: outputDir.trim(),
      candidateProfile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resume: resumeFile
      }
    };
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        await new Promise((resolve) => {
          chrome.storage.local.set({
            customer_config: customerConfig,
            geminiApiKey: geminiApiKey.trim()
            // Keep in sync for tailoring worker
          }, () => resolve());
        });
      } else {
        localStorage.setItem("customer_config", JSON.stringify(customerConfig));
        localStorage.setItem("geminiApiKey", geminiApiKey.trim());
      }
      if (userId) {
        await saveCustomerConfig(userId, customerConfig);
      }
      onComplete(customerConfig);
    } catch (err) {
      console.error("Failed to save onboarding configuration:", err);
      alert("Failed to save onboarding data. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    padding: "32px 24px",
    height: "100%",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    background: "var(--bg-color)",
    color: "var(--text-primary)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: 14,
        background: "var(--card-bg, rgba(255, 255, 255, 0.03))",
        border: "1px solid var(--border-color, rgba(255, 255, 255, 0.08))",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        marginBottom: 16,
        position: "relative"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "AutoApplyAI Logo", style: { width: 36, height: 36, objectFit: "contain" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          position: "absolute",
          bottom: -6,
          right: -6,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "var(--brand-color)",
          border: "2px solid var(--bg-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(255, 128, 0, 0.4)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 12, className: "animate-spin", style: { animationDuration: "4s" } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { style: {
        fontFamily: "var(--font-title)",
        fontSize: "1.5rem",
        fontWeight: 800,
        background: "linear-gradient(to right, var(--text-primary), var(--brand-color))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        margin: "0 0 8px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 20, style: { color: "var(--brand-color)" } }),
        " Micro Onboarding"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0, lineHeight: 1.4 }, children: "Please complete configuration details to launch AutoApplyAI. All fields are mandatory." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 500, margin: "0 auto", width: "100%" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 12, style: { color: "var(--brand-color)" } }),
            " First Name *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              className: "form-control",
              value: firstName,
              onChange: (e) => setFirstName(e.target.value),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 12, style: { color: "var(--brand-color)" } }),
            " Last Name *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              className: "form-control",
              value: lastName,
              onChange: (e) => setLastName(e.target.value),
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 12, style: { color: "var(--brand-color)" } }),
          " Email Address *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            className: "form-control",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 12, style: { color: "var(--brand-color)" } }),
          " Phone Number *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            className: "form-control",
            placeholder: "e.g. 555-555-5555",
            value: phone,
            onChange: (e) => setPhone(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { size: 12, style: { color: "var(--brand-color)" } }),
          " Gemini API Key *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            className: "form-control",
            placeholder: "Enter Gemini API key...",
            value: geminiApiKey,
            onChange: (e) => setGeminiApiKey(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { size: 12, style: { color: "var(--brand-color)" } }),
          " Output Directory *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            className: "form-control",
            value: outputDir,
            onChange: (e) => setOutputDir(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 12, style: { color: "var(--brand-color)" } }),
          " Resume PDF Document *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed var(--panel-border)",
          borderRadius: "8px",
          padding: "16px",
          background: "var(--panel-bg)",
          cursor: "pointer",
          transition: "border-color 0.2s"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: ".pdf",
              onChange: handleFileChange,
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }, children: resumeFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 24, style: { color: "var(--brand-color)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }, children: resumeFile }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "var(--text-muted)" }, children: "Click or drag to replace PDF" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 24, style: { color: "var(--text-secondary)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }, children: "Upload PDF Resume" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "var(--text-muted)" }, children: "Only PDF documents accepted" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "btn btn-primary",
          style: {
            width: "100%",
            padding: "14px",
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontWeight: 600,
            fontSize: "0.9rem"
          },
          children: loading ? "Saving configs..." : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
            " Complete Onboarding"
          ] })
        }
      )
    ] })
  ] });
}
const DEFAULT_RULES = {
  profile: {
    candidate_name: "Bhagath Siddi",
    output_naming_convention: "bhagath_resume_{company}_{title}"
  },
  syntax_constraints: {
    latex_compatibility: "Overleaf and Tectonic strict validation",
    forbidden_characters: {
      "&": "Always substitute with the literal word 'and' everywhere",
      "%": "Always explicitly escape as '\\%' to prevent background compilation loops"
    },
    bullet_styling: "Standard itemize environments only. Omit non-standard decorative or special characters."
  },
  tone_and_voice: {
    style: "Warm, authentic, deeply human, grounded in engineering logic",
    forbidden_words: {
      "trajectory": "Replace entirely with the word 'journey' when discussing career progression"
    },
    buzzword_policy: "Avoid robotic corporate jargon; prefer concise, metric-backed impact statements."
  },
  page_defense_layout: {
    absolute_page_limit: 1,
    geometry_margins: "margin=0.35in, top=0.3in, bottom=0.3in",
    section_spacing: "\\titlespacing{\\section}{0pt}{5pt}{3pt}",
    list_spacing: "noitemsep, topsep=0pt, parsep=0pt, partopsep=0pt, leftmargin=11pt",
    forbidden_environments: ["quote"],
    macro_content_limits: {
      summary_sentences_max: 5,
      core_competencies_count: 8
    }
  },
  ats_target_block: {
    required: false,
    format_string: "\\footnotesize \\textbf{ATS STRATEGY MATCH TARGET:} 95\\%+ Optimization (Keywords: {keywords})"
  },
  file_naming: {
    output_dir: "output"
  }
};
const DEFAULT_PROFILE = {
  firstName: "Bhagath",
  lastName: "Siddi",
  email: "bhagathsiddi@gmail.com",
  phone: "555-555-5555",
  location: "Prosper, TX 75078",
  linkedin: "linkedin.com/in/bhagathsiddi",
  role: "DIRECTOR OF AI ENGINEERING | STRATEGY & ENTERPRISE ML LIFE-CYCLE",
  summary: "Visionary, truth-driven Engineering Leader with 20 plus years of software experience, specializing in building and scaling high-performing AI/ML teams from the ground up. Proven track record of executing strategic technical roadmaps, driving rapid proof-of-concept development, and deploying production-grade agentic workflows and LLM applications at scale. Grounded in logic and a collaborative culture of inclusion, balancing aggressive execution timelines with a customer-centric focus on humanity and clinical operational excellence.",
  competencies: [
    "AI Strategy & Vision Execution: Expert at translating complex executive business objectives into executable engineering roadmaps, setting the technical vision for ML/LLM systems, and maintaining architectural governance.",
    "Advanced AI & Agentic Workflows: Deep technical expertise across LLM technologies including prompt engineering, Retrieval-Augmented Generation (RAG), vector embeddings, fine-tuning, multi-step reasoning, and tool-use orchestration agents.",
    "Lifecycle & Enterprise MLOps: End-to-end ownership from research and rapid prototyping through production deployment, experiment tracking, reproducibility, automated testing, drift detection, and cloud-native observability.",
    "Cloud Infrastructure & Big Data: Advanced proficiency with cloud-native ML ecosystems across Azure (Azure ML, Azure DevOps pipelines, Databricks) and AWS serverless computing alongside Python, Spark, Delta Lake, and SQL data architectures.",
    "Team Scaling, Culture & Ethics: Dedicated to cultivating a healthy, generative, and inclusive team culture focused on technical excellence, talent mentorship, diversity, and responsible AI principles covering fairness, transparency, and clinical data governance."
  ]
};
const BASE_LATEX_TEMPLATE = `% --- PACKAGED BASE RESUME TEMPLATE ---
\\documentclass[9pt, letterpaper]{extarticle}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.3in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\definecolor{trorange}{RGB}{255, 128, 0}
\\urlstyle{same}

\\titleformat{\\section}{\\large\\bfseries\\color{trorange}\\uppercase}{}{0em}{}[\\titrule]
\\titlespacing{\\section}{0pt}{12pt}{4pt}
\\setlist[itemize]{noitemsep, topsep=1pt, parsep=1pt, partopsep=0pt, leftmargin=12pt}

\\begin{document}

\\begin{center}
    {\\huge \\textbf{%TOKEN_FIRST_NAME% %TOKEN_LAST_NAME%}} \\\\
    \\vspace{2pt}
    \\small %TOKEN_LOCATION% \\ | \\ %TOKEN_PHONE% \\ | \\ \\href{mailto:%TOKEN_EMAIL%}{%TOKEN_EMAIL%} \\ | \\ \\href{https://%TOKEN_LINKEDIN%}{%TOKEN_LINKEDIN%} \\\\
    \\vspace{4pt} 
    \\textbf{\\large %TOKEN_ROLE_ZONE%}
\\end{center}

\\vspace{-4pt}
\\begin{quote}
\\small \\centering
%TOKEN_SUMMARY_ZONE%
\\end{quote}

\\vspace{-4pt}

\\section{Core AI Competencies \\& Technical Leadership}
\\begin{itemize}
%TOKEN_COMPETENCIES_ZONE%
\\end{itemize}

\\section{Professional Experience}

\\textbf{7-Eleven} \\hfill \\textbf{Frisco/Dallas, TX} \\\\
\\textit{%TOKEN_7ELEVEN_TITLE_ZONE%} \\hfill \\textbf{2024 -- 2026}
\\begin{itemize}
    \\item \\textbf{AI Strategy \\& Product Development:} Spearheaded the adoption of advanced engineering practices and AI-native system designs, scaling the platform to support high-volume distributed applications serving over 250 million users.
    \\item \\textbf{Rapid Prototyping \\& Execution:} Led multi-scrum engineering teams to move fast from proof-of-concept to production-grade deployment on aggressive timelines, achieving a measurable 25\\% reduction in overall time-to-market.
    \\item \\textbf{Data-Driven Leadership:} Exercised sound judgment and swift decision-making to optimize core product roadmaps and timeline estimations, building cross-functional consensus with stakeholders to reduce post-launch system anomalies by 30\\%.
    \\item \\textbf{Technical Excellence \\& Mentorship:} Recruited, structured, and scaled a premier engineering branch, mentoring senior and staff engineers while establishing robust CI/CD deployment pipelines and high-velocity development lifecycles.
\\end{itemize}

\\vspace{6pt}

\\textbf{CVS Health} \\hfill \\textbf{Remote} \\\\
\\textit{%TOKEN_CVS_TITLE_ZONE%} \\hfill \\textbf{2014 -- 2023}
\\begin{itemize}
    \\item \\textbf{Healthcare ML \\& Core Architecture:} Owned the architecture, design, and deployment of secure applications operating in highly regulated environments, managing clinical, transactional, and claims data frameworks handling millions of secure daily operations.
    \\item \\textbf{Team Building \\& Scale:} Built, led, and scaled distributed agile squads of 12--18 engineers across 4 cross-functional divisions, prioritizing career development plans that improved sprint velocity by 20\\% and decreased team onboarding loops by 40\\%.
    \\item \\textbf{Cross-Functional \\& Executive Alignment:} Collaborated closely with Product, Product Design, Clinical Operations, and Delivery partners to scope high-impact initiatives, utilizing strong interpersonal and presentation skills to influence technical strategy at the level of executive leadership.
    \\item \\textbf{Compliance \\& Distributed Systems:} Managed the end-to-end lifecycle of distributed architectures utilizing relational and NoSQL engines (MSSQL, Postgres), ensuring complete data governance, payment gateway security, and strict healthcare compliance.
\\end{itemize}

\\vspace{6pt}

\\textbf{Enterprise Consultant} \\hfill \\textbf{Various} \\\\
\\textit{Technical Lead | Senior Software Engineer} \\hfill \\textbf{2005 -- 2014} \\\\
\\small\\textit{Client Portfolio: American Express, AT\\&T, Verizon, JPMC, Universal American, Alindus}
\\begin{itemize}
    \\item \\textbf{System Architecture \\& Algorithms:} Directed deep exploration into complex data structures, algorithms, and secure software engineering methodologies, constructing high-throughput distributed transaction systems that drove a 15\\% optimization in query performance.
    \\item \\textbf{Agile Delivery \\& Integrity:} Managed task delegation and sprint velocity metrics for engineering pipelines, maintaining rigorous attention to detail and delivering production targets within fast-paced financial and telecom operational settings.
\\end{itemize}

\\section{Education, Certifications \\& Qualifications}
\\begin{itemize}
    \\item \\textbf{Applied Agentic AI for Organizational Transformation} | MIT Professional Education (2026)
    \\item \\textbf{AWS Certified Solutions Architect -- Professional} | \\href{https://www.credly.com/badges/7ef67d8d-67f2-4036-a8bf-8bbe73098a1f/linked_in?t=teze8g}{Credential Verification Link}
    \\item \\textbf{Bachelor of Technology (B.Tech) in Computer Science \\& Engineering} | Kakatiya University, India
    \\item \\textbf{Technical Stack Summary:} Python, PyTorch, TensorFlow, Azure ML, Databricks, Spark, Delta Lake, Azure DevOps, AWS Serverless, Lambda, JavaScript, MSSQL, Postgres, DynamoDB, Salesforce, React, TypeScript, SQL, GitHub, Jira Cloud.
\\end{itemize}

\\end{document}`;
function App() {
  var _a;
  const [currentUser, setCurrentUser] = reactExports.useState(null);
  const [jobs, setJobs] = reactExports.useState([]);
  const [selectedJob, setSelectedJob] = reactExports.useState(null);
  const [customerConfig, setCustomerConfig] = reactExports.useState(null);
  const [candidateProfile, setCandidateProfile] = reactExports.useState(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] = reactExports.useState(DEFAULT_PROFILE);
  const [settingsTab, setSettingsTab] = reactExports.useState("api");
  const [jobUrl, setJobUrl] = reactExports.useState("");
  const [jobDescription, setJobDescription] = reactExports.useState("");
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("analysis");
  const [authLoading, setAuthLoading] = reactExports.useState(true);
  const [configLoading, setConfigLoading] = reactExports.useState(true);
  const [authLinkedStatus, setAuthLinkedStatus] = reactExports.useState(null);
  const [showSettings, setShowSettings] = reactExports.useState(false);
  const [apiKey, setApiKey] = reactExports.useState("");
  const [showApiKey, setShowApiKey] = reactExports.useState(false);
  const [customRules, setCustomRules] = reactExports.useState(JSON.stringify(DEFAULT_RULES, null, 2));
  const openSettings = () => {
    setDraftProfile({ ...candidateProfile });
    setSettingsTab("api");
    setShowSettings(true);
  };
  reactExports.useEffect(() => {
    const savedApiKey = localStorage.getItem("geminiApiKey");
    const savedRules = localStorage.getItem("resumeRules");
    const savedHistory = localStorage.getItem("localHistory");
    const savedProfile = localStorage.getItem("candidateProfile");
    const localConfigStr = localStorage.getItem("customer_config");
    if (localConfigStr) {
      try {
        const config = JSON.parse(localConfigStr);
        if (config && typeof config === "object") {
          const isComplete = !!(config.customerId && config.geminiApiKey && config.outputDir && config.candidateProfile && config.candidateProfile.firstName && config.candidateProfile.lastName && config.candidateProfile.email && config.candidateProfile.phone && config.candidateProfile.resume);
          if (isComplete) {
            setConfigLoading(false);
          }
          setCustomerConfig(config);
          if (config.geminiApiKey) setApiKey(config.geminiApiKey);
          if (config.candidateProfile) {
            setCandidateProfile((prev) => ({
              ...prev,
              firstName: config.candidateProfile.firstName,
              lastName: config.candidateProfile.lastName,
              email: config.candidateProfile.email,
              phone: config.candidateProfile.phone
            }));
          }
        }
      } catch (e) {
        console.error("Failed to parse local customer_config:", e);
      }
    }
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedRules) setCustomRules(savedRules);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && typeof parsed === "object") {
          setCandidateProfile(parsed);
        }
      } catch (e) {
      }
    }
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setJobs(parsed);
        }
      } catch (e) {
      }
    }
    let unsubJobs = null;
    if (auth) {
      const unsubAuth = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
        if (unsubJobs) {
          unsubJobs();
          unsubJobs = null;
        }
        if (user) {
          unsubJobs = subscribeToJobs(user.uid, (syncedJobs) => {
            setJobs(syncedJobs);
          });
          getCustomerConfig(user.uid).then((cloudConfig) => {
            if (cloudConfig) {
              setCustomerConfig(cloudConfig);
              setApiKey(cloudConfig.geminiApiKey);
              localStorage.setItem("customer_config", JSON.stringify(cloudConfig));
              localStorage.setItem("geminiApiKey", cloudConfig.geminiApiKey);
              if (cloudConfig.candidateProfile) {
                setCandidateProfile((prev) => ({
                  ...prev,
                  firstName: cloudConfig.candidateProfile.firstName,
                  lastName: cloudConfig.candidateProfile.lastName,
                  email: cloudConfig.candidateProfile.email,
                  phone: cloudConfig.candidateProfile.phone
                }));
              }
            }
          }).catch((err) => {
            console.error("Failed to get customer config from Firestore:", err);
          }).finally(() => {
            setConfigLoading(false);
          });
        } else {
          setConfigLoading(false);
          const savedHist = localStorage.getItem("localHistory");
          if (savedHist) {
            try {
              const parsed = JSON.parse(savedHist);
              if (Array.isArray(parsed)) {
                setJobs(parsed);
              }
            } catch (e) {
            }
          }
          const savedProf = localStorage.getItem("candidateProfile");
          if (savedProf) {
            try {
              const parsed = JSON.parse(savedProf);
              if (parsed && typeof parsed === "object") {
                setCandidateProfile(parsed);
              }
            } catch (e) {
            }
          }
        }
      });
      return () => {
        unsubAuth();
        if (unsubJobs) unsubJobs();
      };
    } else {
      setAuthLoading(false);
      setConfigLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    if (selectedJob) {
      const matchingJob = jobs.find((j) => j.id === selectedJob.id);
      if (matchingJob) {
        setSelectedJob(matchingJob);
      }
    }
  }, [jobs]);
  const handleGoogleSignIn = async () => {
    if (!auth) {
      alert("Firebase Auth is not configured.");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const params2 = new URLSearchParams(window.location.search);
      const isExtensionFlow2 = params2.get("origin") === "extension";
      const extId2 = params2.get("extId");
      if (isExtensionFlow2 && extId2) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          const idToken = credential.idToken;
          const accessToken = credential.accessToken;
          if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
            console.log("[DEBUG LOG] Sending SIGN_IN_CREDENTIALS payload to extension:", {
              extId: extId2,
              idToken: idToken ? idToken.substring(0, 15) + "..." : null,
              accessToken: accessToken ? accessToken.substring(0, 15) + "..." : null
            });
            chrome.runtime.sendMessage(extId2, {
              type: "SIGN_IN_CREDENTIALS",
              idToken,
              accessToken
            }, (response) => {
              console.log("[DEBUG LOG] Received extension SIGN_IN_CREDENTIALS response:", response);
              if (response && response.success) {
                setAuthLinkedStatus("Your credentials have been successfully transferred and linked to the AutoApplyAI Chrome Extension! Inspect this page's developer console to check transmission details.");
              } else {
                console.error("[DEBUG LOG] Extension authentication failed:", response);
                alert("Authentication failed in the extension: " + ((response == null ? void 0 : response.error) || "Unknown error"));
              }
            });
          } else {
            alert("Extension communication channel not found. Make sure the extension is installed and enabled.");
          }
        } else {
          alert("Could not retrieve credentials from Google Sign-In.");
        }
      }
    } catch (e) {
      console.error("Firebase Auth popup signin failed:", e);
      alert("Google Sign-In failed.");
    }
  };
  const handleSignOut = () => {
    if (auth) {
      signOut(auth).then(() => {
        setCurrentUser(null);
      });
    }
  };
  const handleSaveSettings = async () => {
    try {
      JSON.parse(customRules);
      localStorage.setItem("geminiApiKey", apiKey);
      localStorage.setItem("resumeRules", customRules);
      setCandidateProfile(draftProfile);
      localStorage.setItem("candidateProfile", JSON.stringify(draftProfile));
      if (customerConfig) {
        const updatedConfig = {
          ...customerConfig,
          geminiApiKey: apiKey,
          candidateProfile: {
            ...customerConfig.candidateProfile,
            firstName: draftProfile.firstName,
            lastName: draftProfile.lastName,
            email: draftProfile.email,
            phone: draftProfile.phone
          }
        };
        setCustomerConfig(updatedConfig);
        localStorage.setItem("customer_config", JSON.stringify(updatedConfig));
        if (currentUser) {
          await saveCustomerConfig(currentUser.uid, updatedConfig);
        }
      }
      setShowSettings(false);
      alert("Settings saved successfully!");
    } catch (e) {
      alert("Invalid JSON format in Resume Rules config.");
    }
  };
  const handleTailorJob = async () => {
    if (!jobDescription || jobDescription.trim().length < 50) {
      alert("Please enter a valid job description (minimum 50 chars).");
      return;
    }
    if (!apiKey) {
      alert("Gemini API Key is missing. Please configure it in settings.");
      openSettings();
      return;
    }
    let rules;
    try {
      rules = JSON.parse(customRules);
    } catch (e) {
      alert("Invalid JSON format in Resume Rules config. Please check settings.");
      openSettings();
      return;
    }
    setIsProcessing(true);
    const jobId = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const initialJob = {
      id: jobId,
      jobTitle: "Manual Job...",
      companyName: "Analyzing...",
      jobUrl: jobUrl || "Manual Input",
      jobDescription,
      atsScore: 0,
      analysis: "Tailoring in progress...",
      summary: "",
      competencies: "",
      coverLetter: "",
      keywords: [],
      date: (/* @__PURE__ */ new Date()).toISOString(),
      status: "processing"
    };
    setSelectedJob(initialJob);
    try {
      if (currentUser) {
        await saveJobToDb(currentUser.uid, initialJob);
      } else {
        const updated = [initialJob, ...jobs];
        setJobs(updated);
        localStorage.setItem("localHistory", JSON.stringify(updated));
      }
      const pass1Result = await runPass1Generate(apiKey, jobDescription, rules, candidateProfile);
      const tempJob = {
        ...initialJob,
        jobTitle: pass1Result.jobTitle || "Role Title",
        companyName: pass1Result.companyName || "Company"
      };
      setSelectedJob(tempJob);
      const pass2Result = await runPass2Optimize(apiKey, jobDescription, rules, candidateProfile, {
        jobTitle: tempJob.jobTitle,
        companyName: tempJob.companyName,
        summary: pass1Result.summary,
        competencies: pass1Result.competencies,
        cover_letter: pass1Result.cover_letter
      });
      const cleanSummary = cleanLatex(pass2Result.summary, rules, { isCompetencies: false });
      const finalSummary = substituteForbiddenWords(cleanSummary, rules);
      const cleanComp = cleanLatex(pass2Result.competencies, rules, { isCompetencies: true });
      const finalComp = substituteForbiddenWords(cleanComp, rules);
      const cleanCL = cleanLatex(pass2Result.cover_letter, rules, { isCoverLetter: true });
      const finalCL = substituteForbiddenWords(cleanCL, rules);
      const finalJob = {
        ...tempJob,
        atsScore: pass2Result.atsScore || 92,
        analysis: pass2Result.analysis || "",
        summary: finalSummary,
        competencies: finalComp,
        coverLetter: finalCL,
        keywords: pass2Result.keywords || [],
        status: "completed"
      };
      setSelectedJob(finalJob);
      if (currentUser) {
        await saveJobToDb(currentUser.uid, finalJob);
      } else {
        const savedHistory = localStorage.getItem("localHistory");
        const localHistory = savedHistory ? JSON.parse(savedHistory) : [];
        const updatedHistory = localHistory.map((j) => j.id === jobId ? finalJob : j);
        setJobs(updatedHistory);
        localStorage.setItem("localHistory", JSON.stringify(updatedHistory));
      }
    } catch (err) {
      console.error(err);
      const failedJob = {
        ...initialJob,
        status: "failed",
        error: err.message || "AI processing aborted"
      };
      setSelectedJob(failedJob);
      if (currentUser) {
        await saveJobToDb(currentUser.uid, failedJob);
      } else {
        const savedHistory = localStorage.getItem("localHistory");
        const localHistory = savedHistory ? JSON.parse(savedHistory) : [];
        const updatedHistory = localHistory.map((j) => j.id === jobId ? failedJob : j);
        setJobs(updatedHistory);
        localStorage.setItem("localHistory", JSON.stringify(updatedHistory));
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDeleteJob = async (e, jobId) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this job record?")) return;
    if (currentUser) {
      await deleteJobFromDb(currentUser.uid, jobId);
    } else {
      const updated = jobs.filter((j) => j.id !== jobId);
      setJobs(updated);
      localStorage.setItem("localHistory", JSON.stringify(updated));
    }
    if ((selectedJob == null ? void 0 : selectedJob.id) === jobId) {
      setSelectedJob(null);
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard successfully!");
  };
  const triggerDownload = (fileName, content) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const getFullResumeLatex = (job) => {
    const rules = JSON.parse(customRules);
    return injectTokensIntoTemplate(BASE_LATEX_TEMPLATE, {
      jobTitle: job.jobTitle,
      summary: job.summary,
      competencies: job.competencies,
      rules,
      profile: candidateProfile,
      keywords: job.keywords
    });
  };
  const getCoverLetterLatex = (job) => {
    const rules = JSON.parse(customRules);
    const cleanFirstName = cleanLatex(candidateProfile.firstName || "Bhagath", rules);
    const cleanLastName = cleanLatex(candidateProfile.lastName || "Siddi", rules);
    const cleanEmail = cleanLatex(candidateProfile.email || "bhagathsiddi@gmail.com", rules);
    const cleanPhone = cleanLatex(candidateProfile.phone || "555-555-5555", rules);
    const cleanLocation = cleanLatex(candidateProfile.location || "Prosper, TX 75078", rules);
    const cleanLinkedin = cleanLatex(candidateProfile.linkedin || "linkedin.com/in/bhagathsiddi", rules);
    const clTemplate = `\\documentclass[10pt, letterpaper]{extarticle}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{parskip}

\\definecolor{trorange}{RGB}{255, 128, 0}
\\urlstyle{same}

\\begin{document}

\\begin{center}
    {\\huge \\textbf{${cleanFirstName.toUpperCase()} ${cleanLastName.toUpperCase()}}} \\\\
    \\vspace{4pt}
    \\small ${cleanLocation} \\ | \\ ${cleanPhone} \\ | \\ \\href{mailto:${cleanEmail}}{${cleanEmail}} \\ | \\ \\href{https://${cleanLinkedin}}{${cleanLinkedin}}
\\end{center}

\\vspace{5pt}
\\hrule
\\vspace{25pt}

\\noindent
${job.coverLetter}

\\end{document}`;
    return clTemplate;
  };
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const printStyles = `
      body {
        font-family: 'Times New Roman', Times, serif;
        color: #333;
        padding: 0.5in;
        line-height: 1.4;
      }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .orange { color: #ff8000; }
      h2 { font-size: 16pt; margin-bottom: 2pt; margin-top: 0; }
      .contact { font-size: 9.5pt; margin-bottom: 8pt; }
      .role { font-size: 11pt; margin-bottom: 12pt; }
      .section-header {
        border-bottom: 1px solid #ff8000;
        font-size: 10.5pt;
        font-weight: bold;
        color: #ff8000;
        text-transform: uppercase;
        margin-top: 14pt;
        margin-bottom: 6pt;
        padding-bottom: 1pt;
      }
      .summary { font-size: 9pt; text-align: justify; margin-bottom: 10pt; }
      .line { display: flex; justify-content: space-between; font-size: 9pt; font-weight: bold; margin-top: 6pt; }
      .subline { display: flex; justify-content: space-between; font-size: 8.5pt; font-style: italic; margin-bottom: 4pt; }
      ul { list-style-type: disc; padding-left: 15pt; margin-bottom: 6pt; margin-top: 2pt; }
      li { font-size: 9pt; text-align: justify; margin-bottom: 3pt; }
      @media print {
        body { padding: 0; }
      }
    `;
    const { title711, titleCVS } = getHistoricalTitles((selectedJob == null ? void 0 : selectedJob.jobTitle) || "");
    const compBullets = (selectedJob == null ? void 0 : selectedJob.competencies.split("\n").map((line) => {
      const itemText = line.replace(/\\item\s*/, "").trim();
      const boldText = itemText.replace(/\\textbf\{(.*?)\}/g, "<strong>$1</strong>");
      return `<li>${boldText}</li>`;
    }).join("")) || "";
    const summaryText = (selectedJob == null ? void 0 : selectedJob.summary) || "";
    printWindow.document.write(`
      <html>
        <head>
          <title>${(selectedJob == null ? void 0 : selectedJob.companyName) || "Resume"}_Tailored_Resume</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="center">
            <h2 class="bold">${(candidateProfile.firstName || "Bhagath").toUpperCase()} ${(candidateProfile.lastName || "Siddi").toUpperCase()}</h2>
            <div class="contact">${candidateProfile.location || ""}  |  ${candidateProfile.phone || ""}  |  ${candidateProfile.email || ""}  |  ${candidateProfile.linkedin || ""}</div>
            <div class="role bold">${((selectedJob == null ? void 0 : selectedJob.jobTitle) || "").toUpperCase()}</div>
          </div>

          <div class="summary">${summaryText}</div>

          <div class="section-header">Core AI Competencies & Technical Leadership</div>
          <ul>${compBullets}</ul>

          <div class="section-header">Professional Experience</div>
          
          <div class="line">
            <span>7-Eleven</span>
            <span>Frisco/Dallas, TX</span>
          </div>
          <div class="subline">
            <span>${title711}</span>
            <span>2024 -- 2026</span>
          </div>
          <ul>
            <li><strong>AI Strategy & Product Development:</strong> Spearheaded the adoption of advanced engineering practices and AI-native system designs, scaling the platform to support high-volume distributed applications serving over 250 million users.</li>
            <li><strong>Rapid Prototyping & Execution:</strong> Led multi-scrum engineering teams to move fast from proof-of-concept to production-grade deployment on aggressive timelines, achieving a measurable 25% reduction in overall time-to-market.</li>
            <li><strong>Data-Driven Leadership:</strong> Exercised sound judgment and swift decision-making to optimize core product roadmaps and timeline estimations, building cross-functional consensus with stakeholders to reduce post-launch system anomalies by 30%.</li>
            <li><strong>Technical Excellence & Mentorship:</strong> Recruited, structured, and scaled a premier engineering branch, mentoring senior and staff engineers while establishing robust CI/CD deployment pipelines and high-velocity development lifecycles.</li>
          </ul>

          <div class="line">
            <span>CVS Health</span>
            <span>Remote</span>
          </div>
          <div class="subline">
            <span>${titleCVS}</span>
            <span>2014 -- 2023</span>
          </div>
          <ul>
            <li><strong>Healthcare ML & Core Architecture:</strong> Owned the architecture, design, and deployment of secure applications operating in highly regulated environments, managing clinical, transactional, and claims data frameworks handling millions of secure daily operations.</li>
            <li><strong>Team Building & Scale:</strong> Built, led, and scaled distributed agile squads of 12--18 engineers across 4 cross-functional divisions, prioritizing career development plans that improved sprint velocity by 20% and decreased team onboarding loops by 40%.</li>
            <li><strong>Cross-Functional & Executive Alignment:</strong> Collaborated closely with Product, Product Design, Clinical Operations, and Delivery partners to scope high-impact initiatives, utilizing strong interpersonal and presentation skills to influence technical strategy at the level of executive leadership.</li>
            <li><strong>Compliance & Distributed Systems:</strong> Managed the end-to-end lifecycle of distributed architectures utilizing relational and NoSQL engines (MSSQL, Postgres), ensuring complete data governance, payment gateway security, and strict healthcare compliance.</li>
          </ul>

          <div class="line">
            <span>Enterprise Consultant</span>
            <span>Various</span>
          </div>
          <div class="subline">
            <span>Technical Lead | Senior Software Engineer</span>
            <span>2005 -- 2014</span>
          </div>
          <ul>
            <li><strong>System Architecture & Algorithms:</strong> Directed deep exploration into complex data structures, algorithms, and secure software engineering methodologies, constructing high-throughput distributed transaction systems that drove a 15% optimization in query performance.</li>
            <li><strong>Agile Delivery & Integrity:</strong> Managed task delegation and sprint velocity metrics for engineering pipelines, maintaining rigorous attention to detail and delivering production targets within fast-paced financial and telecom operational settings.</li>
          </ul>

          <div class="section-header">Education, Certifications & Qualifications</div>
          <ul>
            <li><strong>Applied Agentic AI for Organizational Transformation</strong> | MIT Professional Education (2026)</li>
            <li><strong>AWS Certified Solutions Architect -- Professional</strong> | Credential Verification Link</li>
            <li><strong>Bachelor of Technology (B.Tech) in Computer Science & Engineering</strong> | Kakatiya University, India</li>
            <li><strong>Technical Stack Summary:</strong> Python, PyTorch, TensorFlow, Azure ML, Databricks, Spark, Delta Lake, Azure DevOps, AWS Serverless, Lambda, JavaScript, MSSQL, Postgres, DynamoDB, Salesforce, React, TypeScript, SQL, GitHub, Jira Cloud.</li>
          </ul>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  const params = new URLSearchParams(window.location.search);
  const isExtensionFlow = params.get("origin") === "extension" || localStorage.getItem("extId") !== null;
  const extId = params.get("extId") || localStorage.getItem("extId");
  const isConfigComplete = (config) => {
    return !!(config && config.customerId && config.geminiApiKey && config.outputDir && config.candidateProfile && config.candidateProfile.firstName && config.candidateProfile.lastName && config.candidateProfile.email && config.candidateProfile.phone && config.candidateProfile.resume);
  };
  reactExports.useEffect(() => {
    if (currentUser && isConfigComplete(customerConfig) && isExtensionFlow && extId) {
      currentUser.getIdToken().then((idToken) => {
        var _a2, _b, _c, _d, _e, _f;
        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
          console.log("[DEBUG LOG] Syncing GOOGLE_AUTH_SUCCESS payload to extension:", {
            extId,
            uid: currentUser.uid,
            token: idToken ? idToken.substring(0, 15) + "..." : null,
            profile: {
              firstName: ((_a2 = customerConfig == null ? void 0 : customerConfig.candidateProfile) == null ? void 0 : _a2.firstName) || "",
              lastName: ((_b = customerConfig == null ? void 0 : customerConfig.candidateProfile) == null ? void 0 : _b.lastName) || "",
              email: ((_c = customerConfig == null ? void 0 : customerConfig.candidateProfile) == null ? void 0 : _c.email) || ""
            }
          });
          chrome.runtime.sendMessage(extId, {
            action: "GOOGLE_AUTH_SUCCESS",
            uid: currentUser.uid,
            token: idToken,
            profile: {
              firstName: ((_d = customerConfig == null ? void 0 : customerConfig.candidateProfile) == null ? void 0 : _d.firstName) || "",
              lastName: ((_e = customerConfig == null ? void 0 : customerConfig.candidateProfile) == null ? void 0 : _e.lastName) || "",
              email: ((_f = customerConfig == null ? void 0 : customerConfig.candidateProfile) == null ? void 0 : _f.email) || ""
            }
          }, (response) => {
            console.log("[DEBUG LOG] Received extension GOOGLE_AUTH_SUCCESS response:", response);
            localStorage.removeItem("isExtensionFlow");
            setAuthLinkedStatus("Your configuration settings have been successfully synced and linked to the AutoApplyAI Chrome Extension! Inspect this page's developer console to check sync details.");
          });
        }
      });
    }
  }, [currentUser, customerConfig]);
  if (authLinkedStatus) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", height: "100vh", width: "100vw", justifyContent: "center", alignItems: "center", background: "var(--bg-color)", padding: 24, boxSizing: "border-box" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-card", style: { maxWidth: 450, width: "100%", padding: "40px 32px", textAlign: "center", display: "flex", flexDirection: "column", gap: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "rgba(52, 168, 83, 0.1)",
        border: "1px solid rgba(52, 168, 83, 0.2)",
        color: "var(--brand-color)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "20 6 9 17 4 12" }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontFamily: "var(--font-title)", fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px 0" }, children: "Linked Successfully!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0, lineHeight: 1.4 }, children: authLinkedStatus }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--brand-color)", fontSize: "0.78rem", fontWeight: 600, marginTop: 12 }, children: "Open DevTools Console (Right-click → Inspect → Console) to view debugging logs." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "btn btn-primary",
          onClick: () => window.close(),
          style: { width: "100%", padding: "12px", borderRadius: 8, fontSize: "0.9rem" },
          children: "Close Tab"
        }
      )
    ] }) });
  }
  if (authLoading || configLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", height: "100vh", width: "100vw", justifyContent: "center", alignItems: "center", background: "var(--bg-color)", color: "var(--text-primary)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "animate-spin", size: 40, style: { color: "var(--brand-color)", marginBottom: 16 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.9rem", color: "var(--text-secondary)" }, children: "Securing connection..." })
    ] });
  }
  if (!currentUser) {
    if (isExtensionFlow && extId) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", height: "100vh", width: "100vw", justifyContent: "center", alignItems: "center", background: "var(--bg-color)", padding: 24, boxSizing: "border-box" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-card", style: { maxWidth: 450, width: "100%", padding: "40px 32px", textAlign: "center", display: "flex", flexDirection: "column", gap: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "AutoApplyAI Logo", style: { width: 64, height: 64, objectFit: "contain", borderRadius: 12 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontFamily: "var(--font-title)", fontSize: "1.8rem", fontWeight: 800, background: "linear-gradient(to right, var(--text-primary), var(--brand-color))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }, children: "Link Extension" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, marginTop: 4 }, children: "Authenticate with Google to grant secure access and sync job search history to your Chrome Extension." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderTop: "1px solid var(--panel-border)", paddingTop: 20 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleGoogleSignIn,
            className: "btn btn-primary",
            style: { width: "100%", padding: "14px", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: "0.95rem", fontWeight: 600 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z", fill: "#FBBC05" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z", fill: "#EA4335" })
              ] }),
              "Authenticate & Link Extension"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "var(--text-muted)", fontSize: "0.75rem", marginTop: 4 }, children: "This page will automatically close and return you to the extension once linked." })
      ] }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", height: "100vh", width: "100vw", justifyContent: "center", alignItems: "center", background: "var(--bg-color)", padding: 24, boxSizing: "border-box" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-card", style: { maxWidth: 400, width: "100%", padding: "40px 32px", textAlign: "center", display: "flex", flexDirection: "column", gap: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "AutoApplyAI Logo", style: { width: 48, height: 48, objectFit: "contain", borderRadius: 8 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontFamily: "var(--font-title)", fontSize: "1.6rem", fontWeight: 800, background: "linear-gradient(to right, var(--text-primary), var(--brand-color))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }, children: "AutoApplyAI" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5, marginTop: 4 }, children: "Accelerate your job application journey. Tailor resumes and auto-sync to Cloud Firestore." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderTop: "1px solid var(--panel-border)", paddingTop: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleGoogleSignIn,
          className: "btn btn-primary",
          style: { width: "100%", padding: "12px", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: "0.9rem" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z", fill: "#FBBC05" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z", fill: "#EA4335" })
            ] }),
            "Sign in with Google"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "var(--text-muted)", fontSize: "0.72rem", marginTop: 8 }, children: "By signing in, you agree to secure data backup under your Google Account on Cloud Firestore." })
    ] }) });
  }
  if (!isConfigComplete(customerConfig)) {
    const parts = (currentUser.displayName || "").trim().split(/\s+/);
    const initialProfile = {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      email: currentUser.email || ""
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100vh", width: "100vw", background: "var(--bg-color)", overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MicroOnboarding,
      {
        userId: currentUser.uid,
        initialProfile,
        onComplete: (config) => {
          setCustomerConfig(config);
          setApiKey(config.geminiApiKey);
          if (config.candidateProfile) {
            setCandidateProfile((prev) => ({
              ...prev,
              firstName: config.candidateProfile.firstName,
              lastName: config.candidateProfile.lastName,
              email: config.candidateProfile.email,
              phone: config.candidateProfile.phone
            }));
          }
        }
      }
    ) });
  }
  if (isExtensionFlow && extId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", height: "100vh", width: "100vw", justifyContent: "center", alignItems: "center", background: "var(--bg-color)", padding: 24, boxSizing: "border-box" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "detail-card", style: { maxWidth: 450, width: "100%", padding: "40px 32px", textAlign: "center", display: "flex", flexDirection: "column", gap: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "AutoApplyAI Logo", style: { width: 64, height: 64, objectFit: "contain", borderRadius: 12 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontFamily: "var(--font-title)", fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-color)" }, children: "Linked Successfully" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, marginTop: 4 }, children: "Your extension has been authenticated and linked. You can close this tab now." })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-app", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "app-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "logo-area", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "AutoApplyAI Logo", className: "logo-icon", style: { objectFit: "contain" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "logo-text", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "AUTOAPPLYAI" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sub-text", children: "Serverless Web Dashboard" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-actions", children: [
        currentUser ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-indicator", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pulse-dot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-label", style: { fontSize: "0.75rem" }, children: currentUser.displayName || currentUser.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSignOut, className: "item-delete-btn", style: { marginLeft: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 14 }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleGoogleSignIn, className: "btn", style: { padding: "6px 12px", fontSize: "0.78rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 14 }),
          " Connect via Google"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: openSettings, className: "btn", style: { padding: "8px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 18 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "app-body", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "history-pane", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pane-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "History Queue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setSelectedJob(null);
                setJobUrl("");
                setJobDescription("");
              },
              className: "btn",
              style: { padding: "6px", borderRadius: "50%" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "history-list", children: jobs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 20 }, children: "No active jobs found. Add a new tailoring job to start." }) : jobs.map((job) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => setSelectedJob(job),
            className: `history-item ${(selectedJob == null ? void 0 : selectedJob.id) === job.id ? "active" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-item-header", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "job-title-text", title: job.jobTitle, children: job.jobTitle }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "score-badge", children: [
                  job.atsScore,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "company-text", children: job.companyName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-badge ${job.status}`, children: job.status }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleDeleteJob(e, job.id), className: "item-delete-btn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
              ] })
            ]
          },
          job.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "input-pane", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pane-header", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Resume Customizer" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pane-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "form-group", style: { background: "rgba(255, 128, 0, 0.05)", padding: 12, borderRadius: 8, border: "1px dashed rgba(255, 128, 0, 0.2)", marginBottom: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, fontSize: "0.78rem", color: "var(--text-secondary)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Chrome, { size: 18, style: { color: "var(--brand-color)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tip:" }),
              " Install the AutoApplyAI Extension to extract and tailor jobs from LinkedIn/Indeed in 1-click!"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Target Page URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "https://linkedin.com/jobs/...",
                value: jobUrl,
                onChange: (e) => setJobUrl(e.target.value),
                className: "form-control"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Job Description Text" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                placeholder: "Paste the target job description requirements here...",
                value: jobDescription,
                onChange: (e) => setJobDescription(e.target.value),
                className: "form-control",
                style: { flex: 1, minHeight: 250 }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleTailorJob,
              disabled: isProcessing,
              className: "btn btn-primary",
              style: { padding: "12px", width: "100%", marginTop: "auto" },
              children: isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "animate-spin", size: 16 }),
                " Tailoring..."
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
                " Tailor & Optimize Resume"
              ] })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "details-pane", children: selectedJob ? selectedJob.status === "processing" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center", padding: 24, textAlign: "center", background: "var(--bg-color)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "animate-spin", size: 36, style: { color: "var(--brand-color)", marginBottom: 16 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }, children: "AI Optimization In Progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: 280, lineHeight: 1.5 }, children: "Analyzing the job description and running multi-pass optimization sweep to tailor your resume..." })
      ] }) : selectedJob.status === "failed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center", padding: 24, textAlign: "center", background: "var(--bg-color)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 48, height: 48, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger-color)", marginBottom: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: 700, color: "var(--danger-color)", marginBottom: 8 }, children: "Optimization Failed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid rgba(239, 68, 68, 0.2)", padding: 12, borderRadius: 8, fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: 280, marginBottom: 16, wordBreak: "break-word", textAlign: "left" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
          " ",
          selectedJob.error || "Unknown AI error"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedJob(null), className: "btn btn-primary", style: { padding: "8px 16px", fontSize: "0.85rem" }, children: "Dismiss" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "details-header-tabs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setActiveTab("analysis"),
              className: `tab-btn ${activeTab === "analysis" ? "active" : ""}`,
              children: "ATS Report"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setActiveTab("resume"),
              className: `tab-btn ${activeTab === "resume" ? "active" : ""}`,
              children: "Resume LaTeX"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setActiveTab("cover"),
              className: `tab-btn ${activeTab === "cover" ? "active" : ""}`,
              children: "Cover Letter"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setActiveTab("preview"),
              className: `tab-btn ${activeTab === "preview" ? "active" : ""}`,
              children: "Print Preview"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "details-content", children: [
          activeTab === "analysis" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-card", style: { display: "flex", gap: 24, alignItems: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  style: {
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: "4px solid var(--brand-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "#ffffff"
                  },
                  children: [
                    selectedJob.atsScore,
                    "%"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { fontSize: "1.1rem", marginBottom: 4 }, children: "ATS Compliance Match Score" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "var(--text-secondary)", fontSize: "0.85rem" }, children: [
                  "Optimized for ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedJob.jobTitle }),
                  " at ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedJob.companyName }),
                  "."
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "detail-card-title", children: "Match Analysis & Insights" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "plain-text", children: selectedJob.analysis })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "detail-card-title", children: "ATS Keywords Injected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "keyword-tags", children: selectedJob.keywords.map((kw, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "keyword-tag", children: kw }, i)) })
            ] })
          ] }),
          activeTab === "resume" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, marginBottom: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => copyToClipboard(getFullResumeLatex(selectedJob)),
                  className: "btn",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }),
                    " Copy Source"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => triggerDownload(
                    `${normalizeName(selectedJob.companyName)}_resume.tex`,
                    getFullResumeLatex(selectedJob)
                  ),
                  className: "btn",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                    " Download .tex"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "latex-code-block", children: getFullResumeLatex(selectedJob) })
          ] }),
          activeTab === "cover" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, marginBottom: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => copyToClipboard(selectedJob.coverLetter),
                  className: "btn",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }),
                    " Copy Letter"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => copyToClipboard(getCoverLetterLatex(selectedJob)),
                  className: "btn",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }),
                    " Copy LaTeX"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => triggerDownload(
                    `${normalizeName(selectedJob.companyName)}_coverletter.tex`,
                    getCoverLetterLatex(selectedJob)
                  ),
                  className: "btn",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                    " Download .tex"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "detail-card", style: { background: "#13151c", border: "1px solid rgba(255,255,255,0.04)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "plain-text", style: { fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "#e2e8f0" }, children: selectedJob.coverLetter }) })
          ] }),
          activeTab === "preview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 12, marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handlePrint, className: "btn btn-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
              " Print to PDF"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-container", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-title", children: [
                (candidateProfile.firstName || "Bhagath").toUpperCase(),
                " ",
                (candidateProfile.lastName || "Siddi").toUpperCase()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-contact", children: [
                candidateProfile.location || "",
                "  |  ",
                candidateProfile.phone || "",
                "  |  ",
                candidateProfile.email || "",
                "  |  ",
                candidateProfile.linkedin || ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "resume-preview-role", children: (selectedJob.jobTitle || "").toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "resume-preview-section", children: "Professional Summary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "resume-preview-summary", children: selectedJob.summary }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "resume-preview-section", children: "Core AI Competencies & Technical Leadership" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "resume-preview-bullets", children: selectedJob.competencies.split("\n").map((line, i) => {
                const bullet = line.replace(/\\item\s*/, "").replace(/\\textbf\{(.*?)\}/g, "$1");
                return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: bullet }, i);
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "resume-preview-section", children: "Professional Experience" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-header-line", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "7-Eleven" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Frisco/Dallas, TX" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-subline", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getHistoricalTitles(selectedJob.jobTitle).title711 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "2024 -- 2026" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "resume-preview-bullets", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AI Strategy & Product Development:" }),
                  " Spearheaded the adoption of advanced engineering practices and AI-native system designs, scaling the platform to support high-volume distributed applications serving over 250 million users."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Rapid Prototyping & Execution:" }),
                  " Led multi-scrum engineering teams to move fast from proof-of-concept to production-grade deployment on aggressive timelines, achieving a measurable 25% reduction in overall time-to-market."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Data-Driven Leadership:" }),
                  " Exercised sound judgment and swift decision-making to optimize core product roadmaps and timeline estimations, building cross-functional consensus with stakeholders to reduce post-launch system anomalies by 30%."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Technical Excellence & Mentorship:" }),
                  " Recruited, structured, and scaled a premier engineering branch, mentoring senior and staff engineers while establishing robust CI/CD deployment pipelines and high-velocity development lifecycles."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-header-line", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "CVS Health" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Remote" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-subline", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getHistoricalTitles(selectedJob.jobTitle).titleCVS }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "2014 -- 2023" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "resume-preview-bullets", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Healthcare ML & Core Architecture:" }),
                  " Owned the architecture, design, and deployment of secure applications operating in highly regulated environments, managing clinical, transactional, and claims data frameworks handling millions of secure daily operations."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Team Building & Scale:" }),
                  " Built, led, and scaled distributed agile squads of 12--18 engineers across 4 cross-functional divisions, prioritizing career development plans that improved sprint velocity by 20% and decreased team onboarding loops by 40%."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cross-Functional & Executive Alignment:" }),
                  " Collaborated closely with Product, Product Design, Clinical Operations, and Delivery partners to scope high-impact initiatives, utilizing strong interpersonal and presentation skills to influence technical strategy at the level of executive leadership."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Compliance & Distributed Systems:" }),
                  " Managed the end-to-end lifecycle of distributed architectures utilizing relational and NoSQL engines (MSSQL, Postgres), ensuring complete data governance, payment gateway security, and strict healthcare compliance."
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "welcome-screen", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "AutoApplyAI Logo", style: { width: 64, height: 64, objectFit: "contain", animation: "float 4s ease-in-out infinite", marginBottom: 16 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Welcome to AutoApplyAI" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Paste your target job description requirements inside the center pane to customize and optimize your resume instantly." })
      ] }) })
    ] }),
    showSettings && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content", style: { maxWidth: "650px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Configuration Panel (BYOK)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowSettings(false), className: "item-delete-btn", style: { padding: "6px" }, children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "details-header-tabs", style: { padding: "0 20px", borderBottom: "1px solid var(--panel-border)", background: "#f8fafc" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSettingsTab("api"),
            className: `tab-btn ${settingsTab === "api" ? "active" : ""}`,
            style: { padding: "12px 8px", fontSize: "0.85rem" },
            type: "button",
            children: "API & Rules"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSettingsTab("contact"),
            className: `tab-btn ${settingsTab === "contact" ? "active" : ""}`,
            style: { padding: "12px 8px", fontSize: "0.85rem" },
            type: "button",
            children: "Contact Info"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSettingsTab("profile"),
            className: `tab-btn ${settingsTab === "profile" ? "active" : ""}`,
            style: { padding: "12px 8px", fontSize: "0.85rem" },
            type: "button",
            children: "Profile Details"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSettingsTab("competencies"),
            className: `tab-btn ${settingsTab === "competencies" ? "active" : ""}`,
            style: { padding: "12px 8px", fontSize: "0.85rem" },
            type: "button",
            children: "Competencies"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-body", style: { minHeight: "350px" }, children: [
        settingsTab === "api" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Gemini API Key" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: showApiKey ? "text" : "password",
                  placeholder: "Enter your Gemini API key...",
                  value: apiKey,
                  onChange: (e) => setApiKey(e.target.value),
                  className: "form-control"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowApiKey(!showApiKey), className: "btn", type: "button", children: showApiKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 16 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("small", { style: { color: "var(--text-muted)", fontSize: "0.72rem" }, children: "Stored securely locally inside localStorage" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Resume Customization Rules (JSON)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: customRules,
                onChange: (e) => setCustomRules(e.target.value),
                className: "form-control",
                style: { minHeight: 200, fontFamily: "monospace", fontSize: "0.78rem" }
              }
            )
          ] })
        ] }),
        settingsTab === "contact" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "First Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: draftProfile.firstName || "",
                  onChange: (e) => setDraftProfile({ ...draftProfile, firstName: e.target.value }),
                  className: "form-control"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Last Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: draftProfile.lastName || "",
                  onChange: (e) => setDraftProfile({ ...draftProfile, lastName: e.target.value }),
                  className: "form-control"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Email Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "email",
                value: draftProfile.email || "",
                onChange: (e) => setDraftProfile({ ...draftProfile, email: e.target.value }),
                className: "form-control"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Phone Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: draftProfile.phone || "",
                onChange: (e) => setDraftProfile({ ...draftProfile, phone: e.target.value }),
                className: "form-control"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Location (City, State / ZIP)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: draftProfile.location || "",
                onChange: (e) => setDraftProfile({ ...draftProfile, location: e.target.value }),
                className: "form-control"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "LinkedIn Profile" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: draftProfile.linkedin || "",
                onChange: (e) => setDraftProfile({ ...draftProfile, linkedin: e.target.value }),
                className: "form-control"
              }
            )
          ] })
        ] }),
        settingsTab === "profile" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Target Professional Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: draftProfile.role || "",
                onChange: (e) => setDraftProfile({ ...draftProfile, role: e.target.value }),
                className: "form-control",
                placeholder: "e.g. DIRECTOR OF AI ENGINEERING"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Base Professional Summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: draftProfile.summary || "",
                onChange: (e) => setDraftProfile({ ...draftProfile, summary: e.target.value }),
                className: "form-control",
                style: { minHeight: 180, fontSize: "0.85rem", lineHeight: "1.4" },
                placeholder: "Enter base summary paragraph to tailor..."
              }
            )
          ] })
        ] }),
        settingsTab === "competencies" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "12px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }, children: [
              "Base Competencies (",
              ((_a = draftProfile.competencies) == null ? void 0 : _a.length) || 0,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  const newCompetencies = [...draftProfile.competencies || [], "New Competency: Description"];
                  setDraftProfile({ ...draftProfile, competencies: newCompetencies });
                },
                className: "btn btn-primary",
                style: { padding: "4px 10px", fontSize: "0.75rem", borderRadius: "4px" },
                type: "button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
                  " Add Item"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }, children: [
            (draftProfile.competencies || []).map((comp, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "flex-start" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  value: comp,
                  onChange: (e) => {
                    const updated = [...draftProfile.competencies];
                    updated[idx] = e.target.value;
                    setDraftProfile({ ...draftProfile, competencies: updated });
                  },
                  className: "form-control",
                  style: { minHeight: "60px", flex: 1, fontSize: "0.8rem", padding: "6px 10px" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    const updated = draftProfile.competencies.filter((_, i) => i !== idx);
                    setDraftProfile({ ...draftProfile, competencies: updated });
                  },
                  className: "item-delete-btn",
                  style: { padding: "6px", marginTop: "4px" },
                  type: "button",
                  title: "Delete Competency",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                }
              )
            ] }, idx)),
            (!draftProfile.competencies || draftProfile.competencies.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--panel-border)", borderRadius: "8px" }, children: "No core competencies defined. Add one to get started." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-footer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowSettings(false), className: "btn", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSaveSettings, className: "btn btn-primary", children: "Save Settings" })
      ] })
    ] }) })
  ] });
}
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  if (reason && (reason.name === "FirebaseError" || reason.message && (reason.message.toLowerCase().includes("offline") || reason.message.toLowerCase().includes("network") || reason.message.toLowerCase().includes("auth/internal-error")))) {
    console.warn("Handled offline/network promise rejection gracefully:", reason.message || reason);
    event.preventDefault();
  }
});
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
//# sourceMappingURL=dashboard-BiLw2j-j.js.map
