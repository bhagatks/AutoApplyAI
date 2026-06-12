import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, B as BrandLockup, a as BrandWordmark, b as client, R as React } from "./BrandLockup-Dmic_fsE.js";
import { C as Chrome } from "./chrome-CJtLYT64.js";
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Check = createLucideIcon("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
const DEMO = {
  pm: {
    label: "Product Manager",
    before: "Worked with teams to deliver product features and manage backlog.",
    after: [
      "Led cross-functional squads of 8 to ship 3 major releases, improving activation by 22%.",
      "Prioritized roadmap using OKRs and user research, cutting time-to-decision by 35%.",
      "Partnered with eng and design to launch MVP in 6 weeks, hitting 10k beta signups."
    ]
  },
  engineer: {
    label: "Software Engineer",
    before: "Built software applications and fixed bugs using various technologies.",
    after: [
      "Architected React/Node services handling 2M+ daily requests with 99.9% uptime.",
      "Reduced API latency 40% via caching, query tuning, and async job pipelines.",
      "Mentored 4 engineers through code review and CI/CD practices on AWS."
    ]
  },
  marketing: {
    label: "Marketing Manager",
    before: "Managed marketing campaigns and social media for the company.",
    after: [
      "Drove 3.2x ROAS on paid channels through A/B testing and audience segmentation.",
      "Grew organic traffic 85% YoY with SEO content hub and lifecycle email flows.",
      "Launched brand campaign reaching 1.4M impressions and 12% CTR lift."
    ]
  }
};
const FEATURES = [
  {
    title: "ATS-tailored resumes",
    body: "AI rewrites your summary and competencies to match each job description — targeting 90%+ keyword alignment."
  },
  {
    title: "One-click from job pages",
    body: "Scrape LinkedIn and other boards from the Chrome sidepanel. No copy-paste marathon."
  },
  {
    title: "Cover letters included",
    body: "Get a tailored cover letter alongside LaTeX-ready resume blocks for every application."
  },
  {
    title: "Your API key, your data",
    body: "Bring your own Gemini, OpenAI, Anthropic, or Grok key. Resume parsing runs client-side."
  },
  {
    title: "Cloud sync",
    body: "Job history and settings sync to Firestore so you can review applications on the web dashboard."
  },
  {
    title: "Local file output",
    body: "Save tailored PDFs and DOCX to a folder you choose — ready for submit or print."
  }
];
const FAQ = [
  {
    q: "Do I need a separate account for the extension and website?",
    a: "No. Sign in once with Google. Your config syncs between the Chrome sidepanel and the web dashboard."
  },
  {
    q: "Where do I complete setup?",
    a: "In the Chrome extension sidepanel. That is where you upload your resume, pick an output folder, and add your AI API key."
  },
  {
    q: "Which AI providers are supported?",
    a: "Google Gemini, OpenAI, Anthropic Claude, and xAI Grok. You choose the provider and model in the extension."
  },
  {
    q: "Is my resume stored in the cloud?",
    a: "Your profile and job history sync to your Firestore account. API keys can stay local or sync based on your settings."
  },
  {
    q: "Can I use the dashboard without the extension?",
    a: "The dashboard is for reviewing job history and settings after setup. First-time onboarding happens in the extension sidepanel."
  }
];
function LandingApp() {
  const [role, setRole] = reactExports.useState("engineer");
  const demo = DEMO[role];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "landing-header", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-header-inner", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLockup, { theme: "dark", size: "md", href: "/" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "landing-nav", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", children: "Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#how-it-works", children: "How it works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#faq", children: "FAQ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Dashboard" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#install", className: "landing-btn landing-btn-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Chrome, { size: 16 }),
        " Add to Chrome"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "landing-hero landing-container", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-hero-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "landing-eyebrow", children: "AI resume tailoring for job seekers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Every application tailored. From one job posting." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "landing-hero-lead", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BrandWordmark, { theme: "dark", size: "sm" }),
          " transforms generic resume lines into sharp, quantified bullets matched to each role — then saves tailored LaTeX, PDF, and cover letter output locally."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-hero-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#install", className: "landing-btn landing-btn-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Chrome, { size: 18 }),
            " Install Chrome extension"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", className: "landing-btn landing-btn-secondary", children: "Open dashboard" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-demo-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "landing-demo-tabs", children: Object.keys(DEMO).map((key) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: `landing-demo-tab${role === key ? " active" : ""}`,
            onClick: () => setRole(key),
            children: DEMO[key].label
          },
          key
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "landing-demo-label", children: "Before" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "landing-demo-before", children: demo.before }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "landing-demo-label", children: "After — tailored bullets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "landing-demo-after", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: demo.after.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: line })
        ] }, line)) }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "features", className: "landing-section landing-section-alt", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-container", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Built for serious applicants" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "landing-section-sub", children: "Everything you need to tailor faster — without leaving the job posting." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "landing-features", children: FEATURES.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-feature", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: f.body })
      ] }, f.title)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "how-it-works", className: "landing-section landing-container", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Live in three steps" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "landing-section-sub", children: "Install the extension, finish setup in the sidepanel, then tailor from any job page." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-steps", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-step", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "landing-step-num", children: "1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Install extension" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Add ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(BrandWordmark, { theme: "dark", size: "sm" }),
            " to Chrome and pin the sidepanel for quick access."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-step", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "landing-step-num", children: "2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Complete setup" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Upload your resume, connect your AI key, and choose where files are saved." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-step", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "landing-step-num", children: "3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Tailor & apply" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Open a job listing, scrape the description, and generate a matched resume in minutes." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq", className: "landing-section landing-section-alt", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-container", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Frequently asked" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "landing-section-sub", children: "Quick answers before you install." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "landing-faq", children: FAQ.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "landing-faq-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: item.q }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.a })
      ] }, item.q)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "install", className: "landing-cta", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Ready to tailor your next application?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Install the extension and complete setup in the sidepanel — takes about five minutes." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://chrome.google.com/webstore", className: "landing-btn landing-btn-primary", target: "_blank", rel: "noopener noreferrer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Chrome, { size: 18 }),
        " Add to Chrome"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-[#24324A] bg-[#0B1020] px-6 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-8 md:flex-row md:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "/",
          className: "inline-flex items-stretch gap-4 no-underline",
          "aria-label": "AutoApplyAI home",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "/logo.png",
                alt: "",
                className: "h-[3.5rem] w-auto shrink-0 rounded-lg object-contain object-left sm:h-[3.75rem]"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-[3.5rem] flex-col justify-center gap-1.5 sm:h-[3.75rem]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BrandWordmark, { theme: "dark", size: "2xl" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-snug text-[#94A3B8]", children: "Tailored applications in one click." })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex flex-wrap items-center gap-6 md:gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: "/login",
            className: "text-sm font-medium text-[#94A3B8] no-underline transition-colors hover:text-[#F8FAFC]",
            children: "Dashboard"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: "#features",
            className: "text-sm font-medium text-[#94A3B8] no-underline transition-colors hover:text-[#F8FAFC]",
            children: "Features"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: "#faq",
            className: "text-sm font-medium text-[#94A3B8] no-underline transition-colors hover:text-[#F8FAFC]",
            children: "FAQ"
          }
        )
      ] })
    ] }) })
  ] });
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(LandingApp, {}) })
);
//# sourceMappingURL=landing-Cg7ti4sq.js.map
