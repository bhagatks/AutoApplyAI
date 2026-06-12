const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/errorboundary-CPEENljf.js","assets/BrandLockup-Dmic_fsE.js","assets/BrandLockup-xY77Fvku.css","assets/errorboundary-D7RP4Brf.css"])))=>i.map(i=>d[i]);
var _a;
import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, B as BrandLockup, R as React, a as BrandWordmark, b as client } from "./BrandLockup-Dmic_fsE.js";
import { X as getBundledCoreCompetencyCatalog, Y as getCompetencySuggestions, Z as isCompetencyAlreadySelected, _ as hasExactCompetencyMatch, P as Plus, $ as getBundledCoreSkillCatalog, a0 as getSkillSuggestions, a1 as isSkillAlreadySelected, a2 as hasExactSkillMatch, a3 as isParsedResumeComplete, T as Trash2, a4 as getCredentialFieldLabels, a5 as CREDENTIAL_TYPE_OPTIONS, a6 as emptyEducationEntry, a7 as DEFAULT_PROVIDER_MODELS, a8 as resolveProviderModel, a9 as emptyWorkExperience, w as resolveEducationEntries, u as useToast, i as formatAiErrorToast, aa as fetchAvailableModels, ab as applyParsedResumeToForm, ac as buildParsedResumeFromForm, L as LogOut, ad as getProviderSelectLabel, ae as CheckCircle, af as computeExperienceYears, q as Sparkles, U as User, y as ToastStack, ag as verifyProviderApiKey, ah as prefetchAllProviderModels, H as getAiErrorToastVariant, ai as ensureDirectoryWriteAccess, aj as saveOutputDirHandle, ak as saveResumeToDirectory, al as extractResumeDocumentText, am as parseResumeWithAI, O as prepareFirestoreAccess, an as getUserCompetencyProfile, ao as mergeCompetenciesForUser, ap as saveUserCompetencyProfile, aq as getUserSkillProfile, ar as mergeSkillsForUser, as as saveUserSkillProfile, at as MAX_USER_CUSTOM_COMPETENCIES, au as MAX_USER_CUSTOM_SKILLS, av as isScanCancelledError, aw as buildResumeRulesForCustomer, ax as parsedResumeToBaseProfile, F as saveCustomerConfig, p as Loader, n as jobListFitBadge, ay as platformLabel, az as AlertCircle, aA as setChromeLocal, aB as signInWithChromeToken, aC as __vitePreload, aD as loadPipelineSettings, aE as loadPipelineQueue, aF as loadLocalSettings, aG as getChromeLocal, m as auth, o as onAuthStateChanged, aH as removeChromeLocal, Q as subscribeToJobs, R as getCustomerConfig, aI as getCloudApiKey, aJ as addChromeLocalChangedListener, aK as isJobActivelyTailoring, aL as signInWithGoogleTokens, A as clearAllLocalAppData, B as signOut, S as Settings, J as JobFitPanel, g as getParsedResumeBaseVersion, C as Copy, D as Download, t as normalizeName, v as Printer, E as EyeOff, x as Eye, aM as getUserProfile, aN as getJobsFromDb, aO as mergePipelineWithFirestore, aP as saveSettings, aQ as saveCloudApiKey, I as deleteJobFromDb, K as buildResumeLatex, M as buildCoverLetterLatex, N as isCustomerConfigComplete, aR as saveArtifactsForJob, V as initSentry, W as ErrorBoundary } from "./errorboundary-CPEENljf.js";
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Briefcase = createLucideIcon("Briefcase", [
  ["rect", { width: "20", height: "14", x: "2", y: "7", rx: "2", ry: "2", key: "eto64e" }],
  ["path", { d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "zwj3tp" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CheckCircle2 = createLucideIcon("CheckCircle2", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronRight = createLucideIcon("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
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
const Globe = createLucideIcon("Globe", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const GraduationCap = createLucideIcon("GraduationCap", [
  [
    "path",
    {
      d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
      key: "j76jl0"
    }
  ],
  ["path", { d: "M22 10v6", key: "1lu8f3" }],
  ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5", key: "1r8lef" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const HelpCircle = createLucideIcon("HelpCircle", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
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
const LayoutDashboard = createLucideIcon("LayoutDashboard", [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Link2 = createLucideIcon("Link2", [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
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
const MapPin = createLucideIcon("MapPin", [
  ["path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", key: "2oe9fu" }],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pause = createLucideIcon("Pause", [
  ["rect", { width: "4", height: "16", x: "6", y: "4", key: "iffhe4" }],
  ["rect", { width: "4", height: "16", x: "14", y: "4", key: "sjin7j" }]
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
const Play = createLucideIcon("Play", [
  ["polygon", { points: "5 3 19 12 5 21 5 3", key: "191637" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const RefreshCw = createLucideIcon("RefreshCw", [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const RotateCcw = createLucideIcon("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Search = createLucideIcon("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Square = createLucideIcon("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
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
async function encryptKey(plainText, passphrase) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e5,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plainText)
  );
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, "0")).join("");
  const cipherBytes = new Uint8Array(encrypted);
  const cipherHex = Array.from(cipherBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${ivHex}:${cipherHex}`;
}
async function decryptKey(cipherText, passphrase) {
  const parts = cipherText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted API key format");
  }
  const salt = new Uint8Array(parts[0].match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  const iv = new Uint8Array(parts[1].match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  const cipherBytes = new Uint8Array(parts[2].match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e5,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBytes
  );
  return new TextDecoder().decode(decrypted);
}
const SUGGESTION_LIMIT$1 = 24;
function CompetencyAddPicker({
  disabled,
  selectedTitles,
  onAdd
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const [catalog] = reactExports.useState(() => getBundledCoreCompetencyCatalog());
  const rootRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      var _a2;
      return (_a2 = inputRef.current) == null ? void 0 : _a2.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);
  reactExports.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);
  const trimmed = query.trim();
  const suggestions = getCompetencySuggestions(catalog, query, SUGGESTION_LIMIT$1, null, selectedTitles);
  const showCustomAdd = !!trimmed && !isCompetencyAlreadySelected(selectedTitles, trimmed) && !hasExactCompetencyMatch(catalog, trimmed);
  const handleSelect = (title) => {
    if (disabled || isCompetencyAlreadySelected(selectedTitles, title)) return;
    onAdd(title);
    setQuery("");
    setOpen(false);
  };
  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
    if (open) setQuery("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: rootRef, style: { position: "relative", alignSelf: "flex-start", width: "100%" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: handleToggle,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          fontSize: "0.78rem",
          fontWeight: 600,
          borderRadius: 8,
          border: "1px dashed var(--panel-border)",
          background: "transparent",
          color: disabled ? "var(--text-muted)" : "var(--accent)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
          "Add competency"
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--panel-bg)",
          border: "1px solid var(--panel-border)",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          overflow: "hidden"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderBottom: "1px solid var(--panel-border)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { color: "var(--text-muted)", flexShrink: 0 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: inputRef,
                    type: "text",
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    placeholder: "Search competencies…",
                    style: {
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: "0.82rem",
                      color: "var(--text-primary)"
                    }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxHeight: 220, overflowY: "auto" }, children: [
            suggestions.length === 0 && !showCustomAdd && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "12px 14px", fontSize: "0.78rem", color: "var(--text-muted)" }, children: trimmed ? "No matches. Add a custom competency below." : "Type to search the catalog." }),
            suggestions.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleSelect(entry.title),
                style: {
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 14px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  color: "var(--text-primary)"
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.background = "var(--hover-bg, rgba(0,0,0,0.04))";
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.background = "transparent";
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: entry.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 8, fontSize: "0.72rem", color: "var(--text-muted)" }, children: entry.category })
                ]
              },
              entry.id
            )),
            showCustomAdd && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleSelect(trimmed),
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  border: "none",
                  borderTop: suggestions.length ? "1px solid var(--panel-border)" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  color: "var(--accent)",
                  fontWeight: 600
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                  'Add custom: "',
                  trimmed,
                  '"'
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                padding: "6px 12px",
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                borderTop: "1px solid var(--panel-border)"
              },
              children: [
                catalog.entries.length,
                " competencies in catalog"
              ]
            }
          )
        ]
      }
    )
  ] });
}
const SUGGESTION_LIMIT = 24;
function SkillAddPicker({ disabled, selectedTitles, onAdd }) {
  const [open, setOpen] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const [catalog] = reactExports.useState(() => getBundledCoreSkillCatalog());
  const rootRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      var _a2;
      return (_a2 = inputRef.current) == null ? void 0 : _a2.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);
  reactExports.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);
  const trimmed = query.trim();
  const suggestions = getSkillSuggestions(catalog, query, SUGGESTION_LIMIT, null, selectedTitles);
  const showCustomAdd = !!trimmed && !isSkillAlreadySelected(selectedTitles, trimmed) && !hasExactSkillMatch(catalog, trimmed);
  const handleSelect = (title) => {
    if (disabled || isSkillAlreadySelected(selectedTitles, title)) return;
    onAdd(title);
    setQuery("");
    setOpen(false);
  };
  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
    if (open) setQuery("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: rootRef, style: { position: "relative", alignSelf: "flex-start", width: "100%" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "btn",
        disabled,
        onClick: handleToggle,
        style: { fontSize: "0.78rem" },
        "aria-expanded": open,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, style: { marginRight: 4 } }),
          " Add skill"
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          marginTop: 8,
          border: "1px solid var(--panel-border)",
          borderRadius: 8,
          background: "var(--panel-bg, #172033)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          overflow: "hidden"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderBottom: "1px solid var(--panel-border)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { color: "var(--text-muted, #94a3b8)", flexShrink: 0 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: inputRef,
                    className: "form-control",
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    onKeyDown: (e) => {
                      if (e.key === "Escape") {
                        setOpen(false);
                        setQuery("");
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        if (showCustomAdd) handleSelect(trimmed);
                        else if (suggestions[0]) handleSelect(suggestions[0].title);
                      }
                    },
                    placeholder: "Search technical skills...",
                    style: { border: "none", boxShadow: "none", padding: "4px 0", fontSize: "0.82rem" }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "listbox", style: { maxHeight: 220, overflowY: "auto" }, children: [
            suggestions.length === 0 && !showCustomAdd && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "12px", fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }, children: trimmed ? "No matching skills." : "Type to search the catalog." }),
            suggestions.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                role: "option",
                onClick: () => handleSelect(entry.title),
                style: {
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  color: "var(--text-primary)"
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.background = "var(--surface-hover)";
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.background = "transparent";
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: entry.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "var(--text-muted)", marginLeft: 6, fontSize: "0.72rem" }, children: entry.category })
                ]
              },
              entry.id
            )),
            showCustomAdd && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleSelect(trimmed),
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  border: "none",
                  borderTop: suggestions.length ? "1px solid var(--panel-border)" : "none",
                  background: "rgba(37, 99, 235, 0.08)",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  color: "var(--brand-color)",
                  fontWeight: 600
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                  "Add “",
                  trimmed,
                  "”"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              style: {
                padding: "6px 12px",
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                borderTop: "1px solid var(--panel-border)"
              },
              children: trimmed ? `${suggestions.length} match${suggestions.length === 1 ? "" : "es"} from catalog` : `${catalog.entries.length} skills in catalog — type to search`
            }
          )
        ]
      }
    )
  ] });
}
function push(keys, messages, key, message) {
  keys.push(key);
  messages.push(message);
}
function validateOnboardingForm(input) {
  var _a2, _b, _c, _d, _e, _f, _g;
  const keys = [];
  const messages = [];
  const {
    geminiApiKey,
    isKeyVerified,
    outputDir,
    resumeFile,
    isScanningResume,
    profileUnlocked,
    firstName,
    lastName,
    email,
    phone,
    parsedResumeDraft: resume
  } = input;
  if (!geminiApiKey.trim()) {
    push(keys, messages, "apiKey", "Enter your AI API key");
  } else if (!isKeyVerified) {
    push(keys, messages, "apiKeyNotVerified", "Verify your API key");
  }
  if (!outputDir.trim()) {
    push(keys, messages, "outputDir", "Choose an output folder for tailored resumes");
  }
  if (!resumeFile) {
    push(keys, messages, "resumeFile", "Upload your resume (PDF or DOCX)");
  } else if (isScanningResume) {
    push(keys, messages, "resumeScan", "Wait for resume scan to finish");
  } else if (!profileUnlocked) {
    push(keys, messages, "resumeScan", "Complete resume scan to unlock your profile");
  }
  if (!firstName.trim()) push(keys, messages, "firstName", "First name");
  if (!lastName.trim()) push(keys, messages, "lastName", "Last name");
  if (!email.trim()) push(keys, messages, "email", "Email");
  if (!phone.trim()) push(keys, messages, "phone", "Phone");
  if (profileUnlocked && !isScanningResume && !isParsedResumeComplete(resume)) {
    if (!((_a2 = resume.city) == null ? void 0 : _a2.trim())) push(keys, messages, "city", "City");
    if (!((_b = resume.state) == null ? void 0 : _b.trim())) push(keys, messages, "state", "State");
    if (!((_c = resume.country) == null ? void 0 : _c.trim())) push(keys, messages, "country", "Country");
    if (!((_d = resume.role) == null ? void 0 : _d.trim())) push(keys, messages, "role", "Target role / headline");
    if (!((_e = resume.summary) == null ? void 0 : _e.trim())) push(keys, messages, "summary", "Professional summary");
    const competencyCount = ((_f = resume.competencies) == null ? void 0 : _f.filter((c) => c.trim()).length) ?? 0;
    if (competencyCount < 6) {
      push(keys, messages, "competencies", `Core competencies (${competencyCount}/6 minimum)`);
    }
    if (!((_g = resume.currentCompany) == null ? void 0 : _g.trim())) push(keys, messages, "currentCompany", "Current company");
    const experience = resume.experience ?? [];
    if (!experience.length) {
      push(keys, messages, "experience", "At least one work experience entry");
    } else {
      experience.forEach((job, i) => {
        var _a3, _b2, _c2, _d2, _e2;
        const prefix = `exp-${i}`;
        if (!((_a3 = job.jobTitle) == null ? void 0 : _a3.trim())) push(keys, messages, `${prefix}-title`, `Experience ${i + 1}: job title`);
        if (!((_b2 = job.company) == null ? void 0 : _b2.trim())) push(keys, messages, `${prefix}-company`, `Experience ${i + 1}: company`);
        if (!((_c2 = job.startDate) == null ? void 0 : _c2.trim()) || !((_d2 = job.endDate) == null ? void 0 : _d2.trim())) {
          push(keys, messages, `${prefix}-dates`, `Experience ${i + 1}: start and end dates`);
        }
        if (!((_e2 = job.bullets) == null ? void 0 : _e2.some((b) => b.trim()))) {
          push(keys, messages, `${prefix}-bullets`, `Experience ${i + 1}: at least one bullet`);
        }
      });
    }
    const education = resume.education ?? [];
    if (!education.length) {
      push(keys, messages, "education", "At least one education entry");
    } else {
      education.forEach((entry, i) => {
        var _a3, _b2;
        const prefix = `edu-${i}`;
        if (!((_a3 = entry.degree) == null ? void 0 : _a3.trim())) push(keys, messages, `${prefix}-degree`, `Education ${i + 1}: degree`);
        if (!((_b2 = entry.school) == null ? void 0 : _b2.trim())) push(keys, messages, `${prefix}-school`, `Education ${i + 1}: school`);
      });
    }
  }
  return { keys, messages };
}
function isFieldInvalid(invalidKeys, key) {
  return Boolean(invalidKeys == null ? void 0 : invalidKeys.has(key));
}
function fieldControlClass(invalidKeys, key, base = "form-control") {
  return `${base}${isFieldInvalid(invalidKeys, key) ? " field-invalid" : ""}`;
}
function fieldGroupClass(invalidKeys, key) {
  return `form-group${isFieldInvalid(invalidKeys, key) ? " field-invalid-group" : ""}`;
}
function fieldLabelStyle(invalidKeys, key, base = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--text-secondary)"
}) {
  return isFieldInvalid(invalidKeys, key) ? { ...base, color: "var(--danger-color)" } : base;
}
function scrollToFirstInvalidField(keys, container) {
  if (!container || keys.length === 0) return;
  requestAnimationFrame(() => {
    for (const key of keys) {
      const el = container.querySelector(`[data-field-key="${key}"]`);
      if (!el || !(el instanceof HTMLElement)) continue;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el.matches("input, textarea, select, button")) {
        el.focus({ preventScroll: true });
      } else {
        const focusable = el.querySelector("input, textarea, select, button");
        focusable == null ? void 0 : focusable.focus({ preventScroll: true });
      }
      break;
    }
  });
}
const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--text-secondary)"
};
const sectionTitleStyle = {
  fontSize: "0.82rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  margin: "8px 0 4px",
  borderBottom: "1px solid var(--panel-border)",
  paddingBottom: 6
};
function ResumeProfileSections(props) {
  const {
    disabled,
    invalidFields = null,
    onClearInvalidField,
    city,
    setCity,
    state,
    setState,
    country,
    setCountry,
    postalCode,
    setPostalCode,
    role,
    setRole,
    summary,
    setSummary,
    competencies,
    setCompetencies,
    skills,
    setSkills,
    experience,
    setExperience,
    education,
    setEducation,
    currentCompany,
    setCurrentCompany,
    currentlyWorking,
    setCurrentlyWorking,
    linkedin,
    setLinkedin,
    github,
    setGithub,
    portfolio,
    setPortfolio,
    website,
    setWebsite,
    otherLinks,
    setOtherLinks,
    languages,
    setLanguages,
    workAuthorizationUS,
    setWorkAuthorizationUS,
    requiresSponsorship,
    setRequiresSponsorship
  } = props;
  const wrapStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    opacity: disabled ? 0.45 : 1,
    pointerEvents: disabled ? "none" : "auto"
  };
  const updateJob = (index, patch) => {
    const next = [...experience];
    next[index] = { ...next[index], ...patch };
    setExperience(next);
  };
  const updateEducation = (index, patch) => {
    const next = [...education];
    next[index] = { ...next[index], ...patch };
    setEducation(next);
  };
  const sectionTitleClass = (key) => `section-title${key && isFieldInvalid(invalidFields, key) ? " field-invalid-section" : ""}`;
  const touch = (key, fn) => {
    onClearInvalidField == null ? void 0 : onClearInvalidField(key);
    fn();
  };
  const locationInvalid = isFieldInvalid(invalidFields, "city") || isFieldInvalid(invalidFields, "state") || isFieldInvalid(invalidFields, "country");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: wrapStyle, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: sectionTitleClass(locationInvalid ? "city" : void 0), style: sectionTitleStyle, "data-field-key": locationInvalid ? "city" : void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14, style: { display: "inline", marginRight: 6, verticalAlign: "text-bottom" } }),
      "Location *"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "city", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: fieldLabelStyle(invalidFields, "city", labelStyle), children: "City *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: fieldControlClass(invalidFields, "city"), "data-field-key": "city", value: city, onChange: (e) => touch("city", () => setCity(e.target.value)), disabled })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "state", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: fieldLabelStyle(invalidFields, "state", labelStyle), children: "State *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: fieldControlClass(invalidFields, "state"), "data-field-key": "state", value: state, onChange: (e) => touch("state", () => setState(e.target.value)), disabled })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "country", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: fieldLabelStyle(invalidFields, "country", labelStyle), children: "Country *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: fieldControlClass(invalidFields, "country"), "data-field-key": "country", value: country, onChange: (e) => touch("country", () => setCountry(e.target.value)), disabled })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Postal Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "form-control", value: postalCode, onChange: (e) => setPostalCode(e.target.value), disabled })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: sectionTitleClass("role"), style: sectionTitleStyle, "data-field-key": "role", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 14, style: { display: "inline", marginRight: 6, verticalAlign: "text-bottom" } }),
      "Professional Identity *"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "role", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: fieldLabelStyle(invalidFields, "role", labelStyle), children: "Target Role / Headline *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: fieldControlClass(invalidFields, "role"), "data-field-key": "role", value: role, onChange: (e) => touch("role", () => setRole(e.target.value)), disabled })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "currentCompany", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: fieldLabelStyle(invalidFields, "currentCompany", labelStyle), children: "Current Company *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: fieldControlClass(invalidFields, "currentCompany"), "data-field-key": "currentCompany", value: currentCompany, onChange: (e) => touch("currentCompany", () => setCurrentCompany(e.target.value)), disabled })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", style: { display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "checkbox",
          checked: currentlyWorking,
          onChange: (e) => setCurrentlyWorking(e.target.checked),
          disabled,
          id: "currentlyWorking"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "currentlyWorking", style: { ...labelStyle, margin: 0 }, children: "Currently working at this company" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "summary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: fieldLabelStyle(invalidFields, "summary", labelStyle), children: "Professional Summary *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          className: fieldControlClass(invalidFields, "summary"),
          "data-field-key": "summary",
          rows: 4,
          value: summary,
          onChange: (e) => touch("summary", () => setSummary(e.target.value)),
          disabled,
          placeholder: "3-5 sentence executive summary..."
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: sectionTitleClass("competencies"), style: sectionTitleStyle, "data-field-key": "competencies", children: "Core Competencies * (min 6)" }),
    competencies.map((comp, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, "data-field-key": idx === 0 ? "competencies" : void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          className: fieldControlClass(invalidFields, idx === 0 ? "competencies" : `comp-${idx}`, "form-control"),
          "data-field-key": idx === 0 ? "competencies" : void 0,
          value: comp,
          disabled,
          onChange: (e) => {
            touch("competencies", () => {
              const next = [...competencies];
              next[idx] = e.target.value;
              setCompetencies(next);
            });
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "btn",
          disabled,
          onClick: () => setCompetencies(competencies.filter((_, i) => i !== idx)),
          style: { padding: "0 10px" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
        }
      )
    ] }, idx)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CompetencyAddPicker,
      {
        disabled,
        selectedTitles: competencies,
        onAdd: (title) => {
          const existing = competencies.filter((c) => c.trim());
          setCompetencies([...existing, title]);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionTitleStyle, children: "Technical Skills" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 8px", fontSize: "0.72rem", color: "var(--text-muted)" }, children: "Languages, frameworks, databases, and tools — used for ATS matching (separate from core competencies)." }),
    skills.map((skill, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          className: "form-control",
          value: skill,
          disabled,
          onChange: (e) => {
            const next = [...skills];
            next[idx] = e.target.value;
            setSkills(next);
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "btn",
          disabled,
          onClick: () => setSkills(skills.filter((_, i) => i !== idx)),
          style: { padding: "0 10px" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
        }
      )
    ] }, idx)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SkillAddPicker,
      {
        disabled,
        selectedTitles: skills,
        onAdd: (title) => {
          const existing = skills.filter((s) => s.trim());
          setSkills([...existing, title]);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: sectionTitleClass("experience"), style: sectionTitleStyle, "data-field-key": "experience", children: "Work Experience *" }),
    experience.map((job, idx) => {
      const cardInvalid = isFieldInvalid(invalidFields, `exp-${idx}-title`) || isFieldInvalid(invalidFields, `exp-${idx}-company`) || isFieldInvalid(invalidFields, `exp-${idx}-dates`) || isFieldInvalid(invalidFields, `exp-${idx}-bullets`) || idx === 0 && isFieldInvalid(invalidFields, "experience");
      const cardKey = idx === 0 && isFieldInvalid(invalidFields, "experience") ? "experience" : `exp-${idx}-title`;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-field-key": cardKey,
          style: {
            border: `1px solid ${cardInvalid ? "var(--danger-color)" : "var(--panel-border)"}`,
            borderRadius: 8,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxShadow: cardInvalid ? "0 0 0 1px rgba(239, 68, 68, 0.15)" : void 0
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { style: { fontSize: "0.78rem", color: cardInvalid ? "var(--danger-color)" : void 0 }, children: [
                "Position ",
                idx + 1
              ] }),
              experience.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn", disabled, onClick: () => setExperience(experience.filter((_, i) => i !== idx)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: fieldControlClass(invalidFields, `exp-${idx}-title`), "data-field-key": `exp-${idx}-title`, placeholder: "Job title *", value: job.jobTitle, disabled, onChange: (e) => touch(`exp-${idx}-title`, () => updateJob(idx, { jobTitle: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: fieldControlClass(invalidFields, `exp-${idx}-company`), "data-field-key": `exp-${idx}-company`, placeholder: "Company *", value: job.company, disabled, onChange: (e) => touch(`exp-${idx}-company`, () => updateJob(idx, { company: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "form-control", placeholder: "Location", value: job.location || "", disabled, onChange: (e) => updateJob(idx, { location: e.target.value }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, "data-field-key": `exp-${idx}-dates`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: fieldControlClass(invalidFields, `exp-${idx}-dates`), placeholder: "Start (YYYY-MM) *", value: job.startDate, disabled, onChange: (e) => touch(`exp-${idx}-dates`, () => updateJob(idx, { startDate: e.target.value })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: fieldControlClass(invalidFields, `exp-${idx}-dates`), placeholder: "End (YYYY-MM or Present) *", value: job.endDate, disabled, onChange: (e) => touch(`exp-${idx}-dates`, () => updateJob(idx, { endDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: fieldLabelStyle(invalidFields, `exp-${idx}-bullets`, labelStyle), children: "Bullets * (one per line)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                className: fieldControlClass(invalidFields, `exp-${idx}-bullets`),
                "data-field-key": `exp-${idx}-bullets`,
                rows: 4,
                disabled,
                value: job.bullets.join("\n"),
                onChange: (e) => touch(`exp-${idx}-bullets`, () => updateJob(idx, { bullets: e.target.value.split("\n") }))
              }
            )
          ]
        },
        idx
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "btn",
        disabled,
        onClick: () => setExperience([...experience, { jobTitle: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] }]),
        style: { fontSize: "0.78rem", alignSelf: "flex-start" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, style: { marginRight: 4 } }),
          " Add position"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: sectionTitleClass("education"), style: sectionTitleStyle, "data-field-key": "education", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { size: 14, style: { display: "inline", marginRight: 6, verticalAlign: "text-bottom" } }),
      "Education & Credentials *"
    ] }),
    education.map((entry, idx) => {
      var _a2;
      const labels = getCredentialFieldLabels(entry.credentialType);
      const typeLabel = ((_a2 = CREDENTIAL_TYPE_OPTIONS.find((o) => o.value === entry.credentialType)) == null ? void 0 : _a2.label) || "Credential";
      const cardInvalid = isFieldInvalid(invalidFields, `edu-${idx}-degree`) || isFieldInvalid(invalidFields, `edu-${idx}-school`) || idx === 0 && isFieldInvalid(invalidFields, "education");
      const cardKey = idx === 0 && isFieldInvalid(invalidFields, "education") ? "education" : `edu-${idx}-degree`;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-field-key": cardKey,
          style: {
            border: `1px solid ${cardInvalid ? "var(--danger-color)" : "var(--panel-border)"}`,
            borderRadius: 8,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxShadow: cardInvalid ? "0 0 0 1px rgba(239, 68, 68, 0.15)" : void 0
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { style: { fontSize: "0.78rem", color: cardInvalid ? "var(--danger-color)" : void 0 }, children: [
                typeLabel,
                " ",
                idx + 1
              ] }),
              education.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "btn",
                  disabled,
                  onClick: () => setEducation(education.filter((_, i) => i !== idx)),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", style: { margin: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Type *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  className: "form-control",
                  value: entry.credentialType,
                  disabled,
                  onChange: (e) => updateEducation(idx, { credentialType: e.target.value }),
                  children: CREDENTIAL_TYPE_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option.value, children: option.label }, option.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                className: fieldControlClass(invalidFields, `edu-${idx}-degree`),
                "data-field-key": `edu-${idx}-degree`,
                placeholder: labels.title,
                value: entry.degree,
                disabled,
                onChange: (e) => touch(`edu-${idx}-degree`, () => updateEducation(idx, { degree: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                className: "form-control",
                placeholder: labels.fieldOfStudy,
                value: entry.fieldOfStudy,
                disabled,
                onChange: (e) => updateEducation(idx, { fieldOfStudy: e.target.value })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                className: fieldControlClass(invalidFields, `edu-${idx}-school`),
                "data-field-key": `edu-${idx}-school`,
                placeholder: labels.issuer,
                value: entry.school,
                disabled,
                onChange: (e) => touch(`edu-${idx}-school`, () => updateEducation(idx, { school: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                className: "form-control",
                placeholder: "Location (city, state)",
                value: entry.location,
                disabled,
                onChange: (e) => updateEducation(idx, { location: e.target.value })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "form-control",
                  placeholder: "Start (optional, YYYY or YYYY-MM)",
                  value: entry.startDate,
                  disabled,
                  onChange: (e) => updateEducation(idx, { startDate: e.target.value })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "form-control",
                  placeholder: labels.endDate,
                  value: entry.endDate,
                  disabled,
                  onChange: (e) => updateEducation(idx, { endDate: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                className: "form-control",
                placeholder: labels.honors,
                value: entry.honors,
                disabled,
                onChange: (e) => updateEducation(idx, { honors: e.target.value })
              }
            )
          ]
        },
        idx
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "btn",
        disabled,
        onClick: () => setEducation([...education, emptyEducationEntry()]),
        style: { fontSize: "0.78rem", alignSelf: "flex-start" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, style: { marginRight: 4 } }),
          " Add credential"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { style: { opacity: disabled ? 0.45 : 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { style: { ...sectionTitleStyle, cursor: disabled ? "not-allowed" : "pointer", listStyle: "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 14, style: { display: "inline", marginRight: 6, verticalAlign: "text-bottom" } }),
        "Links & Languages (optional)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 12, pointerEvents: disabled ? "none" : "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "form-control", placeholder: "LinkedIn", value: linkedin, disabled, onChange: (e) => setLinkedin(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "form-control", placeholder: "GitHub", value: github, disabled, onChange: (e) => setGithub(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "form-control", placeholder: "Portfolio", value: portfolio, disabled, onChange: (e) => setPortfolio(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "form-control", placeholder: "Website", value: website, disabled, onChange: (e) => setWebsite(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "form-control", rows: 2, placeholder: "Other links (one per line)", value: otherLinks, disabled, onChange: (e) => setOtherLinks(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "form-control", placeholder: "Languages (comma separated)", value: languages, disabled, onChange: (e) => setLanguages(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { style: { opacity: disabled ? 0.45 : 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { style: { ...sectionTitleStyle, cursor: disabled ? "not-allowed" : "pointer", listStyle: "none" }, children: "Work Eligibility (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 12, pointerEvents: disabled ? "none" : "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "form-control", placeholder: "Work authorization (US)", value: workAuthorizationUS, disabled, onChange: (e) => setWorkAuthorizationUS(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "form-control", value: requiresSponsorship, disabled, onChange: (e) => setRequiresSponsorship(e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Sponsorship required?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "No", children: "No" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Yes", children: "Yes" })
        ] })
      ] })
    ] })
  ] });
}
function isOnboardingDevInjectEnabled() {
  return true;
}
function getOnboardingDevApiKey(provider) {
  var _a2;
  const keys = {
    gemini: "AIzaSyDdezmVikA-2v-6GhLLtEw40_jabKihMVo",
    openai: "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",
    anthropic: "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",
    grok: "xai-yfxkdqU5nsqUvaxaxXc7fnOy4p28ypTM9dG0KM961zna3mY1A1R5NnFI641yjFS53Tpa6TwLPK8g6OGg"
  };
  const key = (_a2 = keys[provider]) == null ? void 0 : _a2.trim();
  return key || void 0;
}
const ONBOARDING_DEV_REMINDER = "DEV TEST MODE: API keys are auto-filled from .env.local. Delete .env.local and rebuild when onboarding testing is done.";
function MicroOnboarding({ userId, onComplete, onSignOut, initialProfile, initialConfig }) {
  const [isSigningOut, setIsSigningOut] = reactExports.useState(false);
  const [aiProvider, setAiProvider] = reactExports.useState(
    () => (initialConfig == null ? void 0 : initialConfig.aiProvider) || "gemini"
  );
  const [firstName, setFirstName] = reactExports.useState(
    () => {
      var _a2;
      return ((_a2 = initialConfig == null ? void 0 : initialConfig.candidateProfile) == null ? void 0 : _a2.firstName) || (initialProfile == null ? void 0 : initialProfile.firstName) || "";
    }
  );
  const [lastName, setLastName] = reactExports.useState(
    () => {
      var _a2;
      return ((_a2 = initialConfig == null ? void 0 : initialConfig.candidateProfile) == null ? void 0 : _a2.lastName) || (initialProfile == null ? void 0 : initialProfile.lastName) || "";
    }
  );
  const [email, setEmail] = reactExports.useState(
    () => {
      var _a2;
      return ((_a2 = initialConfig == null ? void 0 : initialConfig.candidateProfile) == null ? void 0 : _a2.email) || (initialProfile == null ? void 0 : initialProfile.email) || "";
    }
  );
  const [phone, setPhone] = reactExports.useState(
    () => {
      var _a2;
      return ((_a2 = initialConfig == null ? void 0 : initialConfig.candidateProfile) == null ? void 0 : _a2.phone) || "";
    }
  );
  const [geminiApiKey, setGeminiApiKey] = reactExports.useState(
    () => (initialConfig == null ? void 0 : initialConfig.geminiApiKey) || ""
  );
  const [outputDir, setOutputDir] = reactExports.useState(
    () => (initialConfig == null ? void 0 : initialConfig.outputDir) || ""
  );
  const [resumeContext, setResumeContext] = reactExports.useState(
    () => (initialConfig == null ? void 0 : initialConfig.resumeContext) || ""
  );
  const [resumeFile, setResumeFile] = reactExports.useState(
    () => {
      var _a2;
      return ((_a2 = initialConfig == null ? void 0 : initialConfig.candidateProfile) == null ? void 0 : _a2.resume) || "";
    }
  );
  const [loading, setLoading] = reactExports.useState(false);
  const [modelsLoading, setModelsLoading] = reactExports.useState(true);
  const [isKeyVerified, setIsKeyVerified] = reactExports.useState(
    () => !!(initialConfig == null ? void 0 : initialConfig.geminiApiKey)
  );
  const [isVerifyingKey, setIsVerifyingKey] = reactExports.useState(false);
  const [isScanningResume, setIsScanningResume] = reactExports.useState(false);
  const [uploadedFile, setUploadedFile] = reactExports.useState(null);
  const [dirHandle, setDirHandle] = reactExports.useState(null);
  const [showTooltip, setShowTooltip] = reactExports.useState(false);
  const [providerModels, setProviderModels] = reactExports.useState(DEFAULT_PROVIDER_MODELS);
  const activeModel = resolveProviderModel(aiProvider, providerModels[aiProvider]);
  const [scanComplete, setScanComplete] = reactExports.useState(() => !!(initialConfig == null ? void 0 : initialConfig.parsedResume));
  const [profileUnlocked, setProfileUnlocked] = reactExports.useState(() => !!(initialConfig == null ? void 0 : initialConfig.parsedResume));
  const [scanStatus, setScanStatus] = reactExports.useState("");
  const scanCancelRef = reactExports.useRef(false);
  const formScrollRef = reactExports.useRef(null);
  const [invalidFields, setInvalidFields] = reactExports.useState(null);
  const clearInvalidField = (key) => {
    setInvalidFields((prev) => {
      if (!(prev == null ? void 0 : prev.has(key))) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next.size > 0 ? next : null;
    });
  };
  const scanAbortControllerRef = reactExports.useRef(null);
  const verifyInflightRef = reactExports.useRef(null);
  const runVerifyKey = (provider, key) => {
    const trimmed = key.trim();
    const inflight = verifyInflightRef.current;
    if (inflight && inflight.provider === provider && inflight.key === trimmed) {
      return inflight.promise;
    }
    const promise = verifyProviderApiKey(provider, trimmed).finally(() => {
      var _a2;
      if (((_a2 = verifyInflightRef.current) == null ? void 0 : _a2.promise) === promise) {
        verifyInflightRef.current = null;
      }
    });
    verifyInflightRef.current = { provider, key: trimmed, promise };
    return promise;
  };
  const throwIfScanCancelled = () => {
    if (scanCancelRef.current) {
      throw new Error("SCAN_CANCELLED");
    }
  };
  const handleStopScan = () => {
    var _a2;
    scanCancelRef.current = true;
    (_a2 = scanAbortControllerRef.current) == null ? void 0 : _a2.abort();
    setScanStatus("Stopping...");
  };
  const [savedResumeName, setSavedResumeName] = reactExports.useState(() => {
    var _a2, _b;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.sourceFilePath) || ((_b = initialConfig == null ? void 0 : initialConfig.candidateProfile) == null ? void 0 : _b.resume) || "";
  });
  const [city, setCity] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.city) || "";
  });
  const [state, setStateVal] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.state) || "";
  });
  const [country, setCountry] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.country) || "United States";
  });
  const [postalCode, setPostalCode] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.postalCode) || "";
  });
  const [role, setRole] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.role) || "";
  });
  const [summary, setSummary] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.summary) || "";
  });
  const [competencies, setCompetencies] = reactExports.useState(() => {
    var _a2, _b;
    return ((_b = (_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.competencies) == null ? void 0 : _b.length) ? initialConfig.parsedResume.competencies : [""];
  });
  const [skills, setSkills] = reactExports.useState(() => {
    var _a2, _b;
    return ((_b = (_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.skills) == null ? void 0 : _b.length) ? initialConfig.parsedResume.skills : [];
  });
  const [experience, setExperience] = reactExports.useState(() => {
    var _a2, _b;
    return ((_b = (_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.experience) == null ? void 0 : _b.length) ? initialConfig.parsedResume.experience : [emptyWorkExperience()];
  });
  const [currentCompany, setCurrentCompany] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.currentCompany) || "";
  });
  const [currentlyWorking, setCurrentlyWorking] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.currentlyWorking) ?? false;
  });
  const [education, setEducation] = reactExports.useState(() => resolveEducationEntries(initialConfig == null ? void 0 : initialConfig.parsedResume));
  const [linkedin, setLinkedin] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.linkedin) || "";
  });
  const [github, setGithub] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.github) || "";
  });
  const [portfolio, setPortfolio] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.portfolio) || "";
  });
  const [website, setWebsite] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.website) || "";
  });
  const [otherLinks, setOtherLinks] = reactExports.useState(() => {
    var _a2, _b;
    return ((_b = (_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.otherLinks) == null ? void 0 : _b.join("\n")) || "";
  });
  const [languages, setLanguages] = reactExports.useState(() => {
    var _a2, _b;
    return ((_b = (_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.languages) == null ? void 0 : _b.join(", ")) || "";
  });
  const [workAuthorizationUS, setWorkAuthorizationUS] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.workAuthorizationUS) || "";
  });
  const [requiresSponsorship, setRequiresSponsorship] = reactExports.useState(() => {
    var _a2;
    return ((_a2 = initialConfig == null ? void 0 : initialConfig.parsedResume) == null ? void 0 : _a2.requiresSponsorship) || "";
  });
  const devInjectActive = isOnboardingDevInjectEnabled();
  const { toasts, showToast, dismissToast } = useToast();
  reactExports.useEffect(() => {
    const devKey = getOnboardingDevApiKey(aiProvider);
    if (!devKey) return;
    setGeminiApiKey(devKey);
    let cancelled = false;
    verifyInflightRef.current = null;
    runVerifyKey(aiProvider, devKey).then((result) => {
      if (cancelled) return;
      setIsKeyVerified(result.valid);
      if (!result.valid && result.error) {
        showToast(
          formatAiErrorToast(result.error, { provider: aiProvider, context: "verify_key" }),
          "error"
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [aiProvider, devInjectActive]);
  reactExports.useEffect(() => {
    let cancelled = false;
    const loadModels = async () => {
      var _a2;
      setModelsLoading(true);
      try {
        const savedKey = ((_a2 = initialConfig == null ? void 0 : initialConfig.geminiApiKey) == null ? void 0 : _a2.trim()) || "";
        const activeProvider = (initialConfig == null ? void 0 : initialConfig.aiProvider) || "gemini";
        const catalog = await prefetchAllProviderModels({
          apiKey: savedKey || void 0,
          activeProvider: savedKey ? activeProvider : void 0
        });
        if (!cancelled) {
          setProviderModels(catalog);
        }
      } catch (err) {
        console.error("Failed to prefetch provider models:", err);
        if (!cancelled) {
          setProviderModels(DEFAULT_PROVIDER_MODELS);
        }
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    };
    loadModels();
    return () => {
      cancelled = true;
    };
  }, [initialConfig == null ? void 0 : initialConfig.aiProvider, initialConfig == null ? void 0 : initialConfig.aiModel, initialConfig == null ? void 0 : initialConfig.geminiApiKey]);
  reactExports.useEffect(() => {
    if (!isKeyVerified || !geminiApiKey.trim()) return;
    let cancelled = false;
    fetchAvailableModels(aiProvider, geminiApiKey.trim()).then((modelList) => {
      if (cancelled) return;
      setProviderModels((prev) => ({ ...prev, [aiProvider]: modelList }));
    });
    return () => {
      cancelled = true;
    };
  }, [isKeyVerified, aiProvider, geminiApiKey]);
  reactExports.useEffect(() => {
    var _a2;
    if (initialConfig) {
      setAiProvider(initialConfig.aiProvider || "gemini");
      if (initialConfig.candidateProfile) {
        setFirstName(initialConfig.candidateProfile.firstName || "");
        setLastName(initialConfig.candidateProfile.lastName || "");
        setEmail(initialConfig.candidateProfile.email || "");
        setPhone(initialConfig.candidateProfile.phone || "");
        setResumeFile(initialConfig.candidateProfile.resume || "");
      }
      if (initialConfig.parsedResume) {
        populateFromScan(initialConfig.parsedResume);
        setProfileUnlocked(true);
        setScanComplete(true);
        setSavedResumeName(initialConfig.parsedResume.sourceFilePath || ((_a2 = initialConfig.candidateProfile) == null ? void 0 : _a2.resume) || "");
      }
      setGeminiApiKey(initialConfig.geminiApiKey || "");
      setOutputDir(initialConfig.outputDir || "");
      setResumeContext(initialConfig.resumeContext || "");
      setIsKeyVerified(!!initialConfig.geminiApiKey);
    } else if (initialProfile) {
      if (initialProfile.firstName) setFirstName(initialProfile.firstName);
      if (initialProfile.lastName) setLastName(initialProfile.lastName);
      if (initialProfile.email) setEmail(initialProfile.email);
    }
  }, [initialConfig, initialProfile]);
  reactExports.useEffect(() => {
    const loadExisting = async () => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(["customer_config", "basic_user_config"], (res) => {
          if (res.customer_config) {
            try {
              const config = res.customer_config;
              if (config) {
                setAiProvider(config.aiProvider || "gemini");
                setGeminiApiKey(config.geminiApiKey || "");
                setOutputDir(config.outputDir || "");
                setResumeContext(config.resumeContext || "");
                setIsKeyVerified(!!config.geminiApiKey);
                if (config.candidateProfile) {
                  setFirstName(config.candidateProfile.firstName || "");
                  setLastName(config.candidateProfile.lastName || "");
                  setEmail(config.candidateProfile.email || "");
                  setPhone(config.candidateProfile.phone || "");
                  setResumeFile(config.candidateProfile.resume || "");
                }
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
            if (config) {
              setAiProvider(config.aiProvider || "gemini");
              setGeminiApiKey(config.geminiApiKey || "");
              setOutputDir(config.outputDir || "");
              setResumeContext(config.resumeContext || "");
              setIsKeyVerified(!!config.geminiApiKey);
              if (config.candidateProfile) {
                setFirstName(config.candidateProfile.firstName || "");
                setLastName(config.candidateProfile.lastName || "");
                setEmail(config.candidateProfile.email || "");
                setPhone(config.candidateProfile.phone || "");
                setResumeFile(config.candidateProfile.resume || "");
              }
            }
          } catch (e) {
            console.error("Failed to parse local customer_config:", e);
          }
        }
      }
    };
    loadExisting();
  }, []);
  const handleVerifyKey = async () => {
    if (!geminiApiKey.trim()) return;
    setIsVerifyingKey(true);
    try {
      const result = await runVerifyKey(aiProvider, geminiApiKey.trim());
      setIsKeyVerified(result.valid);
      if (result.valid) {
        showToast("API key verified successfully.", "success");
      } else {
        showToast(
          formatAiErrorToast(result.error || "Invalid API key. Please check and try again.", {
            provider: aiProvider,
            context: "verify_key"
          }),
          "error"
        );
      }
    } catch (err) {
      console.error("API Verification error:", err);
      showToast(
        formatAiErrorToast(err, { provider: aiProvider, context: "verify_key" }),
        getAiErrorToastVariant(err, { provider: aiProvider, context: "verify_key" })
      );
    } finally {
      setIsVerifyingKey(false);
    }
  };
  const populateFromScan = (parsed) => {
    applyParsedResumeToForm(parsed, {
      setFirstName,
      setLastName,
      setEmail,
      setPhone,
      setCity,
      setState: setStateVal,
      setCountry,
      setPostalCode,
      setRole,
      setSummary,
      setCompetencies,
      setSkills,
      setExperience,
      setEducation,
      setCurrentCompany,
      setCurrentlyWorking,
      setLinkedin,
      setGithub,
      setPortfolio,
      setWebsite,
      setOtherLinks,
      setLanguages,
      setWorkAuthorizationUS,
      setRequiresSponsorship
    });
  };
  const pickOutputDirectory = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      if (!(handle == null ? void 0 : handle.name)) return;
      const granted = await ensureDirectoryWriteAccess(handle);
      if (!granted) {
        showToast("Write access to the folder is required. Please allow access and try again.", "warning");
        return;
      }
      setDirHandle(handle);
      setOutputDir(handle.name);
      await saveOutputDirHandle(handle);
    } catch (err) {
      console.warn("Directory picker cancelled or not supported:", err);
    }
  };
  const handleFileChange = async (e) => {
    var _a2;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const nameLower = file.name.toLowerCase();
      if (!nameLower.endsWith(".pdf") && !nameLower.endsWith(".docx") && !nameLower.endsWith(".txt")) {
        showToast("Please select a PDF, Word (.docx), or plain text (.txt) file.", "warning");
        return;
      }
      if (!outputDir.trim()) {
        showToast("Choose an output directory before uploading your resume.", "warning");
        return;
      }
      setUploadedFile(file);
      setResumeFile(file.name);
      (_a2 = scanAbortControllerRef.current) == null ? void 0 : _a2.abort();
      scanCancelRef.current = false;
      scanAbortControllerRef.current = new AbortController();
      const scanSignal = scanAbortControllerRef.current.signal;
      setIsScanningResume(true);
      setScanComplete(false);
      setProfileUnlocked(false);
      let savedResumeNameLocal;
      try {
        setScanStatus("Saving resume to output directory...");
        savedResumeNameLocal = await saveResumeToDirectory(dirHandle, file, "base_resume");
        throwIfScanCancelled();
        if (savedResumeNameLocal) {
          setSavedResumeName(savedResumeNameLocal);
          setResumeFile(savedResumeNameLocal);
        }
      } catch (saveErr) {
        console.warn("Resume save deferred:", saveErr);
        showToast(
          saveErr instanceof Error ? saveErr.message : "Could not save resume to folder yet. It will be saved when you complete onboarding.",
          "warning"
        );
      }
      setScanStatus("Extracting text from document...");
      try {
        const extraction = await extractResumeDocumentText(file, scanSignal);
        throwIfScanCancelled();
        if (!extraction.text.trim()) {
          throw new Error("No readable text found in the document.");
        }
        setScanStatus("Structuring profile with AI...");
        const scanResult = await parseResumeWithAI(
          aiProvider,
          geminiApiKey.trim(),
          extraction.text,
          activeModel,
          file.name,
          setScanStatus,
          scanSignal,
          extraction.warnings
        );
        throwIfScanCancelled();
        const parsed = scanResult.resume;
        for (const warning of scanResult.warnings) {
          showToast(warning, scanResult.quality === "full" ? "info" : "warning");
        }
        setScanStatus("Matching core competencies...");
        await prepareFirestoreAccess(userId);
        throwIfScanCancelled();
        const globalCatalog = getBundledCoreCompetencyCatalog();
        const userProfile = await getUserCompetencyProfile(userId);
        throwIfScanCancelled();
        const mergeResult = mergeCompetenciesForUser(
          globalCatalog,
          userProfile,
          parsed.competencies || [],
          "scan"
        );
        await saveUserCompetencyProfile(userId, mergeResult.profile, { requireFirestore: true });
        throwIfScanCancelled();
        setScanStatus("Matching technical skills...");
        const globalSkillCatalog = getBundledCoreSkillCatalog();
        const userSkillProfile = await getUserSkillProfile(userId);
        throwIfScanCancelled();
        const skillMergeResult = mergeSkillsForUser(
          globalSkillCatalog,
          userSkillProfile,
          parsed.skills || [],
          "scan"
        );
        await saveUserSkillProfile(userId, skillMergeResult.profile, { requireFirestore: true });
        throwIfScanCancelled();
        populateFromScan({
          ...parsed,
          competencies: mergeResult.profileCompetencies.length > 0 ? mergeResult.profileCompetencies : parsed.competencies,
          skills: skillMergeResult.profileSkills.length > 0 ? skillMergeResult.profileSkills : parsed.skills || []
        });
        if (mergeResult.addedCustomCount > 0) {
          showToast(
            `Added ${mergeResult.addedCustomCount} scanned competenc${mergeResult.addedCustomCount === 1 ? "y" : "ies"} to your profile.`,
            "info"
          );
        } else if (mergeResult.matchedCatalogCount > 0 || mergeResult.matchedCustomCount > 0) {
          showToast("Resume competencies matched to the core competencies catalog.", "success");
        }
        if (mergeResult.skippedCount > 0) {
          showToast(
            `Custom competency limit (${MAX_USER_CUSTOM_COMPETENCIES}) reached — ${mergeResult.skippedCount} new competenc${mergeResult.skippedCount === 1 ? "y was" : "ies were"} kept in profile only.`,
            "warning"
          );
        }
        if (skillMergeResult.addedCustomCount > 0) {
          showToast(
            `Added ${skillMergeResult.addedCustomCount} scanned skill${skillMergeResult.addedCustomCount === 1 ? "" : "s"} to your profile.`,
            "info"
          );
        } else if (skillMergeResult.matchedCatalogCount > 0 || skillMergeResult.matchedCustomCount > 0) {
          showToast("Resume skills matched to the core skills catalog.", "success");
        }
        if (skillMergeResult.skippedCount > 0) {
          showToast(
            `Custom skill limit (${MAX_USER_CUSTOM_SKILLS}) reached — ${skillMergeResult.skippedCount} skill${skillMergeResult.skippedCount === 1 ? "" : "s"} kept in profile only.`,
            "warning"
          );
        }
        setScanComplete(true);
        setProfileUnlocked(true);
        setScanStatus(
          scanResult.quality === "full" ? "Scan complete — review and edit fields below." : "Scan imported partial data — review experience, skills, and contact fields below."
        );
      } catch (err) {
        if (isScanCancelledError(err)) {
          setScanStatus("");
          setProfileUnlocked(true);
          showToast("Resume scan stopped. You can enter details manually.", "info");
        } else {
          console.error("Resume scanning failed:", err);
          setScanStatus("");
          setProfileUnlocked(true);
          showToast(
            `${formatAiErrorToast(err, { provider: aiProvider, context: "resume_scan" })} You can still fill in fields manually.`,
            getAiErrorToastVariant(err, { provider: aiProvider, context: "resume_scan" })
          );
        }
      } finally {
        scanCancelRef.current = false;
        scanAbortControllerRef.current = null;
        setIsScanningResume(false);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !geminiApiKey.trim() || !outputDir.trim() || !resumeFile) {
      showToast("Please complete all required fields, including resume upload.", "warning");
      return;
    }
    setLoading(true);
    const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const suffix = userId ? `_${userId.slice(0, 5)}` : "";
    const customerId = `customer_${cleanFirst}_${cleanLast}${suffix}`;
    const parsedResume = buildParsedResumeFromForm({
      firstName,
      lastName,
      email,
      phone,
      city,
      state,
      country,
      postalCode,
      role,
      summary,
      competencies,
      skills,
      experience,
      education,
      currentCompany,
      currentlyWorking,
      linkedin,
      github,
      portfolio,
      website,
      otherLinks,
      languages,
      workAuthorizationUS,
      requiresSponsorship,
      resumeFile: savedResumeName || resumeFile,
      sourceFilePath: savedResumeName || resumeFile
    });
    const rulesJson = JSON.stringify(buildResumeRulesForCustomer(outputDir.trim()));
    const customerConfig = {
      customerId,
      aiProvider,
      aiModel: activeModel,
      geminiApiKey: geminiApiKey.trim(),
      outputDir: outputDir.trim(),
      resumeContext: resumeContext.trim() || void 0,
      candidateProfile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resume: savedResumeName || resumeFile
      },
      parsedResume
    };
    try {
      if (dirHandle && uploadedFile) {
        await saveResumeToDirectory(dirHandle, uploadedFile, "base_resume");
      }
      const baseProfile = parsedResumeToBaseProfile(parsedResume);
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        await new Promise((resolve) => {
          chrome.storage.local.set({
            customer_config: customerConfig,
            geminiApiKey: geminiApiKey.trim(),
            candidateProfile: baseProfile,
            resumeRules: rulesJson
          }, () => resolve());
        });
      } else {
        localStorage.setItem("customer_config", JSON.stringify(customerConfig));
        localStorage.setItem("geminiApiKey", geminiApiKey.trim());
        localStorage.setItem("candidateProfile", JSON.stringify(baseProfile));
        localStorage.setItem("resumeRules", rulesJson);
      }
      if (userId) {
        await saveCustomerConfig(userId, customerConfig);
        try {
          await prepareFirestoreAccess(userId);
          const globalCatalog = getBundledCoreCompetencyCatalog();
          const userProfile = await getUserCompetencyProfile(userId);
          const merged = mergeCompetenciesForUser(
            globalCatalog,
            userProfile,
            competencies.filter((c) => c.trim()),
            "manual"
          );
          await saveUserCompetencyProfile(userId, merged.profile, { requireFirestore: true });
          const globalSkillCatalog = getBundledCoreSkillCatalog();
          const userSkillProfile = await getUserSkillProfile(userId);
          const mergedSkills = mergeSkillsForUser(
            globalSkillCatalog,
            userSkillProfile,
            skills.filter((s) => s.trim()),
            "manual"
          );
          await saveUserSkillProfile(userId, mergedSkills.profile, { requireFirestore: true });
          showToast(
            `Profile saved: ${merged.profile.catalogRefs.length} competency refs, ${mergedSkills.profile.catalogRefs.length} skill refs.`,
            "success"
          );
        } catch (catalogErr) {
          console.error("User competency/skill profile sync failed:", catalogErr);
          showToast(
            "Profile saved, but competency/skill references failed to sync to Firestore. Open DevTools console for details.",
            "warning"
          );
        }
      }
      onComplete(customerConfig);
    } catch (err) {
      console.error("Failed to save onboarding configuration:", err);
      showToast("Could not save onboarding data. Check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  };
  const profileFieldsEnabled = profileUnlocked && !isScanningResume;
  const parsedResumeDraft = buildParsedResumeFromForm({
    firstName,
    lastName,
    email,
    phone,
    city,
    state,
    country,
    postalCode,
    role,
    summary,
    competencies,
    skills,
    experience,
    education,
    currentCompany,
    currentlyWorking,
    linkedin,
    github,
    portfolio,
    website,
    otherLinks,
    languages,
    workAuthorizationUS,
    requiresSponsorship,
    resumeFile: savedResumeName || resumeFile
  });
  const isFormValid = !!(firstName.trim() && lastName.trim() && email.trim() && phone.trim() && geminiApiKey.trim() && outputDir.trim() && resumeFile && isKeyVerified && profileUnlocked && isParsedResumeComplete(parsedResumeDraft));
  const getValidationResult = () => validateOnboardingForm({
    geminiApiKey,
    isKeyVerified,
    outputDir,
    resumeFile,
    isScanningResume,
    profileUnlocked,
    firstName,
    lastName,
    email,
    phone,
    parsedResumeDraft
  });
  const handleGetStartedClick = (e) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!isFormValid) {
      e.preventDefault();
      const { keys, messages } = getValidationResult();
      if (messages.length === 0) {
        showToast("Please complete all required fields.", "warning");
        return;
      }
      setInvalidFields(new Set(keys));
      scrollToFirstInvalidField(keys, formScrollRef.current);
      const preview = messages.slice(0, 4);
      const rest = messages.length - preview.length;
      const body = preview.join(" · ");
      const toastMessage = rest > 0 ? `Fix highlighted fields: ${body} · and ${rest} more.` : `Fix highlighted fields: ${body}.`;
      showToast(toastMessage, "warning");
    }
  };
  if (modelsLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 16,
          background: "var(--bg-color)",
          color: "var(--text-secondary)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "animate-spin",
              style: {
                width: 32,
                height: 32,
                border: "3px solid var(--brand-color)",
                borderTopColor: "transparent",
                borderRadius: "50%"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", fontWeight: 600 }, children: "Loading latest AI models..." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit: handleSubmit,
      style: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        background: "var(--bg-color)",
        color: "var(--text-primary)",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-color, rgba(255, 255, 255, 0.08))",
              background: "var(--bg-color)",
              zIndex: 10,
              position: "relative",
              flexShrink: 0
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLockup, { size: "sm" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
                fontFamily: "var(--font-title)",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "var(--brand)",
                margin: "0",
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                pointerEvents: "none"
              }, children: "Get Started" }),
              onSignOut ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  disabled: isSigningOut,
                  onClick: async () => {
                    if (isSigningOut) return;
                    setIsSigningOut(true);
                    try {
                      await onSignOut();
                    } catch (err) {
                      console.error("Sign out failed:", err);
                    } finally {
                      setIsSigningOut(false);
                    }
                  },
                  style: {
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: isSigningOut ? "wait" : "pointer",
                    padding: 8,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    opacity: isSigningOut ? 0.6 : 1
                  },
                  title: "Sign Out",
                  onMouseOver: (e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.color = "var(--danger-color)";
                  },
                  onMouseOut: (e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 18 })
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 34 } })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            ref: formScrollRef,
            className: "pane-content",
            style: { padding: "24px 24px 16px 24px", display: "flex", flexDirection: "column", gap: 20 },
            children: [
              invalidFields && invalidFields.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "onboarding-validation-banner", "data-field-key": Array.from(invalidFields)[0], children: "Please complete the highlighted fields below (shown in red)." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  style: {
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "rgba(255, 176, 46, 0.12)",
                    border: "1px solid rgba(255, 176, 46, 0.35)",
                    color: "var(--warning-color)",
                    fontSize: "0.72rem",
                    lineHeight: 1.4
                  },
                  children: ONBOARDING_DEV_REMINDER
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 500, margin: "0 auto", width: "100%" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", position: "relative" }, children: [
                    "AI Provider *",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        onMouseEnter: () => setShowTooltip(true),
                        onMouseLeave: () => setShowTooltip(false),
                        style: {
                          display: "inline-flex",
                          alignItems: "center",
                          cursor: "pointer",
                          color: "var(--text-muted, #94a3b8)",
                          position: "relative"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(HelpCircle, { size: 14 }),
                          showTooltip && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "span",
                            {
                              style: {
                                position: "absolute",
                                top: "100%",
                                left: "0px",
                                width: "260px",
                                backgroundColor: "var(--panel-bg, #1e293b)",
                                color: "var(--text-primary, #fff)",
                                border: "1px solid var(--panel-border, #334155)",
                                textAlign: "left",
                                borderRadius: "6px",
                                padding: "10px 12px",
                                zIndex: 1e3,
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                fontSize: "0.72rem",
                                fontWeight: 400,
                                lineHeight: "1.4",
                                whiteSpace: "normal",
                                marginTop: "4px"
                              },
                              children: [
                                aiProvider === "gemini" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: "How to get Gemini Key:" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { margin: "0 0 0 14px", padding: 0 }, children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Go to ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://aistudio.google.com/", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--brand)", textDecoration: "underline" }, children: "Google AI Studio" })
                                    ] }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Click ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Create API Key" })
                                    ] }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Copy the key and paste it below." })
                                  ] })
                                ] }),
                                aiProvider === "openai" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: "How to get OpenAI Key:" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { margin: "0 0 0 14px", padding: 0 }, children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Go to the ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://platform.openai.com/api-keys", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--brand)", textDecoration: "underline" }, children: "OpenAI Dashboard" })
                                    ] }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Click ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Create new secret key" })
                                    ] }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Copy the key and paste it below." })
                                  ] })
                                ] }),
                                aiProvider === "anthropic" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: "How to get Anthropic Key:" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { margin: "0 0 0 14px", padding: 0 }, children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Go to the ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://console.anthropic.com/settings/keys", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--brand)", textDecoration: "underline" }, children: "Anthropic Console" })
                                    ] }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Click ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Create Key" })
                                    ] }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Copy the key and paste it below." })
                                  ] })
                                ] }),
                                aiProvider === "grok" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: "How to get Grok Key:" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { margin: "0 0 0 14px", padding: 0 }, children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Sign up at ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://accounts.x.ai/", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--brand)", textDecoration: "underline" }, children: "accounts.x.ai" }),
                                      " and add credits"
                                    ] }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Open ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://console.x.ai/", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--brand)", textDecoration: "underline" }, children: "console.x.ai" }),
                                      " → ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "API Keys" })
                                    ] }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Create a key and enable ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Chat" }),
                                      " endpoint + ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "model" }),
                                      " access (new keys have none by default)"
                                    ] }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                      "Copy the key (starts with ",
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "xai-" }),
                                      ") and paste it below"
                                    ] })
                                  ] })
                                ] })
                              ]
                            }
                          )
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "select",
                    {
                      className: "form-control",
                      value: aiProvider,
                      onChange: (e) => {
                        const prov = e.target.value;
                        setAiProvider(prov);
                        setIsKeyVerified(false);
                      },
                      children: ["gemini", "openai", "anthropic", "grok"].map((provider) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: provider, children: getProviderSelectLabel(provider) }, provider))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: fieldGroupClass(invalidFields, "apiKey"), "data-field-key": "apiKey", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: fieldLabelStyle(invalidFields, "apiKey", { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { size: 12, style: { color: "var(--brand-color)" } }),
                    aiProvider === "gemini" ? "Gemini API Key *" : aiProvider === "openai" ? "OpenAI API Key *" : aiProvider === "anthropic" ? "Anthropic API Key *" : "xAI Grok API Key *"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, "data-field-key": (invalidFields == null ? void 0 : invalidFields.has("apiKeyNotVerified")) ? "apiKeyNotVerified" : void 0, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "password",
                        className: fieldControlClass(invalidFields, "apiKey"),
                        "data-field-key": "apiKey",
                        placeholder: `Enter your ${aiProvider} API key...`,
                        value: geminiApiKey,
                        onChange: (e) => {
                          setGeminiApiKey(e.target.value);
                          setIsKeyVerified(false);
                          clearInvalidField("apiKey");
                          clearInvalidField("apiKeyNotVerified");
                        },
                        required: true,
                        style: { flex: 1 }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        className: `btn${(invalidFields == null ? void 0 : invalidFields.has("apiKeyNotVerified")) ? " field-invalid" : ""}`,
                        "data-field-key": "apiKeyNotVerified",
                        disabled: isVerifyingKey || !geminiApiKey.trim(),
                        onClick: handleVerifyKey,
                        style: {
                          minWidth: 90,
                          fontSize: "0.8rem",
                          borderColor: isKeyVerified ? "var(--success-color)" : "var(--border-color)",
                          color: isKeyVerified ? "var(--success-color)" : "var(--text-secondary)"
                        },
                        children: isVerifyingKey ? "Verifying..." : isKeyVerified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 14 }),
                          " Verified"
                        ] }) : "Verify Key"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: fieldGroupClass(invalidFields, "outputDir"), "data-field-key": "outputDir", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: fieldLabelStyle(invalidFields, "outputDir", { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { size: 12, style: { color: "var(--brand-color)" } }),
                    " Output Directory *"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        className: fieldControlClass(invalidFields, "outputDir"),
                        "data-field-key": "outputDir",
                        value: outputDir,
                        placeholder: "Select local target directory...",
                        readOnly: true,
                        onClick: () => {
                          clearInvalidField("outputDir");
                          void pickOutputDirectory();
                        },
                        required: true,
                        style: { flex: 1, cursor: "pointer" }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn",
                        onClick: () => {
                          clearInvalidField("outputDir");
                          void pickOutputDirectory();
                        },
                        style: { padding: "0 12px", whiteSpace: "nowrap", fontSize: "0.8rem" },
                        children: "Choose..."
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("small", { style: { color: "var(--text-muted)", fontSize: "0.7rem", marginTop: 4, display: "block" }, children: "Select where tailored resumes will be saved" })
                ] }),
                computeExperienceYears(experience) > 10 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "form-group", style: { padding: 10, borderRadius: 8, background: "rgba(255, 128, 0, 0.06)", border: "1px dashed rgba(255, 128, 0, 0.25)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("small", { style: { color: "var(--text-secondary)", fontSize: "0.78rem", display: "block" }, children: "Profiles with 10+ years of experience often fit 2 pages better — the engine will recommend page count when you tailor each job." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12, style: { color: "var(--brand-color)" } }),
                    " Resume context ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "var(--text-muted)" }, children: "(optional)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      className: "form-control",
                      value: resumeContext,
                      onChange: (e) => setResumeContext(e.target.value),
                      placeholder: "Career themes, target roles, metrics to emphasize, industries to avoid, visa status, relocation preferences...",
                      rows: 3,
                      style: { resize: "vertical", fontSize: "0.82rem" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("small", { style: { color: "var(--text-muted)", fontSize: "0.7rem", marginTop: 4, display: "block" }, children: "Helps AI tailor summaries and answers. Ground truth only — do not invent facts here." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: fieldGroupClass(invalidFields, "resumeFile"), "data-field-key": "resumeFile", style: { opacity: isKeyVerified && outputDir.trim() ? 1 : 0.5 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: fieldLabelStyle(invalidFields, "resumeFile", { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 12, style: { color: "var(--brand-color)" } }),
                    " Resume Document (PDF / DOCX) *"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: `upload-dropzone${(invalidFields == null ? void 0 : invalidFields.has("resumeFile")) || (invalidFields == null ? void 0 : invalidFields.has("resumeScan")) ? " field-invalid" : ""}`,
                      "data-field-key": (invalidFields == null ? void 0 : invalidFields.has("resumeScan")) ? "resumeScan" : "resumeFile",
                      style: {
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `2px dashed ${isScanningResume ? "rgba(255, 255, 255, 0.35)" : "var(--panel-border)"}`,
                        borderRadius: "8px",
                        padding: "20px",
                        background: isScanningResume ? "rgba(255, 255, 255, 0.04)" : "var(--panel-bg)",
                        cursor: isKeyVerified && outputDir.trim() && !isScanningResume ? "pointer" : "not-allowed",
                        transition: "border-color 0.2s, background 0.2s"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "file",
                            accept: ".pdf,.docx,.txt",
                            onChange: handleFileChange,
                            disabled: !isKeyVerified || !outputDir.trim() || isScanningResume,
                            style: {
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              opacity: 0,
                              cursor: isKeyVerified && outputDir.trim() && !isScanningResume ? "pointer" : "not-allowed",
                              pointerEvents: isScanningResume ? "none" : "auto"
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", maxWidth: 320 }, children: isScanningResume ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin", style: { width: 24, height: 24, border: "2.5px solid var(--brand-color)", borderTopColor: "transparent", borderRadius: "50%" } }),
                          resumeFile && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }, children: resumeFile }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              style: {
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "var(--brand-color)",
                                textAlign: "center",
                                lineHeight: 1.35
                              },
                              children: scanStatus || "Scanning resume..."
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "button",
                            {
                              type: "button",
                              className: "btn",
                              onClick: (e) => {
                                e.stopPropagation();
                                handleStopScan();
                              },
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 4,
                                padding: "6px 14px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                                borderColor: "rgba(255, 255, 255, 0.25)",
                                background: "rgba(255, 255, 255, 0.06)"
                              },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 12, fill: "currentColor" }),
                                " Stop scan"
                              ]
                            }
                          )
                        ] }) : resumeFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 28, style: { color: "var(--brand-color)" } }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }, children: resumeFile }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "var(--text-muted)" }, children: scanComplete ? "Scan complete — click to replace" : "Uploaded — scan pending or failed" })
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 28, style: { color: "var(--text-secondary)" } }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }, children: "Upload PDF or Word Resume" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "var(--text-muted)" }, children: "Choose output directory first, then upload" })
                        ] }) })
                      ]
                    }
                  ),
                  resumeFile && !scanComplete && !isScanningResume && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      className: "btn",
                      style: { marginTop: 8, fontSize: "0.78rem", width: "100%" },
                      onClick: () => setProfileUnlocked(true),
                      children: "Enter profile manually"
                    }
                  ),
                  scanStatus && scanComplete && /* @__PURE__ */ jsxRuntimeExports.jsx("small", { style: { color: "var(--success-color)", fontSize: "0.72rem", marginTop: 6, display: "block" }, children: scanStatus })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16, opacity: profileFieldsEnabled ? 1 : 0.5 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "firstName", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: fieldLabelStyle(invalidFields, "firstName", { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 12, style: { color: "var(--brand-color)" } }),
                      " First Name *"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        className: fieldControlClass(invalidFields, "firstName"),
                        "data-field-key": "firstName",
                        value: firstName,
                        onChange: (e) => {
                          setFirstName(e.target.value);
                          clearInvalidField("firstName");
                        },
                        required: true,
                        disabled: !profileFieldsEnabled
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "lastName", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: fieldLabelStyle(invalidFields, "lastName", { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 12, style: { color: "var(--brand-color)" } }),
                      " Last Name *"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        className: fieldControlClass(invalidFields, "lastName"),
                        "data-field-key": "lastName",
                        value: lastName,
                        onChange: (e) => {
                          setLastName(e.target.value);
                          clearInvalidField("lastName");
                        },
                        required: true,
                        disabled: !profileFieldsEnabled
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "email", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: fieldLabelStyle(invalidFields, "email", { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 12, style: { color: "var(--brand-color)" } }),
                      " Email Address *"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "email",
                        className: fieldControlClass(invalidFields, "email"),
                        "data-field-key": "email",
                        value: email,
                        onChange: (e) => {
                          setEmail(e.target.value);
                          clearInvalidField("email");
                        },
                        required: true,
                        disabled: !profileFieldsEnabled
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", "data-field-key": "phone", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: fieldLabelStyle(invalidFields, "phone", { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 12, style: { color: "var(--brand-color)" } }),
                      " Phone Number *"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        className: fieldControlClass(invalidFields, "phone"),
                        "data-field-key": "phone",
                        placeholder: "e.g. 555-555-5555",
                        value: phone,
                        onChange: (e) => {
                          setPhone(e.target.value);
                          clearInvalidField("phone");
                        },
                        required: true,
                        disabled: !profileFieldsEnabled
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ResumeProfileSections,
                  {
                    invalidFields,
                    onClearInvalidField: clearInvalidField,
                    disabled: !profileFieldsEnabled,
                    city,
                    setCity,
                    state,
                    setState: setStateVal,
                    country,
                    setCountry,
                    postalCode,
                    setPostalCode,
                    role,
                    setRole,
                    summary,
                    setSummary,
                    competencies,
                    setCompetencies,
                    skills,
                    setSkills,
                    experience,
                    setExperience,
                    education,
                    setEducation,
                    currentCompany,
                    setCurrentCompany,
                    currentlyWorking,
                    setCurrentlyWorking,
                    linkedin,
                    setLinkedin,
                    github,
                    setGithub,
                    portfolio,
                    setPortfolio,
                    website,
                    setWebsite,
                    otherLinks,
                    setOtherLinks,
                    languages,
                    setLanguages,
                    workAuthorizationUS,
                    setWorkAuthorizationUS,
                    requiresSponsorship,
                    setRequiresSponsorship
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              padding: "16px 24px 24px 24px",
              borderTop: "1px solid var(--panel-border)",
              background: "var(--bg-color)",
              boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
              display: "flex",
              justifyContent: "center",
              zIndex: 5,
              flexShrink: 0
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                disabled: loading,
                onClick: handleGetStartedClick,
                className: "btn btn-primary",
                "aria-disabled": !isFormValid && !loading,
                style: {
                  width: "100%",
                  maxWidth: 500,
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  background: !isFormValid && !loading ? "var(--text-muted)" : "var(--brand)",
                  borderColor: "transparent",
                  cursor: loading ? "wait" : "pointer",
                  opacity: !isFormValid && !loading ? 0.6 : 1,
                  color: "#FFFFFF",
                  transition: "all 0.2s ease-in-out"
                },
                children: loading ? "Saving configs..." : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
                  " Get Started"
                ] })
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToastStack, { toasts, onDismiss: dismissToast })
      ]
    }
  );
}
const STAGE_LABELS = {
  queued: "Queued",
  tailoring: "Tailoring",
  tailored: "Ready to Apply",
  applying: "Applying",
  needs_review: "Review & Submit",
  applied: "Applied",
  failed: "Failed"
};
const STAGE_ORDER = [
  "queued",
  "tailoring",
  "tailored",
  "applying",
  "needs_review",
  "applied",
  "failed"
];
function stageIndex(stage) {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx >= 0 ? idx : 0;
}
function HomeScreen({
  jobs,
  pipelinePaused,
  isImporting,
  onAddCurrentTab,
  onTogglePause,
  onSelectJob,
  onDeleteJob,
  onMarkApplied,
  onRetry
}) {
  const activeCount = jobs.filter(
    (j) => ["queued", "tailoring", "tailored", "applying"].includes(j.pipelineStage || "")
  ).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "input-pane", style: { width: "100%", maxWidth: "100%", borderRight: "none" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pane-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Home" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: onTogglePause,
          className: "btn",
          title: pipelinePaused ? "Resume pipeline" : "Pause pipeline",
          style: { padding: "6px 10px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 6 },
          children: [
            pipelinePaused ? /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { size: 14 }),
            pipelinePaused ? "Resume" : "Pause"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pane-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "0.85rem", lineHeight: 1.55, color: "var(--text-secondary)" }, children: "Add a job from your open tab — we tailor in the background, then assist-apply one at a time." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onAddCurrentTab,
          disabled: isImporting,
          className: "btn btn-primary",
          style: {
            width: "100%",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          },
          children: isImporting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "animate-spin", size: 16 }),
            " Adding job..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 16 }),
            " Add + Tailor + Apply"
          ] })
        }
      ),
      pipelinePaused && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          style: {
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255, 193, 7, 0.1)",
            border: "1px solid rgba(255, 193, 7, 0.25)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)"
          },
          children: "Pipeline paused — new jobs queue but tailoring and apply are on hold."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { style: { margin: 0, fontSize: "0.9rem", fontWeight: 600 }, children: [
          "Pipeline (",
          jobs.length,
          ")"
        ] }),
        activeCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "var(--brand-color)", display: "flex", alignItems: "center", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
          " ",
          activeCount,
          " active"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "history-list", children: jobs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 20 }, children: "No jobs yet. Open a posting and tap Add above." }) : jobs.map((job) => {
        const stage = job.pipelineStage || "queued";
        const isActive = ["tailoring", "applying"].includes(stage);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "history-item",
            style: { cursor: "default", marginBottom: 8 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  onClick: () => onSelectJob(job),
                  style: { cursor: "pointer" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-item-header", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "job-title-text", title: job.jobTitle, children: job.jobTitle }),
                      jobListFitBadge(job) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "score-badge", children: jobListFitBadge(job) }) : job.atsScore > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "score-badge", children: [
                        job.atsScore,
                        "%"
                      ] }) : null
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "company-text", children: job.companyName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `status-badge ${stage === "failed" ? "failed" : stage === "applied" ? "completed" : "processing"}`, children: [
                        isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "animate-spin", size: 10, style: { marginRight: 4, display: "inline" } }),
                        STAGE_LABELS[stage]
                      ] }),
                      job.platform && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "var(--text-muted)", padding: "2px 6px", background: "var(--panel-bg-2)", borderRadius: 4 }, children: platformLabel(job.platform) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 4, marginTop: 8 }, children: STAGE_ORDER.slice(0, 5).map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        style: {
                          flex: 1,
                          height: 3,
                          borderRadius: 2,
                          background: stageIndex(stage) >= i ? "var(--brand-color)" : "rgba(255,255,255,0.08)"
                        }
                      },
                      s
                    )) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 }, children: [
                stage === "needs_review" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-primary",
                    style: { padding: "4px 10px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 },
                    onClick: () => onMarkApplied(job.id),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 12 }),
                      " Mark Submitted"
                    ]
                  }
                ),
                stage === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: "btn",
                    style: { padding: "4px 10px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 },
                    onClick: () => onRetry(job.id),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 12 }),
                      " Retry"
                    ]
                  }
                ),
                job.applyError && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: job.applyError, style: { display: "flex", alignItems: "center", color: "var(--danger-color)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => onSelectJob(job),
                    className: "btn",
                    style: { padding: "4px 8px" },
                    title: "View details",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => onDeleteJob(e, job.id),
                    className: "item-delete-btn",
                    title: "Remove job",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
                  }
                )
              ] })
            ]
          },
          job.id
        );
      }) })
    ] })
  ] });
}
const appConfig = {
  DASHBOARD_URL: "https://autoapplyai-3e61d.web.app/login"
};
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
async function revokeGoogleAccessToken(token) {
  const trimmed = token == null ? void 0 : token.trim();
  if (!trimmed) return false;
  try {
    const res = await fetch(GOOGLE_REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `token=${encodeURIComponent(trimmed)}`
    });
    return res.ok || res.status === 400;
  } catch {
    return false;
  }
}
async function removeChromeCachedAuthToken(token) {
  var _a2;
  if (typeof chrome === "undefined" || !((_a2 = chrome.identity) == null ? void 0 : _a2.removeCachedAuthToken) || !(token == null ? void 0 : token.trim())) {
    return;
  }
  await new Promise((resolve) => {
    chrome.identity.removeCachedAuthToken({ token: token.trim() }, () => resolve());
  });
}
async function clearChromeCachedAuthTokens() {
  if (typeof chrome === "undefined" || !chrome.identity) return;
  if (chrome.identity.clearAllCachedAuthTokens) {
    await new Promise((resolve) => {
      chrome.identity.clearAllCachedAuthTokens(() => resolve());
    });
    return;
  }
  if (!chrome.identity.getAuthToken) return;
  await new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (cachedToken) => {
      if (chrome.runtime.lastError || !cachedToken) {
        resolve();
        return;
      }
      chrome.identity.removeCachedAuthToken({ token: cachedToken }, () => resolve());
    });
  });
}
async function signOutGoogleAuth(storedToken) {
  await clearChromeCachedAuthTokens();
  const token = storedToken == null ? void 0 : storedToken.trim();
  if (token) {
    await removeChromeCachedAuthToken(token);
    await revokeGoogleAccessToken(token);
  }
}
function isInvalidCredentialError(err) {
  if (!err || typeof err !== "object") return false;
  const code = err.code;
  const message = err.message || String(err);
  return code === "auth/invalid-credential" || message.includes("invalid-credential");
}
function getFreshChromeToken(interactive) {
  return new Promise((resolve) => {
    var _a2;
    if (typeof chrome === "undefined" || !((_a2 = chrome.identity) == null ? void 0 : _a2.getAuthToken)) {
      resolve(null);
      return;
    }
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        resolve(null);
        return;
      }
      resolve(token);
    });
  });
}
async function signInWithFreshChromeToken(token) {
  try {
    return await signInWithChromeToken(token);
  } catch (err) {
    if (isInvalidCredentialError(err)) {
      await removeChromeCachedAuthToken(token);
    }
    throw err;
  }
}
async function trySilentChromeAuthRefresh() {
  const token = await getFreshChromeToken(false);
  if (!token) return { user: null, token: null };
  try {
    const user = await signInWithFreshChromeToken(token);
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}
function buildBasicUserConfig(user, token, prev) {
  var _a2, _b, _c;
  const parts = (user.displayName || "").trim().split(/\s+/);
  return {
    uid: user.uid,
    token,
    profile: {
      firstName: parts[0] || ((_a2 = prev == null ? void 0 : prev.profile) == null ? void 0 : _a2.firstName) || "",
      lastName: parts.slice(1).join(" ") || ((_b = prev == null ? void 0 : prev.profile) == null ? void 0 : _b.lastName) || "",
      email: user.email || ((_c = prev == null ? void 0 : prev.profile) == null ? void 0 : _c.email) || ""
    }
  };
}
async function clearStaleBasicUserToken(config) {
  const next = { ...config, token: "" };
  await setChromeLocal({ basic_user_config: next });
  if (config.token) {
    await removeChromeCachedAuthToken(config.token);
  }
  return next;
}
const DEFAULT_RULES = {
  profile: {
    candidate_name: "f_name l_name",
    output_naming_convention: "f_name_resume_{company}_{title}"
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
  firstName: "f_name",
  lastName: "l_name",
  email: "f_namel_name@gmail.com",
  phone: "555-555-5555",
  location: "Prosper, TX 75078",
  linkedin: "linkedin.com/in/f_namel_name",
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
const isConfigComplete = isCustomerConfigComplete;
function App() {
  var _a2, _b, _c, _d, _e, _f;
  const [currentUser, setCurrentUser] = reactExports.useState(null);
  const [jobs, setJobs] = reactExports.useState([]);
  const [selectedJob, setSelectedJob] = reactExports.useState(null);
  const [candidateProfile, setCandidateProfile] = reactExports.useState(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] = reactExports.useState(DEFAULT_PROFILE);
  const [settingsTab, setSettingsTab] = reactExports.useState("api");
  const [isImportingJob, setIsImportingJob] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("analysis");
  const [currentView, setCurrentView] = reactExports.useState("home");
  const [pipelinePaused, setPipelinePaused] = reactExports.useState(false);
  const [authLoading, setAuthLoading] = reactExports.useState(true);
  const [configLoading, setConfigLoading] = reactExports.useState(true);
  const [isRefreshing, setIsRefreshing] = reactExports.useState(false);
  const [customerConfig, setCustomerConfig] = reactExports.useState(null);
  const [basicUserConfig, setBasicUserConfig] = reactExports.useState(null);
  const [storageLoaded, setStorageLoaded] = reactExports.useState(false);
  const [showSettings, setShowSettings] = reactExports.useState(false);
  const [apiKey, setApiKey] = reactExports.useState("");
  const [draftProvider, setDraftProvider] = reactExports.useState("gemini");
  const [draftModel, setDraftModel] = reactExports.useState("");
  const [settingsModels, setSettingsModels] = reactExports.useState([]);
  const [showSettingsTooltip, setShowSettingsTooltip] = reactExports.useState(false);
  const [showApiKey, setShowApiKey] = reactExports.useState(false);
  const [customRules, setCustomRules] = reactExports.useState(JSON.stringify(DEFAULT_RULES, null, 2));
  const [syncApiKeyToCloud, setSyncApiKeyToCloud] = reactExports.useState(false);
  const [encryptApiKey, setEncryptApiKey] = reactExports.useState(false);
  const [cloudPassphrase, setCloudPassphrase] = reactExports.useState("");
  const [passphrasePromptOpen, setPassphrasePromptOpen] = reactExports.useState(false);
  const [passphraseInput, setPassphraseInput] = reactExports.useState("");
  const [encryptedKeyCiphertext, setEncryptedKeyCiphertext] = reactExports.useState("");
  const [decryptionError, setDecryptionError] = reactExports.useState("");
  const [debugLogs, setDebugLogs] = reactExports.useState([]);
  const logDebug = (msg, ...args) => {
    const formatted = msg + (args.length ? " " + args.map((a) => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ") : "");
    console.log("[DEBUG]", formatted);
    setDebugLogs((prev) => [...prev.slice(-49), `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${formatted}`]);
  };
  const { toasts, showToast, dismissToast } = useToast();
  const withToasts = (node) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    node,
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToastStack, { toasts, onDismiss: dismissToast })
  ] });
  const [isLoggedInFlag, setIsLoggedInFlag] = reactExports.useState(false);
  const [isSigningIn, setIsSigningIn] = reactExports.useState(false);
  const [sessionNeedsRefresh, setSessionNeedsRefresh] = reactExports.useState(false);
  const isSigningOutRef = reactExports.useRef(false);
  const openSettings = () => {
    setDraftProfile({ ...candidateProfile });
    setDraftProvider((customerConfig == null ? void 0 : customerConfig.aiProvider) || "gemini");
    setDraftModel((customerConfig == null ? void 0 : customerConfig.aiModel) || "");
    setSettingsTab("api");
    getChromeLocal(["syncApiKeyToCloud", "encryptApiKey", "cloudPassphrase"]).then((res) => {
      setSyncApiKeyToCloud(!!res.syncApiKeyToCloud);
      setEncryptApiKey(!!res.encryptApiKey);
      setCloudPassphrase(res.cloudPassphrase || "");
    });
    setShowSettings(true);
  };
  reactExports.useEffect(() => {
    if (showSettings && apiKey.trim()) {
      __vitePreload(async () => {
        const { fetchAvailableModels: fetchAvailableModels2 } = await import("./errorboundary-CPEENljf.js").then((n) => n.aS);
        return { fetchAvailableModels: fetchAvailableModels2 };
      }, true ? __vite__mapDeps([0,1,2,3]) : void 0).then(({ fetchAvailableModels: fetchAvailableModels2 }) => {
        fetchAvailableModels2(draftProvider, apiKey.trim()).then((modelList) => {
          setSettingsModels(modelList);
          if (!modelList.includes(draftModel)) {
            setDraftModel((customerConfig == null ? void 0 : customerConfig.aiModel) || modelList[0] || "");
          }
        });
      });
    } else {
      setSettingsModels([]);
    }
  }, [showSettings, draftProvider, apiKey]);
  reactExports.useEffect(() => {
    loadPipelineSettings().then((s) => setPipelinePaused(s.paused));
    loadPipelineQueue().then(setJobs);
    loadLocalSettings().then((res) => {
      if (res.geminiApiKey) setApiKey(res.geminiApiKey);
      if (res.resumeRules) setCustomRules(res.resumeRules);
      if (res.candidateProfile) setCandidateProfile(res.candidateProfile);
    });
    getChromeLocal(["customer_config", "basic_user_config", "is_logged_in"]).then((res) => {
      if (res.is_logged_in) {
        setIsLoggedInFlag(true);
      }
      if (res.customer_config) {
        const config = res.customer_config;
        const isComplete = isConfigComplete(config);
        if (isComplete) {
          setConfigLoading(false);
        }
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
      if (res.basic_user_config) {
        setBasicUserConfig(res.basic_user_config);
      }
      setStorageLoaded(true);
    });
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
          setChromeLocal({ userId: user.uid });
          const syncCloudData = async () => {
            const authReady = await prepareFirestoreAccess(user.uid);
            if (!authReady) {
              logDebug("Firestore auth not ready yet. Skipping cloud sync until token refresh succeeds.");
              setConfigLoading(false);
              return;
            }
            unsubJobs = subscribeToJobs(user.uid, (syncedJobs) => {
              void loadPipelineQueue().then((pipeline) => {
                setJobs(mergePipelineWithFirestore(pipeline, syncedJobs));
              });
            });
            getCustomerConfig(user.uid).then((cloudConfig) => {
              if (cloudConfig) {
                setCustomerConfig(cloudConfig);
                setApiKey(cloudConfig.geminiApiKey);
                const isComplete = isConfigComplete(cloudConfig);
                if (isComplete) {
                  setChromeLocal({
                    customer_config: cloudConfig,
                    is_logged_in: true
                  }).then(() => {
                    logDebug("Cloud config is complete. Auto-skipping onboarding.");
                    setIsLoggedInFlag(true);
                  });
                } else {
                  setChromeLocal({ customer_config: cloudConfig });
                }
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
            getCloudApiKey(user.uid).then((cloudDoc) => {
              if (cloudDoc) {
                if (!cloudDoc.encrypted) {
                  setApiKey(cloudDoc.key);
                  setChromeLocal({ geminiApiKey: cloudDoc.key });
                } else {
                  getChromeLocal(["cloudPassphrase"]).then((store) => {
                    const savedPassphrase = store.cloudPassphrase || "";
                    if (savedPassphrase) {
                      decryptKey(cloudDoc.key, savedPassphrase).then((decrypted) => {
                        setApiKey(decrypted);
                        setChromeLocal({ geminiApiKey: decrypted });
                      }).catch(() => {
                        setEncryptedKeyCiphertext(cloudDoc.key);
                        setPassphrasePromptOpen(true);
                      });
                    } else {
                      setEncryptedKeyCiphertext(cloudDoc.key);
                      setPassphrasePromptOpen(true);
                    }
                  });
                }
              }
            }).catch((err) => {
              console.warn("Failed to get cloud API key:", err);
            });
          };
          syncCloudData();
        } else {
          setConfigLoading(false);
          removeChromeLocal("userId");
          if (isSigningOutRef.current) {
            logDebug("Sign-out in progress. Bypassing reloading local settings.");
            isSigningOutRef.current = false;
            setJobs([]);
            setCandidateProfile(DEFAULT_PROFILE);
          } else {
            loadLocalSettings().then((res) => {
              setJobs(res.localHistory || []);
              setCandidateProfile(res.candidateProfile || DEFAULT_PROFILE);
            });
          }
        }
      });
      const handleStorageChange = (changes, areaName) => {
        if (areaName === "local") {
          if (changes.customer_config) {
            const newConfig = changes.customer_config.newValue || null;
            setCustomerConfig(newConfig);
            if (newConfig) {
              setApiKey(newConfig.geminiApiKey);
              if (newConfig.candidateProfile) {
                setCandidateProfile((prev) => ({
                  ...prev,
                  firstName: newConfig.candidateProfile.firstName,
                  lastName: newConfig.candidateProfile.lastName,
                  email: newConfig.candidateProfile.email,
                  phone: newConfig.candidateProfile.phone
                }));
              }
            }
          }
          if (changes.basic_user_config) {
            setBasicUserConfig(changes.basic_user_config.newValue || null);
          }
        }
      };
      const removeStorageListener = addChromeLocalChangedListener(handleStorageChange);
      return () => {
        unsubAuth();
        if (unsubJobs) unsubJobs();
        removeStorageListener();
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
  const refreshPipeline = async () => {
    const queue = await loadPipelineQueue();
    setJobs(queue);
  };
  const persistArtifactsForJobId = async (jobId) => {
    const queue = await loadPipelineQueue();
    const job = queue.find((j) => j.id === jobId);
    if (!job || job.pipelineStage !== "tailored") return;
    try {
      const rules = JSON.parse(customRules);
      await saveArtifactsForJob(job, rules, candidateProfile, customerConfig == null ? void 0 : customerConfig.parsedResume);
      await refreshPipeline();
    } catch (err) {
      console.warn("Artifact save failed:", err);
    }
  };
  reactExports.useEffect(() => {
    const onStorage = (changes, area) => {
      if (area !== "local") return;
      if (changes.pipeline_queue_v1 || changes.localHistory) {
        void refreshPipeline();
      }
      if (changes.pipeline_settings_v1) {
        const next = changes.pipeline_settings_v1.newValue;
        if (next && typeof next.paused === "boolean") setPipelinePaused(next.paused);
      }
    };
    const removePipelineStorage = addChromeLocalChangedListener(onStorage);
    const onMessage = (message, _sender, sendResponse) => {
      if (message.action === "PIPELINE_UPDATED") {
        void refreshPipeline();
        return;
      }
      if (message.action === "SAVE_JOB_ARTIFACTS" && message.jobId) {
        void persistArtifactsForJobId(message.jobId).then(() => sendResponse({ success: true }));
        return true;
      }
      return false;
    };
    chrome.runtime.onMessage.addListener(onMessage);
    void chrome.runtime.sendMessage({ action: "PROCESS_PIPELINE" }).catch(() => {
    });
    return () => {
      removePipelineStorage();
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, [customRules, candidateProfile]);
  reactExports.useEffect(() => {
    const hasActiveTailoring = jobs.some(isJobActivelyTailoring);
    if (!hasActiveTailoring) return;
    const tick = () => {
      void refreshPipeline();
      void chrome.runtime.sendMessage({ action: "PROCESS_PIPELINE" }).catch(() => {
      });
    };
    tick();
    const interval = setInterval(tick, 8e3);
    return () => clearInterval(interval);
  }, [jobs]);
  const handleTogglePipelinePause = async () => {
    const next = !pipelinePaused;
    setPipelinePaused(next);
    await chrome.runtime.sendMessage({ action: "SET_PIPELINE_PAUSED", paused: next });
    showToast(next ? "Pipeline paused." : "Pipeline resumed.", "success");
  };
  const handleMarkApplied = async (jobId) => {
    await chrome.runtime.sendMessage({ action: "MARK_JOB_APPLIED", jobId });
    showToast("Marked as submitted.", "success");
    await refreshPipeline();
  };
  const handleRetryPipeline = async (jobId) => {
    await chrome.runtime.sendMessage({ action: "RETRY_PIPELINE_JOB", jobId });
    showToast("Job re-queued.", "success");
    await refreshPipeline();
  };
  const addCurrentTabToPipeline = async () => {
    var _a3;
    if (!apiKey) {
      showToast("API key is missing. Configure it in Settings.", "warning");
      openSettings();
      return;
    }
    setIsImportingJob(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!(tab == null ? void 0 : tab.id) || !((_a3 = tab.url) == null ? void 0 : _a3.startsWith("http"))) {
        showToast("Open a job posting in the browser tab first.", "warning");
        return;
      }
      let jobDescription = "";
      let jobUrl = tab.url;
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_JOB_DETAILS" });
        if ((response == null ? void 0 : response.success) && response.jobDescription) {
          jobDescription = response.jobDescription;
          jobUrl = response.url || tab.url;
        }
      } catch {
        try {
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
          await new Promise((r) => setTimeout(r, 200));
          const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_JOB_DETAILS" });
          if ((response == null ? void 0 : response.success) && response.jobDescription) {
            jobDescription = response.jobDescription;
            jobUrl = response.url || tab.url;
          }
        } catch (injectErr) {
          const msg = injectErr instanceof Error ? injectErr.message : String(injectErr);
          if (msg.includes("Extension manifest must request permission")) {
            showToast(
              "This job site is not allowed yet. Rebuild and reload the extension, then try again.",
              "error"
            );
            return;
          }
        }
      }
      if (!jobDescription || jobDescription.trim().length < 50) {
        const onAshbyApply = /jobs\.ashbyhq\.com/i.test(jobUrl) && /\/application/i.test(jobUrl);
        showToast(
          onAshbyApply ? "On Ashby, open the job posting page (not the application form), then try Add again." : "Could not read a job description on this page.",
          "warning"
        );
        return;
      }
      const resp = await chrome.runtime.sendMessage({
        action: "ENQUEUE_PIPELINE_JOB",
        jobDescription: jobDescription.trim(),
        jobUrl,
        sourceTabId: tab.id
      });
      if (!(resp == null ? void 0 : resp.success)) {
        showToast((resp == null ? void 0 : resp.error) || "Failed to enqueue job.", "error");
        return;
      }
      showToast("Job added — tailoring starts in the background.", "success");
      await refreshPipeline();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Extension manifest must request permission")) {
        showToast("Reload the extension at chrome://extensions after updating.", "error");
      } else {
        showToast("Could not add job from the open tab.", "error");
      }
    } finally {
      setIsImportingJob(false);
    }
  };
  reactExports.useEffect(() => {
    const handleExternalMessage = (message, _sender, sendResponse) => {
      if (message.type === "SIGN_IN_CREDENTIALS") {
        const { idToken, accessToken } = message;
        signInWithGoogleTokens(idToken, accessToken).then((user) => {
          if (user) {
            const parts = (user.displayName || "").trim().split(/\s+/);
            const basicConfig = {
              uid: user.uid,
              token: idToken,
              profile: {
                firstName: parts[0] || "",
                lastName: parts.slice(1).join(" ") || "",
                email: user.email || ""
              }
            };
            chrome.storage.local.set({ basic_user_config: basicConfig }, () => {
              sendResponse({ success: true });
            });
          } else {
            sendResponse({ success: false, error: "User is null" });
          }
        }).catch((err) => {
          console.error("External login failed:", err);
          sendResponse({ success: false, error: err.message });
        });
        return true;
      }
    };
    try {
      chrome.runtime.onMessageExternal.addListener(handleExternalMessage);
      return () => {
        chrome.runtime.onMessageExternal.removeListener(handleExternalMessage);
      };
    } catch (e) {
      console.warn("onMessageExternal not available in this context:", e);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!storageLoaded) return;
    if (basicUserConfig && basicUserConfig.token) {
      if (!currentUser || currentUser.uid !== basicUserConfig.uid) {
        logDebug("Sync active: basicUserConfig token found, but currentUser is mismatched or null. Authenticating...");
        setAuthLoading(true);
        const isAccessToken = basicUserConfig.token.startsWith("ya29.");
        const signInPromise = isAccessToken ? signInWithChromeToken(basicUserConfig.token) : signInWithGoogleTokens(basicUserConfig.token, null);
        signInPromise.then((user) => {
          if (user) {
            setSessionNeedsRefresh(false);
            logDebug("Successfully logged in extension via stored basicUserConfig token.");
            if (user.uid !== basicUserConfig.uid) {
              logDebug("UID mismatch during sync. Updating basic_user_config with new UID:", user.uid);
              const updatedConfig = buildBasicUserConfig(user, basicUserConfig.token, basicUserConfig);
              chrome.storage.local.set({ basic_user_config: updatedConfig }, () => {
                setBasicUserConfig(updatedConfig);
              });
            }
          }
        }).catch(async (err) => {
          var _a3;
          const expired = isInvalidCredentialError(err);
          if (expired) {
            logDebug("Stored Google token expired — clearing cache and trying silent refresh.");
          } else {
            logDebug("Failed to sign in with stored token:", err);
          }
          const clearedConfig = await clearStaleBasicUserToken(basicUserConfig);
          setBasicUserConfig(clearedConfig);
          const { user: refreshedUser, token: freshToken } = await trySilentChromeAuthRefresh();
          if (refreshedUser && freshToken) {
            const updatedConfig = buildBasicUserConfig(refreshedUser, freshToken, basicUserConfig);
            await setChromeLocal({ basic_user_config: updatedConfig });
            setBasicUserConfig(updatedConfig);
            setSessionNeedsRefresh(false);
            logDebug("Silent auth refresh succeeded.");
            return;
          }
          setSessionNeedsRefresh(true);
          if (typeof chrome !== "undefined" && ((_a3 = chrome.storage) == null ? void 0 : _a3.local)) {
            chrome.storage.local.get(["customer_config"], (res) => {
              if (res.customer_config) {
                logDebug("Local profile kept — tap Sync via Google to restore cloud sync.");
                return;
              }
              handleSignOut();
            });
          } else {
            handleSignOut();
          }
        }).finally(() => {
          setAuthLoading(false);
        });
      } else if (currentUser) {
        prepareFirestoreAccess(currentUser.uid).then((ready) => {
          if (!ready) return;
          getCustomerConfig(currentUser.uid).then((cloudConfig) => {
            if (cloudConfig) {
              setCustomerConfig(cloudConfig);
              setApiKey(cloudConfig.geminiApiKey);
              chrome.storage.local.set({ customer_config: cloudConfig });
            }
          });
          getCloudApiKey(currentUser.uid).then((cloudDoc) => {
            if (cloudDoc && !cloudDoc.encrypted) {
              setApiKey(cloudDoc.key);
              chrome.storage.local.set({ geminiApiKey: cloudDoc.key });
            }
          });
        });
      }
    } else {
      if (currentUser && auth) {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(["basic_user_config"], (res) => {
            if (!res.basic_user_config) {
              logDebug("No stored basicUserConfig found in storage. Triggering full sign-out.");
              handleSignOut();
            } else {
              logDebug("Stored config found in storage during sync, bypassing accidental logout.");
            }
          });
        } else {
          logDebug("No chrome storage available. Triggering full sign-out.");
          handleSignOut();
        }
      }
    }
  }, [basicUserConfig, currentUser, storageLoaded]);
  const handleGoogleSignIn = async () => {
    if (isSigningIn) {
      logDebug("Sign-in already in progress. Ignoring duplicate request.");
      return;
    }
    try {
      logDebug("handleGoogleSignIn invoked. Fetching fresh token directly via user gesture.");
      setIsSigningIn(true);
      if (typeof chrome !== "undefined" && chrome.identity) {
        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
          if (chrome.runtime.lastError) {
            const errMsg = chrome.runtime.lastError.message || "Google Sign-In cancelled or failed.";
            logDebug("chrome.runtime.lastError during getAuthToken:", errMsg);
            showToast("Authentication failed: " + errMsg, "error");
            setIsSigningIn(false);
            return;
          }
          if (!token) {
            logDebug("No token returned by chrome.identity.getAuthToken.");
            showToast("Authentication failed: No token was returned.", "error");
            setIsSigningIn(false);
            return;
          }
          logDebug("Token received:", token.substring(0, 15) + "...");
          try {
            const user = await signInWithFreshChromeToken(token);
            if (user) {
              setSessionNeedsRefresh(false);
              logDebug("Firebase Sign-in successful for UID:", user.uid);
              const basicConfig = buildBasicUserConfig(user, token);
              chrome.storage.local.set({ basic_user_config: basicConfig }, () => {
                logDebug("basic_user_config saved to storage.");
                setBasicUserConfig(basicConfig);
                logDebug("Direct Google Sign-in complete.");
                setIsSigningIn(false);
              });
            } else {
              logDebug("signInWithChromeToken returned null user.");
              showToast("Failed to link native auth token to Firebase.", "error");
              setIsSigningIn(false);
            }
          } catch (err) {
            logDebug("Firebase Auth error during sign-in:", err);
            if (chrome.identity && token) {
              chrome.identity.removeCachedAuthToken({ token }, () => {
                logDebug("Cleared invalid token from Chrome cache.");
              });
            }
            showToast(
              isInvalidCredentialError(err) ? "Google session expired. Try signing in again." : "Firebase login error: " + formatAiErrorToast(err, { context: "generic" }),
              "error"
            );
            setIsSigningIn(false);
          }
        });
      } else {
        logDebug("chrome.identity is not available in this context.");
        showToast("Google Sign-In is only available in the Chrome extension.", "warning");
        setIsSigningIn(false);
      }
    } catch (e) {
      logDebug("Failed to initiate Google Sign-In:", e);
      showToast("Google Sign-In failed: " + e.message, "error");
      setIsSigningIn(false);
    }
  };
  const handleSignOut = async () => {
    var _a3;
    logDebug("handleSignOut triggered. Wiping session and storage.");
    isSigningOutRef.current = true;
    const tokenToClear = basicUserConfig == null ? void 0 : basicUserConfig.token;
    setCurrentUser(null);
    setCustomerConfig(null);
    setBasicUserConfig(null);
    setApiKey("");
    setCustomRules(JSON.stringify(DEFAULT_RULES, null, 2));
    setCandidateProfile(DEFAULT_PROFILE);
    setDraftProfile(DEFAULT_PROFILE);
    setJobs([]);
    setSelectedJob(null);
    setIsLoggedInFlag(false);
    try {
      await clearAllLocalAppData();
      logDebug("Local app data cleared.");
    } catch (err) {
      logDebug("Local data clear error:", err);
    }
    if (auth) {
      try {
        await signOut(auth);
        logDebug("Signed out of Firebase Auth.");
      } catch (err) {
        logDebug("Sign out error:", err);
      }
    }
    try {
      await signOutGoogleAuth(tokenToClear);
      logDebug("Google OAuth session cleared.");
    } catch (e) {
      logDebug("Google OAuth sign-out helper failed:", e);
    }
    if (typeof chrome !== "undefined" && ((_a3 = chrome.runtime) == null ? void 0 : _a3.sendMessage)) {
      try {
        await chrome.runtime.sendMessage({ action: "CLEAR_LOCAL_DATA" });
      } catch {
      }
    }
    if (typeof chrome !== "undefined" && chrome.tabs) {
      const dashboardUrlPattern = `${appConfig.DASHBOARD_URL.replace(/\/login$/, "")}/*`;
      chrome.tabs.query({ url: dashboardUrlPattern }, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: "SIGN_OUT" }).catch(() => {
            });
          }
        });
      });
    }
  };
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const [localSettings, pipelineSettings, pipelineQueue, chromeLocal] = await Promise.all([
        loadLocalSettings(),
        loadPipelineSettings(),
        loadPipelineQueue(),
        getChromeLocal(["customer_config", "basic_user_config"])
      ]);
      if (localSettings.geminiApiKey) setApiKey(localSettings.geminiApiKey);
      if (localSettings.resumeRules) setCustomRules(localSettings.resumeRules);
      if (localSettings.candidateProfile) setCandidateProfile(localSettings.candidateProfile);
      setPipelinePaused(pipelineSettings.paused);
      if (chromeLocal.customer_config) {
        const config = chromeLocal.customer_config;
        setCustomerConfig(config);
        if (config.geminiApiKey) setApiKey(config.geminiApiKey);
      }
      if (chromeLocal.basic_user_config) {
        setBasicUserConfig(chromeLocal.basic_user_config);
      }
      let mergedJobs = pipelineQueue;
      if (currentUser) {
        const authReady = await prepareFirestoreAccess(currentUser.uid);
        if (authReady) {
          const [prof, cloudConfig, firestoreJobs] = await Promise.all([
            getUserProfile(currentUser.uid),
            getCustomerConfig(currentUser.uid),
            getJobsFromDb(currentUser.uid)
          ]);
          if (prof) setCandidateProfile(prof);
          if (cloudConfig) {
            setCustomerConfig(cloudConfig);
            setApiKey(cloudConfig.geminiApiKey);
            await setChromeLocal({ customer_config: cloudConfig });
          }
          mergedJobs = mergePipelineWithFirestore(pipelineQueue, firestoreJobs);
        }
      }
      setJobs(mergedJobs);
      await chrome.runtime.sendMessage({ action: "PROCESS_PIPELINE" });
      showToast("Queue refreshed.", "success");
    } catch (err) {
      console.error("Refresh failed:", err);
      showToast("Refresh failed. Try again.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };
  const handleSaveSettings = async () => {
    try {
      if (syncApiKeyToCloud && encryptApiKey && !cloudPassphrase) {
        showToast("Enter a passphrase to encrypt your API key.", "warning");
        return;
      }
      await saveSettings(apiKey, customRules, draftProfile, currentUser == null ? void 0 : currentUser.uid);
      setCandidateProfile(draftProfile);
      if (customerConfig) {
        const updatedConfig = {
          ...customerConfig,
          aiProvider: draftProvider,
          aiModel: draftModel,
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
        await new Promise((resolve) => {
          chrome.storage.local.set({ customer_config: updatedConfig }, () => resolve());
        });
        if (currentUser) {
          await saveCustomerConfig(currentUser.uid, updatedConfig);
        }
      }
      await new Promise((resolve) => {
        chrome.storage.local.set({
          syncApiKeyToCloud,
          encryptApiKey,
          cloudPassphrase
        }, () => resolve());
      });
      if (currentUser) {
        if (syncApiKeyToCloud) {
          if (encryptApiKey) {
            const cipher = await encryptKey(apiKey, cloudPassphrase);
            await saveCloudApiKey(currentUser.uid, { encrypted: true, key: cipher });
          } else {
            await saveCloudApiKey(currentUser.uid, { encrypted: false, key: apiKey });
          }
        } else {
          await saveCloudApiKey(currentUser.uid, null);
        }
      }
      setShowSettings(false);
      showToast("Settings saved successfully.", "success");
    } catch (e) {
      showToast("Invalid JSON in Resume Rules config.", "error");
    }
  };
  const handleDeleteJob = async (e, jobId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this job record?")) return;
    try {
      const resp = await chrome.runtime.sendMessage({ action: "DELETE_PIPELINE_JOB", jobId });
      if ((resp == null ? void 0 : resp.success) === false) {
        showToast((resp == null ? void 0 : resp.error) || "Failed to remove job.", "error");
        return;
      }
      if (currentUser) {
        await deleteJobFromDb(currentUser.uid, jobId);
      }
      const updated = (resp == null ? void 0 : resp.jobs) ?? await loadPipelineQueue();
      setJobs(updated);
      if ((selectedJob == null ? void 0 : selectedJob.id) === jobId) {
        setSelectedJob(null);
        setCurrentView("home");
      }
      showToast("Job removed.", "success");
    } catch (err) {
      console.error("Delete job failed:", err);
      showToast("Failed to remove job.", "error");
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard.", "success");
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
    return buildResumeLatex(job, rules, candidateProfile, customerConfig == null ? void 0 : customerConfig.parsedResume);
  };
  const getCoverLetterLatex = (job) => {
    const rules = JSON.parse(customRules);
    return buildCoverLetterLatex(job, rules, candidateProfile, customerConfig == null ? void 0 : customerConfig.parsedResume);
  };
  const handlePrint = () => {
    var _a3, _b2, _c2;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const printStyles = `
      body {
        font-family: 'Times New Roman', Times, serif;
        color: #000;
        padding: 0.35in;
        line-height: 1.35;
      }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      h2 { font-size: 16pt; margin-bottom: 2pt; margin-top: 0; }
      .contact { font-size: 9.5pt; margin-bottom: 8pt; }
      .role { font-size: 11pt; margin-bottom: 12pt; }
      .section-header {
        border-bottom: 1px solid #000;
        font-size: 10.5pt;
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 14pt;
        margin-bottom: 6pt;
        padding-bottom: 1pt;
      }
      .summary { font-size: 9pt; text-align: center; margin-bottom: 10pt; }
      .line { display: flex; justify-content: space-between; font-size: 9pt; font-weight: bold; margin-top: 6pt; }
      .subline { display: flex; justify-content: space-between; font-size: 8.5pt; font-style: italic; margin-bottom: 4pt; }
      ul { list-style-type: disc; padding-left: 15pt; margin-bottom: 6pt; margin-top: 2pt; }
      li { font-size: 9pt; text-align: justify; margin-bottom: 3pt; }
      @media print {
        body { padding: 0; }
      }
    `;
    const compBullets = (selectedJob == null ? void 0 : selectedJob.competencies.split("\n").map((line) => {
      const itemText = line.replace(/\\item\s*/, "").trim();
      const boldText = itemText.replace(/\\textbf\{(.*?)\}/g, "<strong>$1</strong>");
      return `<li>${boldText}</li>`;
    }).join("")) || "";
    const summaryText = (selectedJob == null ? void 0 : selectedJob.summary) || "";
    const skills = ((_b2 = (_a3 = customerConfig == null ? void 0 : customerConfig.parsedResume) == null ? void 0 : _a3.skills) == null ? void 0 : _b2.filter(Boolean)) || [];
    const experience = (((_c2 = customerConfig == null ? void 0 : customerConfig.parsedResume) == null ? void 0 : _c2.experience) || []).filter((job) => {
      var _a4, _b3;
      return ((_a4 = job.company) == null ? void 0 : _a4.trim()) || ((_b3 = job.jobTitle) == null ? void 0 : _b3.trim());
    }).slice(0, 3);
    const education = resolveEducationEntries(customerConfig == null ? void 0 : customerConfig.parsedResume).filter((e) => {
      var _a4, _b3;
      return ((_a4 = e.degree) == null ? void 0 : _a4.trim()) || ((_b3 = e.school) == null ? void 0 : _b3.trim());
    });
    const skillsHtml = skills.length ? `<div class="section-header">Technical Skills</div><p style="font-size:9pt">${skills.join(", ")}</p>` : "";
    const experienceHtml = experience.map((job) => {
      const bullets = (job.bullets || []).filter(Boolean).slice(0, 4).map((b) => `<li>${b.replace(/\\textbf\{(.*?)\}/g, "<strong>$1</strong>")}</li>`).join("");
      return `
          <div class="line"><span>${job.company}</span><span>${job.location || ""}</span></div>
          <div class="subline"><span>${job.jobTitle}</span><span>${[job.startDate, job.endDate].filter(Boolean).join(" -- ")}</span></div>
          <ul>${bullets}</ul>`;
    }).join("");
    const educationHtml = education.map((entry) => {
      const label = [entry.degree, entry.fieldOfStudy, entry.school].filter(Boolean).join(" | ");
      return `<li><strong>${label}</strong></li>`;
    }).join("");
    printWindow.document.write(`
      <html>
        <head>
          <title>${(selectedJob == null ? void 0 : selectedJob.companyName) || "Resume"}_Tailored_Resume</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="center">
            <h2 class="bold">${(candidateProfile.firstName || "f_name").toUpperCase()} ${(candidateProfile.lastName || "l_name").toUpperCase()}</h2>
            <div class="contact">${candidateProfile.location || ""}  |  ${candidateProfile.phone || ""}  |  ${candidateProfile.email || ""}  |  ${candidateProfile.linkedin || ""}</div>
            <div class="role bold">${((selectedJob == null ? void 0 : selectedJob.jobTitle) || "").toUpperCase()}</div>
          </div>

          <div class="summary">${summaryText}</div>

          <div class="section-header">Core AI Competencies and Technical Leadership</div>
          <ul>${compBullets}</ul>

          ${skillsHtml}

          <div class="section-header">Professional Experience</div>
          ${experienceHtml}

          <div class="section-header">Education and Certifications</div>
          <ul>${educationHtml}</ul>
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
  if (authLoading || configLoading) {
    return withToasts(
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sidepanel-fill", style: { justifyContent: "center", alignItems: "center", color: "var(--text-primary)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "animate-spin", size: 40, style: { color: "var(--brand-color)", marginBottom: 16 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.9rem", color: "var(--text-secondary)" }, children: "Securing connection..." })
      ] })
    );
  }
  if (!currentUser) {
    return withToasts(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sidepanel-fill pane-scroll-region", style: { justifyContent: "center", alignItems: "center", padding: 24 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-card", style: { maxWidth: 400, width: "100%", padding: "40px 32px", textAlign: "center", display: "flex", flexDirection: "column", gap: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLockup, { size: "lg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5, marginTop: 4 }, children: "Accelerate your job application journey. Tailor resumes and auto-sync to Cloud." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderTop: "1px solid var(--panel-border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleGoogleSignIn,
            disabled: isSigningIn,
            className: "btn btn-primary",
            style: { width: "100%", padding: "12px", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: "0.9rem", opacity: isSigningIn ? 0.7 : 1, cursor: isSigningIn ? "not-allowed" : "pointer" },
            children: [
              isSigningIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "animate-spin", size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z", fill: "#FBBC05" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z", fill: "#EA4335" })
              ] }),
              isSigningIn ? "Signing in..." : "Sign in with Google"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "var(--text-muted)", fontSize: "0.72rem", marginTop: 8 }, children: "By signing in, you agree to secure data backup under your Google Account on Cloud Firestore." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 12, textAlign: "left", borderTop: "1px dashed var(--panel-border)", paddingTop: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { style: { fontSize: "0.72rem", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none", fontWeight: 600 }, children: [
            "Diagnostic Debug Logs (",
            debugLogs.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            marginTop: 8,
            maxHeight: 180,
            overflowY: "auto",
            background: "var(--panel-bg)",
            border: "1px solid var(--panel-border)",
            borderRadius: 6,
            padding: 10,
            fontFamily: "monospace",
            fontSize: "0.68rem",
            color: "#334155",
            whiteSpace: "pre-wrap",
            textAlign: "left"
          }, children: debugLogs.length === 0 ? "No logs captured yet. Try signing in/out." : debugLogs.join("\n") })
        ] }) })
      ] }) })
    );
  }
  if (!isLoggedInFlag || !isConfigComplete(customerConfig)) {
    return withToasts(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sidepanel-fill", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MicroOnboarding,
        {
          userId: currentUser.uid,
          initialProfile: {
            email: currentUser.email || "",
            firstName: ((_a2 = currentUser.displayName) == null ? void 0 : _a2.split(/\s+/)[0]) || "",
            lastName: ((_b = currentUser.displayName) == null ? void 0 : _b.split(/\s+/).slice(1).join(" ")) || ""
          },
          initialConfig: customerConfig,
          onComplete: (config) => {
            chrome.storage.local.set({ is_logged_in: true }, () => {
              logDebug("Onboarding completed, set is_logged_in to true in storage.");
              setIsLoggedInFlag(true);
            });
            setCustomerConfig(config);
            setApiKey(config.geminiApiKey);
            if (config.parsedResume) {
              setCandidateProfile(parsedResumeToBaseProfile(config.parsedResume));
            } else if (config.candidateProfile) {
              setCandidateProfile((prev) => ({
                ...prev,
                firstName: config.candidateProfile.firstName || prev.firstName,
                lastName: config.candidateProfile.lastName || prev.lastName,
                email: config.candidateProfile.email || prev.email,
                phone: config.candidateProfile.phone || prev.phone
              }));
            }
          },
          onSignOut: handleSignOut
        }
      ) })
    );
  }
  return withToasts(
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `glass-app ${isRefreshing ? "animate-flicker" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "app-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "logo-area", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          BrandLockup,
          {
            size: "md",
            subText: currentUser ? currentUser.displayName || currentUser.email : "Guest Mode"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-actions", children: [
          !currentUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleGoogleSignIn,
              disabled: isSigningIn,
              className: "btn",
              style: { padding: "6px 12px", fontSize: "0.78rem", opacity: isSigningIn ? 0.7 : 1, cursor: isSigningIn ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 },
              children: [
                isSigningIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "animate-spin", size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 14 }),
                isSigningIn ? "Syncing..." : "Sync via Google"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => chrome.tabs.create({ url: appConfig.DASHBOARD_URL.replace(/\/login$/, "") }),
              className: "btn",
              style: { padding: "8px" },
              title: "Open web dashboard",
              type: "button",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { size: 18 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleRefresh,
              disabled: isRefreshing,
              className: "btn",
              style: { padding: "8px" },
              title: "Refresh queue & data",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 16, className: isRefreshing ? "animate-spin" : "" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: openSettings, className: "btn", style: { padding: "8px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 18 }) })
        ] })
      ] }),
      sessionNeedsRefresh && !currentUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: {
            padding: "10px 16px",
            background: "rgba(245, 158, 11, 0.12)",
            borderBottom: "1px solid rgba(245, 158, 11, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }, children: "Google session expired. Local settings work — reconnect to sync with cloud." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleGoogleSignIn,
                disabled: isSigningIn,
                className: "btn btn-primary",
                style: { padding: "6px 12px", fontSize: "0.78rem", whiteSpace: "nowrap" },
                children: isSigningIn ? "Connecting..." : "Reconnect"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "details-header-tabs view-switcher", style: { padding: "0 16px", background: "var(--panel-bg)", zIndex: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setCurrentView("home"),
            className: `tab-btn ${currentView === "home" ? "active" : ""}`,
            style: { flex: 1, textAlign: "center" },
            children: [
              "Home (",
              jobs.length,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => selectedJob && setCurrentView("detail"),
            className: `tab-btn ${currentView === "detail" ? "active" : ""}`,
            style: { flex: 1, textAlign: "center", opacity: selectedJob ? 1 : 0.5 },
            disabled: !selectedJob,
            children: "Detail"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "app-body", children: [
        currentView === "home" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          HomeScreen,
          {
            jobs,
            pipelinePaused,
            isImporting: isImportingJob,
            onAddCurrentTab: addCurrentTabToPipeline,
            onTogglePause: handleTogglePipelinePause,
            onSelectJob: (job) => {
              setSelectedJob(job);
              setCurrentView("detail");
            },
            onDeleteJob: handleDeleteJob,
            onMarkApplied: handleMarkApplied,
            onRetry: handleRetryPipeline
          }
        ),
        currentView === "detail" && /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "details-pane", children: selectedJob ? isJobActivelyTailoring(selectedJob) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center", padding: 24, textAlign: "center", background: "var(--bg-color)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "animate-spin", size: 36, style: { color: "var(--brand-color)", marginBottom: 16 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }, children: "AI Optimization In Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: 280, lineHeight: 1.5, marginBottom: 8 }, children: selectedJob.analysis && selectedJob.analysis !== "Queued for tailoring..." ? selectedJob.analysis : "Analyzing the job description and running multi-pass optimization sweep to tailor your resume..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-muted)", fontSize: "0.75rem", maxWidth: 280, lineHeight: 1.5, marginBottom: 16 }, children: "This usually takes 1–2 minutes. You can stay on Home — we will update when ready." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setCurrentView("home"),
                className: "btn",
                style: { padding: "8px 16px", fontSize: "0.85rem" },
                children: "Back to Home"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => selectedJob && handleRetryPipeline(selectedJob.id),
                className: "btn btn-primary",
                style: { padding: "8px 16px", fontSize: "0.85rem" },
                children: "Retry Tailoring"
              }
            )
          ] })
        ] }) : selectedJob.status === "failed" || selectedJob.pipelineStage === "failed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center", padding: 24, textAlign: "center", background: "var(--bg-color)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 48, height: 48, borderRadius: "50%", background: "rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", marginBottom: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: 700, color: "var(--danger-color)", marginBottom: 8 }, children: "Optimization Failed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "var(--panel-bg-2)", border: "1px solid rgba(255, 107, 107, 0.25)", padding: 12, borderRadius: 8, fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: 280, marginBottom: 16, wordBreak: "break-word", textAlign: "left" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
            " ",
            selectedJob.error || "Unknown AI error"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCurrentView("home"), className: "btn btn-primary", style: { padding: "8px 16px", fontSize: "0.85rem" }, children: "Back to Home" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "details-header-tabs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setActiveTab("analysis"),
                className: `tab-btn ${activeTab === "analysis" ? "active" : ""}`,
                children: "Job Fit"
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
            activeTab === "analysis" && selectedJob && /* @__PURE__ */ jsxRuntimeExports.jsx(
              JobFitPanel,
              {
                job: selectedJob,
                staleProfileWarning: !!((customerConfig == null ? void 0 : customerConfig.parsedResume) && selectedJob.baseVersion && getParsedResumeBaseVersion(customerConfig.parsedResume) !== selectedJob.baseVersion)
              }
            ),
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "detail-card", style: { background: "var(--panel-bg-2)", border: "1px solid var(--panel-border)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "plain-text", style: { fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "var(--text-primary)" }, children: selectedJob.coverLetter }) })
            ] }),
            activeTab === "preview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 12, marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handlePrint, className: "btn btn-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
                " Print to PDF"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-container", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-title", children: [
                  (candidateProfile.firstName || "f_name").toUpperCase(),
                  " ",
                  (candidateProfile.lastName || "l_name").toUpperCase()
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
                ((_d = (_c = customerConfig == null ? void 0 : customerConfig.parsedResume) == null ? void 0 : _c.skills) == null ? void 0 : _d.length) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "resume-preview-section", children: "Technical Skills" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "resume-preview-summary", children: customerConfig.parsedResume.skills.join(", ") })
                ] }) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "resume-preview-section", children: "Professional Experience" }),
                (((_e = customerConfig == null ? void 0 : customerConfig.parsedResume) == null ? void 0 : _e.experience) || []).filter((job) => {
                  var _a3, _b2;
                  return ((_a3 = job.company) == null ? void 0 : _a3.trim()) || ((_b2 = job.jobTitle) == null ? void 0 : _b2.trim());
                }).slice(0, 3).map((job, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-header-line", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: job.company }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: job.location || "" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "resume-preview-subline", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: job.jobTitle }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: [job.startDate, job.endDate].filter(Boolean).join(" -- ") })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "resume-preview-bullets", children: (job.bullets || []).filter(Boolean).slice(0, 4).map((bullet, bi) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: bullet.replace(/\\textbf\{(.*?)\}/g, "$1") }, bi)) })
                ] }, `exp-${idx}`)),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "resume-preview-section", children: "Education and Certifications" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "resume-preview-bullets", children: resolveEducationEntries(customerConfig == null ? void 0 : customerConfig.parsedResume).filter((e) => {
                  var _a3, _b2;
                  return ((_a3 = e.degree) == null ? void 0 : _a3.trim()) || ((_b2 = e.school) == null ? void 0 : _b2.trim());
                }).map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: [entry.degree, entry.fieldOfStudy, entry.school].filter(Boolean).join(" | ") }, i)) })
              ] })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "welcome-screen", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLockup, { size: "lg", style: { marginBottom: 16 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.35em" }, children: [
            "Welcome to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(BrandWordmark, { as: "span", size: "lg" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Select a tailored job from the Queue tab, or go to the Scrape tab to tailor a new role description." })
        ] }) })
      ] }),
      showSettings && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content", style: { maxWidth: "650px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Configuration Panel (BYOK)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowSettings(false), className: "item-delete-btn", style: { padding: "6px" }, children: "✕" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "details-header-tabs", style: { padding: "0 20px", borderBottom: "1px solid var(--panel-border)", background: "var(--panel-bg)" }, children: [
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
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, position: "relative" }, children: [
                "AI Provider",
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    onMouseEnter: () => setShowSettingsTooltip(true),
                    onMouseLeave: () => setShowSettingsTooltip(false),
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      cursor: "pointer",
                      color: "var(--text-muted, #94a3b8)",
                      position: "relative"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(HelpCircle, { size: 14 }),
                      showSettingsTooltip && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "span",
                        {
                          style: {
                            position: "absolute",
                            top: "100%",
                            left: "0px",
                            width: "260px",
                            backgroundColor: "var(--panel-bg, #1e293b)",
                            color: "var(--text-primary, #fff)",
                            border: "1px solid var(--panel-border, #334155)",
                            textAlign: "left",
                            borderRadius: "6px",
                            padding: "10px 12px",
                            zIndex: 1e3,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            fontSize: "0.72rem",
                            fontWeight: 400,
                            lineHeight: "1.4",
                            whiteSpace: "normal",
                            marginTop: "4px"
                          },
                          children: [
                            draftProvider === "gemini" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: "How to get Gemini Key:" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { margin: "0 0 0 14px", padding: 0 }, children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                  "Go to ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://aistudio.google.com/", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--brand)", textDecoration: "underline" }, children: "Google AI Studio" })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                  "Click ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Create API Key" })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Copy the key and paste it below." })
                              ] })
                            ] }),
                            draftProvider === "openai" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: "How to get OpenAI Key:" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { margin: "0 0 0 14px", padding: 0 }, children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                  "Go to the ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://platform.openai.com/api-keys", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--brand)", textDecoration: "underline" }, children: "OpenAI Dashboard" })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                  "Click ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Create new secret key" })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Copy the key and paste it below." })
                              ] })
                            ] }),
                            draftProvider === "anthropic" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: "How to get Anthropic Key:" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { margin: "0 0 0 14px", padding: 0 }, children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                  "Go to the ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://console.anthropic.com/settings/keys", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--brand)", textDecoration: "underline" }, children: "Anthropic Console" })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                  "Click ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Create Key" })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Copy the key and paste it below." })
                              ] })
                            ] }),
                            draftProvider === "grok" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: "How to get Grok Key:" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { margin: "0 0 0 14px", padding: 0 }, children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                  "Go to the ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://console.x.ai/", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--brand)", textDecoration: "underline" }, children: "xAI Console" })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                                  "Click ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "API Keys" }),
                                  " in settings"
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Create a new API Key and paste it below." })
                              ] })
                            ] })
                          ]
                        }
                      )
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "form-control",
                  value: draftProvider,
                  onChange: (e) => setDraftProvider(e.target.value),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "gemini", children: "Google Gemini (Recommended)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "openai", children: "OpenAI (GPT-4o Mini)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "anthropic", children: "Anthropic (Claude 3.5 Sonnet)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "grok", children: "xAI Grok (Grok 4.3)" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: draftProvider === "gemini" ? "Gemini API Key" : draftProvider === "openai" ? "OpenAI API Key" : draftProvider === "anthropic" ? "Anthropic API Key" : "xAI Grok API Key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: showApiKey ? "text" : "password",
                    placeholder: `Enter your ${draftProvider} API key...`,
                    value: apiKey,
                    onChange: (e) => setApiKey(e.target.value),
                    className: "form-control"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowApiKey(!showApiKey), className: "btn", type: "button", children: showApiKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 16 }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("small", { style: { color: "var(--text-muted)", fontSize: "0.72rem" }, children: "Stored securely locally inside chrome.storage.local" })
            ] }),
            settingsModels.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Model Selection" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  className: "form-control",
                  value: draftModel,
                  onChange: (e) => setDraftModel(e.target.value),
                  children: settingsModels.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
                }
              )
            ] }),
            currentUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", style: { display: "flex", alignItems: "center", gap: "8px", margin: "12px 0" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "syncApiKeyToCloud",
                    checked: syncApiKeyToCloud,
                    onChange: (e) => {
                      setSyncApiKeyToCloud(e.target.checked);
                      if (!e.target.checked) setEncryptApiKey(false);
                    },
                    style: { cursor: "pointer", width: "auto" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "syncApiKeyToCloud", style: { margin: 0, fontSize: "0.82rem", cursor: "pointer", fontWeight: 500, userSelect: "none" }, children: [
                  "Sync ",
                  draftProvider === "gemini" ? "Gemini" : draftProvider === "openai" ? "OpenAI" : "Anthropic",
                  " API Key to Cloud Firestore"
                ] })
              ] }),
              syncApiKeyToCloud && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", style: { display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      id: "encryptApiKey",
                      checked: encryptApiKey,
                      onChange: (e) => setEncryptApiKey(e.target.checked),
                      style: { cursor: "pointer", width: "auto" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "encryptApiKey", style: { margin: 0, fontSize: "0.82rem", cursor: "pointer", fontWeight: 500, userSelect: "none" }, children: "Enable Passphrase-Based Client-Side Encryption" })
                ] }),
                encryptApiKey && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", style: { paddingLeft: "22px", marginBottom: "12px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.75rem", fontWeight: 600 }, children: "Decryption Passphrase *" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "password",
                      className: "form-control",
                      placeholder: "Enter secure passphrase...",
                      value: cloudPassphrase,
                      onChange: (e) => setCloudPassphrase(e.target.value),
                      style: { fontSize: "0.8rem", padding: "6px 10px" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("small", { style: { color: "var(--text-muted)", fontSize: "0.66rem", display: "block", marginTop: "4px", lineHeight: 1.3 }, children: "Saved locally on this browser to auto-decrypt. Required on other devices to sync." })
                ] })
              ] })
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
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }, children: [
                "Base Competencies (",
                ((_f = draftProfile.competencies) == null ? void 0 : _f.length) || 0,
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-footer", style: { display: "flex", justifyContent: "space-between", width: "100%" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: currentUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                handleSignOut();
                setShowSettings(false);
              },
              className: "btn",
              style: { borderColor: "var(--danger-color)", color: "var(--danger-color)", display: "flex", alignItems: "center", gap: 6 },
              type: "button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 14 }),
                " Sign Out"
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowSettings(false), className: "btn", type: "button", children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSaveSettings, className: "btn btn-primary", type: "button", children: "Save Settings" })
          ] })
        ] })
      ] }) }),
      passphrasePromptOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", style: { zIndex: 9999 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content", style: { maxWidth: "400px", padding: "24px", textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { marginBottom: "12px", color: "var(--brand)", fontWeight: 800, fontFamily: "var(--font-title)" }, children: "Decrypt Synced API Key" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.82rem", marginBottom: "20px", lineHeight: 1.4 }, children: "Your Gemini API Key is synced in the cloud but is protected by passphrase encryption. Enter your passphrase below to decrypt and unlock it." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", style: { textAlign: "left", marginBottom: "20px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Passphrase" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              className: "form-control",
              placeholder: "Enter passphrase...",
              value: passphraseInput,
              onChange: (e) => {
                setPassphraseInput(e.target.value);
                setDecryptionError("");
              }
            }
          ),
          decryptionError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "var(--danger-color)", fontSize: "0.75rem", marginTop: "6px" }, children: decryptionError })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "10px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setPassphrasePromptOpen(false);
                setPassphraseInput("");
                setDecryptionError("");
              },
              className: "btn",
              style: { flex: 1 },
              type: "button",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: async () => {
                if (!passphraseInput) return;
                try {
                  const decrypted = await decryptKey(encryptedKeyCiphertext, passphraseInput);
                  setApiKey(decrypted);
                  chrome.storage.local.set({
                    geminiApiKey: decrypted,
                    cloudPassphrase: passphraseInput,
                    syncApiKeyToCloud: true,
                    encryptApiKey: true
                  });
                  setPassphrasePromptOpen(false);
                  setPassphraseInput("");
                  setDecryptionError("");
                  showToast("API key decrypted successfully.", "success");
                } catch (e) {
                  setDecryptionError("Invalid passphrase. Please try again.");
                }
              },
              className: "btn btn-primary",
              style: { flex: 1 },
              type: "button",
              children: "Decrypt"
            }
          )
        ] })
      ] }) })
    ] })
  );
}
initSentry("sidepanel");
document.documentElement.classList.add("sidepanel-root");
document.body.classList.add("sidepanel-root");
if (typeof chrome !== "undefined" && ((_a = chrome.runtime) == null ? void 0 : _a.connect)) {
  const sidepanelPort = chrome.runtime.connect({ name: "autoapplyai-sidepanel" });
  const announceReady = () => {
    var _a2;
    if (!((_a2 = chrome.tabs) == null ? void 0 : _a2.query)) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      var _a3;
      sidepanelPort.postMessage({
        action: "SIDEPANEL_READY",
        tabId: (_a3 = tabs[0]) == null ? void 0 : _a3.id
      });
    });
  };
  announceReady();
}
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  if (reason && (reason.name === "FirebaseError" || reason.message && (reason.message.toLowerCase().includes("offline") || reason.message.toLowerCase().includes("network") || reason.message.toLowerCase().includes("auth/internal-error")))) {
    console.warn("Handled offline/network promise rejection gracefully:", reason.message || reason);
    event.preventDefault();
  }
});
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Something went wrong. Reload the extension." }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
//# sourceMappingURL=sidepanel-BEJjzyLF.js.map
