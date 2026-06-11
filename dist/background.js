const Gc = `You are an expert executive career strategist. Your purpose is to output tailored resume blocks and matching cover letters that comprehensively match a job description. You must thoroughly fill out the top sections of the document so they look substantive and executive-grade, while ensuring the total resume does not spill onto a second page.

CRITICAL SYNTAX RULES:
1. Output raw, copy-pasteable LaTeX strings that match standard document environments.
2. Never use a raw ampersand (&) in body text—always spell out 'and'.
3. Every single percentage sign must be explicitly escaped as '\\%'.
4. Do not output markdown wrappers or code block markers (like \`\`\`latex).
5. Use natural, warm, human-focused phrasing. Frame career growth as a 'journey', never a 'trajectory'.
6. The 'summary' field MUST contain only the raw paragraph text. Do NOT wrap it in LaTeX environments (like \\begin{quote}, \\begin{itemize}, or \\begin{center}) and do NOT include any section titles or headers (like \\section{Executive Summary}, \\section*{Summary}, or \\textbf{Executive Summary}).
7. The 'competencies' field MUST contain only a flat sequence of LaTeX \\item bullet points (e.g., \\item \\textbf{Title:} Description). Do NOT wrap the list in a \\begin{itemize} and \\end{itemize} block, and do NOT include any section titles or headers (like \\section*{Core Competencies} or \\textbf{Core Competencies}) within the field.
8. The 'cover_letter' field MUST contain the formatted cover letter text. Do NOT wrap it in LaTeX environments, and let double newlines represent paragraph breaks. You MUST structure the cover letter EXACTLY as follows (separated by double newlines):
   - Recipient line: e.g., 'Hiring Team Moonshot Labs' (or the specific hiring manager and team if named, e.g. 'Andrew Phelan and the Moonshot Labs Hiring Team')
   - Location line: e.g., 'Dallas-Fort Worth Metroplex, TX' (or matching job city/state)
   - Subject line: e.g., 'Subject: Application for AI Development Manager'
   - Salutation line: e.g., 'Dear Andrew Phelan and the Moonshot Labs Hiring Team,'
   - Body paragraphs: 3 to 4 tailored paragraphs.
   - Sign-off: 'Sincerely,\\n\\nBhagath Siddi'

CONTENT FILL BOUNDS:
- Provide a detailed, robust Executive Summary block (exactly 4 to 5 lines of text).
- Do NOT include any ATS target block, keywords block, or metadata under the summary.
- Generate exactly 7 to 8 highly descriptive, technical core competency items that thoroughly expand on matching methodologies.
- Write a highly tailored, compelling 3-4 paragraph Cover Letter body that connects the candidate's journey (e.g., 7-Eleven tech leadership, CVS health manager, MIT Agentic AI program) directly to the target role's mission and challenges.`, Kc = {
  firstName: "Bhagath",
  lastName: "Siddi",
  email: "bhagathsiddi@gmail.com",
  phone: "989-312-3420",
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
}, Wc = {
  type: "OBJECT",
  properties: {
    jobTitle: { type: "STRING" },
    companyName: { type: "STRING" },
    atsScore: { type: "INTEGER" },
    analysis: { type: "STRING" },
    summary: { type: "STRING" },
    competencies: { type: "STRING" },
    cover_letter: { type: "STRING" },
    keywords: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["jobTitle", "companyName", "atsScore", "analysis", "summary", "competencies", "cover_letter", "keywords"]
};
async function Ta(n, e, t) {
  var f, y, w, R, C, k;
  const r = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${n}`, i = await fetch(r, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: e }] }],
      systemInstruction: { parts: [{ text: Gc }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: Wc
      }
    })
  });
  if (!i.ok) {
    const O = await i.text();
    throw new Error(`Gemini API returned error status ${i.status}: ${O}`);
  }
  const o = (f = i.body) == null ? void 0 : f.getReader(), l = new TextDecoder("utf-8");
  let u = "", h = "";
  if (o)
    for (; ; ) {
      const { value: O, done: N } = await o.read();
      if (N) break;
      h += l.decode(O, { stream: !0 });
      const H = h.split(`
`);
      h = H.pop() || "";
      for (const F of H)
        if (F.startsWith("data: ")) {
          const j = F.substring(6).trim();
          if (j === "[DONE]") continue;
          try {
            const Ee = ((k = (C = (R = (w = (y = JSON.parse(j).candidates) == null ? void 0 : y[0]) == null ? void 0 : w.content) == null ? void 0 : R.parts) == null ? void 0 : C[0]) == null ? void 0 : k.text) || "";
            u += Ee;
          } catch {
          }
        }
    }
  try {
    return JSON.parse(u);
  } catch {
    throw console.error("Failed to parse final JSON string:", u), new Error("Gemini returned invalid or truncated JSON response.");
  }
}
async function Qc(n, e, t, r, i) {
  var y, w, R, C;
  const o = ((w = (y = t.page_defense_layout) == null ? void 0 : y.macro_content_limits) == null ? void 0 : w.summary_sentences_max) || 4, l = ((C = (R = t.page_defense_layout) == null ? void 0 : R.macro_content_limits) == null ? void 0 : C.core_competencies_count) || 6, u = r.firstName || "Bhagath", h = r.lastName || "Siddi", f = `You are an expert ATS optimization resume writer. Your goal is to tailor the candidate's resume summary and competencies to match the target job description so perfectly that the ATS Match Score is above 90%.

Candidate Base Resume Profile:
- Name: ${u} ${h}
- Target Role: ${r.role}
- Base Summary: ${r.summary}
- Base Competencies:
${r.competencies.map((k) => `  * ${k}`).join(`
`)}

Job Description to target:
"""
${e}
"""

Your tasks:
1. Tailor the candidate's professional summary. It must be a concise paragraph (no more than ${o} sentences).
   - Frame the candidate's 20+ years of software experience and engineering leadership to align with the target job's domain.
   - Highlight transferable skills: e.g., if the job is about E-Commerce/loyalty/CRM, emphasize high-scale customer-facing systems, cloud architectures (AWS/GCP), loyalty personalization, and leading full-stack or backend teams.
   - Cleanse and omit irrelevant domain-specific buzzwords (such as 'clinical', 'healthcare', 'medical') unless the target job description explicitly mentions healthcare.
   - Contextualize their technology stack to match the job description's keywords (such as Node.js, React, React Native, CI/CD, GCP, AWS) by framing it as environments they have architected, systems they integrated, or cross-functional teams they have supervised.
   - Format the summary as raw LaTeX.

2. Tailor exactly ${l} core competencies. Format them as exactly ${l} LaTeX items:
   \\item \\textbf{Competency Title:} Competency description highlighting direct alignment with the job.
   - Map each of the ${l} competencies directly to key requirements in the job description (e.g. engineering leadership, cloud computing, frontend/backend architecture, agile delivery, system scalability).
   - Weave in the exact keywords from the job description (e.g. Node.js, React, AWS, GCP, e-commerce, CRM, agile).
   - Ensure the titles and descriptions reflect keywords from the job description but remain grounded in the candidate's real capabilities as a senior director/leader.
   - Keep the description of each competency extremely concise (at most 1-2 sentences, ~20-25 words each) to strictly respect the absolute 1-page budget.

3. Write a highly tailored, compelling Cover Letter body connecting the candidate's background (7-Eleven, CVS Health, MIT Agentic AI credentials) directly to the target role's mission and challenges.
   - You MUST structure the cover letter EXACTLY as follows, using double newlines for paragraph breaks:
     Recipient Line: Hiring Team [Company Name] (or specific hiring manager and team if named, e.g., Andrew Phelan and the Moonshot Labs Hiring Team)
     Location Line: [Location context from the JD, e.g. Dallas-Fort Worth Metroplex, TX]
     Subject Line: Subject: Application for [Job Title]
     Salutation Line: Dear [Hiring Manager and/or Hiring Team, e.g. Dear Andrew Phelan and the Moonshot Labs Hiring Team,]
     Body Paragraphs: 3-4 paragraphs of tailored body text.
     Sign-off: Sincerely,\\n\\n${u} ${h}
   - Output this formatting directly inside the "cover_letter" JSON property.

4. Compute an ATS Match Score (0 to 100) reflecting the match percentage. Since your task is to successfully tailor the resume, your final tailored content should achieve a score of 90 or higher.
5. Extract the jobTitle and companyName from the job description or page details.
6. Provide a list of at most 10-15 most critical matching keywords (an array of strings) and a detailed match analysis explaining how the candidate's transferable skills were mapped to the job requirements.

Format the output strictly as a JSON object matching this schema.`;
  return Ta(n, f, i);
}
async function Jc(n, e, t, r, i, o) {
  var w, R, C, k;
  const l = ((R = (w = t.page_defense_layout) == null ? void 0 : w.macro_content_limits) == null ? void 0 : R.summary_sentences_max) || 4, u = ((k = (C = t.page_defense_layout) == null ? void 0 : C.macro_content_limits) == null ? void 0 : k.core_competencies_count) || 6, h = r.firstName || "Bhagath", f = r.lastName || "Siddi", y = `You are a strict ATS compliance editor, resume optimizer, and cover letter writer. Your task is to perform a second validation pass on the draft resume summary, competencies, and cover letter to ensure they are fully tailored to the target job and that the ATS Match Score is 90% or higher.

Job Description:
"""
${e}
"""

Candidate Base Resume Profile:
- Name: ${h} ${f}
- Target Role: ${r.role}
- Base Summary: ${r.summary}
- Base Competencies:
${r.competencies.map((O) => `  * ${O}`).join(`
`)}

DRAFT Tailored Summary:
"""
${i.summary}
"""

DRAFT Tailored Competencies:
"""
${i.competencies}
"""

DRAFT Tailored Cover Letter:
"""
${i.cover_letter}
"""

Your tasks:
1. Audit the draft summary and competencies against the target job description. Identify any missing keywords or requirements (e.g., specific technologies like Node.js, React, AWS, GCP, or domains like e-commerce, loyalty, CRM).
2. Rewrite, refine, and optimize the summary and competencies to weave in those missing elements as transferable skills, leadership competencies, or architectural governance, maximizing the tailoring density.
3. Ensure that any irrelevant domain jargon (like 'clinical' or 'healthcare') is completely stripped out unless the target job is in the healthcare industry.
4. Verify that the summary is a single cohesive paragraph of no more than ${l} sentences.
5. Verify that there are exactly ${u} core competency items, and that their descriptions are highly concise (at most 1-2 sentences each) to respect the absolute 1-page budget.
6. Review and optimize the cover letter text, keeping it highly tailored, professional, free of ampersands, and correctly structured with recipient, location, subject, salutation, body paragraphs, and professional closing sign-off. Ensure the recipient line, location line, subject line, and salutation line are each separated by double newlines at the start. The cover letter closing sign-off must be exactly: Sincerely,\\n\\n${h} ${f}
7. Re-evaluate the ATS match score (0-100). The final score must be 90 or higher, reflecting the optimized alignment.
8. Verify and preserve the jobTitle: "${i.jobTitle}" and companyName: "${i.companyName}".
9. Provide a list of at most 10-15 most critical matching keywords (an array of strings) to keep the appended ATS target block concise and prevent layout overflow.

Format the output strictly as a JSON object matching this schema.`;
  return Ta(n, y, o);
}
function ui(n, e, t) {
  var o;
  if (!n) return "";
  let r = n.replace(/\\(?:sub){0,2}section\*?\{[^}]*\}/gi, "");
  r = r.replace(/\\begin\{(?:itemize|quote|enumerate|center|flushleft|flushright)\}/gi, ""), r = r.replace(/\\end\{(?:itemize|quote|enumerate|center|flushleft|flushright)\}/gi, ""), r = r.replace(/\\(?:v|h)space\*?\{[^}]*\}/gi, ""), r = r.replace(/\\(?:v|h)fill/gi, ""), r = r.replace(/\\textbf\{Executive\s+Summary\}/gi, ""), r = r.replace(/\\textbf\{Core\s+Competencies\}/gi, ""), r = r.replace(/\\textbf\{Core\s+AI\s+Competencies\s+\&\s+Technical\s+Leadership\}/gi, ""), r = r.replace(/\\textbf\{Core\s+AI\s+Competencies\s+and\s+Technical\s+Leadership\}/gi, ""), r = r.replace(/^\s*Executive\s+Summary\s*[:\-]?\s*/i, ""), r = r.replace(/^\s*Core\s+Competencies\s*[:\-]?\s*/i, ""), r = r.replace(/^\s*Core\s+AI\s+Competencies\s+and\s+Technical\s+Leadership\s*[:\-]?\s*/i, ""), t != null && t.isCompetencies ? (r = r.replace(/\\item\s*\\textbf\{Executive\s+Summary\}/gi, ""), r = r.replace(/\\item\s*\\textbf\{Core\s+Competencies\}/gi, "")) : (r = r.replace(/^\s*\\item\s*\\textbf\{[^}]*\}\s*/gi, ""), r = r.replace(/^\s*\\item\s*/gi, ""));
  const i = ((o = e.syntax_constraints) == null ? void 0 : o.forbidden_characters) || {};
  if ("&" in i && (r = r.replace(/&/g, " and ")), "%" in i && (r = r.replace(new RegExp("(?<!\\\\)%", "g"), "\\%")), r = r.replace(new RegExp("(?<!\\\\)_", "g"), "\\_"), r = r.replace(new RegExp("(?<!\\\\)\\$", "g"), "\\$"), r = r.replace(new RegExp("(?<!\\\\)#", "g"), "\\#"), t != null && t.isCompetencies) {
    const l = r.split(`
`).map((h) => h.trim()).filter(Boolean), u = [];
    for (const h of l)
      h === "\\item" || h === "\\item \\textbf{}" || u.push(h);
    r = u.join(`
`);
  } else t != null && t.isCoverLetter ? (r = r.replace(/\r\n/g, `
`), r = r.replace(/\n{2,}/g, " <PARAGRAPH_BREAK> "), r = r.replace(/\s+/g, " "), r = r.replace(/<PARAGRAPH_BREAK>/g, `

`)) : r = r.replace(/\s+/g, " ");
  return r.trim();
}
function hi(n, e) {
  var i;
  const t = ((i = e.tone_and_voice) == null ? void 0 : i.forbidden_words) || {};
  let r = n;
  for (const [o, l] of Object.entries(t)) {
    const u = l.match(/'(.*?)'/), h = u ? u[1] : "journey", f = new RegExp(o, "gi");
    r = r.replace(f, h);
  }
  return r;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ia = function(n) {
  const e = [];
  let t = 0;
  for (let r = 0; r < n.length; r++) {
    let i = n.charCodeAt(r);
    i < 128 ? e[t++] = i : i < 2048 ? (e[t++] = i >> 6 | 192, e[t++] = i & 63 | 128) : (i & 64512) === 55296 && r + 1 < n.length && (n.charCodeAt(r + 1) & 64512) === 56320 ? (i = 65536 + ((i & 1023) << 10) + (n.charCodeAt(++r) & 1023), e[t++] = i >> 18 | 240, e[t++] = i >> 12 & 63 | 128, e[t++] = i >> 6 & 63 | 128, e[t++] = i & 63 | 128) : (e[t++] = i >> 12 | 224, e[t++] = i >> 6 & 63 | 128, e[t++] = i & 63 | 128);
  }
  return e;
}, Xc = function(n) {
  const e = [];
  let t = 0, r = 0;
  for (; t < n.length; ) {
    const i = n[t++];
    if (i < 128)
      e[r++] = String.fromCharCode(i);
    else if (i > 191 && i < 224) {
      const o = n[t++];
      e[r++] = String.fromCharCode((i & 31) << 6 | o & 63);
    } else if (i > 239 && i < 365) {
      const o = n[t++], l = n[t++], u = n[t++], h = ((i & 7) << 18 | (o & 63) << 12 | (l & 63) << 6 | u & 63) - 65536;
      e[r++] = String.fromCharCode(55296 + (h >> 10)), e[r++] = String.fromCharCode(56320 + (h & 1023));
    } else {
      const o = n[t++], l = n[t++];
      e[r++] = String.fromCharCode((i & 15) << 12 | (o & 63) << 6 | l & 63);
    }
  }
  return e.join("");
}, wa = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob == "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(n, e) {
    if (!Array.isArray(n))
      throw Error("encodeByteArray takes an array as a parameter");
    this.init_();
    const t = e ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, r = [];
    for (let i = 0; i < n.length; i += 3) {
      const o = n[i], l = i + 1 < n.length, u = l ? n[i + 1] : 0, h = i + 2 < n.length, f = h ? n[i + 2] : 0, y = o >> 2, w = (o & 3) << 4 | u >> 4;
      let R = (u & 15) << 2 | f >> 6, C = f & 63;
      h || (C = 64, l || (R = 64)), r.push(t[y], t[w], t[R], t[C]);
    }
    return r.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(n, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? btoa(n) : this.encodeByteArray(Ia(n), e);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(n, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? atob(n) : Xc(this.decodeStringToByteArray(n, e));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(n, e) {
    this.init_();
    const t = e ? this.charToByteMapWebSafe_ : this.charToByteMap_, r = [];
    for (let i = 0; i < n.length; ) {
      const o = t[n.charAt(i++)], u = i < n.length ? t[n.charAt(i)] : 0;
      ++i;
      const f = i < n.length ? t[n.charAt(i)] : 64;
      ++i;
      const w = i < n.length ? t[n.charAt(i)] : 64;
      if (++i, o == null || u == null || f == null || w == null)
        throw new Yc();
      const R = o << 2 | u >> 4;
      if (r.push(R), f !== 64) {
        const C = u << 4 & 240 | f >> 2;
        if (r.push(C), w !== 64) {
          const k = f << 6 & 192 | w;
          r.push(k);
        }
      }
    }
    return r;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
      for (let n = 0; n < this.ENCODED_VALS.length; n++)
        this.byteToCharMap_[n] = this.ENCODED_VALS.charAt(n), this.charToByteMap_[this.byteToCharMap_[n]] = n, this.byteToCharMapWebSafe_[n] = this.ENCODED_VALS_WEBSAFE.charAt(n), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]] = n, n >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)] = n, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)] = n);
    }
  }
};
class Yc extends Error {
  constructor() {
    super(...arguments), this.name = "DecodeBase64StringError";
  }
}
const Zc = function(n) {
  const e = Ia(n);
  return wa.encodeByteArray(e, !0);
}, hr = function(n) {
  return Zc(n).replace(/\./g, "");
}, Aa = function(n) {
  try {
    return wa.decodeString(n, !0);
  } catch (e) {
    console.error("base64Decode failed: ", e);
  }
  return null;
};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function eu() {
  if (typeof self < "u")
    return self;
  if (typeof window < "u")
    return window;
  if (typeof global < "u")
    return global;
  throw new Error("Unable to locate global object.");
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const tu = () => eu().__FIREBASE_DEFAULTS__, nu = () => {
  if (typeof process > "u" || typeof process.env > "u")
    return;
  const n = process.env.__FIREBASE_DEFAULTS__;
  if (n)
    return JSON.parse(n);
}, ru = () => {
  if (typeof document > "u")
    return;
  let n;
  try {
    n = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
  } catch {
    return;
  }
  const e = n && Aa(n[1]);
  return e && JSON.parse(e);
}, Cr = () => {
  try {
    return tu() || nu() || ru();
  } catch (n) {
    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);
    return;
  }
}, Ra = (n) => {
  var e, t;
  return (t = (e = Cr()) === null || e === void 0 ? void 0 : e.emulatorHosts) === null || t === void 0 ? void 0 : t[n];
}, iu = (n) => {
  const e = Ra(n);
  if (!e)
    return;
  const t = e.lastIndexOf(":");
  if (t <= 0 || t + 1 === e.length)
    throw new Error(`Invalid host ${e} with no separate hostname and port!`);
  const r = parseInt(e.substring(t + 1), 10);
  return e[0] === "[" ? [e.substring(1, t - 1), r] : [e.substring(0, t), r];
}, ba = () => {
  var n;
  return (n = Cr()) === null || n === void 0 ? void 0 : n.config;
}, Sa = (n) => {
  var e;
  return (e = Cr()) === null || e === void 0 ? void 0 : e[`_${n}`];
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class su {
  constructor() {
    this.reject = () => {
    }, this.resolve = () => {
    }, this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
  /**
   * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
   * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
   * and returns a node-style callback which will resolve or reject the Deferred's promise.
   */
  wrapCallback(e) {
    return (t, r) => {
      t ? this.reject(t) : this.resolve(r), typeof e == "function" && (this.promise.catch(() => {
      }), e.length === 1 ? e(t) : e(t, r));
    };
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ou(n, e) {
  if (n.uid)
    throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
  const t = {
    alg: "none",
    type: "JWT"
  }, r = e || "demo-project", i = n.iat || 0, o = n.sub || n.user_id;
  if (!o)
    throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
  const l = Object.assign({
    // Set all required fields to decent defaults
    iss: `https://securetoken.google.com/${r}`,
    aud: r,
    iat: i,
    exp: i + 3600,
    auth_time: i,
    sub: o,
    user_id: o,
    firebase: {
      sign_in_provider: "custom",
      identities: {}
    }
  }, n);
  return [
    hr(JSON.stringify(t)),
    hr(JSON.stringify(l)),
    ""
  ].join(".");
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ge() {
  return typeof navigator < "u" && typeof navigator.userAgent == "string" ? navigator.userAgent : "";
}
function au() {
  return typeof window < "u" && // @ts-ignore Setting up an broadly applicable index signature for Window
  // just to deal with this case would probably be a bad idea.
  !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ge());
}
function lu() {
  var n;
  const e = (n = Cr()) === null || n === void 0 ? void 0 : n.forceEnvironment;
  if (e === "node")
    return !0;
  if (e === "browser")
    return !1;
  try {
    return Object.prototype.toString.call(global.process) === "[object process]";
  } catch {
    return !1;
  }
}
function cu() {
  return typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers";
}
function uu() {
  const n = typeof chrome == "object" ? chrome.runtime : typeof browser == "object" ? browser.runtime : void 0;
  return typeof n == "object" && n.id !== void 0;
}
function hu() {
  return typeof navigator == "object" && navigator.product === "ReactNative";
}
function du() {
  const n = ge();
  return n.indexOf("MSIE ") >= 0 || n.indexOf("Trident/") >= 0;
}
function fu() {
  return !lu() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
}
function pu() {
  try {
    return typeof indexedDB == "object";
  } catch {
    return !1;
  }
}
function mu() {
  return new Promise((n, e) => {
    try {
      let t = !0;
      const r = "validate-browser-context-for-indexeddb-analytics-module", i = self.indexedDB.open(r);
      i.onsuccess = () => {
        i.result.close(), t || self.indexedDB.deleteDatabase(r), n(!0);
      }, i.onupgradeneeded = () => {
        t = !1;
      }, i.onerror = () => {
        var o;
        e(((o = i.error) === null || o === void 0 ? void 0 : o.message) || "");
      };
    } catch (t) {
      e(t);
    }
  });
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const gu = "FirebaseError";
class $e extends Error {
  constructor(e, t, r) {
    super(t), this.code = e, this.customData = r, this.name = gu, Object.setPrototypeOf(this, $e.prototype), Error.captureStackTrace && Error.captureStackTrace(this, An.prototype.create);
  }
}
class An {
  constructor(e, t, r) {
    this.service = e, this.serviceName = t, this.errors = r;
  }
  create(e, ...t) {
    const r = t[0] || {}, i = `${this.service}/${e}`, o = this.errors[e], l = o ? _u(o, r) : "Error", u = `${this.serviceName}: ${l} (${i}).`;
    return new $e(i, u, r);
  }
}
function _u(n, e) {
  return n.replace(yu, (t, r) => {
    const i = e[r];
    return i != null ? String(i) : `<${r}?>`;
  });
}
const yu = /\{\$([^}]+)}/g;
function vu(n) {
  for (const e in n)
    if (Object.prototype.hasOwnProperty.call(n, e))
      return !1;
  return !0;
}
function dr(n, e) {
  if (n === e)
    return !0;
  const t = Object.keys(n), r = Object.keys(e);
  for (const i of t) {
    if (!r.includes(i))
      return !1;
    const o = n[i], l = e[i];
    if (To(o) && To(l)) {
      if (!dr(o, l))
        return !1;
    } else if (o !== l)
      return !1;
  }
  for (const i of r)
    if (!t.includes(i))
      return !1;
  return !0;
}
function To(n) {
  return n !== null && typeof n == "object";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Rn(n) {
  const e = [];
  for (const [t, r] of Object.entries(n))
    Array.isArray(r) ? r.forEach((i) => {
      e.push(encodeURIComponent(t) + "=" + encodeURIComponent(i));
    }) : e.push(encodeURIComponent(t) + "=" + encodeURIComponent(r));
  return e.length ? "&" + e.join("&") : "";
}
function Eu(n, e) {
  const t = new Tu(n, e);
  return t.subscribe.bind(t);
}
class Tu {
  /**
   * @param executor Function which can make calls to a single Observer
   *     as a proxy.
   * @param onNoObservers Callback when count of Observers goes to zero.
   */
  constructor(e, t) {
    this.observers = [], this.unsubscribes = [], this.observerCount = 0, this.task = Promise.resolve(), this.finalized = !1, this.onNoObservers = t, this.task.then(() => {
      e(this);
    }).catch((r) => {
      this.error(r);
    });
  }
  next(e) {
    this.forEachObserver((t) => {
      t.next(e);
    });
  }
  error(e) {
    this.forEachObserver((t) => {
      t.error(e);
    }), this.close(e);
  }
  complete() {
    this.forEachObserver((e) => {
      e.complete();
    }), this.close();
  }
  /**
   * Subscribe function that can be used to add an Observer to the fan-out list.
   *
   * - We require that no event is sent to a subscriber synchronously to their
   *   call to subscribe().
   */
  subscribe(e, t, r) {
    let i;
    if (e === void 0 && t === void 0 && r === void 0)
      throw new Error("Missing Observer.");
    Iu(e, [
      "next",
      "error",
      "complete"
    ]) ? i = e : i = {
      next: e,
      error: t,
      complete: r
    }, i.next === void 0 && (i.next = di), i.error === void 0 && (i.error = di), i.complete === void 0 && (i.complete = di);
    const o = this.unsubscribeOne.bind(this, this.observers.length);
    return this.finalized && this.task.then(() => {
      try {
        this.finalError ? i.error(this.finalError) : i.complete();
      } catch {
      }
    }), this.observers.push(i), o;
  }
  // Unsubscribe is synchronous - we guarantee that no events are sent to
  // any unsubscribed Observer.
  unsubscribeOne(e) {
    this.observers === void 0 || this.observers[e] === void 0 || (delete this.observers[e], this.observerCount -= 1, this.observerCount === 0 && this.onNoObservers !== void 0 && this.onNoObservers(this));
  }
  forEachObserver(e) {
    if (!this.finalized)
      for (let t = 0; t < this.observers.length; t++)
        this.sendOne(t, e);
  }
  // Call the Observer via one of it's callback function. We are careful to
  // confirm that the observe has not been unsubscribed since this asynchronous
  // function had been queued.
  sendOne(e, t) {
    this.task.then(() => {
      if (this.observers !== void 0 && this.observers[e] !== void 0)
        try {
          t(this.observers[e]);
        } catch (r) {
          typeof console < "u" && console.error && console.error(r);
        }
    });
  }
  close(e) {
    this.finalized || (this.finalized = !0, e !== void 0 && (this.finalError = e), this.task.then(() => {
      this.observers = void 0, this.onNoObservers = void 0;
    }));
  }
}
function Iu(n, e) {
  if (typeof n != "object" || n === null)
    return !1;
  for (const t of e)
    if (t in n && typeof n[t] == "function")
      return !0;
  return !1;
}
function di() {
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ce(n) {
  return n && n._delegate ? n._delegate : n;
}
class mt {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(e, t, r) {
    this.name = e, this.instanceFactory = t, this.type = r, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
  }
  setInstantiationMode(e) {
    return this.instantiationMode = e, this;
  }
  setMultipleInstances(e) {
    return this.multipleInstances = e, this;
  }
  setServiceProps(e) {
    return this.serviceProps = e, this;
  }
  setInstanceCreatedCallback(e) {
    return this.onInstanceCreated = e, this;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ut = "[DEFAULT]";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class wu {
  constructor(e, t) {
    this.name = e, this.container = t, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * @param identifier A provider can provide multiple instances of a service
   * if this.component.multipleInstances is true.
   */
  get(e) {
    const t = this.normalizeInstanceIdentifier(e);
    if (!this.instancesDeferred.has(t)) {
      const r = new su();
      if (this.instancesDeferred.set(t, r), this.isInitialized(t) || this.shouldAutoInitialize())
        try {
          const i = this.getOrInitializeService({
            instanceIdentifier: t
          });
          i && r.resolve(i);
        } catch {
        }
    }
    return this.instancesDeferred.get(t).promise;
  }
  getImmediate(e) {
    var t;
    const r = this.normalizeInstanceIdentifier(e == null ? void 0 : e.identifier), i = (t = e == null ? void 0 : e.optional) !== null && t !== void 0 ? t : !1;
    if (this.isInitialized(r) || this.shouldAutoInitialize())
      try {
        return this.getOrInitializeService({
          instanceIdentifier: r
        });
      } catch (o) {
        if (i)
          return null;
        throw o;
      }
    else {
      if (i)
        return null;
      throw Error(`Service ${this.name} is not available`);
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(e) {
    if (e.name !== this.name)
      throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
    if (this.component)
      throw Error(`Component for ${this.name} has already been provided`);
    if (this.component = e, !!this.shouldAutoInitialize()) {
      if (Ru(e))
        try {
          this.getOrInitializeService({ instanceIdentifier: ut });
        } catch {
        }
      for (const [t, r] of this.instancesDeferred.entries()) {
        const i = this.normalizeInstanceIdentifier(t);
        try {
          const o = this.getOrInitializeService({
            instanceIdentifier: i
          });
          r.resolve(o);
        } catch {
        }
      }
    }
  }
  clearInstance(e = ut) {
    this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
  }
  // app.delete() will call this method on every provider to delete the services
  // TODO: should we mark the provider as deleted?
  async delete() {
    const e = Array.from(this.instances.values());
    await Promise.all([
      ...e.filter((t) => "INTERNAL" in t).map((t) => t.INTERNAL.delete()),
      ...e.filter((t) => "_delete" in t).map((t) => t._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(e = ut) {
    return this.instances.has(e);
  }
  getOptions(e = ut) {
    return this.instancesOptions.get(e) || {};
  }
  initialize(e = {}) {
    const { options: t = {} } = e, r = this.normalizeInstanceIdentifier(e.instanceIdentifier);
    if (this.isInitialized(r))
      throw Error(`${this.name}(${r}) has already been initialized`);
    if (!this.isComponentSet())
      throw Error(`Component ${this.name} has not been registered yet`);
    const i = this.getOrInitializeService({
      instanceIdentifier: r,
      options: t
    });
    for (const [o, l] of this.instancesDeferred.entries()) {
      const u = this.normalizeInstanceIdentifier(o);
      r === u && l.resolve(i);
    }
    return i;
  }
  /**
   *
   * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
   * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
   *
   * @param identifier An optional instance identifier
   * @returns a function to unregister the callback
   */
  onInit(e, t) {
    var r;
    const i = this.normalizeInstanceIdentifier(t), o = (r = this.onInitCallbacks.get(i)) !== null && r !== void 0 ? r : /* @__PURE__ */ new Set();
    o.add(e), this.onInitCallbacks.set(i, o);
    const l = this.instances.get(i);
    return l && e(l, i), () => {
      o.delete(e);
    };
  }
  /**
   * Invoke onInit callbacks synchronously
   * @param instance the service instance`
   */
  invokeOnInitCallbacks(e, t) {
    const r = this.onInitCallbacks.get(t);
    if (r)
      for (const i of r)
        try {
          i(e, t);
        } catch {
        }
  }
  getOrInitializeService({ instanceIdentifier: e, options: t = {} }) {
    let r = this.instances.get(e);
    if (!r && this.component && (r = this.component.instanceFactory(this.container, {
      instanceIdentifier: Au(e),
      options: t
    }), this.instances.set(e, r), this.instancesOptions.set(e, t), this.invokeOnInitCallbacks(r, e), this.component.onInstanceCreated))
      try {
        this.component.onInstanceCreated(this.container, e, r);
      } catch {
      }
    return r || null;
  }
  normalizeInstanceIdentifier(e = ut) {
    return this.component ? this.component.multipleInstances ? e : ut : e;
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
}
function Au(n) {
  return n === ut ? void 0 : n;
}
function Ru(n) {
  return n.instantiationMode === "EAGER";
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class bu {
  constructor(e) {
    this.name = e, this.providers = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param component Component being added
   * @param overwrite When a component with the same name has already been registered,
   * if overwrite is true: overwrite the existing component with the new component and create a new
   * provider with the new component. It can be useful in tests where you want to use different mocks
   * for different tests.
   * if overwrite is false: throw an exception
   */
  addComponent(e) {
    const t = this.getProvider(e.name);
    if (t.isComponentSet())
      throw new Error(`Component ${e.name} has already been registered with ${this.name}`);
    t.setComponent(e);
  }
  addOrOverwriteComponent(e) {
    this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
  }
  /**
   * getProvider provides a type safe interface where it can only be called with a field name
   * present in NameServiceMapping interface.
   *
   * Firebase SDKs providing services should extend NameServiceMapping interface to register
   * themselves.
   */
  getProvider(e) {
    if (this.providers.has(e))
      return this.providers.get(e);
    const t = new wu(e, this);
    return this.providers.set(e, t), t;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var x;
(function(n) {
  n[n.DEBUG = 0] = "DEBUG", n[n.VERBOSE = 1] = "VERBOSE", n[n.INFO = 2] = "INFO", n[n.WARN = 3] = "WARN", n[n.ERROR = 4] = "ERROR", n[n.SILENT = 5] = "SILENT";
})(x || (x = {}));
const Su = {
  debug: x.DEBUG,
  verbose: x.VERBOSE,
  info: x.INFO,
  warn: x.WARN,
  error: x.ERROR,
  silent: x.SILENT
}, Pu = x.INFO, Cu = {
  [x.DEBUG]: "log",
  [x.VERBOSE]: "log",
  [x.INFO]: "info",
  [x.WARN]: "warn",
  [x.ERROR]: "error"
}, ku = (n, e, ...t) => {
  if (e < n.logLevel)
    return;
  const r = (/* @__PURE__ */ new Date()).toISOString(), i = Cu[e];
  if (i)
    console[i](`[${r}]  ${n.name}:`, ...t);
  else
    throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);
};
class Hi {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(e) {
    this.name = e, this._logLevel = Pu, this._logHandler = ku, this._userLogHandler = null;
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(e) {
    if (!(e in x))
      throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
    this._logLevel = e;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(e) {
    this._logLevel = typeof e == "string" ? Su[e] : e;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(e) {
    if (typeof e != "function")
      throw new TypeError("Value assigned to `logHandler` must be a function");
    this._logHandler = e;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(e) {
    this._userLogHandler = e;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...e) {
    this._userLogHandler && this._userLogHandler(this, x.DEBUG, ...e), this._logHandler(this, x.DEBUG, ...e);
  }
  log(...e) {
    this._userLogHandler && this._userLogHandler(this, x.VERBOSE, ...e), this._logHandler(this, x.VERBOSE, ...e);
  }
  info(...e) {
    this._userLogHandler && this._userLogHandler(this, x.INFO, ...e), this._logHandler(this, x.INFO, ...e);
  }
  warn(...e) {
    this._userLogHandler && this._userLogHandler(this, x.WARN, ...e), this._logHandler(this, x.WARN, ...e);
  }
  error(...e) {
    this._userLogHandler && this._userLogHandler(this, x.ERROR, ...e), this._logHandler(this, x.ERROR, ...e);
  }
}
const Nu = (n, e) => e.some((t) => n instanceof t);
let Io, wo;
function Du() {
  return Io || (Io = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function Ou() {
  return wo || (wo = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const Pa = /* @__PURE__ */ new WeakMap(), Ai = /* @__PURE__ */ new WeakMap(), Ca = /* @__PURE__ */ new WeakMap(), fi = /* @__PURE__ */ new WeakMap(), zi = /* @__PURE__ */ new WeakMap();
function Vu(n) {
  const e = new Promise((t, r) => {
    const i = () => {
      n.removeEventListener("success", o), n.removeEventListener("error", l);
    }, o = () => {
      t(et(n.result)), i();
    }, l = () => {
      r(n.error), i();
    };
    n.addEventListener("success", o), n.addEventListener("error", l);
  });
  return e.then((t) => {
    t instanceof IDBCursor && Pa.set(t, n);
  }).catch(() => {
  }), zi.set(e, n), e;
}
function Mu(n) {
  if (Ai.has(n))
    return;
  const e = new Promise((t, r) => {
    const i = () => {
      n.removeEventListener("complete", o), n.removeEventListener("error", l), n.removeEventListener("abort", l);
    }, o = () => {
      t(), i();
    }, l = () => {
      r(n.error || new DOMException("AbortError", "AbortError")), i();
    };
    n.addEventListener("complete", o), n.addEventListener("error", l), n.addEventListener("abort", l);
  });
  Ai.set(n, e);
}
let Ri = {
  get(n, e, t) {
    if (n instanceof IDBTransaction) {
      if (e === "done")
        return Ai.get(n);
      if (e === "objectStoreNames")
        return n.objectStoreNames || Ca.get(n);
      if (e === "store")
        return t.objectStoreNames[1] ? void 0 : t.objectStore(t.objectStoreNames[0]);
    }
    return et(n[e]);
  },
  set(n, e, t) {
    return n[e] = t, !0;
  },
  has(n, e) {
    return n instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in n;
  }
};
function Lu(n) {
  Ri = n(Ri);
}
function xu(n) {
  return n === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...t) {
    const r = n.call(pi(this), e, ...t);
    return Ca.set(r, e.sort ? e.sort() : [e]), et(r);
  } : Ou().includes(n) ? function(...e) {
    return n.apply(pi(this), e), et(Pa.get(this));
  } : function(...e) {
    return et(n.apply(pi(this), e));
  };
}
function Uu(n) {
  return typeof n == "function" ? xu(n) : (n instanceof IDBTransaction && Mu(n), Nu(n, Du()) ? new Proxy(n, Ri) : n);
}
function et(n) {
  if (n instanceof IDBRequest)
    return Vu(n);
  if (fi.has(n))
    return fi.get(n);
  const e = Uu(n);
  return e !== n && (fi.set(n, e), zi.set(e, n)), e;
}
const pi = (n) => zi.get(n);
function Fu(n, e, { blocked: t, upgrade: r, blocking: i, terminated: o } = {}) {
  const l = indexedDB.open(n, e), u = et(l);
  return r && l.addEventListener("upgradeneeded", (h) => {
    r(et(l.result), h.oldVersion, h.newVersion, et(l.transaction), h);
  }), t && l.addEventListener("blocked", (h) => t(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    h.oldVersion,
    h.newVersion,
    h
  )), u.then((h) => {
    o && h.addEventListener("close", () => o()), i && h.addEventListener("versionchange", (f) => i(f.oldVersion, f.newVersion, f));
  }).catch(() => {
  }), u;
}
const Bu = ["get", "getKey", "getAll", "getAllKeys", "count"], ju = ["put", "add", "delete", "clear"], mi = /* @__PURE__ */ new Map();
function Ao(n, e) {
  if (!(n instanceof IDBDatabase && !(e in n) && typeof e == "string"))
    return;
  if (mi.get(e))
    return mi.get(e);
  const t = e.replace(/FromIndex$/, ""), r = e !== t, i = ju.includes(t);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(t in (r ? IDBIndex : IDBObjectStore).prototype) || !(i || Bu.includes(t))
  )
    return;
  const o = async function(l, ...u) {
    const h = this.transaction(l, i ? "readwrite" : "readonly");
    let f = h.store;
    return r && (f = f.index(u.shift())), (await Promise.all([
      f[t](...u),
      i && h.done
    ]))[0];
  };
  return mi.set(e, o), o;
}
Lu((n) => ({
  ...n,
  get: (e, t, r) => Ao(e, t) || n.get(e, t, r),
  has: (e, t) => !!Ao(e, t) || n.has(e, t)
}));
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class $u {
  constructor(e) {
    this.container = e;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    return this.container.getProviders().map((t) => {
      if (Hu(t)) {
        const r = t.getImmediate();
        return `${r.library}/${r.version}`;
      } else
        return null;
    }).filter((t) => t).join(" ");
  }
}
function Hu(n) {
  const e = n.getComponent();
  return (e == null ? void 0 : e.type) === "VERSION";
}
const bi = "@firebase/app", Ro = "0.10.13";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Fe = new Hi("@firebase/app"), zu = "@firebase/app-compat", qu = "@firebase/analytics-compat", Gu = "@firebase/analytics", Ku = "@firebase/app-check-compat", Wu = "@firebase/app-check", Qu = "@firebase/auth", Ju = "@firebase/auth-compat", Xu = "@firebase/database", Yu = "@firebase/data-connect", Zu = "@firebase/database-compat", eh = "@firebase/functions", th = "@firebase/functions-compat", nh = "@firebase/installations", rh = "@firebase/installations-compat", ih = "@firebase/messaging", sh = "@firebase/messaging-compat", oh = "@firebase/performance", ah = "@firebase/performance-compat", lh = "@firebase/remote-config", ch = "@firebase/remote-config-compat", uh = "@firebase/storage", hh = "@firebase/storage-compat", dh = "@firebase/firestore", fh = "@firebase/vertexai-preview", ph = "@firebase/firestore-compat", mh = "firebase", gh = "10.14.1";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Si = "[DEFAULT]", _h = {
  [bi]: "fire-core",
  [zu]: "fire-core-compat",
  [Gu]: "fire-analytics",
  [qu]: "fire-analytics-compat",
  [Wu]: "fire-app-check",
  [Ku]: "fire-app-check-compat",
  [Qu]: "fire-auth",
  [Ju]: "fire-auth-compat",
  [Xu]: "fire-rtdb",
  [Yu]: "fire-data-connect",
  [Zu]: "fire-rtdb-compat",
  [eh]: "fire-fn",
  [th]: "fire-fn-compat",
  [nh]: "fire-iid",
  [rh]: "fire-iid-compat",
  [ih]: "fire-fcm",
  [sh]: "fire-fcm-compat",
  [oh]: "fire-perf",
  [ah]: "fire-perf-compat",
  [lh]: "fire-rc",
  [ch]: "fire-rc-compat",
  [uh]: "fire-gcs",
  [hh]: "fire-gcs-compat",
  [dh]: "fire-fst",
  [ph]: "fire-fst-compat",
  [fh]: "fire-vertex",
  "fire-js": "fire-js",
  [mh]: "fire-js-all"
};
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pn = /* @__PURE__ */ new Map(), yh = /* @__PURE__ */ new Map(), Pi = /* @__PURE__ */ new Map();
function bo(n, e) {
  try {
    n.container.addComponent(e);
  } catch (t) {
    Fe.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`, t);
  }
}
function Nt(n) {
  const e = n.name;
  if (Pi.has(e))
    return Fe.debug(`There were multiple attempts to register component ${e}.`), !1;
  Pi.set(e, n);
  for (const t of pn.values())
    bo(t, n);
  for (const t of yh.values())
    bo(t, n);
  return !0;
}
function qi(n, e) {
  const t = n.container.getProvider("heartbeat").getImmediate({ optional: !0 });
  return t && t.triggerHeartbeat(), n.container.getProvider(e);
}
function Ze(n) {
  return n.settings !== void 0;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const vh = {
  "no-app": "No Firebase App '{$appName}' has been created - call initializeApp() first",
  "bad-app-name": "Illegal App name: '{$appName}'",
  "duplicate-app": "Firebase App named '{$appName}' already exists with different options or config",
  "app-deleted": "Firebase App named '{$appName}' already deleted",
  "server-app-deleted": "Firebase Server App has been deleted",
  "no-options": "Need to provide options, when not being deployed to hosting via source.",
  "invalid-app-argument": "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  "invalid-log-argument": "First argument to `onLog` must be null or a function.",
  "idb-open": "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-get": "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-set": "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-delete": "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
  "finalization-registry-not-supported": "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
  "invalid-server-app-environment": "FirebaseServerApp is not for use in browser environments."
}, tt = new An("app", "Firebase", vh);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Eh {
  constructor(e, t, r) {
    this._isDeleted = !1, this._options = Object.assign({}, e), this._config = Object.assign({}, t), this._name = t.name, this._automaticDataCollectionEnabled = t.automaticDataCollectionEnabled, this._container = r, this.container.addComponent(new mt(
      "app",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
  }
  get automaticDataCollectionEnabled() {
    return this.checkDestroyed(), this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(e) {
    this.checkDestroyed(), this._automaticDataCollectionEnabled = e;
  }
  get name() {
    return this.checkDestroyed(), this._name;
  }
  get options() {
    return this.checkDestroyed(), this._options;
  }
  get config() {
    return this.checkDestroyed(), this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(e) {
    this._isDeleted = e;
  }
  /**
   * This function will throw an Error if the App has already been deleted -
   * use before performing API actions on the App.
   */
  checkDestroyed() {
    if (this.isDeleted)
      throw tt.create("app-deleted", { appName: this._name });
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ut = gh;
function ka(n, e = {}) {
  let t = n;
  typeof e != "object" && (e = { name: e });
  const r = Object.assign({ name: Si, automaticDataCollectionEnabled: !1 }, e), i = r.name;
  if (typeof i != "string" || !i)
    throw tt.create("bad-app-name", {
      appName: String(i)
    });
  if (t || (t = ba()), !t)
    throw tt.create(
      "no-options"
      /* AppError.NO_OPTIONS */
    );
  const o = pn.get(i);
  if (o) {
    if (dr(t, o.options) && dr(r, o.config))
      return o;
    throw tt.create("duplicate-app", { appName: i });
  }
  const l = new bu(i);
  for (const h of Pi.values())
    l.addComponent(h);
  const u = new Eh(t, r, l);
  return pn.set(i, u), u;
}
function Gi(n = Si) {
  const e = pn.get(n);
  if (!e && n === Si && ba())
    return ka();
  if (!e)
    throw tt.create("no-app", { appName: n });
  return e;
}
function Th() {
  return Array.from(pn.values());
}
function nt(n, e, t) {
  var r;
  let i = (r = _h[n]) !== null && r !== void 0 ? r : n;
  t && (i += `-${t}`);
  const o = i.match(/\s|\//), l = e.match(/\s|\//);
  if (o || l) {
    const u = [
      `Unable to register library "${i}" with version "${e}":`
    ];
    o && u.push(`library name "${i}" contains illegal characters (whitespace or "/")`), o && l && u.push("and"), l && u.push(`version name "${e}" contains illegal characters (whitespace or "/")`), Fe.warn(u.join(" "));
    return;
  }
  Nt(new mt(
    `${i}-version`,
    () => ({ library: i, version: e }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ih = "firebase-heartbeat-database", wh = 1, mn = "firebase-heartbeat-store";
let gi = null;
function Na() {
  return gi || (gi = Fu(Ih, wh, {
    upgrade: (n, e) => {
      switch (e) {
        case 0:
          try {
            n.createObjectStore(mn);
          } catch (t) {
            console.warn(t);
          }
      }
    }
  }).catch((n) => {
    throw tt.create("idb-open", {
      originalErrorMessage: n.message
    });
  })), gi;
}
async function Ah(n) {
  try {
    const t = (await Na()).transaction(mn), r = await t.objectStore(mn).get(Da(n));
    return await t.done, r;
  } catch (e) {
    if (e instanceof $e)
      Fe.warn(e.message);
    else {
      const t = tt.create("idb-get", {
        originalErrorMessage: e == null ? void 0 : e.message
      });
      Fe.warn(t.message);
    }
  }
}
async function So(n, e) {
  try {
    const r = (await Na()).transaction(mn, "readwrite");
    await r.objectStore(mn).put(e, Da(n)), await r.done;
  } catch (t) {
    if (t instanceof $e)
      Fe.warn(t.message);
    else {
      const r = tt.create("idb-set", {
        originalErrorMessage: t == null ? void 0 : t.message
      });
      Fe.warn(r.message);
    }
  }
}
function Da(n) {
  return `${n.name}!${n.options.appId}`;
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Rh = 1024, bh = 30 * 24 * 60 * 60 * 1e3;
class Sh {
  constructor(e) {
    this.container = e, this._heartbeatsCache = null;
    const t = this.container.getProvider("app").getImmediate();
    this._storage = new Ch(t), this._heartbeatsCachePromise = this._storage.read().then((r) => (this._heartbeatsCache = r, r));
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    var e, t;
    try {
      const i = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), o = Po();
      return ((e = this._heartbeatsCache) === null || e === void 0 ? void 0 : e.heartbeats) == null && (this._heartbeatsCache = await this._heartbeatsCachePromise, ((t = this._heartbeatsCache) === null || t === void 0 ? void 0 : t.heartbeats) == null) || this._heartbeatsCache.lastSentHeartbeatDate === o || this._heartbeatsCache.heartbeats.some((l) => l.date === o) ? void 0 : (this._heartbeatsCache.heartbeats.push({ date: o, agent: i }), this._heartbeatsCache.heartbeats = this._heartbeatsCache.heartbeats.filter((l) => {
        const u = new Date(l.date).valueOf();
        return Date.now() - u <= bh;
      }), this._storage.overwrite(this._heartbeatsCache));
    } catch (r) {
      Fe.warn(r);
    }
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    var e;
    try {
      if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, ((e = this._heartbeatsCache) === null || e === void 0 ? void 0 : e.heartbeats) == null || this._heartbeatsCache.heartbeats.length === 0)
        return "";
      const t = Po(), { heartbeatsToSend: r, unsentEntries: i } = Ph(this._heartbeatsCache.heartbeats), o = hr(JSON.stringify({ version: 2, heartbeats: r }));
      return this._heartbeatsCache.lastSentHeartbeatDate = t, i.length > 0 ? (this._heartbeatsCache.heartbeats = i, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), o;
    } catch (t) {
      return Fe.warn(t), "";
    }
  }
}
function Po() {
  return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function Ph(n, e = Rh) {
  const t = [];
  let r = n.slice();
  for (const i of n) {
    const o = t.find((l) => l.agent === i.agent);
    if (o) {
      if (o.dates.push(i.date), Co(t) > e) {
        o.dates.pop();
        break;
      }
    } else if (t.push({
      agent: i.agent,
      dates: [i.date]
    }), Co(t) > e) {
      t.pop();
      break;
    }
    r = r.slice(1);
  }
  return {
    heartbeatsToSend: t,
    unsentEntries: r
  };
}
class Ch {
  constructor(e) {
    this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    return pu() ? mu().then(() => !0).catch(() => !1) : !1;
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    if (await this._canUseIndexedDBPromise) {
      const t = await Ah(this.app);
      return t != null && t.heartbeats ? t : { heartbeats: [] };
    } else
      return { heartbeats: [] };
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(e) {
    var t;
    if (await this._canUseIndexedDBPromise) {
      const i = await this.read();
      return So(this.app, {
        lastSentHeartbeatDate: (t = e.lastSentHeartbeatDate) !== null && t !== void 0 ? t : i.lastSentHeartbeatDate,
        heartbeats: e.heartbeats
      });
    } else
      return;
  }
  // add heartbeats
  async add(e) {
    var t;
    if (await this._canUseIndexedDBPromise) {
      const i = await this.read();
      return So(this.app, {
        lastSentHeartbeatDate: (t = e.lastSentHeartbeatDate) !== null && t !== void 0 ? t : i.lastSentHeartbeatDate,
        heartbeats: [
          ...i.heartbeats,
          ...e.heartbeats
        ]
      });
    } else
      return;
  }
}
function Co(n) {
  return hr(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: n })
  ).length;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function kh(n) {
  Nt(new mt(
    "platform-logger",
    (e) => new $u(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), Nt(new mt(
    "heartbeat",
    (e) => new Sh(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), nt(bi, Ro, n), nt(bi, Ro, "esm2017"), nt("fire-js", "");
}
kh("");
var Nh = "firebase", Dh = "10.14.1";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
nt(Nh, Dh, "app");
var ko = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/
var Oa;
(function() {
  var n;
  /** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
  function e(E, p) {
    function g() {
    }
    g.prototype = p.prototype, E.D = p.prototype, E.prototype = new g(), E.prototype.constructor = E, E.C = function(_, v, T) {
      for (var m = Array(arguments.length - 2), _e = 2; _e < arguments.length; _e++) m[_e - 2] = arguments[_e];
      return p.prototype[v].apply(_, m);
    };
  }
  function t() {
    this.blockSize = -1;
  }
  function r() {
    this.blockSize = -1, this.blockSize = 64, this.g = Array(4), this.B = Array(this.blockSize), this.o = this.h = 0, this.s();
  }
  e(r, t), r.prototype.s = function() {
    this.g[0] = 1732584193, this.g[1] = 4023233417, this.g[2] = 2562383102, this.g[3] = 271733878, this.o = this.h = 0;
  };
  function i(E, p, g) {
    g || (g = 0);
    var _ = Array(16);
    if (typeof p == "string") for (var v = 0; 16 > v; ++v) _[v] = p.charCodeAt(g++) | p.charCodeAt(g++) << 8 | p.charCodeAt(g++) << 16 | p.charCodeAt(g++) << 24;
    else for (v = 0; 16 > v; ++v) _[v] = p[g++] | p[g++] << 8 | p[g++] << 16 | p[g++] << 24;
    p = E.g[0], g = E.g[1], v = E.g[2];
    var T = E.g[3], m = p + (T ^ g & (v ^ T)) + _[0] + 3614090360 & 4294967295;
    p = g + (m << 7 & 4294967295 | m >>> 25), m = T + (v ^ p & (g ^ v)) + _[1] + 3905402710 & 4294967295, T = p + (m << 12 & 4294967295 | m >>> 20), m = v + (g ^ T & (p ^ g)) + _[2] + 606105819 & 4294967295, v = T + (m << 17 & 4294967295 | m >>> 15), m = g + (p ^ v & (T ^ p)) + _[3] + 3250441966 & 4294967295, g = v + (m << 22 & 4294967295 | m >>> 10), m = p + (T ^ g & (v ^ T)) + _[4] + 4118548399 & 4294967295, p = g + (m << 7 & 4294967295 | m >>> 25), m = T + (v ^ p & (g ^ v)) + _[5] + 1200080426 & 4294967295, T = p + (m << 12 & 4294967295 | m >>> 20), m = v + (g ^ T & (p ^ g)) + _[6] + 2821735955 & 4294967295, v = T + (m << 17 & 4294967295 | m >>> 15), m = g + (p ^ v & (T ^ p)) + _[7] + 4249261313 & 4294967295, g = v + (m << 22 & 4294967295 | m >>> 10), m = p + (T ^ g & (v ^ T)) + _[8] + 1770035416 & 4294967295, p = g + (m << 7 & 4294967295 | m >>> 25), m = T + (v ^ p & (g ^ v)) + _[9] + 2336552879 & 4294967295, T = p + (m << 12 & 4294967295 | m >>> 20), m = v + (g ^ T & (p ^ g)) + _[10] + 4294925233 & 4294967295, v = T + (m << 17 & 4294967295 | m >>> 15), m = g + (p ^ v & (T ^ p)) + _[11] + 2304563134 & 4294967295, g = v + (m << 22 & 4294967295 | m >>> 10), m = p + (T ^ g & (v ^ T)) + _[12] + 1804603682 & 4294967295, p = g + (m << 7 & 4294967295 | m >>> 25), m = T + (v ^ p & (g ^ v)) + _[13] + 4254626195 & 4294967295, T = p + (m << 12 & 4294967295 | m >>> 20), m = v + (g ^ T & (p ^ g)) + _[14] + 2792965006 & 4294967295, v = T + (m << 17 & 4294967295 | m >>> 15), m = g + (p ^ v & (T ^ p)) + _[15] + 1236535329 & 4294967295, g = v + (m << 22 & 4294967295 | m >>> 10), m = p + (v ^ T & (g ^ v)) + _[1] + 4129170786 & 4294967295, p = g + (m << 5 & 4294967295 | m >>> 27), m = T + (g ^ v & (p ^ g)) + _[6] + 3225465664 & 4294967295, T = p + (m << 9 & 4294967295 | m >>> 23), m = v + (p ^ g & (T ^ p)) + _[11] + 643717713 & 4294967295, v = T + (m << 14 & 4294967295 | m >>> 18), m = g + (T ^ p & (v ^ T)) + _[0] + 3921069994 & 4294967295, g = v + (m << 20 & 4294967295 | m >>> 12), m = p + (v ^ T & (g ^ v)) + _[5] + 3593408605 & 4294967295, p = g + (m << 5 & 4294967295 | m >>> 27), m = T + (g ^ v & (p ^ g)) + _[10] + 38016083 & 4294967295, T = p + (m << 9 & 4294967295 | m >>> 23), m = v + (p ^ g & (T ^ p)) + _[15] + 3634488961 & 4294967295, v = T + (m << 14 & 4294967295 | m >>> 18), m = g + (T ^ p & (v ^ T)) + _[4] + 3889429448 & 4294967295, g = v + (m << 20 & 4294967295 | m >>> 12), m = p + (v ^ T & (g ^ v)) + _[9] + 568446438 & 4294967295, p = g + (m << 5 & 4294967295 | m >>> 27), m = T + (g ^ v & (p ^ g)) + _[14] + 3275163606 & 4294967295, T = p + (m << 9 & 4294967295 | m >>> 23), m = v + (p ^ g & (T ^ p)) + _[3] + 4107603335 & 4294967295, v = T + (m << 14 & 4294967295 | m >>> 18), m = g + (T ^ p & (v ^ T)) + _[8] + 1163531501 & 4294967295, g = v + (m << 20 & 4294967295 | m >>> 12), m = p + (v ^ T & (g ^ v)) + _[13] + 2850285829 & 4294967295, p = g + (m << 5 & 4294967295 | m >>> 27), m = T + (g ^ v & (p ^ g)) + _[2] + 4243563512 & 4294967295, T = p + (m << 9 & 4294967295 | m >>> 23), m = v + (p ^ g & (T ^ p)) + _[7] + 1735328473 & 4294967295, v = T + (m << 14 & 4294967295 | m >>> 18), m = g + (T ^ p & (v ^ T)) + _[12] + 2368359562 & 4294967295, g = v + (m << 20 & 4294967295 | m >>> 12), m = p + (g ^ v ^ T) + _[5] + 4294588738 & 4294967295, p = g + (m << 4 & 4294967295 | m >>> 28), m = T + (p ^ g ^ v) + _[8] + 2272392833 & 4294967295, T = p + (m << 11 & 4294967295 | m >>> 21), m = v + (T ^ p ^ g) + _[11] + 1839030562 & 4294967295, v = T + (m << 16 & 4294967295 | m >>> 16), m = g + (v ^ T ^ p) + _[14] + 4259657740 & 4294967295, g = v + (m << 23 & 4294967295 | m >>> 9), m = p + (g ^ v ^ T) + _[1] + 2763975236 & 4294967295, p = g + (m << 4 & 4294967295 | m >>> 28), m = T + (p ^ g ^ v) + _[4] + 1272893353 & 4294967295, T = p + (m << 11 & 4294967295 | m >>> 21), m = v + (T ^ p ^ g) + _[7] + 4139469664 & 4294967295, v = T + (m << 16 & 4294967295 | m >>> 16), m = g + (v ^ T ^ p) + _[10] + 3200236656 & 4294967295, g = v + (m << 23 & 4294967295 | m >>> 9), m = p + (g ^ v ^ T) + _[13] + 681279174 & 4294967295, p = g + (m << 4 & 4294967295 | m >>> 28), m = T + (p ^ g ^ v) + _[0] + 3936430074 & 4294967295, T = p + (m << 11 & 4294967295 | m >>> 21), m = v + (T ^ p ^ g) + _[3] + 3572445317 & 4294967295, v = T + (m << 16 & 4294967295 | m >>> 16), m = g + (v ^ T ^ p) + _[6] + 76029189 & 4294967295, g = v + (m << 23 & 4294967295 | m >>> 9), m = p + (g ^ v ^ T) + _[9] + 3654602809 & 4294967295, p = g + (m << 4 & 4294967295 | m >>> 28), m = T + (p ^ g ^ v) + _[12] + 3873151461 & 4294967295, T = p + (m << 11 & 4294967295 | m >>> 21), m = v + (T ^ p ^ g) + _[15] + 530742520 & 4294967295, v = T + (m << 16 & 4294967295 | m >>> 16), m = g + (v ^ T ^ p) + _[2] + 3299628645 & 4294967295, g = v + (m << 23 & 4294967295 | m >>> 9), m = p + (v ^ (g | ~T)) + _[0] + 4096336452 & 4294967295, p = g + (m << 6 & 4294967295 | m >>> 26), m = T + (g ^ (p | ~v)) + _[7] + 1126891415 & 4294967295, T = p + (m << 10 & 4294967295 | m >>> 22), m = v + (p ^ (T | ~g)) + _[14] + 2878612391 & 4294967295, v = T + (m << 15 & 4294967295 | m >>> 17), m = g + (T ^ (v | ~p)) + _[5] + 4237533241 & 4294967295, g = v + (m << 21 & 4294967295 | m >>> 11), m = p + (v ^ (g | ~T)) + _[12] + 1700485571 & 4294967295, p = g + (m << 6 & 4294967295 | m >>> 26), m = T + (g ^ (p | ~v)) + _[3] + 2399980690 & 4294967295, T = p + (m << 10 & 4294967295 | m >>> 22), m = v + (p ^ (T | ~g)) + _[10] + 4293915773 & 4294967295, v = T + (m << 15 & 4294967295 | m >>> 17), m = g + (T ^ (v | ~p)) + _[1] + 2240044497 & 4294967295, g = v + (m << 21 & 4294967295 | m >>> 11), m = p + (v ^ (g | ~T)) + _[8] + 1873313359 & 4294967295, p = g + (m << 6 & 4294967295 | m >>> 26), m = T + (g ^ (p | ~v)) + _[15] + 4264355552 & 4294967295, T = p + (m << 10 & 4294967295 | m >>> 22), m = v + (p ^ (T | ~g)) + _[6] + 2734768916 & 4294967295, v = T + (m << 15 & 4294967295 | m >>> 17), m = g + (T ^ (v | ~p)) + _[13] + 1309151649 & 4294967295, g = v + (m << 21 & 4294967295 | m >>> 11), m = p + (v ^ (g | ~T)) + _[4] + 4149444226 & 4294967295, p = g + (m << 6 & 4294967295 | m >>> 26), m = T + (g ^ (p | ~v)) + _[11] + 3174756917 & 4294967295, T = p + (m << 10 & 4294967295 | m >>> 22), m = v + (p ^ (T | ~g)) + _[2] + 718787259 & 4294967295, v = T + (m << 15 & 4294967295 | m >>> 17), m = g + (T ^ (v | ~p)) + _[9] + 3951481745 & 4294967295, E.g[0] = E.g[0] + p & 4294967295, E.g[1] = E.g[1] + (v + (m << 21 & 4294967295 | m >>> 11)) & 4294967295, E.g[2] = E.g[2] + v & 4294967295, E.g[3] = E.g[3] + T & 4294967295;
  }
  r.prototype.u = function(E, p) {
    p === void 0 && (p = E.length);
    for (var g = p - this.blockSize, _ = this.B, v = this.h, T = 0; T < p; ) {
      if (v == 0) for (; T <= g; ) i(this, E, T), T += this.blockSize;
      if (typeof E == "string") {
        for (; T < p; )
          if (_[v++] = E.charCodeAt(T++), v == this.blockSize) {
            i(this, _), v = 0;
            break;
          }
      } else for (; T < p; ) if (_[v++] = E[T++], v == this.blockSize) {
        i(this, _), v = 0;
        break;
      }
    }
    this.h = v, this.o += p;
  }, r.prototype.v = function() {
    var E = Array((56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h);
    E[0] = 128;
    for (var p = 1; p < E.length - 8; ++p) E[p] = 0;
    var g = 8 * this.o;
    for (p = E.length - 8; p < E.length; ++p) E[p] = g & 255, g /= 256;
    for (this.u(E), E = Array(16), p = g = 0; 4 > p; ++p) for (var _ = 0; 32 > _; _ += 8) E[g++] = this.g[p] >>> _ & 255;
    return E;
  };
  function o(E, p) {
    var g = u;
    return Object.prototype.hasOwnProperty.call(g, E) ? g[E] : g[E] = p(E);
  }
  function l(E, p) {
    this.h = p;
    for (var g = [], _ = !0, v = E.length - 1; 0 <= v; v--) {
      var T = E[v] | 0;
      _ && T == p || (g[v] = T, _ = !1);
    }
    this.g = g;
  }
  var u = {};
  function h(E) {
    return -128 <= E && 128 > E ? o(E, function(p) {
      return new l([p | 0], 0 > p ? -1 : 0);
    }) : new l([E | 0], 0 > E ? -1 : 0);
  }
  function f(E) {
    if (isNaN(E) || !isFinite(E)) return w;
    if (0 > E) return N(f(-E));
    for (var p = [], g = 1, _ = 0; E >= g; _++) p[_] = E / g | 0, g *= 4294967296;
    return new l(p, 0);
  }
  function y(E, p) {
    if (E.length == 0) throw Error("number format error: empty string");
    if (p = p || 10, 2 > p || 36 < p) throw Error("radix out of range: " + p);
    if (E.charAt(0) == "-") return N(y(E.substring(1), p));
    if (0 <= E.indexOf("-")) throw Error('number format error: interior "-" character');
    for (var g = f(Math.pow(p, 8)), _ = w, v = 0; v < E.length; v += 8) {
      var T = Math.min(8, E.length - v), m = parseInt(E.substring(v, v + T), p);
      8 > T ? (T = f(Math.pow(p, T)), _ = _.j(T).add(f(m))) : (_ = _.j(g), _ = _.add(f(m)));
    }
    return _;
  }
  var w = h(0), R = h(1), C = h(16777216);
  n = l.prototype, n.m = function() {
    if (O(this)) return -N(this).m();
    for (var E = 0, p = 1, g = 0; g < this.g.length; g++) {
      var _ = this.i(g);
      E += (0 <= _ ? _ : 4294967296 + _) * p, p *= 4294967296;
    }
    return E;
  }, n.toString = function(E) {
    if (E = E || 10, 2 > E || 36 < E) throw Error("radix out of range: " + E);
    if (k(this)) return "0";
    if (O(this)) return "-" + N(this).toString(E);
    for (var p = f(Math.pow(E, 6)), g = this, _ = ""; ; ) {
      var v = z(g, p).g;
      g = H(g, v.j(p));
      var T = ((0 < g.g.length ? g.g[0] : g.h) >>> 0).toString(E);
      if (g = v, k(g)) return T + _;
      for (; 6 > T.length; ) T = "0" + T;
      _ = T + _;
    }
  }, n.i = function(E) {
    return 0 > E ? 0 : E < this.g.length ? this.g[E] : this.h;
  };
  function k(E) {
    if (E.h != 0) return !1;
    for (var p = 0; p < E.g.length; p++) if (E.g[p] != 0) return !1;
    return !0;
  }
  function O(E) {
    return E.h == -1;
  }
  n.l = function(E) {
    return E = H(this, E), O(E) ? -1 : k(E) ? 0 : 1;
  };
  function N(E) {
    for (var p = E.g.length, g = [], _ = 0; _ < p; _++) g[_] = ~E.g[_];
    return new l(g, ~E.h).add(R);
  }
  n.abs = function() {
    return O(this) ? N(this) : this;
  }, n.add = function(E) {
    for (var p = Math.max(this.g.length, E.g.length), g = [], _ = 0, v = 0; v <= p; v++) {
      var T = _ + (this.i(v) & 65535) + (E.i(v) & 65535), m = (T >>> 16) + (this.i(v) >>> 16) + (E.i(v) >>> 16);
      _ = m >>> 16, T &= 65535, m &= 65535, g[v] = m << 16 | T;
    }
    return new l(g, g[g.length - 1] & -2147483648 ? -1 : 0);
  };
  function H(E, p) {
    return E.add(N(p));
  }
  n.j = function(E) {
    if (k(this) || k(E)) return w;
    if (O(this)) return O(E) ? N(this).j(N(E)) : N(N(this).j(E));
    if (O(E)) return N(this.j(N(E)));
    if (0 > this.l(C) && 0 > E.l(C)) return f(this.m() * E.m());
    for (var p = this.g.length + E.g.length, g = [], _ = 0; _ < 2 * p; _++) g[_] = 0;
    for (_ = 0; _ < this.g.length; _++) for (var v = 0; v < E.g.length; v++) {
      var T = this.i(_) >>> 16, m = this.i(_) & 65535, _e = E.i(v) >>> 16, $t = E.i(v) & 65535;
      g[2 * _ + 2 * v] += m * $t, F(g, 2 * _ + 2 * v), g[2 * _ + 2 * v + 1] += T * $t, F(g, 2 * _ + 2 * v + 1), g[2 * _ + 2 * v + 1] += m * _e, F(g, 2 * _ + 2 * v + 1), g[2 * _ + 2 * v + 2] += T * _e, F(g, 2 * _ + 2 * v + 2);
    }
    for (_ = 0; _ < p; _++) g[_] = g[2 * _ + 1] << 16 | g[2 * _];
    for (_ = p; _ < 2 * p; _++) g[_] = 0;
    return new l(g, 0);
  };
  function F(E, p) {
    for (; (E[p] & 65535) != E[p]; ) E[p + 1] += E[p] >>> 16, E[p] &= 65535, p++;
  }
  function j(E, p) {
    this.g = E, this.h = p;
  }
  function z(E, p) {
    if (k(p)) throw Error("division by zero");
    if (k(E)) return new j(w, w);
    if (O(E)) return p = z(N(E), p), new j(N(p.g), N(p.h));
    if (O(p)) return p = z(E, N(p)), new j(N(p.g), p.h);
    if (30 < E.g.length) {
      if (O(E) || O(p)) throw Error("slowDivide_ only works with positive integers.");
      for (var g = R, _ = p; 0 >= _.l(E); ) g = Ee(g), _ = Ee(_);
      var v = Y(g, 1), T = Y(_, 1);
      for (_ = Y(_, 2), g = Y(g, 2); !k(_); ) {
        var m = T.add(_);
        0 >= m.l(E) && (v = v.add(g), T = m), _ = Y(_, 1), g = Y(g, 1);
      }
      return p = H(E, v.j(p)), new j(v, p);
    }
    for (v = w; 0 <= E.l(p); ) {
      for (g = Math.max(1, Math.floor(E.m() / p.m())), _ = Math.ceil(Math.log(g) / Math.LN2), _ = 48 >= _ ? 1 : Math.pow(2, _ - 48), T = f(g), m = T.j(p); O(m) || 0 < m.l(E); ) g -= _, T = f(g), m = T.j(p);
      k(T) && (T = R), v = v.add(T), E = H(E, m);
    }
    return new j(v, E);
  }
  n.A = function(E) {
    return z(this, E).h;
  }, n.and = function(E) {
    for (var p = Math.max(this.g.length, E.g.length), g = [], _ = 0; _ < p; _++) g[_] = this.i(_) & E.i(_);
    return new l(g, this.h & E.h);
  }, n.or = function(E) {
    for (var p = Math.max(this.g.length, E.g.length), g = [], _ = 0; _ < p; _++) g[_] = this.i(_) | E.i(_);
    return new l(g, this.h | E.h);
  }, n.xor = function(E) {
    for (var p = Math.max(this.g.length, E.g.length), g = [], _ = 0; _ < p; _++) g[_] = this.i(_) ^ E.i(_);
    return new l(g, this.h ^ E.h);
  };
  function Ee(E) {
    for (var p = E.g.length + 1, g = [], _ = 0; _ < p; _++) g[_] = E.i(_) << 1 | E.i(_ - 1) >>> 31;
    return new l(g, E.h);
  }
  function Y(E, p) {
    var g = p >> 5;
    p %= 32;
    for (var _ = E.g.length - g, v = [], T = 0; T < _; T++) v[T] = 0 < p ? E.i(T + g) >>> p | E.i(T + g + 1) << 32 - p : E.i(T + g);
    return new l(v, E.h);
  }
  r.prototype.digest = r.prototype.v, r.prototype.reset = r.prototype.s, r.prototype.update = r.prototype.u, l.prototype.add = l.prototype.add, l.prototype.multiply = l.prototype.j, l.prototype.modulo = l.prototype.A, l.prototype.compare = l.prototype.l, l.prototype.toNumber = l.prototype.m, l.prototype.toString = l.prototype.toString, l.prototype.getBits = l.prototype.i, l.fromNumber = f, l.fromString = y, Oa = l;
}).apply(typeof ko < "u" ? ko : typeof self < "u" ? self : typeof window < "u" ? window : {});
var Yn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/
var Va, ln, Ma, ir, Ci, La, xa, Ua;
(function() {
  var n, e = typeof Object.defineProperties == "function" ? Object.defineProperty : function(s, a, c) {
    return s == Array.prototype || s == Object.prototype || (s[a] = c.value), s;
  };
  function t(s) {
    s = [typeof globalThis == "object" && globalThis, s, typeof window == "object" && window, typeof self == "object" && self, typeof Yn == "object" && Yn];
    for (var a = 0; a < s.length; ++a) {
      var c = s[a];
      if (c && c.Math == Math) return c;
    }
    throw Error("Cannot find global object");
  }
  var r = t(this);
  function i(s, a) {
    if (a) e: {
      var c = r;
      s = s.split(".");
      for (var d = 0; d < s.length - 1; d++) {
        var I = s[d];
        if (!(I in c)) break e;
        c = c[I];
      }
      s = s[s.length - 1], d = c[s], a = a(d), a != d && a != null && e(c, s, { configurable: !0, writable: !0, value: a });
    }
  }
  function o(s, a) {
    s instanceof String && (s += "");
    var c = 0, d = !1, I = { next: function() {
      if (!d && c < s.length) {
        var A = c++;
        return { value: a(A, s[A]), done: !1 };
      }
      return d = !0, { done: !0, value: void 0 };
    } };
    return I[Symbol.iterator] = function() {
      return I;
    }, I;
  }
  i("Array.prototype.values", function(s) {
    return s || function() {
      return o(this, function(a, c) {
        return c;
      });
    };
  });
  /** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
  var l = l || {}, u = this || self;
  function h(s) {
    var a = typeof s;
    return a = a != "object" ? a : s ? Array.isArray(s) ? "array" : a : "null", a == "array" || a == "object" && typeof s.length == "number";
  }
  function f(s) {
    var a = typeof s;
    return a == "object" && s != null || a == "function";
  }
  function y(s, a, c) {
    return s.call.apply(s.bind, arguments);
  }
  function w(s, a, c) {
    if (!s) throw Error();
    if (2 < arguments.length) {
      var d = Array.prototype.slice.call(arguments, 2);
      return function() {
        var I = Array.prototype.slice.call(arguments);
        return Array.prototype.unshift.apply(I, d), s.apply(a, I);
      };
    }
    return function() {
      return s.apply(a, arguments);
    };
  }
  function R(s, a, c) {
    return R = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? y : w, R.apply(null, arguments);
  }
  function C(s, a) {
    var c = Array.prototype.slice.call(arguments, 1);
    return function() {
      var d = c.slice();
      return d.push.apply(d, arguments), s.apply(this, d);
    };
  }
  function k(s, a) {
    function c() {
    }
    c.prototype = a.prototype, s.aa = a.prototype, s.prototype = new c(), s.prototype.constructor = s, s.Qb = function(d, I, A) {
      for (var P = Array(arguments.length - 2), q = 2; q < arguments.length; q++) P[q - 2] = arguments[q];
      return a.prototype[I].apply(d, P);
    };
  }
  function O(s) {
    const a = s.length;
    if (0 < a) {
      const c = Array(a);
      for (let d = 0; d < a; d++) c[d] = s[d];
      return c;
    }
    return [];
  }
  function N(s, a) {
    for (let c = 1; c < arguments.length; c++) {
      const d = arguments[c];
      if (h(d)) {
        const I = s.length || 0, A = d.length || 0;
        s.length = I + A;
        for (let P = 0; P < A; P++) s[I + P] = d[P];
      } else s.push(d);
    }
  }
  class H {
    constructor(a, c) {
      this.i = a, this.j = c, this.h = 0, this.g = null;
    }
    get() {
      let a;
      return 0 < this.h ? (this.h--, a = this.g, this.g = a.next, a.next = null) : a = this.i(), a;
    }
  }
  function F(s) {
    return /^[\s\xa0]*$/.test(s);
  }
  function j() {
    var s = u.navigator;
    return s && (s = s.userAgent) ? s : "";
  }
  function z(s) {
    return z[" "](s), s;
  }
  z[" "] = function() {
  };
  var Ee = j().indexOf("Gecko") != -1 && !(j().toLowerCase().indexOf("webkit") != -1 && j().indexOf("Edge") == -1) && !(j().indexOf("Trident") != -1 || j().indexOf("MSIE") != -1) && j().indexOf("Edge") == -1;
  function Y(s, a, c) {
    for (const d in s) a.call(c, s[d], d, s);
  }
  function E(s, a) {
    for (const c in s) a.call(void 0, s[c], c, s);
  }
  function p(s) {
    const a = {};
    for (const c in s) a[c] = s[c];
    return a;
  }
  const g = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
  function _(s, a) {
    let c, d;
    for (let I = 1; I < arguments.length; I++) {
      d = arguments[I];
      for (c in d) s[c] = d[c];
      for (let A = 0; A < g.length; A++) c = g[A], Object.prototype.hasOwnProperty.call(d, c) && (s[c] = d[c]);
    }
  }
  function v(s) {
    var a = 1;
    s = s.split(":");
    const c = [];
    for (; 0 < a && s.length; ) c.push(s.shift()), a--;
    return s.length && c.push(s.join(":")), c;
  }
  function T(s) {
    u.setTimeout(() => {
      throw s;
    }, 0);
  }
  function m() {
    var s = Br;
    let a = null;
    return s.g && (a = s.g, s.g = s.g.next, s.g || (s.h = null), a.next = null), a;
  }
  class _e {
    constructor() {
      this.h = this.g = null;
    }
    add(a, c) {
      const d = $t.get();
      d.set(a, c), this.h ? this.h.next = d : this.g = d, this.h = d;
    }
  }
  var $t = new H(() => new hc(), (s) => s.reset());
  class hc {
    constructor() {
      this.next = this.g = this.h = null;
    }
    set(a, c) {
      this.h = a, this.g = c, this.next = null;
    }
    reset() {
      this.next = this.g = this.h = null;
    }
  }
  let Ht, zt = !1, Br = new _e(), Es = () => {
    const s = u.Promise.resolve(void 0);
    Ht = () => {
      s.then(dc);
    };
  };
  var dc = () => {
    for (var s; s = m(); ) {
      try {
        s.h.call(s.g);
      } catch (c) {
        T(c);
      }
      var a = $t;
      a.j(s), 100 > a.h && (a.h++, s.next = a.g, a.g = s);
    }
    zt = !1;
  };
  function He() {
    this.s = this.s, this.C = this.C;
  }
  He.prototype.s = !1, He.prototype.ma = function() {
    this.s || (this.s = !0, this.N());
  }, He.prototype.N = function() {
    if (this.C) for (; this.C.length; ) this.C.shift()();
  };
  function le(s, a) {
    this.type = s, this.g = this.target = a, this.defaultPrevented = !1;
  }
  le.prototype.h = function() {
    this.defaultPrevented = !0;
  };
  var fc = function() {
    if (!u.addEventListener || !Object.defineProperty) return !1;
    var s = !1, a = Object.defineProperty({}, "passive", { get: function() {
      s = !0;
    } });
    try {
      const c = () => {
      };
      u.addEventListener("test", c, a), u.removeEventListener("test", c, a);
    } catch {
    }
    return s;
  }();
  function qt(s, a) {
    if (le.call(this, s ? s.type : ""), this.relatedTarget = this.g = this.target = null, this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0, this.key = "", this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1, this.state = null, this.pointerId = 0, this.pointerType = "", this.i = null, s) {
      var c = this.type = s.type, d = s.changedTouches && s.changedTouches.length ? s.changedTouches[0] : null;
      if (this.target = s.target || s.srcElement, this.g = a, a = s.relatedTarget) {
        if (Ee) {
          e: {
            try {
              z(a.nodeName);
              var I = !0;
              break e;
            } catch {
            }
            I = !1;
          }
          I || (a = null);
        }
      } else c == "mouseover" ? a = s.fromElement : c == "mouseout" && (a = s.toElement);
      this.relatedTarget = a, d ? (this.clientX = d.clientX !== void 0 ? d.clientX : d.pageX, this.clientY = d.clientY !== void 0 ? d.clientY : d.pageY, this.screenX = d.screenX || 0, this.screenY = d.screenY || 0) : (this.clientX = s.clientX !== void 0 ? s.clientX : s.pageX, this.clientY = s.clientY !== void 0 ? s.clientY : s.pageY, this.screenX = s.screenX || 0, this.screenY = s.screenY || 0), this.button = s.button, this.key = s.key || "", this.ctrlKey = s.ctrlKey, this.altKey = s.altKey, this.shiftKey = s.shiftKey, this.metaKey = s.metaKey, this.pointerId = s.pointerId || 0, this.pointerType = typeof s.pointerType == "string" ? s.pointerType : pc[s.pointerType] || "", this.state = s.state, this.i = s, s.defaultPrevented && qt.aa.h.call(this);
    }
  }
  k(qt, le);
  var pc = { 2: "touch", 3: "pen", 4: "mouse" };
  qt.prototype.h = function() {
    qt.aa.h.call(this);
    var s = this.i;
    s.preventDefault ? s.preventDefault() : s.returnValue = !1;
  };
  var On = "closure_listenable_" + (1e6 * Math.random() | 0), mc = 0;
  function gc(s, a, c, d, I) {
    this.listener = s, this.proxy = null, this.src = a, this.type = c, this.capture = !!d, this.ha = I, this.key = ++mc, this.da = this.fa = !1;
  }
  function Vn(s) {
    s.da = !0, s.listener = null, s.proxy = null, s.src = null, s.ha = null;
  }
  function Mn(s) {
    this.src = s, this.g = {}, this.h = 0;
  }
  Mn.prototype.add = function(s, a, c, d, I) {
    var A = s.toString();
    s = this.g[A], s || (s = this.g[A] = [], this.h++);
    var P = $r(s, a, d, I);
    return -1 < P ? (a = s[P], c || (a.fa = !1)) : (a = new gc(a, this.src, A, !!d, I), a.fa = c, s.push(a)), a;
  };
  function jr(s, a) {
    var c = a.type;
    if (c in s.g) {
      var d = s.g[c], I = Array.prototype.indexOf.call(d, a, void 0), A;
      (A = 0 <= I) && Array.prototype.splice.call(d, I, 1), A && (Vn(a), s.g[c].length == 0 && (delete s.g[c], s.h--));
    }
  }
  function $r(s, a, c, d) {
    for (var I = 0; I < s.length; ++I) {
      var A = s[I];
      if (!A.da && A.listener == a && A.capture == !!c && A.ha == d) return I;
    }
    return -1;
  }
  var Hr = "closure_lm_" + (1e6 * Math.random() | 0), zr = {};
  function Ts(s, a, c, d, I) {
    if (Array.isArray(a)) {
      for (var A = 0; A < a.length; A++) Ts(s, a[A], c, d, I);
      return null;
    }
    return c = As(c), s && s[On] ? s.K(a, c, f(d) ? !!d.capture : !1, I) : _c(s, a, c, !1, d, I);
  }
  function _c(s, a, c, d, I, A) {
    if (!a) throw Error("Invalid event type");
    var P = f(I) ? !!I.capture : !!I, q = Gr(s);
    if (q || (s[Hr] = q = new Mn(s)), c = q.add(a, c, d, P, A), c.proxy) return c;
    if (d = yc(), c.proxy = d, d.src = s, d.listener = c, s.addEventListener) fc || (I = P), I === void 0 && (I = !1), s.addEventListener(a.toString(), d, I);
    else if (s.attachEvent) s.attachEvent(ws(a.toString()), d);
    else if (s.addListener && s.removeListener) s.addListener(d);
    else throw Error("addEventListener and attachEvent are unavailable.");
    return c;
  }
  function yc() {
    function s(c) {
      return a.call(s.src, s.listener, c);
    }
    const a = vc;
    return s;
  }
  function Is(s, a, c, d, I) {
    if (Array.isArray(a)) for (var A = 0; A < a.length; A++) Is(s, a[A], c, d, I);
    else d = f(d) ? !!d.capture : !!d, c = As(c), s && s[On] ? (s = s.i, a = String(a).toString(), a in s.g && (A = s.g[a], c = $r(A, c, d, I), -1 < c && (Vn(A[c]), Array.prototype.splice.call(A, c, 1), A.length == 0 && (delete s.g[a], s.h--)))) : s && (s = Gr(s)) && (a = s.g[a.toString()], s = -1, a && (s = $r(a, c, d, I)), (c = -1 < s ? a[s] : null) && qr(c));
  }
  function qr(s) {
    if (typeof s != "number" && s && !s.da) {
      var a = s.src;
      if (a && a[On]) jr(a.i, s);
      else {
        var c = s.type, d = s.proxy;
        a.removeEventListener ? a.removeEventListener(c, d, s.capture) : a.detachEvent ? a.detachEvent(ws(c), d) : a.addListener && a.removeListener && a.removeListener(d), (c = Gr(a)) ? (jr(c, s), c.h == 0 && (c.src = null, a[Hr] = null)) : Vn(s);
      }
    }
  }
  function ws(s) {
    return s in zr ? zr[s] : zr[s] = "on" + s;
  }
  function vc(s, a) {
    if (s.da) s = !0;
    else {
      a = new qt(a, this);
      var c = s.listener, d = s.ha || s.src;
      s.fa && qr(s), s = c.call(d, a);
    }
    return s;
  }
  function Gr(s) {
    return s = s[Hr], s instanceof Mn ? s : null;
  }
  var Kr = "__closure_events_fn_" + (1e9 * Math.random() >>> 0);
  function As(s) {
    return typeof s == "function" ? s : (s[Kr] || (s[Kr] = function(a) {
      return s.handleEvent(a);
    }), s[Kr]);
  }
  function ce() {
    He.call(this), this.i = new Mn(this), this.M = this, this.F = null;
  }
  k(ce, He), ce.prototype[On] = !0, ce.prototype.removeEventListener = function(s, a, c, d) {
    Is(this, s, a, c, d);
  };
  function ye(s, a) {
    var c, d = s.F;
    if (d) for (c = []; d; d = d.F) c.push(d);
    if (s = s.M, d = a.type || a, typeof a == "string") a = new le(a, s);
    else if (a instanceof le) a.target = a.target || s;
    else {
      var I = a;
      a = new le(d, s), _(a, I);
    }
    if (I = !0, c) for (var A = c.length - 1; 0 <= A; A--) {
      var P = a.g = c[A];
      I = Ln(P, d, !0, a) && I;
    }
    if (P = a.g = s, I = Ln(P, d, !0, a) && I, I = Ln(P, d, !1, a) && I, c) for (A = 0; A < c.length; A++) P = a.g = c[A], I = Ln(P, d, !1, a) && I;
  }
  ce.prototype.N = function() {
    if (ce.aa.N.call(this), this.i) {
      var s = this.i, a;
      for (a in s.g) {
        for (var c = s.g[a], d = 0; d < c.length; d++) Vn(c[d]);
        delete s.g[a], s.h--;
      }
    }
    this.F = null;
  }, ce.prototype.K = function(s, a, c, d) {
    return this.i.add(String(s), a, !1, c, d);
  }, ce.prototype.L = function(s, a, c, d) {
    return this.i.add(String(s), a, !0, c, d);
  };
  function Ln(s, a, c, d) {
    if (a = s.i.g[String(a)], !a) return !0;
    a = a.concat();
    for (var I = !0, A = 0; A < a.length; ++A) {
      var P = a[A];
      if (P && !P.da && P.capture == c) {
        var q = P.listener, ie = P.ha || P.src;
        P.fa && jr(s.i, P), I = q.call(ie, d) !== !1 && I;
      }
    }
    return I && !d.defaultPrevented;
  }
  function Rs(s, a, c) {
    if (typeof s == "function") c && (s = R(s, c));
    else if (s && typeof s.handleEvent == "function") s = R(s.handleEvent, s);
    else throw Error("Invalid listener argument");
    return 2147483647 < Number(a) ? -1 : u.setTimeout(s, a || 0);
  }
  function bs(s) {
    s.g = Rs(() => {
      s.g = null, s.i && (s.i = !1, bs(s));
    }, s.l);
    const a = s.h;
    s.h = null, s.m.apply(null, a);
  }
  class Ec extends He {
    constructor(a, c) {
      super(), this.m = a, this.l = c, this.h = null, this.i = !1, this.g = null;
    }
    j(a) {
      this.h = arguments, this.g ? this.i = !0 : bs(this);
    }
    N() {
      super.N(), this.g && (u.clearTimeout(this.g), this.g = null, this.i = !1, this.h = null);
    }
  }
  function Gt(s) {
    He.call(this), this.h = s, this.g = {};
  }
  k(Gt, He);
  var Ss = [];
  function Ps(s) {
    Y(s.g, function(a, c) {
      this.g.hasOwnProperty(c) && qr(a);
    }, s), s.g = {};
  }
  Gt.prototype.N = function() {
    Gt.aa.N.call(this), Ps(this);
  }, Gt.prototype.handleEvent = function() {
    throw Error("EventHandler.handleEvent not implemented");
  };
  var Wr = u.JSON.stringify, Tc = u.JSON.parse, Ic = class {
    stringify(s) {
      return u.JSON.stringify(s, void 0);
    }
    parse(s) {
      return u.JSON.parse(s, void 0);
    }
  };
  function Qr() {
  }
  Qr.prototype.h = null;
  function Cs(s) {
    return s.h || (s.h = s.i());
  }
  function ks() {
  }
  var Kt = { OPEN: "a", kb: "b", Ja: "c", wb: "d" };
  function Jr() {
    le.call(this, "d");
  }
  k(Jr, le);
  function Xr() {
    le.call(this, "c");
  }
  k(Xr, le);
  var ot = {}, Ns = null;
  function xn() {
    return Ns = Ns || new ce();
  }
  ot.La = "serverreachability";
  function Ds(s) {
    le.call(this, ot.La, s);
  }
  k(Ds, le);
  function Wt(s) {
    const a = xn();
    ye(a, new Ds(a));
  }
  ot.STAT_EVENT = "statevent";
  function Os(s, a) {
    le.call(this, ot.STAT_EVENT, s), this.stat = a;
  }
  k(Os, le);
  function ve(s) {
    const a = xn();
    ye(a, new Os(a, s));
  }
  ot.Ma = "timingevent";
  function Vs(s, a) {
    le.call(this, ot.Ma, s), this.size = a;
  }
  k(Vs, le);
  function Qt(s, a) {
    if (typeof s != "function") throw Error("Fn must not be null and must be a function");
    return u.setTimeout(function() {
      s();
    }, a);
  }
  function Jt() {
    this.g = !0;
  }
  Jt.prototype.xa = function() {
    this.g = !1;
  };
  function wc(s, a, c, d, I, A) {
    s.info(function() {
      if (s.g) if (A)
        for (var P = "", q = A.split("&"), ie = 0; ie < q.length; ie++) {
          var $ = q[ie].split("=");
          if (1 < $.length) {
            var ue = $[0];
            $ = $[1];
            var he = ue.split("_");
            P = 2 <= he.length && he[1] == "type" ? P + (ue + "=" + $ + "&") : P + (ue + "=redacted&");
          }
        }
      else P = null;
      else P = A;
      return "XMLHTTP REQ (" + d + ") [attempt " + I + "]: " + a + `
` + c + `
` + P;
    });
  }
  function Ac(s, a, c, d, I, A, P) {
    s.info(function() {
      return "XMLHTTP RESP (" + d + ") [ attempt " + I + "]: " + a + `
` + c + `
` + A + " " + P;
    });
  }
  function Tt(s, a, c, d) {
    s.info(function() {
      return "XMLHTTP TEXT (" + a + "): " + bc(s, c) + (d ? " " + d : "");
    });
  }
  function Rc(s, a) {
    s.info(function() {
      return "TIMEOUT: " + a;
    });
  }
  Jt.prototype.info = function() {
  };
  function bc(s, a) {
    if (!s.g) return a;
    if (!a) return null;
    try {
      var c = JSON.parse(a);
      if (c) {
        for (s = 0; s < c.length; s++) if (Array.isArray(c[s])) {
          var d = c[s];
          if (!(2 > d.length)) {
            var I = d[1];
            if (Array.isArray(I) && !(1 > I.length)) {
              var A = I[0];
              if (A != "noop" && A != "stop" && A != "close") for (var P = 1; P < I.length; P++) I[P] = "";
            }
          }
        }
      }
      return Wr(c);
    } catch {
      return a;
    }
  }
  var Un = { NO_ERROR: 0, gb: 1, tb: 2, sb: 3, nb: 4, rb: 5, ub: 6, Ia: 7, TIMEOUT: 8, xb: 9 }, Ms = { lb: "complete", Hb: "success", Ja: "error", Ia: "abort", zb: "ready", Ab: "readystatechange", TIMEOUT: "timeout", vb: "incrementaldata", yb: "progress", ob: "downloadprogress", Pb: "uploadprogress" }, Yr;
  function Fn() {
  }
  k(Fn, Qr), Fn.prototype.g = function() {
    return new XMLHttpRequest();
  }, Fn.prototype.i = function() {
    return {};
  }, Yr = new Fn();
  function ze(s, a, c, d) {
    this.j = s, this.i = a, this.l = c, this.R = d || 1, this.U = new Gt(this), this.I = 45e3, this.H = null, this.o = !1, this.m = this.A = this.v = this.L = this.F = this.S = this.B = null, this.D = [], this.g = null, this.C = 0, this.s = this.u = null, this.X = -1, this.J = !1, this.O = 0, this.M = null, this.W = this.K = this.T = this.P = !1, this.h = new Ls();
  }
  function Ls() {
    this.i = null, this.g = "", this.h = !1;
  }
  var xs = {}, Zr = {};
  function ei(s, a, c) {
    s.L = 1, s.v = Hn(De(a)), s.m = c, s.P = !0, Us(s, null);
  }
  function Us(s, a) {
    s.F = Date.now(), Bn(s), s.A = De(s.v);
    var c = s.A, d = s.R;
    Array.isArray(d) || (d = [String(d)]), Ys(c.i, "t", d), s.C = 0, c = s.j.J, s.h = new Ls(), s.g = _o(s.j, c ? a : null, !s.m), 0 < s.O && (s.M = new Ec(R(s.Y, s, s.g), s.O)), a = s.U, c = s.g, d = s.ca;
    var I = "readystatechange";
    Array.isArray(I) || (I && (Ss[0] = I.toString()), I = Ss);
    for (var A = 0; A < I.length; A++) {
      var P = Ts(c, I[A], d || a.handleEvent, !1, a.h || a);
      if (!P) break;
      a.g[P.key] = P;
    }
    a = s.H ? p(s.H) : {}, s.m ? (s.u || (s.u = "POST"), a["Content-Type"] = "application/x-www-form-urlencoded", s.g.ea(
      s.A,
      s.u,
      s.m,
      a
    )) : (s.u = "GET", s.g.ea(s.A, s.u, null, a)), Wt(), wc(s.i, s.u, s.A, s.l, s.R, s.m);
  }
  ze.prototype.ca = function(s) {
    s = s.target;
    const a = this.M;
    a && Oe(s) == 3 ? a.j() : this.Y(s);
  }, ze.prototype.Y = function(s) {
    try {
      if (s == this.g) e: {
        const he = Oe(this.g);
        var a = this.g.Ba();
        const At = this.g.Z();
        if (!(3 > he) && (he != 3 || this.g && (this.h.h || this.g.oa() || so(this.g)))) {
          this.J || he != 4 || a == 7 || (a == 8 || 0 >= At ? Wt(3) : Wt(2)), ti(this);
          var c = this.g.Z();
          this.X = c;
          t: if (Fs(this)) {
            var d = so(this.g);
            s = "";
            var I = d.length, A = Oe(this.g) == 4;
            if (!this.h.i) {
              if (typeof TextDecoder > "u") {
                at(this), Xt(this);
                var P = "";
                break t;
              }
              this.h.i = new u.TextDecoder();
            }
            for (a = 0; a < I; a++) this.h.h = !0, s += this.h.i.decode(d[a], { stream: !(A && a == I - 1) });
            d.length = 0, this.h.g += s, this.C = 0, P = this.h.g;
          } else P = this.g.oa();
          if (this.o = c == 200, Ac(this.i, this.u, this.A, this.l, this.R, he, c), this.o) {
            if (this.T && !this.K) {
              t: {
                if (this.g) {
                  var q, ie = this.g;
                  if ((q = ie.g ? ie.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !F(q)) {
                    var $ = q;
                    break t;
                  }
                }
                $ = null;
              }
              if (c = $) Tt(this.i, this.l, c, "Initial handshake response via X-HTTP-Initial-Response"), this.K = !0, ni(this, c);
              else {
                this.o = !1, this.s = 3, ve(12), at(this), Xt(this);
                break e;
              }
            }
            if (this.P) {
              c = !0;
              let we;
              for (; !this.J && this.C < P.length; ) if (we = Sc(this, P), we == Zr) {
                he == 4 && (this.s = 4, ve(14), c = !1), Tt(this.i, this.l, null, "[Incomplete Response]");
                break;
              } else if (we == xs) {
                this.s = 4, ve(15), Tt(this.i, this.l, P, "[Invalid Chunk]"), c = !1;
                break;
              } else Tt(this.i, this.l, we, null), ni(this, we);
              if (Fs(this) && this.C != 0 && (this.h.g = this.h.g.slice(this.C), this.C = 0), he != 4 || P.length != 0 || this.h.h || (this.s = 1, ve(16), c = !1), this.o = this.o && c, !c) Tt(this.i, this.l, P, "[Invalid Chunked Response]"), at(this), Xt(this);
              else if (0 < P.length && !this.W) {
                this.W = !0;
                var ue = this.j;
                ue.g == this && ue.ba && !ue.M && (ue.j.info("Great, no buffering proxy detected. Bytes received: " + P.length), li(ue), ue.M = !0, ve(11));
              }
            } else Tt(this.i, this.l, P, null), ni(this, P);
            he == 4 && at(this), this.o && !this.J && (he == 4 ? fo(this.j, this) : (this.o = !1, Bn(this)));
          } else zc(this.g), c == 400 && 0 < P.indexOf("Unknown SID") ? (this.s = 3, ve(12)) : (this.s = 0, ve(13)), at(this), Xt(this);
        }
      }
    } catch {
    } finally {
    }
  };
  function Fs(s) {
    return s.g ? s.u == "GET" && s.L != 2 && s.j.Ca : !1;
  }
  function Sc(s, a) {
    var c = s.C, d = a.indexOf(`
`, c);
    return d == -1 ? Zr : (c = Number(a.substring(c, d)), isNaN(c) ? xs : (d += 1, d + c > a.length ? Zr : (a = a.slice(d, d + c), s.C = d + c, a)));
  }
  ze.prototype.cancel = function() {
    this.J = !0, at(this);
  };
  function Bn(s) {
    s.S = Date.now() + s.I, Bs(s, s.I);
  }
  function Bs(s, a) {
    if (s.B != null) throw Error("WatchDog timer not null");
    s.B = Qt(R(s.ba, s), a);
  }
  function ti(s) {
    s.B && (u.clearTimeout(s.B), s.B = null);
  }
  ze.prototype.ba = function() {
    this.B = null;
    const s = Date.now();
    0 <= s - this.S ? (Rc(this.i, this.A), this.L != 2 && (Wt(), ve(17)), at(this), this.s = 2, Xt(this)) : Bs(this, this.S - s);
  };
  function Xt(s) {
    s.j.G == 0 || s.J || fo(s.j, s);
  }
  function at(s) {
    ti(s);
    var a = s.M;
    a && typeof a.ma == "function" && a.ma(), s.M = null, Ps(s.U), s.g && (a = s.g, s.g = null, a.abort(), a.ma());
  }
  function ni(s, a) {
    try {
      var c = s.j;
      if (c.G != 0 && (c.g == s || ri(c.h, s))) {
        if (!s.K && ri(c.h, s) && c.G == 3) {
          try {
            var d = c.Da.g.parse(a);
          } catch {
            d = null;
          }
          if (Array.isArray(d) && d.length == 3) {
            var I = d;
            if (I[0] == 0) {
              e:
                if (!c.u) {
                  if (c.g) if (c.g.F + 3e3 < s.F) Qn(c), Kn(c);
                  else break e;
                  ai(c), ve(18);
                }
            } else c.za = I[1], 0 < c.za - c.T && 37500 > I[2] && c.F && c.v == 0 && !c.C && (c.C = Qt(R(c.Za, c), 6e3));
            if (1 >= Hs(c.h) && c.ca) {
              try {
                c.ca();
              } catch {
              }
              c.ca = void 0;
            }
          } else ct(c, 11);
        } else if ((s.K || c.g == s) && Qn(c), !F(a)) for (I = c.Da.g.parse(a), a = 0; a < I.length; a++) {
          let $ = I[a];
          if (c.T = $[0], $ = $[1], c.G == 2) if ($[0] == "c") {
            c.K = $[1], c.ia = $[2];
            const ue = $[3];
            ue != null && (c.la = ue, c.j.info("VER=" + c.la));
            const he = $[4];
            he != null && (c.Aa = he, c.j.info("SVER=" + c.Aa));
            const At = $[5];
            At != null && typeof At == "number" && 0 < At && (d = 1.5 * At, c.L = d, c.j.info("backChannelRequestTimeoutMs_=" + d)), d = c;
            const we = s.g;
            if (we) {
              const Xn = we.g ? we.g.getResponseHeader("X-Client-Wire-Protocol") : null;
              if (Xn) {
                var A = d.h;
                A.g || Xn.indexOf("spdy") == -1 && Xn.indexOf("quic") == -1 && Xn.indexOf("h2") == -1 || (A.j = A.l, A.g = /* @__PURE__ */ new Set(), A.h && (ii(A, A.h), A.h = null));
              }
              if (d.D) {
                const ci = we.g ? we.g.getResponseHeader("X-HTTP-Session-Id") : null;
                ci && (d.ya = ci, W(d.I, d.D, ci));
              }
            }
            c.G = 3, c.l && c.l.ua(), c.ba && (c.R = Date.now() - s.F, c.j.info("Handshake RTT: " + c.R + "ms")), d = c;
            var P = s;
            if (d.qa = go(d, d.J ? d.ia : null, d.W), P.K) {
              zs(d.h, P);
              var q = P, ie = d.L;
              ie && (q.I = ie), q.B && (ti(q), Bn(q)), d.g = P;
            } else uo(d);
            0 < c.i.length && Wn(c);
          } else $[0] != "stop" && $[0] != "close" || ct(c, 7);
          else c.G == 3 && ($[0] == "stop" || $[0] == "close" ? $[0] == "stop" ? ct(c, 7) : oi(c) : $[0] != "noop" && c.l && c.l.ta($), c.v = 0);
        }
      }
      Wt(4);
    } catch {
    }
  }
  var Pc = class {
    constructor(s, a) {
      this.g = s, this.map = a;
    }
  };
  function js(s) {
    this.l = s || 10, u.PerformanceNavigationTiming ? (s = u.performance.getEntriesByType("navigation"), s = 0 < s.length && (s[0].nextHopProtocol == "hq" || s[0].nextHopProtocol == "h2")) : s = !!(u.chrome && u.chrome.loadTimes && u.chrome.loadTimes() && u.chrome.loadTimes().wasFetchedViaSpdy), this.j = s ? this.l : 1, this.g = null, 1 < this.j && (this.g = /* @__PURE__ */ new Set()), this.h = null, this.i = [];
  }
  function $s(s) {
    return s.h ? !0 : s.g ? s.g.size >= s.j : !1;
  }
  function Hs(s) {
    return s.h ? 1 : s.g ? s.g.size : 0;
  }
  function ri(s, a) {
    return s.h ? s.h == a : s.g ? s.g.has(a) : !1;
  }
  function ii(s, a) {
    s.g ? s.g.add(a) : s.h = a;
  }
  function zs(s, a) {
    s.h && s.h == a ? s.h = null : s.g && s.g.has(a) && s.g.delete(a);
  }
  js.prototype.cancel = function() {
    if (this.i = qs(this), this.h) this.h.cancel(), this.h = null;
    else if (this.g && this.g.size !== 0) {
      for (const s of this.g.values()) s.cancel();
      this.g.clear();
    }
  };
  function qs(s) {
    if (s.h != null) return s.i.concat(s.h.D);
    if (s.g != null && s.g.size !== 0) {
      let a = s.i;
      for (const c of s.g.values()) a = a.concat(c.D);
      return a;
    }
    return O(s.i);
  }
  function Cc(s) {
    if (s.V && typeof s.V == "function") return s.V();
    if (typeof Map < "u" && s instanceof Map || typeof Set < "u" && s instanceof Set) return Array.from(s.values());
    if (typeof s == "string") return s.split("");
    if (h(s)) {
      for (var a = [], c = s.length, d = 0; d < c; d++) a.push(s[d]);
      return a;
    }
    a = [], c = 0;
    for (d in s) a[c++] = s[d];
    return a;
  }
  function kc(s) {
    if (s.na && typeof s.na == "function") return s.na();
    if (!s.V || typeof s.V != "function") {
      if (typeof Map < "u" && s instanceof Map) return Array.from(s.keys());
      if (!(typeof Set < "u" && s instanceof Set)) {
        if (h(s) || typeof s == "string") {
          var a = [];
          s = s.length;
          for (var c = 0; c < s; c++) a.push(c);
          return a;
        }
        a = [], c = 0;
        for (const d in s) a[c++] = d;
        return a;
      }
    }
  }
  function Gs(s, a) {
    if (s.forEach && typeof s.forEach == "function") s.forEach(a, void 0);
    else if (h(s) || typeof s == "string") Array.prototype.forEach.call(s, a, void 0);
    else for (var c = kc(s), d = Cc(s), I = d.length, A = 0; A < I; A++) a.call(void 0, d[A], c && c[A], s);
  }
  var Ks = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
  function Nc(s, a) {
    if (s) {
      s = s.split("&");
      for (var c = 0; c < s.length; c++) {
        var d = s[c].indexOf("="), I = null;
        if (0 <= d) {
          var A = s[c].substring(0, d);
          I = s[c].substring(d + 1);
        } else A = s[c];
        a(A, I ? decodeURIComponent(I.replace(/\+/g, " ")) : "");
      }
    }
  }
  function lt(s) {
    if (this.g = this.o = this.j = "", this.s = null, this.m = this.l = "", this.h = !1, s instanceof lt) {
      this.h = s.h, jn(this, s.j), this.o = s.o, this.g = s.g, $n(this, s.s), this.l = s.l;
      var a = s.i, c = new en();
      c.i = a.i, a.g && (c.g = new Map(a.g), c.h = a.h), Ws(this, c), this.m = s.m;
    } else s && (a = String(s).match(Ks)) ? (this.h = !1, jn(this, a[1] || "", !0), this.o = Yt(a[2] || ""), this.g = Yt(a[3] || "", !0), $n(this, a[4]), this.l = Yt(a[5] || "", !0), Ws(this, a[6] || "", !0), this.m = Yt(a[7] || "")) : (this.h = !1, this.i = new en(null, this.h));
  }
  lt.prototype.toString = function() {
    var s = [], a = this.j;
    a && s.push(Zt(a, Qs, !0), ":");
    var c = this.g;
    return (c || a == "file") && (s.push("//"), (a = this.o) && s.push(Zt(a, Qs, !0), "@"), s.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), c = this.s, c != null && s.push(":", String(c))), (c = this.l) && (this.g && c.charAt(0) != "/" && s.push("/"), s.push(Zt(c, c.charAt(0) == "/" ? Vc : Oc, !0))), (c = this.i.toString()) && s.push("?", c), (c = this.m) && s.push("#", Zt(c, Lc)), s.join("");
  };
  function De(s) {
    return new lt(s);
  }
  function jn(s, a, c) {
    s.j = c ? Yt(a, !0) : a, s.j && (s.j = s.j.replace(/:$/, ""));
  }
  function $n(s, a) {
    if (a) {
      if (a = Number(a), isNaN(a) || 0 > a) throw Error("Bad port number " + a);
      s.s = a;
    } else s.s = null;
  }
  function Ws(s, a, c) {
    a instanceof en ? (s.i = a, xc(s.i, s.h)) : (c || (a = Zt(a, Mc)), s.i = new en(a, s.h));
  }
  function W(s, a, c) {
    s.i.set(a, c);
  }
  function Hn(s) {
    return W(s, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36)), s;
  }
  function Yt(s, a) {
    return s ? a ? decodeURI(s.replace(/%25/g, "%2525")) : decodeURIComponent(s) : "";
  }
  function Zt(s, a, c) {
    return typeof s == "string" ? (s = encodeURI(s).replace(a, Dc), c && (s = s.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), s) : null;
  }
  function Dc(s) {
    return s = s.charCodeAt(0), "%" + (s >> 4 & 15).toString(16) + (s & 15).toString(16);
  }
  var Qs = /[#\/\?@]/g, Oc = /[#\?:]/g, Vc = /[#\?]/g, Mc = /[#\?@]/g, Lc = /#/g;
  function en(s, a) {
    this.h = this.g = null, this.i = s || null, this.j = !!a;
  }
  function qe(s) {
    s.g || (s.g = /* @__PURE__ */ new Map(), s.h = 0, s.i && Nc(s.i, function(a, c) {
      s.add(decodeURIComponent(a.replace(/\+/g, " ")), c);
    }));
  }
  n = en.prototype, n.add = function(s, a) {
    qe(this), this.i = null, s = It(this, s);
    var c = this.g.get(s);
    return c || this.g.set(s, c = []), c.push(a), this.h += 1, this;
  };
  function Js(s, a) {
    qe(s), a = It(s, a), s.g.has(a) && (s.i = null, s.h -= s.g.get(a).length, s.g.delete(a));
  }
  function Xs(s, a) {
    return qe(s), a = It(s, a), s.g.has(a);
  }
  n.forEach = function(s, a) {
    qe(this), this.g.forEach(function(c, d) {
      c.forEach(function(I) {
        s.call(a, I, d, this);
      }, this);
    }, this);
  }, n.na = function() {
    qe(this);
    const s = Array.from(this.g.values()), a = Array.from(this.g.keys()), c = [];
    for (let d = 0; d < a.length; d++) {
      const I = s[d];
      for (let A = 0; A < I.length; A++) c.push(a[d]);
    }
    return c;
  }, n.V = function(s) {
    qe(this);
    let a = [];
    if (typeof s == "string") Xs(this, s) && (a = a.concat(this.g.get(It(this, s))));
    else {
      s = Array.from(this.g.values());
      for (let c = 0; c < s.length; c++) a = a.concat(s[c]);
    }
    return a;
  }, n.set = function(s, a) {
    return qe(this), this.i = null, s = It(this, s), Xs(this, s) && (this.h -= this.g.get(s).length), this.g.set(s, [a]), this.h += 1, this;
  }, n.get = function(s, a) {
    return s ? (s = this.V(s), 0 < s.length ? String(s[0]) : a) : a;
  };
  function Ys(s, a, c) {
    Js(s, a), 0 < c.length && (s.i = null, s.g.set(It(s, a), O(c)), s.h += c.length);
  }
  n.toString = function() {
    if (this.i) return this.i;
    if (!this.g) return "";
    const s = [], a = Array.from(this.g.keys());
    for (var c = 0; c < a.length; c++) {
      var d = a[c];
      const A = encodeURIComponent(String(d)), P = this.V(d);
      for (d = 0; d < P.length; d++) {
        var I = A;
        P[d] !== "" && (I += "=" + encodeURIComponent(String(P[d]))), s.push(I);
      }
    }
    return this.i = s.join("&");
  };
  function It(s, a) {
    return a = String(a), s.j && (a = a.toLowerCase()), a;
  }
  function xc(s, a) {
    a && !s.j && (qe(s), s.i = null, s.g.forEach(function(c, d) {
      var I = d.toLowerCase();
      d != I && (Js(this, d), Ys(this, I, c));
    }, s)), s.j = a;
  }
  function Uc(s, a) {
    const c = new Jt();
    if (u.Image) {
      const d = new Image();
      d.onload = C(Ge, c, "TestLoadImage: loaded", !0, a, d), d.onerror = C(Ge, c, "TestLoadImage: error", !1, a, d), d.onabort = C(Ge, c, "TestLoadImage: abort", !1, a, d), d.ontimeout = C(Ge, c, "TestLoadImage: timeout", !1, a, d), u.setTimeout(function() {
        d.ontimeout && d.ontimeout();
      }, 1e4), d.src = s;
    } else a(!1);
  }
  function Fc(s, a) {
    const c = new Jt(), d = new AbortController(), I = setTimeout(() => {
      d.abort(), Ge(c, "TestPingServer: timeout", !1, a);
    }, 1e4);
    fetch(s, { signal: d.signal }).then((A) => {
      clearTimeout(I), A.ok ? Ge(c, "TestPingServer: ok", !0, a) : Ge(c, "TestPingServer: server error", !1, a);
    }).catch(() => {
      clearTimeout(I), Ge(c, "TestPingServer: error", !1, a);
    });
  }
  function Ge(s, a, c, d, I) {
    try {
      I && (I.onload = null, I.onerror = null, I.onabort = null, I.ontimeout = null), d(c);
    } catch {
    }
  }
  function Bc() {
    this.g = new Ic();
  }
  function jc(s, a, c) {
    const d = c || "";
    try {
      Gs(s, function(I, A) {
        let P = I;
        f(I) && (P = Wr(I)), a.push(d + A + "=" + encodeURIComponent(P));
      });
    } catch (I) {
      throw a.push(d + "type=" + encodeURIComponent("_badmap")), I;
    }
  }
  function zn(s) {
    this.l = s.Ub || null, this.j = s.eb || !1;
  }
  k(zn, Qr), zn.prototype.g = function() {
    return new qn(this.l, this.j);
  }, zn.prototype.i = /* @__PURE__ */ function(s) {
    return function() {
      return s;
    };
  }({});
  function qn(s, a) {
    ce.call(this), this.D = s, this.o = a, this.m = void 0, this.status = this.readyState = 0, this.responseType = this.responseText = this.response = this.statusText = "", this.onreadystatechange = null, this.u = new Headers(), this.h = null, this.B = "GET", this.A = "", this.g = !1, this.v = this.j = this.l = null;
  }
  k(qn, ce), n = qn.prototype, n.open = function(s, a) {
    if (this.readyState != 0) throw this.abort(), Error("Error reopening a connection");
    this.B = s, this.A = a, this.readyState = 1, nn(this);
  }, n.send = function(s) {
    if (this.readyState != 1) throw this.abort(), Error("need to call open() first. ");
    this.g = !0;
    const a = { headers: this.u, method: this.B, credentials: this.m, cache: void 0 };
    s && (a.body = s), (this.D || u).fetch(new Request(this.A, a)).then(this.Sa.bind(this), this.ga.bind(this));
  }, n.abort = function() {
    this.response = this.responseText = "", this.u = new Headers(), this.status = 0, this.j && this.j.cancel("Request was aborted.").catch(() => {
    }), 1 <= this.readyState && this.g && this.readyState != 4 && (this.g = !1, tn(this)), this.readyState = 0;
  }, n.Sa = function(s) {
    if (this.g && (this.l = s, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = s.headers, this.readyState = 2, nn(this)), this.g && (this.readyState = 3, nn(this), this.g))) if (this.responseType === "arraybuffer") s.arrayBuffer().then(this.Qa.bind(this), this.ga.bind(this));
    else if (typeof u.ReadableStream < "u" && "body" in s) {
      if (this.j = s.body.getReader(), this.o) {
        if (this.responseType) throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');
        this.response = [];
      } else this.response = this.responseText = "", this.v = new TextDecoder();
      Zs(this);
    } else s.text().then(this.Ra.bind(this), this.ga.bind(this));
  };
  function Zs(s) {
    s.j.read().then(s.Pa.bind(s)).catch(s.ga.bind(s));
  }
  n.Pa = function(s) {
    if (this.g) {
      if (this.o && s.value) this.response.push(s.value);
      else if (!this.o) {
        var a = s.value ? s.value : new Uint8Array(0);
        (a = this.v.decode(a, { stream: !s.done })) && (this.response = this.responseText += a);
      }
      s.done ? tn(this) : nn(this), this.readyState == 3 && Zs(this);
    }
  }, n.Ra = function(s) {
    this.g && (this.response = this.responseText = s, tn(this));
  }, n.Qa = function(s) {
    this.g && (this.response = s, tn(this));
  }, n.ga = function() {
    this.g && tn(this);
  };
  function tn(s) {
    s.readyState = 4, s.l = null, s.j = null, s.v = null, nn(s);
  }
  n.setRequestHeader = function(s, a) {
    this.u.append(s, a);
  }, n.getResponseHeader = function(s) {
    return this.h && this.h.get(s.toLowerCase()) || "";
  }, n.getAllResponseHeaders = function() {
    if (!this.h) return "";
    const s = [], a = this.h.entries();
    for (var c = a.next(); !c.done; ) c = c.value, s.push(c[0] + ": " + c[1]), c = a.next();
    return s.join(`\r
`);
  };
  function nn(s) {
    s.onreadystatechange && s.onreadystatechange.call(s);
  }
  Object.defineProperty(qn.prototype, "withCredentials", { get: function() {
    return this.m === "include";
  }, set: function(s) {
    this.m = s ? "include" : "same-origin";
  } });
  function eo(s) {
    let a = "";
    return Y(s, function(c, d) {
      a += d, a += ":", a += c, a += `\r
`;
    }), a;
  }
  function si(s, a, c) {
    e: {
      for (d in c) {
        var d = !1;
        break e;
      }
      d = !0;
    }
    d || (c = eo(c), typeof s == "string" ? c != null && encodeURIComponent(String(c)) : W(s, a, c));
  }
  function J(s) {
    ce.call(this), this.headers = /* @__PURE__ */ new Map(), this.o = s || null, this.h = !1, this.v = this.g = null, this.D = "", this.m = 0, this.l = "", this.j = this.B = this.u = this.A = !1, this.I = null, this.H = "", this.J = !1;
  }
  k(J, ce);
  var $c = /^https?$/i, Hc = ["POST", "PUT"];
  n = J.prototype, n.Ha = function(s) {
    this.J = s;
  }, n.ea = function(s, a, c, d) {
    if (this.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.D + "; newUri=" + s);
    a = a ? a.toUpperCase() : "GET", this.D = s, this.l = "", this.m = 0, this.A = !1, this.h = !0, this.g = this.o ? this.o.g() : Yr.g(), this.v = this.o ? Cs(this.o) : Cs(Yr), this.g.onreadystatechange = R(this.Ea, this);
    try {
      this.B = !0, this.g.open(a, String(s), !0), this.B = !1;
    } catch (A) {
      to(this, A);
      return;
    }
    if (s = c || "", c = new Map(this.headers), d) if (Object.getPrototypeOf(d) === Object.prototype) for (var I in d) c.set(I, d[I]);
    else if (typeof d.keys == "function" && typeof d.get == "function") for (const A of d.keys()) c.set(A, d.get(A));
    else throw Error("Unknown input type for opt_headers: " + String(d));
    d = Array.from(c.keys()).find((A) => A.toLowerCase() == "content-type"), I = u.FormData && s instanceof u.FormData, !(0 <= Array.prototype.indexOf.call(Hc, a, void 0)) || d || I || c.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    for (const [A, P] of c) this.g.setRequestHeader(A, P);
    this.H && (this.g.responseType = this.H), "withCredentials" in this.g && this.g.withCredentials !== this.J && (this.g.withCredentials = this.J);
    try {
      io(this), this.u = !0, this.g.send(s), this.u = !1;
    } catch (A) {
      to(this, A);
    }
  };
  function to(s, a) {
    s.h = !1, s.g && (s.j = !0, s.g.abort(), s.j = !1), s.l = a, s.m = 5, no(s), Gn(s);
  }
  function no(s) {
    s.A || (s.A = !0, ye(s, "complete"), ye(s, "error"));
  }
  n.abort = function(s) {
    this.g && this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1, this.m = s || 7, ye(this, "complete"), ye(this, "abort"), Gn(this));
  }, n.N = function() {
    this.g && (this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1), Gn(this, !0)), J.aa.N.call(this);
  }, n.Ea = function() {
    this.s || (this.B || this.u || this.j ? ro(this) : this.bb());
  }, n.bb = function() {
    ro(this);
  };
  function ro(s) {
    if (s.h && typeof l < "u" && (!s.v[1] || Oe(s) != 4 || s.Z() != 2)) {
      if (s.u && Oe(s) == 4) Rs(s.Ea, 0, s);
      else if (ye(s, "readystatechange"), Oe(s) == 4) {
        s.h = !1;
        try {
          const P = s.Z();
          e: switch (P) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              var a = !0;
              break e;
            default:
              a = !1;
          }
          var c;
          if (!(c = a)) {
            var d;
            if (d = P === 0) {
              var I = String(s.D).match(Ks)[1] || null;
              !I && u.self && u.self.location && (I = u.self.location.protocol.slice(0, -1)), d = !$c.test(I ? I.toLowerCase() : "");
            }
            c = d;
          }
          if (c) ye(s, "complete"), ye(s, "success");
          else {
            s.m = 6;
            try {
              var A = 2 < Oe(s) ? s.g.statusText : "";
            } catch {
              A = "";
            }
            s.l = A + " [" + s.Z() + "]", no(s);
          }
        } finally {
          Gn(s);
        }
      }
    }
  }
  function Gn(s, a) {
    if (s.g) {
      io(s);
      const c = s.g, d = s.v[0] ? () => {
      } : null;
      s.g = null, s.v = null, a || ye(s, "ready");
      try {
        c.onreadystatechange = d;
      } catch {
      }
    }
  }
  function io(s) {
    s.I && (u.clearTimeout(s.I), s.I = null);
  }
  n.isActive = function() {
    return !!this.g;
  };
  function Oe(s) {
    return s.g ? s.g.readyState : 0;
  }
  n.Z = function() {
    try {
      return 2 < Oe(this) ? this.g.status : -1;
    } catch {
      return -1;
    }
  }, n.oa = function() {
    try {
      return this.g ? this.g.responseText : "";
    } catch {
      return "";
    }
  }, n.Oa = function(s) {
    if (this.g) {
      var a = this.g.responseText;
      return s && a.indexOf(s) == 0 && (a = a.substring(s.length)), Tc(a);
    }
  };
  function so(s) {
    try {
      if (!s.g) return null;
      if ("response" in s.g) return s.g.response;
      switch (s.H) {
        case "":
        case "text":
          return s.g.responseText;
        case "arraybuffer":
          if ("mozResponseArrayBuffer" in s.g) return s.g.mozResponseArrayBuffer;
      }
      return null;
    } catch {
      return null;
    }
  }
  function zc(s) {
    const a = {};
    s = (s.g && 2 <= Oe(s) && s.g.getAllResponseHeaders() || "").split(`\r
`);
    for (let d = 0; d < s.length; d++) {
      if (F(s[d])) continue;
      var c = v(s[d]);
      const I = c[0];
      if (c = c[1], typeof c != "string") continue;
      c = c.trim();
      const A = a[I] || [];
      a[I] = A, A.push(c);
    }
    E(a, function(d) {
      return d.join(", ");
    });
  }
  n.Ba = function() {
    return this.m;
  }, n.Ka = function() {
    return typeof this.l == "string" ? this.l : String(this.l);
  };
  function rn(s, a, c) {
    return c && c.internalChannelParams && c.internalChannelParams[s] || a;
  }
  function oo(s) {
    this.Aa = 0, this.i = [], this.j = new Jt(), this.ia = this.qa = this.I = this.W = this.g = this.ya = this.D = this.H = this.m = this.S = this.o = null, this.Ya = this.U = 0, this.Va = rn("failFast", !1, s), this.F = this.C = this.u = this.s = this.l = null, this.X = !0, this.za = this.T = -1, this.Y = this.v = this.B = 0, this.Ta = rn("baseRetryDelayMs", 5e3, s), this.cb = rn("retryDelaySeedMs", 1e4, s), this.Wa = rn("forwardChannelMaxRetries", 2, s), this.wa = rn("forwardChannelRequestTimeoutMs", 2e4, s), this.pa = s && s.xmlHttpFactory || void 0, this.Xa = s && s.Tb || void 0, this.Ca = s && s.useFetchStreams || !1, this.L = void 0, this.J = s && s.supportsCrossDomainXhr || !1, this.K = "", this.h = new js(s && s.concurrentRequestLimit), this.Da = new Bc(), this.P = s && s.fastHandshake || !1, this.O = s && s.encodeInitMessageHeaders || !1, this.P && this.O && (this.O = !1), this.Ua = s && s.Rb || !1, s && s.xa && this.j.xa(), s && s.forceLongPolling && (this.X = !1), this.ba = !this.P && this.X && s && s.detectBufferingProxy || !1, this.ja = void 0, s && s.longPollingTimeout && 0 < s.longPollingTimeout && (this.ja = s.longPollingTimeout), this.ca = void 0, this.R = 0, this.M = !1, this.ka = this.A = null;
  }
  n = oo.prototype, n.la = 8, n.G = 1, n.connect = function(s, a, c, d) {
    ve(0), this.W = s, this.H = a || {}, c && d !== void 0 && (this.H.OSID = c, this.H.OAID = d), this.F = this.X, this.I = go(this, null, this.W), Wn(this);
  };
  function oi(s) {
    if (ao(s), s.G == 3) {
      var a = s.U++, c = De(s.I);
      if (W(c, "SID", s.K), W(c, "RID", a), W(c, "TYPE", "terminate"), sn(s, c), a = new ze(s, s.j, a), a.L = 2, a.v = Hn(De(c)), c = !1, u.navigator && u.navigator.sendBeacon) try {
        c = u.navigator.sendBeacon(a.v.toString(), "");
      } catch {
      }
      !c && u.Image && (new Image().src = a.v, c = !0), c || (a.g = _o(a.j, null), a.g.ea(a.v)), a.F = Date.now(), Bn(a);
    }
    mo(s);
  }
  function Kn(s) {
    s.g && (li(s), s.g.cancel(), s.g = null);
  }
  function ao(s) {
    Kn(s), s.u && (u.clearTimeout(s.u), s.u = null), Qn(s), s.h.cancel(), s.s && (typeof s.s == "number" && u.clearTimeout(s.s), s.s = null);
  }
  function Wn(s) {
    if (!$s(s.h) && !s.s) {
      s.s = !0;
      var a = s.Ga;
      Ht || Es(), zt || (Ht(), zt = !0), Br.add(a, s), s.B = 0;
    }
  }
  function qc(s, a) {
    return Hs(s.h) >= s.h.j - (s.s ? 1 : 0) ? !1 : s.s ? (s.i = a.D.concat(s.i), !0) : s.G == 1 || s.G == 2 || s.B >= (s.Va ? 0 : s.Wa) ? !1 : (s.s = Qt(R(s.Ga, s, a), po(s, s.B)), s.B++, !0);
  }
  n.Ga = function(s) {
    if (this.s) if (this.s = null, this.G == 1) {
      if (!s) {
        this.U = Math.floor(1e5 * Math.random()), s = this.U++;
        const I = new ze(this, this.j, s);
        let A = this.o;
        if (this.S && (A ? (A = p(A), _(A, this.S)) : A = this.S), this.m !== null || this.O || (I.H = A, A = null), this.P) e: {
          for (var a = 0, c = 0; c < this.i.length; c++) {
            t: {
              var d = this.i[c];
              if ("__data__" in d.map && (d = d.map.__data__, typeof d == "string")) {
                d = d.length;
                break t;
              }
              d = void 0;
            }
            if (d === void 0) break;
            if (a += d, 4096 < a) {
              a = c;
              break e;
            }
            if (a === 4096 || c === this.i.length - 1) {
              a = c + 1;
              break e;
            }
          }
          a = 1e3;
        }
        else a = 1e3;
        a = co(this, I, a), c = De(this.I), W(c, "RID", s), W(c, "CVER", 22), this.D && W(c, "X-HTTP-Session-Id", this.D), sn(this, c), A && (this.O ? a = "headers=" + encodeURIComponent(String(eo(A))) + "&" + a : this.m && si(c, this.m, A)), ii(this.h, I), this.Ua && W(c, "TYPE", "init"), this.P ? (W(c, "$req", a), W(c, "SID", "null"), I.T = !0, ei(I, c, null)) : ei(I, c, a), this.G = 2;
      }
    } else this.G == 3 && (s ? lo(this, s) : this.i.length == 0 || $s(this.h) || lo(this));
  };
  function lo(s, a) {
    var c;
    a ? c = a.l : c = s.U++;
    const d = De(s.I);
    W(d, "SID", s.K), W(d, "RID", c), W(d, "AID", s.T), sn(s, d), s.m && s.o && si(d, s.m, s.o), c = new ze(s, s.j, c, s.B + 1), s.m === null && (c.H = s.o), a && (s.i = a.D.concat(s.i)), a = co(s, c, 1e3), c.I = Math.round(0.5 * s.wa) + Math.round(0.5 * s.wa * Math.random()), ii(s.h, c), ei(c, d, a);
  }
  function sn(s, a) {
    s.H && Y(s.H, function(c, d) {
      W(a, d, c);
    }), s.l && Gs({}, function(c, d) {
      W(a, d, c);
    });
  }
  function co(s, a, c) {
    c = Math.min(s.i.length, c);
    var d = s.l ? R(s.l.Na, s.l, s) : null;
    e: {
      var I = s.i;
      let A = -1;
      for (; ; ) {
        const P = ["count=" + c];
        A == -1 ? 0 < c ? (A = I[0].g, P.push("ofs=" + A)) : A = 0 : P.push("ofs=" + A);
        let q = !0;
        for (let ie = 0; ie < c; ie++) {
          let $ = I[ie].g;
          const ue = I[ie].map;
          if ($ -= A, 0 > $) A = Math.max(0, I[ie].g - 100), q = !1;
          else try {
            jc(ue, P, "req" + $ + "_");
          } catch {
            d && d(ue);
          }
        }
        if (q) {
          d = P.join("&");
          break e;
        }
      }
    }
    return s = s.i.splice(0, c), a.D = s, d;
  }
  function uo(s) {
    if (!s.g && !s.u) {
      s.Y = 1;
      var a = s.Fa;
      Ht || Es(), zt || (Ht(), zt = !0), Br.add(a, s), s.v = 0;
    }
  }
  function ai(s) {
    return s.g || s.u || 3 <= s.v ? !1 : (s.Y++, s.u = Qt(R(s.Fa, s), po(s, s.v)), s.v++, !0);
  }
  n.Fa = function() {
    if (this.u = null, ho(this), this.ba && !(this.M || this.g == null || 0 >= this.R)) {
      var s = 2 * this.R;
      this.j.info("BP detection timer enabled: " + s), this.A = Qt(R(this.ab, this), s);
    }
  }, n.ab = function() {
    this.A && (this.A = null, this.j.info("BP detection timeout reached."), this.j.info("Buffering proxy detected and switch to long-polling!"), this.F = !1, this.M = !0, ve(10), Kn(this), ho(this));
  };
  function li(s) {
    s.A != null && (u.clearTimeout(s.A), s.A = null);
  }
  function ho(s) {
    s.g = new ze(s, s.j, "rpc", s.Y), s.m === null && (s.g.H = s.o), s.g.O = 0;
    var a = De(s.qa);
    W(a, "RID", "rpc"), W(a, "SID", s.K), W(a, "AID", s.T), W(a, "CI", s.F ? "0" : "1"), !s.F && s.ja && W(a, "TO", s.ja), W(a, "TYPE", "xmlhttp"), sn(s, a), s.m && s.o && si(a, s.m, s.o), s.L && (s.g.I = s.L);
    var c = s.g;
    s = s.ia, c.L = 1, c.v = Hn(De(a)), c.m = null, c.P = !0, Us(c, s);
  }
  n.Za = function() {
    this.C != null && (this.C = null, Kn(this), ai(this), ve(19));
  };
  function Qn(s) {
    s.C != null && (u.clearTimeout(s.C), s.C = null);
  }
  function fo(s, a) {
    var c = null;
    if (s.g == a) {
      Qn(s), li(s), s.g = null;
      var d = 2;
    } else if (ri(s.h, a)) c = a.D, zs(s.h, a), d = 1;
    else return;
    if (s.G != 0) {
      if (a.o) if (d == 1) {
        c = a.m ? a.m.length : 0, a = Date.now() - a.F;
        var I = s.B;
        d = xn(), ye(d, new Vs(d, c)), Wn(s);
      } else uo(s);
      else if (I = a.s, I == 3 || I == 0 && 0 < a.X || !(d == 1 && qc(s, a) || d == 2 && ai(s))) switch (c && 0 < c.length && (a = s.h, a.i = a.i.concat(c)), I) {
        case 1:
          ct(s, 5);
          break;
        case 4:
          ct(s, 10);
          break;
        case 3:
          ct(s, 6);
          break;
        default:
          ct(s, 2);
      }
    }
  }
  function po(s, a) {
    let c = s.Ta + Math.floor(Math.random() * s.cb);
    return s.isActive() || (c *= 2), c * a;
  }
  function ct(s, a) {
    if (s.j.info("Error code " + a), a == 2) {
      var c = R(s.fb, s), d = s.Xa;
      const I = !d;
      d = new lt(d || "//www.google.com/images/cleardot.gif"), u.location && u.location.protocol == "http" || jn(d, "https"), Hn(d), I ? Uc(d.toString(), c) : Fc(d.toString(), c);
    } else ve(2);
    s.G = 0, s.l && s.l.sa(a), mo(s), ao(s);
  }
  n.fb = function(s) {
    s ? (this.j.info("Successfully pinged google.com"), ve(2)) : (this.j.info("Failed to ping google.com"), ve(1));
  };
  function mo(s) {
    if (s.G = 0, s.ka = [], s.l) {
      const a = qs(s.h);
      (a.length != 0 || s.i.length != 0) && (N(s.ka, a), N(s.ka, s.i), s.h.i.length = 0, O(s.i), s.i.length = 0), s.l.ra();
    }
  }
  function go(s, a, c) {
    var d = c instanceof lt ? De(c) : new lt(c);
    if (d.g != "") a && (d.g = a + "." + d.g), $n(d, d.s);
    else {
      var I = u.location;
      d = I.protocol, a = a ? a + "." + I.hostname : I.hostname, I = +I.port;
      var A = new lt(null);
      d && jn(A, d), a && (A.g = a), I && $n(A, I), c && (A.l = c), d = A;
    }
    return c = s.D, a = s.ya, c && a && W(d, c, a), W(d, "VER", s.la), sn(s, d), d;
  }
  function _o(s, a, c) {
    if (a && !s.J) throw Error("Can't create secondary domain capable XhrIo object.");
    return a = s.Ca && !s.pa ? new J(new zn({ eb: c })) : new J(s.pa), a.Ha(s.J), a;
  }
  n.isActive = function() {
    return !!this.l && this.l.isActive(this);
  };
  function yo() {
  }
  n = yo.prototype, n.ua = function() {
  }, n.ta = function() {
  }, n.sa = function() {
  }, n.ra = function() {
  }, n.isActive = function() {
    return !0;
  }, n.Na = function() {
  };
  function Jn() {
  }
  Jn.prototype.g = function(s, a) {
    return new Ie(s, a);
  };
  function Ie(s, a) {
    ce.call(this), this.g = new oo(a), this.l = s, this.h = a && a.messageUrlParams || null, s = a && a.messageHeaders || null, a && a.clientProtocolHeaderRequired && (s ? s["X-Client-Protocol"] = "webchannel" : s = { "X-Client-Protocol": "webchannel" }), this.g.o = s, s = a && a.initMessageHeaders || null, a && a.messageContentType && (s ? s["X-WebChannel-Content-Type"] = a.messageContentType : s = { "X-WebChannel-Content-Type": a.messageContentType }), a && a.va && (s ? s["X-WebChannel-Client-Profile"] = a.va : s = { "X-WebChannel-Client-Profile": a.va }), this.g.S = s, (s = a && a.Sb) && !F(s) && (this.g.m = s), this.v = a && a.supportsCrossDomainXhr || !1, this.u = a && a.sendRawJson || !1, (a = a && a.httpSessionIdParam) && !F(a) && (this.g.D = a, s = this.h, s !== null && a in s && (s = this.h, a in s && delete s[a])), this.j = new wt(this);
  }
  k(Ie, ce), Ie.prototype.m = function() {
    this.g.l = this.j, this.v && (this.g.J = !0), this.g.connect(this.l, this.h || void 0);
  }, Ie.prototype.close = function() {
    oi(this.g);
  }, Ie.prototype.o = function(s) {
    var a = this.g;
    if (typeof s == "string") {
      var c = {};
      c.__data__ = s, s = c;
    } else this.u && (c = {}, c.__data__ = Wr(s), s = c);
    a.i.push(new Pc(a.Ya++, s)), a.G == 3 && Wn(a);
  }, Ie.prototype.N = function() {
    this.g.l = null, delete this.j, oi(this.g), delete this.g, Ie.aa.N.call(this);
  };
  function vo(s) {
    Jr.call(this), s.__headers__ && (this.headers = s.__headers__, this.statusCode = s.__status__, delete s.__headers__, delete s.__status__);
    var a = s.__sm__;
    if (a) {
      e: {
        for (const c in a) {
          s = c;
          break e;
        }
        s = void 0;
      }
      (this.i = s) && (s = this.i, a = a !== null && s in a ? a[s] : void 0), this.data = a;
    } else this.data = s;
  }
  k(vo, Jr);
  function Eo() {
    Xr.call(this), this.status = 1;
  }
  k(Eo, Xr);
  function wt(s) {
    this.g = s;
  }
  k(wt, yo), wt.prototype.ua = function() {
    ye(this.g, "a");
  }, wt.prototype.ta = function(s) {
    ye(this.g, new vo(s));
  }, wt.prototype.sa = function(s) {
    ye(this.g, new Eo());
  }, wt.prototype.ra = function() {
    ye(this.g, "b");
  }, Jn.prototype.createWebChannel = Jn.prototype.g, Ie.prototype.send = Ie.prototype.o, Ie.prototype.open = Ie.prototype.m, Ie.prototype.close = Ie.prototype.close, Ua = function() {
    return new Jn();
  }, xa = function() {
    return xn();
  }, La = ot, Ci = { mb: 0, pb: 1, qb: 2, Jb: 3, Ob: 4, Lb: 5, Mb: 6, Kb: 7, Ib: 8, Nb: 9, PROXY: 10, NOPROXY: 11, Gb: 12, Cb: 13, Db: 14, Bb: 15, Eb: 16, Fb: 17, ib: 18, hb: 19, jb: 20 }, Un.NO_ERROR = 0, Un.TIMEOUT = 8, Un.HTTP_ERROR = 6, ir = Un, Ms.COMPLETE = "complete", Ma = Ms, ks.EventType = Kt, Kt.OPEN = "a", Kt.CLOSE = "b", Kt.ERROR = "c", Kt.MESSAGE = "d", ce.prototype.listen = ce.prototype.K, ln = ks, J.prototype.listenOnce = J.prototype.L, J.prototype.getLastError = J.prototype.Ka, J.prototype.getLastErrorCode = J.prototype.Ba, J.prototype.getStatus = J.prototype.Z, J.prototype.getResponseJson = J.prototype.Oa, J.prototype.getResponseText = J.prototype.oa, J.prototype.send = J.prototype.ea, J.prototype.setWithCredentials = J.prototype.Ha, Va = J;
}).apply(typeof Yn < "u" ? Yn : typeof self < "u" ? self : typeof window < "u" ? window : {});
const No = "@firebase/firestore";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class fe {
  constructor(e) {
    this.uid = e;
  }
  isAuthenticated() {
    return this.uid != null;
  }
  /**
   * Returns a key representing this user, suitable for inclusion in a
   * dictionary.
   */
  toKey() {
    return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
  }
  isEqual(e) {
    return e.uid === this.uid;
  }
}
fe.UNAUTHENTICATED = new fe(null), // TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
fe.GOOGLE_CREDENTIALS = new fe("google-credentials-uid"), fe.FIRST_PARTY = new fe("first-party-uid"), fe.MOCK_USER = new fe("mock-user");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let Ft = "10.14.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const gt = new Hi("@firebase/firestore");
function on() {
  return gt.logLevel;
}
function D(n, ...e) {
  if (gt.logLevel <= x.DEBUG) {
    const t = e.map(Ki);
    gt.debug(`Firestore (${Ft}): ${n}`, ...t);
  }
}
function _t(n, ...e) {
  if (gt.logLevel <= x.ERROR) {
    const t = e.map(Ki);
    gt.error(`Firestore (${Ft}): ${n}`, ...t);
  }
}
function fr(n, ...e) {
  if (gt.logLevel <= x.WARN) {
    const t = e.map(Ki);
    gt.warn(`Firestore (${Ft}): ${n}`, ...t);
  }
}
function Ki(n) {
  if (typeof n == "string") return n;
  try {
    /**
    * @license
    * Copyright 2020 Google LLC
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *   http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
    return function(t) {
      return JSON.stringify(t);
    }(n);
  } catch {
    return n;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function U(n = "Unexpected state") {
  const e = `FIRESTORE (${Ft}) INTERNAL ASSERTION FAILED: ` + n;
  throw _t(e), new Error(e);
}
function X(n, e) {
  n || U();
}
function K(n, e) {
  return n;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const S = {
  // Causes are copied from:
  // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
  /** Not an error; returned on success. */
  OK: "ok",
  /** The operation was cancelled (typically by the caller). */
  CANCELLED: "cancelled",
  /** Unknown error or an error from a different error domain. */
  UNKNOWN: "unknown",
  /**
   * Client specified an invalid argument. Note that this differs from
   * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
   * problematic regardless of the state of the system (e.g., a malformed file
   * name).
   */
  INVALID_ARGUMENT: "invalid-argument",
  /**
   * Deadline expired before operation could complete. For operations that
   * change the state of the system, this error may be returned even if the
   * operation has completed successfully. For example, a successful response
   * from a server could have been delayed long enough for the deadline to
   * expire.
   */
  DEADLINE_EXCEEDED: "deadline-exceeded",
  /** Some requested entity (e.g., file or directory) was not found. */
  NOT_FOUND: "not-found",
  /**
   * Some entity that we attempted to create (e.g., file or directory) already
   * exists.
   */
  ALREADY_EXISTS: "already-exists",
  /**
   * The caller does not have permission to execute the specified operation.
   * PERMISSION_DENIED must not be used for rejections caused by exhausting
   * some resource (use RESOURCE_EXHAUSTED instead for those errors).
   * PERMISSION_DENIED must not be used if the caller cannot be identified
   * (use UNAUTHENTICATED instead for those errors).
   */
  PERMISSION_DENIED: "permission-denied",
  /**
   * The request does not have valid authentication credentials for the
   * operation.
   */
  UNAUTHENTICATED: "unauthenticated",
  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
   * entire file system is out of space.
   */
  RESOURCE_EXHAUSTED: "resource-exhausted",
  /**
   * Operation was rejected because the system is not in a state required for
   * the operation's execution. For example, directory to be deleted may be
   * non-empty, an rmdir operation is applied to a non-directory, etc.
   *
   * A litmus test that may help a service implementor in deciding
   * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
   *  (a) Use UNAVAILABLE if the client can retry just the failing call.
   *  (b) Use ABORTED if the client should retry at a higher-level
   *      (e.g., restarting a read-modify-write sequence).
   *  (c) Use FAILED_PRECONDITION if the client should not retry until
   *      the system state has been explicitly fixed. E.g., if an "rmdir"
   *      fails because the directory is non-empty, FAILED_PRECONDITION
   *      should be returned since the client should not retry unless
   *      they have first fixed up the directory by deleting files from it.
   *  (d) Use FAILED_PRECONDITION if the client performs conditional
   *      REST Get/Update/Delete on a resource and the resource on the
   *      server does not match the condition. E.g., conflicting
   *      read-modify-write on the same resource.
   */
  FAILED_PRECONDITION: "failed-precondition",
  /**
   * The operation was aborted, typically due to a concurrency issue like
   * sequencer check failures, transaction aborts, etc.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  ABORTED: "aborted",
  /**
   * Operation was attempted past the valid range. E.g., seeking or reading
   * past end of file.
   *
   * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
   * if the system state changes. For example, a 32-bit file system will
   * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
   * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
   * an offset past the current file size.
   *
   * There is a fair bit of overlap between FAILED_PRECONDITION and
   * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
   * when it applies so that callers who are iterating through a space can
   * easily look for an OUT_OF_RANGE error to detect when they are done.
   */
  OUT_OF_RANGE: "out-of-range",
  /** Operation is not implemented or not supported/enabled in this service. */
  UNIMPLEMENTED: "unimplemented",
  /**
   * Internal errors. Means some invariants expected by underlying System has
   * been broken. If you see one of these errors, Something is very broken.
   */
  INTERNAL: "internal",
  /**
   * The service is currently unavailable. This is a most likely a transient
   * condition and may be corrected by retrying with a backoff.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  UNAVAILABLE: "unavailable",
  /** Unrecoverable data loss or corruption. */
  DATA_LOSS: "data-loss"
};
class M extends $e {
  /** @hideconstructor */
  constructor(e, t) {
    super(e, t), this.code = e, this.message = t, // HACK: We write a toString property directly because Error is not a real
    // class and so inheritance does not work correctly. We could alternatively
    // do the same "back-door inheritance" trick that FirebaseError does.
    this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class dt {
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Fa {
  constructor(e, t) {
    this.user = t, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${e}`);
  }
}
class Oh {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(e, t) {
    e.enqueueRetryable(() => t(fe.UNAUTHENTICATED));
  }
  shutdown() {
  }
}
class Vh {
  constructor(e) {
    this.token = e, /**
     * Stores the listener registered with setChangeListener()
     * This isn't actually necessary since the UID never changes, but we use this
     * to verify the listen contract is adhered to in tests.
     */
    this.changeListener = null;
  }
  getToken() {
    return Promise.resolve(this.token);
  }
  invalidateToken() {
  }
  start(e, t) {
    this.changeListener = t, // Fire with initial user.
    e.enqueueRetryable(() => t(this.token.user));
  }
  shutdown() {
    this.changeListener = null;
  }
}
class Mh {
  constructor(e) {
    this.t = e, /** Tracks the current User. */
    this.currentUser = fe.UNAUTHENTICATED, /**
     * Counter used to detect if the token changed while a getToken request was
     * outstanding.
     */
    this.i = 0, this.forceRefresh = !1, this.auth = null;
  }
  start(e, t) {
    X(this.o === void 0);
    let r = this.i;
    const i = (h) => this.i !== r ? (r = this.i, t(h)) : Promise.resolve();
    let o = new dt();
    this.o = () => {
      this.i++, this.currentUser = this.u(), o.resolve(), o = new dt(), e.enqueueRetryable(() => i(this.currentUser));
    };
    const l = () => {
      const h = o;
      e.enqueueRetryable(async () => {
        await h.promise, await i(this.currentUser);
      });
    }, u = (h) => {
      D("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = h, this.o && (this.auth.addAuthTokenListener(this.o), l());
    };
    this.t.onInit((h) => u(h)), // Our users can initialize Auth right after Firestore, so we give it
    // a chance to register itself with the component framework before we
    // determine whether to start up in unauthenticated mode.
    setTimeout(() => {
      if (!this.auth) {
        const h = this.t.getImmediate({
          optional: !0
        });
        h ? u(h) : (
          // If auth is still not available, proceed with `null` user
          (D("FirebaseAuthCredentialsProvider", "Auth not yet detected"), o.resolve(), o = new dt())
        );
      }
    }, 0), l();
  }
  getToken() {
    const e = this.i, t = this.forceRefresh;
    return this.forceRefresh = !1, this.auth ? this.auth.getToken(t).then((r) => (
      // Cancel the request since the token changed while the request was
      // outstanding so the response is potentially for a previous user (which
      // user, we can't be sure).
      this.i !== e ? (D("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), this.getToken()) : r ? (X(typeof r.accessToken == "string"), new Fa(r.accessToken, this.currentUser)) : null
    )) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    this.auth && this.o && this.auth.removeAuthTokenListener(this.o), this.o = void 0;
  }
  // Auth.getUid() can return null even with a user logged in. It is because
  // getUid() is synchronous, but the auth code populating Uid is asynchronous.
  // This method should only be called in the AuthTokenListener callback
  // to guarantee to get the actual user.
  u() {
    const e = this.auth && this.auth.getUid();
    return X(e === null || typeof e == "string"), new fe(e);
  }
}
class Lh {
  constructor(e, t, r) {
    this.l = e, this.h = t, this.P = r, this.type = "FirstParty", this.user = fe.FIRST_PARTY, this.I = /* @__PURE__ */ new Map();
  }
  /**
   * Gets an authorization token, using a provided factory function, or return
   * null.
   */
  T() {
    return this.P ? this.P() : null;
  }
  get headers() {
    this.I.set("X-Goog-AuthUser", this.l);
    const e = this.T();
    return e && this.I.set("Authorization", e), this.h && this.I.set("X-Goog-Iam-Authorization-Token", this.h), this.I;
  }
}
class xh {
  constructor(e, t, r) {
    this.l = e, this.h = t, this.P = r;
  }
  getToken() {
    return Promise.resolve(new Lh(this.l, this.h, this.P));
  }
  start(e, t) {
    e.enqueueRetryable(() => t(fe.FIRST_PARTY));
  }
  shutdown() {
  }
  invalidateToken() {
  }
}
class Uh {
  constructor(e) {
    this.value = e, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
  }
}
class Fh {
  constructor(e) {
    this.A = e, this.forceRefresh = !1, this.appCheck = null, this.R = null;
  }
  start(e, t) {
    X(this.o === void 0);
    const r = (o) => {
      o.error != null && D("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);
      const l = o.token !== this.R;
      return this.R = o.token, D("FirebaseAppCheckTokenProvider", `Received ${l ? "new" : "existing"} token.`), l ? t(o.token) : Promise.resolve();
    };
    this.o = (o) => {
      e.enqueueRetryable(() => r(o));
    };
    const i = (o) => {
      D("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = o, this.o && this.appCheck.addTokenListener(this.o);
    };
    this.A.onInit((o) => i(o)), // Our users can initialize AppCheck after Firestore, so we give it
    // a chance to register itself with the component framework.
    setTimeout(() => {
      if (!this.appCheck) {
        const o = this.A.getImmediate({
          optional: !0
        });
        o ? i(o) : (
          // If AppCheck is still not available, proceed without it.
          D("FirebaseAppCheckTokenProvider", "AppCheck not yet detected")
        );
      }
    }, 0);
  }
  getToken() {
    const e = this.forceRefresh;
    return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(e).then((t) => t ? (X(typeof t.token == "string"), this.R = t.token, new Uh(t.token)) : null) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    this.appCheck && this.o && this.appCheck.removeTokenListener(this.o), this.o = void 0;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Bh(n) {
  const e = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof self < "u" && (self.crypto || self.msCrypto)
  ), t = new Uint8Array(n);
  if (e && typeof e.getRandomValues == "function") e.getRandomValues(t);
  else
    for (let r = 0; r < n; r++) t[r] = Math.floor(256 * Math.random());
  return t;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ba {
  static newId() {
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = Math.floor(256 / e.length) * e.length;
    let r = "";
    for (; r.length < 20; ) {
      const i = Bh(40);
      for (let o = 0; o < i.length; ++o)
        r.length < 20 && i[o] < t && (r += e.charAt(i[o] % e.length));
    }
    return r;
  }
}
function G(n, e) {
  return n < e ? -1 : n > e ? 1 : 0;
}
function Dt(n, e, t) {
  return n.length === e.length && n.every((r, i) => t(r, e[i]));
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class re {
  /**
   * Creates a new timestamp.
   *
   * @param seconds - The number of seconds of UTC time since Unix epoch
   *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
   *     9999-12-31T23:59:59Z inclusive.
   * @param nanoseconds - The non-negative fractions of a second at nanosecond
   *     resolution. Negative second values with fractions must still have
   *     non-negative nanoseconds values that count forward in time. Must be
   *     from 0 to 999,999,999 inclusive.
   */
  constructor(e, t) {
    if (this.seconds = e, this.nanoseconds = t, t < 0) throw new M(S.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (t >= 1e9) throw new M(S.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (e < -62135596800) throw new M(S.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
    if (e >= 253402300800) throw new M(S.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
  }
  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   *
   * @returns a new timestamp representing the current date.
   */
  static now() {
    return re.fromMillis(Date.now());
  }
  /**
   * Creates a new timestamp from the given date.
   *
   * @param date - The date to initialize the `Timestamp` from.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     date.
   */
  static fromDate(e) {
    return re.fromMillis(e.getTime());
  }
  /**
   * Creates a new timestamp from the given number of milliseconds.
   *
   * @param milliseconds - Number of milliseconds since Unix epoch
   *     1970-01-01T00:00:00Z.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     number of milliseconds.
   */
  static fromMillis(e) {
    const t = Math.floor(e / 1e3), r = Math.floor(1e6 * (e - 1e3 * t));
    return new re(t, r);
  }
  /**
   * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
   * causes a loss of precision since `Date` objects only support millisecond
   * precision.
   *
   * @returns JavaScript `Date` object representing the same point in time as
   *     this `Timestamp`, with millisecond precision.
   */
  toDate() {
    return new Date(this.toMillis());
  }
  /**
   * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
   * epoch). This operation causes a loss of precision.
   *
   * @returns The point in time corresponding to this timestamp, represented as
   *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   */
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / 1e6;
  }
  _compareTo(e) {
    return this.seconds === e.seconds ? G(this.nanoseconds, e.nanoseconds) : G(this.seconds, e.seconds);
  }
  /**
   * Returns true if this `Timestamp` is equal to the provided one.
   *
   * @param other - The `Timestamp` to compare against.
   * @returns true if this `Timestamp` is equal to the provided one.
   */
  isEqual(e) {
    return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
  }
  /** Returns a textual representation of this `Timestamp`. */
  toString() {
    return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
  }
  /** Returns a JSON-serializable representation of this `Timestamp`. */
  toJSON() {
    return {
      seconds: this.seconds,
      nanoseconds: this.nanoseconds
    };
  }
  /**
   * Converts this object to a primitive string, which allows `Timestamp` objects
   * to be compared using the `>`, `<=`, `>=` and `>` operators.
   */
  valueOf() {
    const e = this.seconds - -62135596800;
    return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Q {
  constructor(e) {
    this.timestamp = e;
  }
  static fromTimestamp(e) {
    return new Q(e);
  }
  static min() {
    return new Q(new re(0, 0));
  }
  static max() {
    return new Q(new re(253402300799, 999999999));
  }
  compareTo(e) {
    return this.timestamp._compareTo(e.timestamp);
  }
  isEqual(e) {
    return this.timestamp.isEqual(e.timestamp);
  }
  /** Returns a number representation of the version for use in spec tests. */
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return "SnapshotVersion(" + this.timestamp.toString() + ")";
  }
  toTimestamp() {
    return this.timestamp;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gn {
  constructor(e, t, r) {
    t === void 0 ? t = 0 : t > e.length && U(), r === void 0 ? r = e.length - t : r > e.length - t && U(), this.segments = e, this.offset = t, this.len = r;
  }
  get length() {
    return this.len;
  }
  isEqual(e) {
    return gn.comparator(this, e) === 0;
  }
  child(e) {
    const t = this.segments.slice(this.offset, this.limit());
    return e instanceof gn ? e.forEach((r) => {
      t.push(r);
    }) : t.push(e), this.construct(t);
  }
  /** The index of one past the last segment of the path. */
  limit() {
    return this.offset + this.length;
  }
  popFirst(e) {
    return e = e === void 0 ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(e) {
    return this.segments[this.offset + e];
  }
  isEmpty() {
    return this.length === 0;
  }
  isPrefixOf(e) {
    if (e.length < this.length) return !1;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  isImmediateParentOf(e) {
    if (this.length + 1 !== e.length) return !1;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  forEach(e) {
    for (let t = this.offset, r = this.limit(); t < r; t++) e(this.segments[t]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  static comparator(e, t) {
    const r = Math.min(e.length, t.length);
    for (let i = 0; i < r; i++) {
      const o = e.get(i), l = t.get(i);
      if (o < l) return -1;
      if (o > l) return 1;
    }
    return e.length < t.length ? -1 : e.length > t.length ? 1 : 0;
  }
}
class ee extends gn {
  construct(e, t, r) {
    return new ee(e, t, r);
  }
  canonicalString() {
    return this.toArray().join("/");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns a string representation of this path
   * where each path segment has been encoded with
   * `encodeURIComponent`.
   */
  toUriEncodedString() {
    return this.toArray().map(encodeURIComponent).join("/");
  }
  /**
   * Creates a resource path from the given slash-delimited string. If multiple
   * arguments are provided, all components are combined. Leading and trailing
   * slashes from all components are ignored.
   */
  static fromString(...e) {
    const t = [];
    for (const r of e) {
      if (r.indexOf("//") >= 0) throw new M(S.INVALID_ARGUMENT, `Invalid segment (${r}). Paths must not contain // in them.`);
      t.push(...r.split("/").filter((i) => i.length > 0));
    }
    return new ee(t);
  }
  static emptyPath() {
    return new ee([]);
  }
}
const jh = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
class ae extends gn {
  construct(e, t, r) {
    return new ae(e, t, r);
  }
  /**
   * Returns true if the string could be used as a segment in a field path
   * without escaping.
   */
  static isValidIdentifier(e) {
    return jh.test(e);
  }
  canonicalString() {
    return this.toArray().map((e) => (e = e.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), ae.isValidIdentifier(e) || (e = "`" + e + "`"), e)).join(".");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns true if this field references the key of a document.
   */
  isKeyField() {
    return this.length === 1 && this.get(0) === "__name__";
  }
  /**
   * The field designating the key of a document.
   */
  static keyField() {
    return new ae(["__name__"]);
  }
  /**
   * Parses a field string from the given server-formatted string.
   *
   * - Splitting the empty string is not allowed (for now at least).
   * - Empty segments within the string (e.g. if there are two consecutive
   *   separators) are not allowed.
   *
   * TODO(b/37244157): we should make this more strict. Right now, it allows
   * non-identifier path components, even if they aren't escaped.
   */
  static fromServerFormat(e) {
    const t = [];
    let r = "", i = 0;
    const o = () => {
      if (r.length === 0) throw new M(S.INVALID_ARGUMENT, `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
      t.push(r), r = "";
    };
    let l = !1;
    for (; i < e.length; ) {
      const u = e[i];
      if (u === "\\") {
        if (i + 1 === e.length) throw new M(S.INVALID_ARGUMENT, "Path has trailing escape character: " + e);
        const h = e[i + 1];
        if (h !== "\\" && h !== "." && h !== "`") throw new M(S.INVALID_ARGUMENT, "Path has invalid escape sequence: " + e);
        r += h, i += 2;
      } else u === "`" ? (l = !l, i++) : u !== "." || l ? (r += u, i++) : (o(), i++);
    }
    if (o(), l) throw new M(S.INVALID_ARGUMENT, "Unterminated ` in path: " + e);
    return new ae(t);
  }
  static emptyPath() {
    return new ae([]);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class L {
  constructor(e) {
    this.path = e;
  }
  static fromPath(e) {
    return new L(ee.fromString(e));
  }
  static fromName(e) {
    return new L(ee.fromString(e).popFirst(5));
  }
  static empty() {
    return new L(ee.emptyPath());
  }
  get collectionGroup() {
    return this.path.popLast().lastSegment();
  }
  /** Returns true if the document is in the specified collectionId. */
  hasCollectionId(e) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
  }
  /** Returns the collection group (i.e. the name of the parent collection) for this key. */
  getCollectionGroup() {
    return this.path.get(this.path.length - 2);
  }
  /** Returns the fully qualified path to the parent collection. */
  getCollectionPath() {
    return this.path.popLast();
  }
  isEqual(e) {
    return e !== null && ee.comparator(this.path, e.path) === 0;
  }
  toString() {
    return this.path.toString();
  }
  static comparator(e, t) {
    return ee.comparator(e.path, t.path);
  }
  static isDocumentKey(e) {
    return e.length % 2 == 0;
  }
  /**
   * Creates and returns a new document key with the given segments.
   *
   * @param segments - The segments of the path to the document
   * @returns A new instance of DocumentKey
   */
  static fromSegments(e) {
    return new L(new ee(e.slice()));
  }
}
function $h(n, e) {
  const t = n.toTimestamp().seconds, r = n.toTimestamp().nanoseconds + 1, i = Q.fromTimestamp(r === 1e9 ? new re(t + 1, 0) : new re(t, r));
  return new rt(i, L.empty(), e);
}
function Hh(n) {
  return new rt(n.readTime, n.key, -1);
}
class rt {
  constructor(e, t, r) {
    this.readTime = e, this.documentKey = t, this.largestBatchId = r;
  }
  /** Returns an offset that sorts before all regular offsets. */
  static min() {
    return new rt(Q.min(), L.empty(), -1);
  }
  /** Returns an offset that sorts after all regular offsets. */
  static max() {
    return new rt(Q.max(), L.empty(), -1);
  }
}
function zh(n, e) {
  let t = n.readTime.compareTo(e.readTime);
  return t !== 0 ? t : (t = L.comparator(n.documentKey, e.documentKey), t !== 0 ? t : G(n.largestBatchId, e.largestBatchId));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const qh = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";
class Gh {
  constructor() {
    this.onCommittedListeners = [];
  }
  addOnCommittedListener(e) {
    this.onCommittedListeners.push(e);
  }
  raiseOnCommittedEvent() {
    this.onCommittedListeners.forEach((e) => e());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function ja(n) {
  if (n.code !== S.FAILED_PRECONDITION || n.message !== qh) throw n;
  D("LocalStore", "Unexpectedly lost primary lease");
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class b {
  constructor(e) {
    this.nextCallback = null, this.catchCallback = null, // When the operation resolves, we'll set result or error and mark isDone.
    this.result = void 0, this.error = void 0, this.isDone = !1, // Set to true when .then() or .catch() are called and prevents additional
    // chaining.
    this.callbackAttached = !1, e((t) => {
      this.isDone = !0, this.result = t, this.nextCallback && // value should be defined unless T is Void, but we can't express
      // that in the type system.
      this.nextCallback(t);
    }, (t) => {
      this.isDone = !0, this.error = t, this.catchCallback && this.catchCallback(t);
    });
  }
  catch(e) {
    return this.next(void 0, e);
  }
  next(e, t) {
    return this.callbackAttached && U(), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(t, this.error) : this.wrapSuccess(e, this.result) : new b((r, i) => {
      this.nextCallback = (o) => {
        this.wrapSuccess(e, o).next(r, i);
      }, this.catchCallback = (o) => {
        this.wrapFailure(t, o).next(r, i);
      };
    });
  }
  toPromise() {
    return new Promise((e, t) => {
      this.next(e, t);
    });
  }
  wrapUserFunction(e) {
    try {
      const t = e();
      return t instanceof b ? t : b.resolve(t);
    } catch (t) {
      return b.reject(t);
    }
  }
  wrapSuccess(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : b.resolve(t);
  }
  wrapFailure(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : b.reject(t);
  }
  static resolve(e) {
    return new b((t, r) => {
      t(e);
    });
  }
  static reject(e) {
    return new b((t, r) => {
      r(e);
    });
  }
  static waitFor(e) {
    return new b((t, r) => {
      let i = 0, o = 0, l = !1;
      e.forEach((u) => {
        ++i, u.next(() => {
          ++o, l && o === i && t();
        }, (h) => r(h));
      }), l = !0, o === i && t();
    });
  }
  /**
   * Given an array of predicate functions that asynchronously evaluate to a
   * boolean, implements a short-circuiting `or` between the results. Predicates
   * will be evaluated until one of them returns `true`, then stop. The final
   * result will be whether any of them returned `true`.
   */
  static or(e) {
    let t = b.resolve(!1);
    for (const r of e) t = t.next((i) => i ? b.resolve(i) : r());
    return t;
  }
  static forEach(e, t) {
    const r = [];
    return e.forEach((i, o) => {
      r.push(t.call(this, i, o));
    }), this.waitFor(r);
  }
  /**
   * Concurrently map all array elements through asynchronous function.
   */
  static mapArray(e, t) {
    return new b((r, i) => {
      const o = e.length, l = new Array(o);
      let u = 0;
      for (let h = 0; h < o; h++) {
        const f = h;
        t(e[f]).next((y) => {
          l[f] = y, ++u, u === o && r(l);
        }, (y) => i(y));
      }
    });
  }
  /**
   * An alternative to recursive PersistencePromise calls, that avoids
   * potential memory problems from unbounded chains of promises.
   *
   * The `action` will be called repeatedly while `condition` is true.
   */
  static doWhile(e, t) {
    return new b((r, i) => {
      const o = () => {
        e() === !0 ? t().next(() => {
          o();
        }, i) : r();
      };
      o();
    });
  }
}
function Kh(n) {
  const e = n.match(/Android ([\d.]+)/i), t = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
  return Number(t);
}
function kr(n) {
  return n.name === "IndexedDbTransactionError";
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class $a {
  constructor(e, t) {
    this.previousValue = e, t && (t.sequenceNumberHandler = (r) => this.ie(r), this.se = (r) => t.writeSequenceNumber(r));
  }
  ie(e) {
    return this.previousValue = Math.max(e, this.previousValue), this.previousValue;
  }
  next() {
    const e = ++this.previousValue;
    return this.se && this.se(e), e;
  }
}
$a.oe = -1;
function Wi(n) {
  return n == null;
}
function pr(n) {
  return n === 0 && 1 / n == -1 / 0;
}
function Wh(n) {
  return typeof n == "number" && Number.isInteger(n) && !pr(n) && n <= Number.MAX_SAFE_INTEGER && n >= Number.MIN_SAFE_INTEGER;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Do(n) {
  let e = 0;
  for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && e++;
  return e;
}
function bn(n, e) {
  for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && e(t, n[t]);
}
function Ha(n) {
  for (const e in n) if (Object.prototype.hasOwnProperty.call(n, e)) return !1;
  return !0;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Te {
  constructor(e, t) {
    this.comparator = e, this.root = t || se.EMPTY;
  }
  // Returns a copy of the map, with the specified key/value added or replaced.
  insert(e, t) {
    return new Te(this.comparator, this.root.insert(e, t, this.comparator).copy(null, null, se.BLACK, null, null));
  }
  // Returns a copy of the map, with the specified key removed.
  remove(e) {
    return new Te(this.comparator, this.root.remove(e, this.comparator).copy(null, null, se.BLACK, null, null));
  }
  // Returns the value of the node with the given key, or null.
  get(e) {
    let t = this.root;
    for (; !t.isEmpty(); ) {
      const r = this.comparator(e, t.key);
      if (r === 0) return t.value;
      r < 0 ? t = t.left : r > 0 && (t = t.right);
    }
    return null;
  }
  // Returns the index of the element in this sorted map, or -1 if it doesn't
  // exist.
  indexOf(e) {
    let t = 0, r = this.root;
    for (; !r.isEmpty(); ) {
      const i = this.comparator(e, r.key);
      if (i === 0) return t + r.left.size;
      i < 0 ? r = r.left : (
        // Count all nodes left of the node plus the node itself
        (t += r.left.size + 1, r = r.right)
      );
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  // Returns the total number of nodes in the map.
  get size() {
    return this.root.size;
  }
  // Returns the minimum key in the map.
  minKey() {
    return this.root.minKey();
  }
  // Returns the maximum key in the map.
  maxKey() {
    return this.root.maxKey();
  }
  // Traverses the map in key order and calls the specified action function
  // for each key/value pair. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.root.inorderTraversal(e);
  }
  forEach(e) {
    this.inorderTraversal((t, r) => (e(t, r), !1));
  }
  toString() {
    const e = [];
    return this.inorderTraversal((t, r) => (e.push(`${t}:${r}`), !1)), `{${e.join(", ")}}`;
  }
  // Traverses the map in reverse key order and calls the specified action
  // function for each key/value pair. If action returns true, traversal is
  // aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.root.reverseTraversal(e);
  }
  // Returns an iterator over the SortedMap.
  getIterator() {
    return new Zn(this.root, null, this.comparator, !1);
  }
  getIteratorFrom(e) {
    return new Zn(this.root, e, this.comparator, !1);
  }
  getReverseIterator() {
    return new Zn(this.root, null, this.comparator, !0);
  }
  getReverseIteratorFrom(e) {
    return new Zn(this.root, e, this.comparator, !0);
  }
}
class Zn {
  constructor(e, t, r, i) {
    this.isReverse = i, this.nodeStack = [];
    let o = 1;
    for (; !e.isEmpty(); ) if (o = t ? r(e.key, t) : 1, // flip the comparison if we're going in reverse
    t && i && (o *= -1), o < 0)
      e = this.isReverse ? e.left : e.right;
    else {
      if (o === 0) {
        this.nodeStack.push(e);
        break;
      }
      this.nodeStack.push(e), e = this.isReverse ? e.right : e.left;
    }
  }
  getNext() {
    let e = this.nodeStack.pop();
    const t = {
      key: e.key,
      value: e.value
    };
    if (this.isReverse) for (e = e.left; !e.isEmpty(); ) this.nodeStack.push(e), e = e.right;
    else for (e = e.right; !e.isEmpty(); ) this.nodeStack.push(e), e = e.left;
    return t;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (this.nodeStack.length === 0) return null;
    const e = this.nodeStack[this.nodeStack.length - 1];
    return {
      key: e.key,
      value: e.value
    };
  }
}
class se {
  constructor(e, t, r, i, o) {
    this.key = e, this.value = t, this.color = r ?? se.RED, this.left = i ?? se.EMPTY, this.right = o ?? se.EMPTY, this.size = this.left.size + 1 + this.right.size;
  }
  // Returns a copy of the current node, optionally replacing pieces of it.
  copy(e, t, r, i, o) {
    return new se(e ?? this.key, t ?? this.value, r ?? this.color, i ?? this.left, o ?? this.right);
  }
  isEmpty() {
    return !1;
  }
  // Traverses the tree in key order and calls the specified action function
  // for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e);
  }
  // Traverses the tree in reverse key order and calls the specified action
  // function for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
  }
  // Returns the minimum node in the tree.
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  // Returns the maximum key in the tree.
  minKey() {
    return this.min().key;
  }
  // Returns the maximum key in the tree.
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  // Returns new tree, with the key/value added.
  insert(e, t, r) {
    let i = this;
    const o = r(e, i.key);
    return i = o < 0 ? i.copy(null, null, null, i.left.insert(e, t, r), null) : o === 0 ? i.copy(null, t, null, null, null) : i.copy(null, null, null, null, i.right.insert(e, t, r)), i.fixUp();
  }
  removeMin() {
    if (this.left.isEmpty()) return se.EMPTY;
    let e = this;
    return e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()), e = e.copy(null, null, null, e.left.removeMin(), null), e.fixUp();
  }
  // Returns new tree, with the specified item removed.
  remove(e, t) {
    let r, i = this;
    if (t(e, i.key) < 0) i.left.isEmpty() || i.left.isRed() || i.left.left.isRed() || (i = i.moveRedLeft()), i = i.copy(null, null, null, i.left.remove(e, t), null);
    else {
      if (i.left.isRed() && (i = i.rotateRight()), i.right.isEmpty() || i.right.isRed() || i.right.left.isRed() || (i = i.moveRedRight()), t(e, i.key) === 0) {
        if (i.right.isEmpty()) return se.EMPTY;
        r = i.right.min(), i = i.copy(r.key, r.value, null, null, i.right.removeMin());
      }
      i = i.copy(null, null, null, null, i.right.remove(e, t));
    }
    return i.fixUp();
  }
  isRed() {
    return this.color;
  }
  // Returns new tree after performing any needed rotations.
  fixUp() {
    let e = this;
    return e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()), e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()), e.left.isRed() && e.right.isRed() && (e = e.colorFlip()), e;
  }
  moveRedLeft() {
    let e = this.colorFlip();
    return e.right.left.isRed() && (e = e.copy(null, null, null, null, e.right.rotateRight()), e = e.rotateLeft(), e = e.colorFlip()), e;
  }
  moveRedRight() {
    let e = this.colorFlip();
    return e.left.left.isRed() && (e = e.rotateRight(), e = e.colorFlip()), e;
  }
  rotateLeft() {
    const e = this.copy(null, null, se.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, e, null);
  }
  rotateRight() {
    const e = this.copy(null, null, se.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, e);
  }
  colorFlip() {
    const e = this.left.copy(null, null, !this.left.color, null, null), t = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, e, t);
  }
  // For testing.
  checkMaxDepth() {
    const e = this.check();
    return Math.pow(2, e) <= this.size + 1;
  }
  // In a balanced RB tree, the black-depth (number of black nodes) from root to
  // leaves is equal on both sides.  This function verifies that or asserts.
  check() {
    if (this.isRed() && this.left.isRed() || this.right.isRed()) throw U();
    const e = this.left.check();
    if (e !== this.right.check()) throw U();
    return e + (this.isRed() ? 0 : 1);
  }
}
se.EMPTY = null, se.RED = !0, se.BLACK = !1;
se.EMPTY = new // Represents an empty node (a leaf node in the Red-Black Tree).
class {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw U();
  }
  get value() {
    throw U();
  }
  get color() {
    throw U();
  }
  get left() {
    throw U();
  }
  get right() {
    throw U();
  }
  // Returns a copy of the current node.
  copy(e, t, r, i, o) {
    return this;
  }
  // Returns a copy of the tree, with the specified key/value added.
  insert(e, t, r) {
    return new se(e, t);
  }
  // Returns a copy of the tree, with the specified key removed.
  remove(e, t) {
    return this;
  }
  isEmpty() {
    return !0;
  }
  inorderTraversal(e) {
    return !1;
  }
  reverseTraversal(e) {
    return !1;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return !1;
  }
  // For testing.
  checkMaxDepth() {
    return !0;
  }
  check() {
    return 0;
  }
}();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class me {
  constructor(e) {
    this.comparator = e, this.data = new Te(this.comparator);
  }
  has(e) {
    return this.data.get(e) !== null;
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(e) {
    return this.data.indexOf(e);
  }
  /** Iterates elements in order defined by "comparator" */
  forEach(e) {
    this.data.inorderTraversal((t, r) => (e(t), !1));
  }
  /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */
  forEachInRange(e, t) {
    const r = this.data.getIteratorFrom(e[0]);
    for (; r.hasNext(); ) {
      const i = r.getNext();
      if (this.comparator(i.key, e[1]) >= 0) return;
      t(i.key);
    }
  }
  /**
   * Iterates over `elem`s such that: start &lt;= elem until false is returned.
   */
  forEachWhile(e, t) {
    let r;
    for (r = t !== void 0 ? this.data.getIteratorFrom(t) : this.data.getIterator(); r.hasNext(); )
      if (!e(r.getNext().key)) return;
  }
  /** Finds the least element greater than or equal to `elem`. */
  firstAfterOrEqual(e) {
    const t = this.data.getIteratorFrom(e);
    return t.hasNext() ? t.getNext().key : null;
  }
  getIterator() {
    return new Oo(this.data.getIterator());
  }
  getIteratorFrom(e) {
    return new Oo(this.data.getIteratorFrom(e));
  }
  /** Inserts or updates an element */
  add(e) {
    return this.copy(this.data.remove(e).insert(e, !0));
  }
  /** Deletes an element */
  delete(e) {
    return this.has(e) ? this.copy(this.data.remove(e)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(e) {
    let t = this;
    return t.size < e.size && (t = e, e = this), e.forEach((r) => {
      t = t.add(r);
    }), t;
  }
  isEqual(e) {
    if (!(e instanceof me) || this.size !== e.size) return !1;
    const t = this.data.getIterator(), r = e.data.getIterator();
    for (; t.hasNext(); ) {
      const i = t.getNext().key, o = r.getNext().key;
      if (this.comparator(i, o) !== 0) return !1;
    }
    return !0;
  }
  toArray() {
    const e = [];
    return this.forEach((t) => {
      e.push(t);
    }), e;
  }
  toString() {
    const e = [];
    return this.forEach((t) => e.push(t)), "SortedSet(" + e.toString() + ")";
  }
  copy(e) {
    const t = new me(this.comparator);
    return t.data = e, t;
  }
}
class Oo {
  constructor(e) {
    this.iter = e;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class be {
  constructor(e) {
    this.fields = e, // TODO(dimond): validation of FieldMask
    // Sort the field mask to support `FieldMask.isEqual()` and assert below.
    e.sort(ae.comparator);
  }
  static empty() {
    return new be([]);
  }
  /**
   * Returns a new FieldMask object that is the result of adding all the given
   * fields paths to this field mask.
   */
  unionWith(e) {
    let t = new me(ae.comparator);
    for (const r of this.fields) t = t.add(r);
    for (const r of e) t = t.add(r);
    return new be(t.toArray());
  }
  /**
   * Verifies that `fieldPath` is included by at least one field in this field
   * mask.
   *
   * This is an O(n) operation, where `n` is the size of the field mask.
   */
  covers(e) {
    for (const t of this.fields) if (t.isPrefixOf(e)) return !0;
    return !1;
  }
  isEqual(e) {
    return Dt(this.fields, e.fields, (t, r) => t.isEqual(r));
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qh extends Error {
  constructor() {
    super(...arguments), this.name = "Base64DecodeError";
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ke {
  constructor(e) {
    this.binaryString = e;
  }
  static fromBase64String(e) {
    const t = function(i) {
      try {
        return atob(i);
      } catch (o) {
        throw typeof DOMException < "u" && o instanceof DOMException ? new Qh("Invalid base64 string: " + o) : o;
      }
    }(e);
    return new ke(t);
  }
  static fromUint8Array(e) {
    const t = (
      /**
      * Helper function to convert an Uint8array to a binary string.
      */
      function(i) {
        let o = "";
        for (let l = 0; l < i.length; ++l) o += String.fromCharCode(i[l]);
        return o;
      }(e)
    );
    return new ke(t);
  }
  [Symbol.iterator]() {
    let e = 0;
    return {
      next: () => e < this.binaryString.length ? {
        value: this.binaryString.charCodeAt(e++),
        done: !1
      } : {
        value: void 0,
        done: !0
      }
    };
  }
  toBase64() {
    return function(t) {
      return btoa(t);
    }(this.binaryString);
  }
  toUint8Array() {
    return function(t) {
      const r = new Uint8Array(t.length);
      for (let i = 0; i < t.length; i++) r[i] = t.charCodeAt(i);
      return r;
    }(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(e) {
    return G(this.binaryString, e.binaryString);
  }
  isEqual(e) {
    return this.binaryString === e.binaryString;
  }
}
ke.EMPTY_BYTE_STRING = new ke("");
const Jh = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function yt(n) {
  if (X(!!n), typeof n == "string") {
    let e = 0;
    const t = Jh.exec(n);
    if (X(!!t), t[1]) {
      let i = t[1];
      i = (i + "000000000").substr(0, 9), e = Number(i);
    }
    const r = new Date(n);
    return {
      seconds: Math.floor(r.getTime() / 1e3),
      nanos: e
    };
  }
  return {
    seconds: oe(n.seconds),
    nanos: oe(n.nanos)
  };
}
function oe(n) {
  return typeof n == "number" ? n : typeof n == "string" ? Number(n) : 0;
}
function _n(n) {
  return typeof n == "string" ? ke.fromBase64String(n) : ke.fromUint8Array(n);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Qi(n) {
  var e, t;
  return ((t = (((e = n == null ? void 0 : n.mapValue) === null || e === void 0 ? void 0 : e.fields) || {}).__type__) === null || t === void 0 ? void 0 : t.stringValue) === "server_timestamp";
}
function za(n) {
  const e = n.mapValue.fields.__previous_value__;
  return Qi(e) ? za(e) : e;
}
function mr(n) {
  const e = yt(n.mapValue.fields.__local_write_time__.timestampValue);
  return new re(e.seconds, e.nanos);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Xh {
  /**
   * Constructs a DatabaseInfo using the provided host, databaseId and
   * persistenceKey.
   *
   * @param databaseId - The database to use.
   * @param appId - The Firebase App Id.
   * @param persistenceKey - A unique identifier for this Firestore's local
   * storage (used in conjunction with the databaseId).
   * @param host - The Firestore backend host to connect to.
   * @param ssl - Whether to use SSL when connecting.
   * @param forceLongPolling - Whether to use the forceLongPolling option
   * when using WebChannel as the network transport.
   * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
   * option when using WebChannel as the network transport.
   * @param longPollingOptions Options that configure long-polling.
   * @param useFetchStreams Whether to use the Fetch API instead of
   * XMLHTTPRequest
   */
  constructor(e, t, r, i, o, l, u, h, f) {
    this.databaseId = e, this.appId = t, this.persistenceKey = r, this.host = i, this.ssl = o, this.forceLongPolling = l, this.autoDetectLongPolling = u, this.longPollingOptions = h, this.useFetchStreams = f;
  }
}
class gr {
  constructor(e, t) {
    this.projectId = e, this.database = t || "(default)";
  }
  static empty() {
    return new gr("", "");
  }
  get isDefaultDatabase() {
    return this.database === "(default)";
  }
  isEqual(e) {
    return e instanceof gr && e.projectId === this.projectId && e.database === this.database;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const er = {
  mapValue: {}
};
function Ot(n) {
  return "nullValue" in n ? 0 : "booleanValue" in n ? 1 : "integerValue" in n || "doubleValue" in n ? 2 : "timestampValue" in n ? 3 : "stringValue" in n ? 5 : "bytesValue" in n ? 6 : "referenceValue" in n ? 7 : "geoPointValue" in n ? 8 : "arrayValue" in n ? 9 : "mapValue" in n ? Qi(n) ? 4 : Zh(n) ? 9007199254740991 : Yh(n) ? 10 : 11 : U();
}
function Ne(n, e) {
  if (n === e) return !0;
  const t = Ot(n);
  if (t !== Ot(e)) return !1;
  switch (t) {
    case 0:
    case 9007199254740991:
      return !0;
    case 1:
      return n.booleanValue === e.booleanValue;
    case 4:
      return mr(n).isEqual(mr(e));
    case 3:
      return function(i, o) {
        if (typeof i.timestampValue == "string" && typeof o.timestampValue == "string" && i.timestampValue.length === o.timestampValue.length)
          return i.timestampValue === o.timestampValue;
        const l = yt(i.timestampValue), u = yt(o.timestampValue);
        return l.seconds === u.seconds && l.nanos === u.nanos;
      }(n, e);
    case 5:
      return n.stringValue === e.stringValue;
    case 6:
      return function(i, o) {
        return _n(i.bytesValue).isEqual(_n(o.bytesValue));
      }(n, e);
    case 7:
      return n.referenceValue === e.referenceValue;
    case 8:
      return function(i, o) {
        return oe(i.geoPointValue.latitude) === oe(o.geoPointValue.latitude) && oe(i.geoPointValue.longitude) === oe(o.geoPointValue.longitude);
      }(n, e);
    case 2:
      return function(i, o) {
        if ("integerValue" in i && "integerValue" in o) return oe(i.integerValue) === oe(o.integerValue);
        if ("doubleValue" in i && "doubleValue" in o) {
          const l = oe(i.doubleValue), u = oe(o.doubleValue);
          return l === u ? pr(l) === pr(u) : isNaN(l) && isNaN(u);
        }
        return !1;
      }(n, e);
    case 9:
      return Dt(n.arrayValue.values || [], e.arrayValue.values || [], Ne);
    case 10:
    case 11:
      return function(i, o) {
        const l = i.mapValue.fields || {}, u = o.mapValue.fields || {};
        if (Do(l) !== Do(u)) return !1;
        for (const h in l) if (l.hasOwnProperty(h) && (u[h] === void 0 || !Ne(l[h], u[h]))) return !1;
        return !0;
      }(n, e);
    default:
      return U();
  }
}
function yn(n, e) {
  return (n.values || []).find((t) => Ne(t, e)) !== void 0;
}
function Vt(n, e) {
  if (n === e) return 0;
  const t = Ot(n), r = Ot(e);
  if (t !== r) return G(t, r);
  switch (t) {
    case 0:
    case 9007199254740991:
      return 0;
    case 1:
      return G(n.booleanValue, e.booleanValue);
    case 2:
      return function(o, l) {
        const u = oe(o.integerValue || o.doubleValue), h = oe(l.integerValue || l.doubleValue);
        return u < h ? -1 : u > h ? 1 : u === h ? 0 : (
          // one or both are NaN.
          isNaN(u) ? isNaN(h) ? 0 : -1 : 1
        );
      }(n, e);
    case 3:
      return Vo(n.timestampValue, e.timestampValue);
    case 4:
      return Vo(mr(n), mr(e));
    case 5:
      return G(n.stringValue, e.stringValue);
    case 6:
      return function(o, l) {
        const u = _n(o), h = _n(l);
        return u.compareTo(h);
      }(n.bytesValue, e.bytesValue);
    case 7:
      return function(o, l) {
        const u = o.split("/"), h = l.split("/");
        for (let f = 0; f < u.length && f < h.length; f++) {
          const y = G(u[f], h[f]);
          if (y !== 0) return y;
        }
        return G(u.length, h.length);
      }(n.referenceValue, e.referenceValue);
    case 8:
      return function(o, l) {
        const u = G(oe(o.latitude), oe(l.latitude));
        return u !== 0 ? u : G(oe(o.longitude), oe(l.longitude));
      }(n.geoPointValue, e.geoPointValue);
    case 9:
      return Mo(n.arrayValue, e.arrayValue);
    case 10:
      return function(o, l) {
        var u, h, f, y;
        const w = o.fields || {}, R = l.fields || {}, C = (u = w.value) === null || u === void 0 ? void 0 : u.arrayValue, k = (h = R.value) === null || h === void 0 ? void 0 : h.arrayValue, O = G(((f = C == null ? void 0 : C.values) === null || f === void 0 ? void 0 : f.length) || 0, ((y = k == null ? void 0 : k.values) === null || y === void 0 ? void 0 : y.length) || 0);
        return O !== 0 ? O : Mo(C, k);
      }(n.mapValue, e.mapValue);
    case 11:
      return function(o, l) {
        if (o === er.mapValue && l === er.mapValue) return 0;
        if (o === er.mapValue) return 1;
        if (l === er.mapValue) return -1;
        const u = o.fields || {}, h = Object.keys(u), f = l.fields || {}, y = Object.keys(f);
        h.sort(), y.sort();
        for (let w = 0; w < h.length && w < y.length; ++w) {
          const R = G(h[w], y[w]);
          if (R !== 0) return R;
          const C = Vt(u[h[w]], f[y[w]]);
          if (C !== 0) return C;
        }
        return G(h.length, y.length);
      }(n.mapValue, e.mapValue);
    default:
      throw U();
  }
}
function Vo(n, e) {
  if (typeof n == "string" && typeof e == "string" && n.length === e.length) return G(n, e);
  const t = yt(n), r = yt(e), i = G(t.seconds, r.seconds);
  return i !== 0 ? i : G(t.nanos, r.nanos);
}
function Mo(n, e) {
  const t = n.values || [], r = e.values || [];
  for (let i = 0; i < t.length && i < r.length; ++i) {
    const o = Vt(t[i], r[i]);
    if (o) return o;
  }
  return G(t.length, r.length);
}
function Mt(n) {
  return ki(n);
}
function ki(n) {
  return "nullValue" in n ? "null" : "booleanValue" in n ? "" + n.booleanValue : "integerValue" in n ? "" + n.integerValue : "doubleValue" in n ? "" + n.doubleValue : "timestampValue" in n ? function(t) {
    const r = yt(t);
    return `time(${r.seconds},${r.nanos})`;
  }(n.timestampValue) : "stringValue" in n ? n.stringValue : "bytesValue" in n ? function(t) {
    return _n(t).toBase64();
  }(n.bytesValue) : "referenceValue" in n ? function(t) {
    return L.fromName(t).toString();
  }(n.referenceValue) : "geoPointValue" in n ? function(t) {
    return `geo(${t.latitude},${t.longitude})`;
  }(n.geoPointValue) : "arrayValue" in n ? function(t) {
    let r = "[", i = !0;
    for (const o of t.values || []) i ? i = !1 : r += ",", r += ki(o);
    return r + "]";
  }(n.arrayValue) : "mapValue" in n ? function(t) {
    const r = Object.keys(t.fields || {}).sort();
    let i = "{", o = !0;
    for (const l of r) o ? o = !1 : i += ",", i += `${l}:${ki(t.fields[l])}`;
    return i + "}";
  }(n.mapValue) : U();
}
function Ni(n) {
  return !!n && "integerValue" in n;
}
function Ji(n) {
  return !!n && "arrayValue" in n;
}
function sr(n) {
  return !!n && "mapValue" in n;
}
function Yh(n) {
  var e, t;
  return ((t = (((e = n == null ? void 0 : n.mapValue) === null || e === void 0 ? void 0 : e.fields) || {}).__type__) === null || t === void 0 ? void 0 : t.stringValue) === "__vector__";
}
function cn(n) {
  if (n.geoPointValue) return {
    geoPointValue: Object.assign({}, n.geoPointValue)
  };
  if (n.timestampValue && typeof n.timestampValue == "object") return {
    timestampValue: Object.assign({}, n.timestampValue)
  };
  if (n.mapValue) {
    const e = {
      mapValue: {
        fields: {}
      }
    };
    return bn(n.mapValue.fields, (t, r) => e.mapValue.fields[t] = cn(r)), e;
  }
  if (n.arrayValue) {
    const e = {
      arrayValue: {
        values: []
      }
    };
    for (let t = 0; t < (n.arrayValue.values || []).length; ++t) e.arrayValue.values[t] = cn(n.arrayValue.values[t]);
    return e;
  }
  return Object.assign({}, n);
}
function Zh(n) {
  return (((n.mapValue || {}).fields || {}).__type__ || {}).stringValue === "__max__";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Re {
  constructor(e) {
    this.value = e;
  }
  static empty() {
    return new Re({
      mapValue: {}
    });
  }
  /**
   * Returns the value at the given path or null.
   *
   * @param path - the path to search
   * @returns The value at the path or null if the path is not set.
   */
  field(e) {
    if (e.isEmpty()) return this.value;
    {
      let t = this.value;
      for (let r = 0; r < e.length - 1; ++r) if (t = (t.mapValue.fields || {})[e.get(r)], !sr(t)) return null;
      return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
    }
  }
  /**
   * Sets the field to the provided value.
   *
   * @param path - The field path to set.
   * @param value - The value to set.
   */
  set(e, t) {
    this.getFieldsMap(e.popLast())[e.lastSegment()] = cn(t);
  }
  /**
   * Sets the provided fields to the provided values.
   *
   * @param data - A map of fields to values (or null for deletes).
   */
  setAll(e) {
    let t = ae.emptyPath(), r = {}, i = [];
    e.forEach((l, u) => {
      if (!t.isImmediateParentOf(u)) {
        const h = this.getFieldsMap(t);
        this.applyChanges(h, r, i), r = {}, i = [], t = u.popLast();
      }
      l ? r[u.lastSegment()] = cn(l) : i.push(u.lastSegment());
    });
    const o = this.getFieldsMap(t);
    this.applyChanges(o, r, i);
  }
  /**
   * Removes the field at the specified path. If there is no field at the
   * specified path, nothing is changed.
   *
   * @param path - The field path to remove.
   */
  delete(e) {
    const t = this.field(e.popLast());
    sr(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
  }
  isEqual(e) {
    return Ne(this.value, e.value);
  }
  /**
   * Returns the map that contains the leaf element of `path`. If the parent
   * entry does not yet exist, or if it is not a map, a new map will be created.
   */
  getFieldsMap(e) {
    let t = this.value;
    t.mapValue.fields || (t.mapValue = {
      fields: {}
    });
    for (let r = 0; r < e.length; ++r) {
      let i = t.mapValue.fields[e.get(r)];
      sr(i) && i.mapValue.fields || (i = {
        mapValue: {
          fields: {}
        }
      }, t.mapValue.fields[e.get(r)] = i), t = i;
    }
    return t.mapValue.fields;
  }
  /**
   * Modifies `fieldsMap` by adding, replacing or deleting the specified
   * entries.
   */
  applyChanges(e, t, r) {
    bn(t, (i, o) => e[i] = o);
    for (const i of r) delete e[i];
  }
  clone() {
    return new Re(cn(this.value));
  }
}
function qa(n) {
  const e = [];
  return bn(n.fields, (t, r) => {
    const i = new ae([t]);
    if (sr(r)) {
      const o = qa(r.mapValue).fields;
      if (o.length === 0)
        e.push(i);
      else
        for (const l of o) e.push(i.child(l));
    } else
      e.push(i);
  }), new be(e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ae {
  constructor(e, t, r, i, o, l, u) {
    this.key = e, this.documentType = t, this.version = r, this.readTime = i, this.createTime = o, this.data = l, this.documentState = u;
  }
  /**
   * Creates a document with no known version or data, but which can serve as
   * base document for mutations.
   */
  static newInvalidDocument(e) {
    return new Ae(
      e,
      0,
      /* version */
      Q.min(),
      /* readTime */
      Q.min(),
      /* createTime */
      Q.min(),
      Re.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist with the given data at the
   * given version.
   */
  static newFoundDocument(e, t, r, i) {
    return new Ae(
      e,
      1,
      /* version */
      t,
      /* readTime */
      Q.min(),
      /* createTime */
      r,
      i,
      0
      /* DocumentState.SYNCED */
    );
  }
  /** Creates a new document that is known to not exist at the given version. */
  static newNoDocument(e, t) {
    return new Ae(
      e,
      2,
      /* version */
      t,
      /* readTime */
      Q.min(),
      /* createTime */
      Q.min(),
      Re.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist at the given version but
   * whose data is not known (e.g. a document that was updated without a known
   * base document).
   */
  static newUnknownDocument(e, t) {
    return new Ae(
      e,
      3,
      /* version */
      t,
      /* readTime */
      Q.min(),
      /* createTime */
      Q.min(),
      Re.empty(),
      2
      /* DocumentState.HAS_COMMITTED_MUTATIONS */
    );
  }
  /**
   * Changes the document type to indicate that it exists and that its version
   * and data are known.
   */
  convertToFoundDocument(e, t) {
    return !this.createTime.isEqual(Q.min()) || this.documentType !== 2 && this.documentType !== 0 || (this.createTime = e), this.version = e, this.documentType = 1, this.data = t, this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it doesn't exist at the given
   * version.
   */
  convertToNoDocument(e) {
    return this.version = e, this.documentType = 2, this.data = Re.empty(), this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it exists at a given version but
   * that its data is not known (e.g. a document that was updated without a known
   * base document).
   */
  convertToUnknownDocument(e) {
    return this.version = e, this.documentType = 3, this.data = Re.empty(), this.documentState = 2, this;
  }
  setHasCommittedMutations() {
    return this.documentState = 2, this;
  }
  setHasLocalMutations() {
    return this.documentState = 1, this.version = Q.min(), this;
  }
  setReadTime(e) {
    return this.readTime = e, this;
  }
  get hasLocalMutations() {
    return this.documentState === 1;
  }
  get hasCommittedMutations() {
    return this.documentState === 2;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return this.documentType !== 0;
  }
  isFoundDocument() {
    return this.documentType === 1;
  }
  isNoDocument() {
    return this.documentType === 2;
  }
  isUnknownDocument() {
    return this.documentType === 3;
  }
  isEqual(e) {
    return e instanceof Ae && this.key.isEqual(e.key) && this.version.isEqual(e.version) && this.documentType === e.documentType && this.documentState === e.documentState && this.data.isEqual(e.data);
  }
  mutableCopy() {
    return new Ae(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class _r {
  constructor(e, t) {
    this.position = e, this.inclusive = t;
  }
}
function Lo(n, e, t) {
  let r = 0;
  for (let i = 0; i < n.position.length; i++) {
    const o = e[i], l = n.position[i];
    if (o.field.isKeyField() ? r = L.comparator(L.fromName(l.referenceValue), t.key) : r = Vt(l, t.data.field(o.field)), o.dir === "desc" && (r *= -1), r !== 0) break;
  }
  return r;
}
function xo(n, e) {
  if (n === null) return e === null;
  if (e === null || n.inclusive !== e.inclusive || n.position.length !== e.position.length) return !1;
  for (let t = 0; t < n.position.length; t++)
    if (!Ne(n.position[t], e.position[t])) return !1;
  return !0;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class yr {
  constructor(e, t = "asc") {
    this.field = e, this.dir = t;
  }
}
function ed(n, e) {
  return n.dir === e.dir && n.field.isEqual(e.field);
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ga {
}
class ne extends Ga {
  constructor(e, t, r) {
    super(), this.field = e, this.op = t, this.value = r;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t, r) {
    return e.isKeyField() ? t === "in" || t === "not-in" ? this.createKeyFieldInFilter(e, t, r) : new nd(e, t, r) : t === "array-contains" ? new sd(e, r) : t === "in" ? new od(e, r) : t === "not-in" ? new ad(e, r) : t === "array-contains-any" ? new ld(e, r) : new ne(e, t, r);
  }
  static createKeyFieldInFilter(e, t, r) {
    return t === "in" ? new rd(e, r) : new id(e, r);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return this.op === "!=" ? t !== null && this.matchesComparison(Vt(t, this.value)) : t !== null && Ot(this.value) === Ot(t) && this.matchesComparison(Vt(t, this.value));
  }
  matchesComparison(e) {
    switch (this.op) {
      case "<":
        return e < 0;
      case "<=":
        return e <= 0;
      case "==":
        return e === 0;
      case "!=":
        return e !== 0;
      case ">":
        return e > 0;
      case ">=":
        return e >= 0;
      default:
        return U();
    }
  }
  isInequality() {
    return [
      "<",
      "<=",
      ">",
      ">=",
      "!=",
      "not-in"
      /* Operator.NOT_IN */
    ].indexOf(this.op) >= 0;
  }
  getFlattenedFilters() {
    return [this];
  }
  getFilters() {
    return [this];
  }
}
class it extends Ga {
  constructor(e, t) {
    super(), this.filters = e, this.op = t, this.ae = null;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t) {
    return new it(e, t);
  }
  matches(e) {
    return Ka(this) ? this.filters.find((t) => !t.matches(e)) === void 0 : this.filters.find((t) => t.matches(e)) !== void 0;
  }
  getFlattenedFilters() {
    return this.ae !== null || (this.ae = this.filters.reduce((e, t) => e.concat(t.getFlattenedFilters()), [])), this.ae;
  }
  // Returns a mutable copy of `this.filters`
  getFilters() {
    return Object.assign([], this.filters);
  }
}
function Ka(n) {
  return n.op === "and";
}
function Wa(n) {
  return td(n) && Ka(n);
}
function td(n) {
  for (const e of n.filters) if (e instanceof it) return !1;
  return !0;
}
function Di(n) {
  if (n instanceof ne)
    return n.field.canonicalString() + n.op.toString() + Mt(n.value);
  if (Wa(n))
    return n.filters.map((e) => Di(e)).join(",");
  {
    const e = n.filters.map((t) => Di(t)).join(",");
    return `${n.op}(${e})`;
  }
}
function Qa(n, e) {
  return n instanceof ne ? function(r, i) {
    return i instanceof ne && r.op === i.op && r.field.isEqual(i.field) && Ne(r.value, i.value);
  }(n, e) : n instanceof it ? function(r, i) {
    return i instanceof it && r.op === i.op && r.filters.length === i.filters.length ? r.filters.reduce((o, l, u) => o && Qa(l, i.filters[u]), !0) : !1;
  }(n, e) : void U();
}
function Ja(n) {
  return n instanceof ne ? function(t) {
    return `${t.field.canonicalString()} ${t.op} ${Mt(t.value)}`;
  }(n) : n instanceof it ? function(t) {
    return t.op.toString() + " {" + t.getFilters().map(Ja).join(" ,") + "}";
  }(n) : "Filter";
}
class nd extends ne {
  constructor(e, t, r) {
    super(e, t, r), this.key = L.fromName(r.referenceValue);
  }
  matches(e) {
    const t = L.comparator(e.key, this.key);
    return this.matchesComparison(t);
  }
}
class rd extends ne {
  constructor(e, t) {
    super(e, "in", t), this.keys = Xa("in", t);
  }
  matches(e) {
    return this.keys.some((t) => t.isEqual(e.key));
  }
}
class id extends ne {
  constructor(e, t) {
    super(e, "not-in", t), this.keys = Xa("not-in", t);
  }
  matches(e) {
    return !this.keys.some((t) => t.isEqual(e.key));
  }
}
function Xa(n, e) {
  var t;
  return (((t = e.arrayValue) === null || t === void 0 ? void 0 : t.values) || []).map((r) => L.fromName(r.referenceValue));
}
class sd extends ne {
  constructor(e, t) {
    super(e, "array-contains", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return Ji(t) && yn(t.arrayValue, this.value);
  }
}
class od extends ne {
  constructor(e, t) {
    super(e, "in", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return t !== null && yn(this.value.arrayValue, t);
  }
}
class ad extends ne {
  constructor(e, t) {
    super(e, "not-in", t);
  }
  matches(e) {
    if (yn(this.value.arrayValue, {
      nullValue: "NULL_VALUE"
    })) return !1;
    const t = e.data.field(this.field);
    return t !== null && !yn(this.value.arrayValue, t);
  }
}
class ld extends ne {
  constructor(e, t) {
    super(e, "array-contains-any", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return !(!Ji(t) || !t.arrayValue.values) && t.arrayValue.values.some((r) => yn(this.value.arrayValue, r));
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class cd {
  constructor(e, t = null, r = [], i = [], o = null, l = null, u = null) {
    this.path = e, this.collectionGroup = t, this.orderBy = r, this.filters = i, this.limit = o, this.startAt = l, this.endAt = u, this.ue = null;
  }
}
function Uo(n, e = null, t = [], r = [], i = null, o = null, l = null) {
  return new cd(n, e, t, r, i, o, l);
}
function Xi(n) {
  const e = K(n);
  if (e.ue === null) {
    let t = e.path.canonicalString();
    e.collectionGroup !== null && (t += "|cg:" + e.collectionGroup), t += "|f:", t += e.filters.map((r) => Di(r)).join(","), t += "|ob:", t += e.orderBy.map((r) => function(o) {
      return o.field.canonicalString() + o.dir;
    }(r)).join(","), Wi(e.limit) || (t += "|l:", t += e.limit), e.startAt && (t += "|lb:", t += e.startAt.inclusive ? "b:" : "a:", t += e.startAt.position.map((r) => Mt(r)).join(",")), e.endAt && (t += "|ub:", t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map((r) => Mt(r)).join(",")), e.ue = t;
  }
  return e.ue;
}
function Yi(n, e) {
  if (n.limit !== e.limit || n.orderBy.length !== e.orderBy.length) return !1;
  for (let t = 0; t < n.orderBy.length; t++) if (!ed(n.orderBy[t], e.orderBy[t])) return !1;
  if (n.filters.length !== e.filters.length) return !1;
  for (let t = 0; t < n.filters.length; t++) if (!Qa(n.filters[t], e.filters[t])) return !1;
  return n.collectionGroup === e.collectionGroup && !!n.path.isEqual(e.path) && !!xo(n.startAt, e.startAt) && xo(n.endAt, e.endAt);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Nr {
  /**
   * Initializes a Query with a path and optional additional query constraints.
   * Path must currently be empty if this is a collection group query.
   */
  constructor(e, t = null, r = [], i = [], o = null, l = "F", u = null, h = null) {
    this.path = e, this.collectionGroup = t, this.explicitOrderBy = r, this.filters = i, this.limit = o, this.limitType = l, this.startAt = u, this.endAt = h, this.ce = null, // The corresponding `Target` of this `Query` instance, for use with
    // non-aggregate queries.
    this.le = null, // The corresponding `Target` of this `Query` instance, for use with
    // aggregate queries. Unlike targets for non-aggregate queries,
    // aggregate query targets do not contain normalized order-bys, they only
    // contain explicit order-bys.
    this.he = null, this.startAt, this.endAt;
  }
}
function ud(n, e, t, r, i, o, l, u) {
  return new Nr(n, e, t, r, i, o, l, u);
}
function hd(n) {
  return new Nr(n);
}
function Fo(n) {
  return n.filters.length === 0 && n.limit === null && n.startAt == null && n.endAt == null && (n.explicitOrderBy.length === 0 || n.explicitOrderBy.length === 1 && n.explicitOrderBy[0].field.isKeyField());
}
function dd(n) {
  return n.collectionGroup !== null;
}
function un(n) {
  const e = K(n);
  if (e.ce === null) {
    e.ce = [];
    const t = /* @__PURE__ */ new Set();
    for (const o of e.explicitOrderBy) e.ce.push(o), t.add(o.field.canonicalString());
    const r = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc";
    (function(l) {
      let u = new me(ae.comparator);
      return l.filters.forEach((h) => {
        h.getFlattenedFilters().forEach((f) => {
          f.isInequality() && (u = u.add(f.field));
        });
      }), u;
    })(e).forEach((o) => {
      t.has(o.canonicalString()) || o.isKeyField() || e.ce.push(new yr(o, r));
    }), // Add the document key field to the last if it is not explicitly ordered.
    t.has(ae.keyField().canonicalString()) || e.ce.push(new yr(ae.keyField(), r));
  }
  return e.ce;
}
function ft(n) {
  const e = K(n);
  return e.le || (e.le = fd(e, un(n))), e.le;
}
function fd(n, e) {
  if (n.limitType === "F") return Uo(n.path, n.collectionGroup, e, n.filters, n.limit, n.startAt, n.endAt);
  {
    e = e.map((i) => {
      const o = i.dir === "desc" ? "asc" : "desc";
      return new yr(i.field, o);
    });
    const t = n.endAt ? new _r(n.endAt.position, n.endAt.inclusive) : null, r = n.startAt ? new _r(n.startAt.position, n.startAt.inclusive) : null;
    return Uo(n.path, n.collectionGroup, e, n.filters, n.limit, t, r);
  }
}
function Oi(n, e, t) {
  return new Nr(n.path, n.collectionGroup, n.explicitOrderBy.slice(), n.filters.slice(), e, t, n.startAt, n.endAt);
}
function Ya(n, e) {
  return Yi(ft(n), ft(e)) && n.limitType === e.limitType;
}
function Za(n) {
  return `${Xi(ft(n))}|lt:${n.limitType}`;
}
function an(n) {
  return `Query(target=${function(t) {
    let r = t.path.canonicalString();
    return t.collectionGroup !== null && (r += " collectionGroup=" + t.collectionGroup), t.filters.length > 0 && (r += `, filters: [${t.filters.map((i) => Ja(i)).join(", ")}]`), Wi(t.limit) || (r += ", limit: " + t.limit), t.orderBy.length > 0 && (r += `, orderBy: [${t.orderBy.map((i) => function(l) {
      return `${l.field.canonicalString()} (${l.dir})`;
    }(i)).join(", ")}]`), t.startAt && (r += ", startAt: ", r += t.startAt.inclusive ? "b:" : "a:", r += t.startAt.position.map((i) => Mt(i)).join(",")), t.endAt && (r += ", endAt: ", r += t.endAt.inclusive ? "a:" : "b:", r += t.endAt.position.map((i) => Mt(i)).join(",")), `Target(${r})`;
  }(ft(n))}; limitType=${n.limitType})`;
}
function Zi(n, e) {
  return e.isFoundDocument() && function(r, i) {
    const o = i.key.path;
    return r.collectionGroup !== null ? i.key.hasCollectionId(r.collectionGroup) && r.path.isPrefixOf(o) : L.isDocumentKey(r.path) ? r.path.isEqual(o) : r.path.isImmediateParentOf(o);
  }(n, e) && function(r, i) {
    for (const o of un(r))
      if (!o.field.isKeyField() && i.data.field(o.field) === null) return !1;
    return !0;
  }(n, e) && function(r, i) {
    for (const o of r.filters) if (!o.matches(i)) return !1;
    return !0;
  }(n, e) && function(r, i) {
    return !(r.startAt && !/**
    * Returns true if a document sorts before a bound using the provided sort
    * order.
    */
    function(l, u, h) {
      const f = Lo(l, u, h);
      return l.inclusive ? f <= 0 : f < 0;
    }(r.startAt, un(r), i) || r.endAt && !function(l, u, h) {
      const f = Lo(l, u, h);
      return l.inclusive ? f >= 0 : f > 0;
    }(r.endAt, un(r), i));
  }(n, e);
}
function pd(n) {
  return (e, t) => {
    let r = !1;
    for (const i of un(n)) {
      const o = md(i, e, t);
      if (o !== 0) return o;
      r = r || i.field.isKeyField();
    }
    return 0;
  };
}
function md(n, e, t) {
  const r = n.field.isKeyField() ? L.comparator(e.key, t.key) : function(o, l, u) {
    const h = l.data.field(o), f = u.data.field(o);
    return h !== null && f !== null ? Vt(h, f) : U();
  }(n.field, e, t);
  switch (n.dir) {
    case "asc":
      return r;
    case "desc":
      return -1 * r;
    default:
      return U();
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Bt {
  constructor(e, t) {
    this.mapKeyFn = e, this.equalsFn = t, /**
     * The inner map for a key/value pair. Due to the possibility of collisions we
     * keep a list of entries that we do a linear search through to find an actual
     * match. Note that collisions should be rare, so we still expect near
     * constant time lookups in practice.
     */
    this.inner = {}, /** The number of entries stored in the map */
    this.innerSize = 0;
  }
  /** Get a value for this key, or undefined if it does not exist. */
  get(e) {
    const t = this.mapKeyFn(e), r = this.inner[t];
    if (r !== void 0) {
      for (const [i, o] of r) if (this.equalsFn(i, e)) return o;
    }
  }
  has(e) {
    return this.get(e) !== void 0;
  }
  /** Put this key and value in the map. */
  set(e, t) {
    const r = this.mapKeyFn(e), i = this.inner[r];
    if (i === void 0) return this.inner[r] = [[e, t]], void this.innerSize++;
    for (let o = 0; o < i.length; o++) if (this.equalsFn(i[o][0], e))
      return void (i[o] = [e, t]);
    i.push([e, t]), this.innerSize++;
  }
  /**
   * Remove this key from the map. Returns a boolean if anything was deleted.
   */
  delete(e) {
    const t = this.mapKeyFn(e), r = this.inner[t];
    if (r === void 0) return !1;
    for (let i = 0; i < r.length; i++) if (this.equalsFn(r[i][0], e)) return r.length === 1 ? delete this.inner[t] : r.splice(i, 1), this.innerSize--, !0;
    return !1;
  }
  forEach(e) {
    bn(this.inner, (t, r) => {
      for (const [i, o] of r) e(i, o);
    });
  }
  isEmpty() {
    return Ha(this.inner);
  }
  size() {
    return this.innerSize;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const gd = new Te(L.comparator);
function vr() {
  return gd;
}
const el = new Te(L.comparator);
function tr(...n) {
  let e = el;
  for (const t of n) e = e.insert(t.key, t);
  return e;
}
function tl(n) {
  let e = el;
  return n.forEach((t, r) => e = e.insert(t, r.overlayedDocument)), e;
}
function ht() {
  return hn();
}
function nl() {
  return hn();
}
function hn() {
  return new Bt((n) => n.toString(), (n, e) => n.isEqual(e));
}
const _d = new Te(L.comparator), yd = new me(L.comparator);
function pe(...n) {
  let e = yd;
  for (const t of n) e = e.add(t);
  return e;
}
const vd = new me(G);
function Ed() {
  return vd;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function es(n, e) {
  if (n.useProto3Json) {
    if (isNaN(e)) return {
      doubleValue: "NaN"
    };
    if (e === 1 / 0) return {
      doubleValue: "Infinity"
    };
    if (e === -1 / 0) return {
      doubleValue: "-Infinity"
    };
  }
  return {
    doubleValue: pr(e) ? "-0" : e
  };
}
function rl(n) {
  return {
    integerValue: "" + n
  };
}
function Td(n, e) {
  return Wh(e) ? rl(e) : es(n, e);
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Dr {
  constructor() {
    this._ = void 0;
  }
}
function Id(n, e, t) {
  return n instanceof Er ? function(i, o) {
    const l = {
      fields: {
        __type__: {
          stringValue: "server_timestamp"
        },
        __local_write_time__: {
          timestampValue: {
            seconds: i.seconds,
            nanos: i.nanoseconds
          }
        }
      }
    };
    return o && Qi(o) && (o = za(o)), o && (l.fields.__previous_value__ = o), {
      mapValue: l
    };
  }(t, e) : n instanceof vn ? sl(n, e) : n instanceof En ? ol(n, e) : function(i, o) {
    const l = il(i, o), u = Bo(l) + Bo(i.Pe);
    return Ni(l) && Ni(i.Pe) ? rl(u) : es(i.serializer, u);
  }(n, e);
}
function wd(n, e, t) {
  return n instanceof vn ? sl(n, e) : n instanceof En ? ol(n, e) : t;
}
function il(n, e) {
  return n instanceof Tr ? (
    /** Returns true if `value` is either an IntegerValue or a DoubleValue. */
    function(r) {
      return Ni(r) || function(o) {
        return !!o && "doubleValue" in o;
      }(r);
    }(e) ? e : {
      integerValue: 0
    }
  ) : null;
}
class Er extends Dr {
}
class vn extends Dr {
  constructor(e) {
    super(), this.elements = e;
  }
}
function sl(n, e) {
  const t = al(e);
  for (const r of n.elements) t.some((i) => Ne(i, r)) || t.push(r);
  return {
    arrayValue: {
      values: t
    }
  };
}
class En extends Dr {
  constructor(e) {
    super(), this.elements = e;
  }
}
function ol(n, e) {
  let t = al(e);
  for (const r of n.elements) t = t.filter((i) => !Ne(i, r));
  return {
    arrayValue: {
      values: t
    }
  };
}
class Tr extends Dr {
  constructor(e, t) {
    super(), this.serializer = e, this.Pe = t;
  }
}
function Bo(n) {
  return oe(n.integerValue || n.doubleValue);
}
function al(n) {
  return Ji(n) && n.arrayValue.values ? n.arrayValue.values.slice() : [];
}
function Ad(n, e) {
  return n.field.isEqual(e.field) && function(r, i) {
    return r instanceof vn && i instanceof vn || r instanceof En && i instanceof En ? Dt(r.elements, i.elements, Ne) : r instanceof Tr && i instanceof Tr ? Ne(r.Pe, i.Pe) : r instanceof Er && i instanceof Er;
  }(n.transform, e.transform);
}
class Rd {
  constructor(e, t) {
    this.version = e, this.transformResults = t;
  }
}
class xe {
  constructor(e, t) {
    this.updateTime = e, this.exists = t;
  }
  /** Creates a new empty Precondition. */
  static none() {
    return new xe();
  }
  /** Creates a new Precondition with an exists flag. */
  static exists(e) {
    return new xe(void 0, e);
  }
  /** Creates a new Precondition based on a version a document exists at. */
  static updateTime(e) {
    return new xe(e);
  }
  /** Returns whether this Precondition is empty. */
  get isNone() {
    return this.updateTime === void 0 && this.exists === void 0;
  }
  isEqual(e) {
    return this.exists === e.exists && (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime);
  }
}
function or(n, e) {
  return n.updateTime !== void 0 ? e.isFoundDocument() && e.version.isEqual(n.updateTime) : n.exists === void 0 || n.exists === e.isFoundDocument();
}
class Or {
}
function ll(n, e) {
  if (!n.hasLocalMutations || e && e.fields.length === 0) return null;
  if (e === null) return n.isNoDocument() ? new ul(n.key, xe.none()) : new Sn(n.key, n.data, xe.none());
  {
    const t = n.data, r = Re.empty();
    let i = new me(ae.comparator);
    for (let o of e.fields) if (!i.has(o)) {
      let l = t.field(o);
      l === null && o.length > 1 && (o = o.popLast(), l = t.field(o)), l === null ? r.delete(o) : r.set(o, l), i = i.add(o);
    }
    return new Et(n.key, r, new be(i.toArray()), xe.none());
  }
}
function bd(n, e, t) {
  n instanceof Sn ? function(i, o, l) {
    const u = i.value.clone(), h = $o(i.fieldTransforms, o, l.transformResults);
    u.setAll(h), o.convertToFoundDocument(l.version, u).setHasCommittedMutations();
  }(n, e, t) : n instanceof Et ? function(i, o, l) {
    if (!or(i.precondition, o))
      return void o.convertToUnknownDocument(l.version);
    const u = $o(i.fieldTransforms, o, l.transformResults), h = o.data;
    h.setAll(cl(i)), h.setAll(u), o.convertToFoundDocument(l.version, h).setHasCommittedMutations();
  }(n, e, t) : function(i, o, l) {
    o.convertToNoDocument(l.version).setHasCommittedMutations();
  }(0, e, t);
}
function dn(n, e, t, r) {
  return n instanceof Sn ? function(o, l, u, h) {
    if (!or(o.precondition, l))
      return u;
    const f = o.value.clone(), y = Ho(o.fieldTransforms, h, l);
    return f.setAll(y), l.convertToFoundDocument(l.version, f).setHasLocalMutations(), null;
  }(n, e, t, r) : n instanceof Et ? function(o, l, u, h) {
    if (!or(o.precondition, l)) return u;
    const f = Ho(o.fieldTransforms, h, l), y = l.data;
    return y.setAll(cl(o)), y.setAll(f), l.convertToFoundDocument(l.version, y).setHasLocalMutations(), u === null ? null : u.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map((w) => w.field));
  }(n, e, t, r) : function(o, l, u) {
    return or(o.precondition, l) ? (l.convertToNoDocument(l.version).setHasLocalMutations(), null) : u;
  }(n, e, t);
}
function Sd(n, e) {
  let t = null;
  for (const r of n.fieldTransforms) {
    const i = e.data.field(r.field), o = il(r.transform, i || null);
    o != null && (t === null && (t = Re.empty()), t.set(r.field, o));
  }
  return t || null;
}
function jo(n, e) {
  return n.type === e.type && !!n.key.isEqual(e.key) && !!n.precondition.isEqual(e.precondition) && !!function(r, i) {
    return r === void 0 && i === void 0 || !(!r || !i) && Dt(r, i, (o, l) => Ad(o, l));
  }(n.fieldTransforms, e.fieldTransforms) && (n.type === 0 ? n.value.isEqual(e.value) : n.type !== 1 || n.data.isEqual(e.data) && n.fieldMask.isEqual(e.fieldMask));
}
class Sn extends Or {
  constructor(e, t, r, i = []) {
    super(), this.key = e, this.value = t, this.precondition = r, this.fieldTransforms = i, this.type = 0;
  }
  getFieldMask() {
    return null;
  }
}
class Et extends Or {
  constructor(e, t, r, i, o = []) {
    super(), this.key = e, this.data = t, this.fieldMask = r, this.precondition = i, this.fieldTransforms = o, this.type = 1;
  }
  getFieldMask() {
    return this.fieldMask;
  }
}
function cl(n) {
  const e = /* @__PURE__ */ new Map();
  return n.fieldMask.fields.forEach((t) => {
    if (!t.isEmpty()) {
      const r = n.data.field(t);
      e.set(t, r);
    }
  }), e;
}
function $o(n, e, t) {
  const r = /* @__PURE__ */ new Map();
  X(n.length === t.length);
  for (let i = 0; i < t.length; i++) {
    const o = n[i], l = o.transform, u = e.data.field(o.field);
    r.set(o.field, wd(l, u, t[i]));
  }
  return r;
}
function Ho(n, e, t) {
  const r = /* @__PURE__ */ new Map();
  for (const i of n) {
    const o = i.transform, l = t.data.field(i.field);
    r.set(i.field, Id(o, l, e));
  }
  return r;
}
class ul extends Or {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 2, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
class Pd extends Or {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 3, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Cd {
  /**
   * @param batchId - The unique ID of this mutation batch.
   * @param localWriteTime - The original write time of this mutation.
   * @param baseMutations - Mutations that are used to populate the base
   * values when this mutation is applied locally. This can be used to locally
   * overwrite values that are persisted in the remote document cache. Base
   * mutations are never sent to the backend.
   * @param mutations - The user-provided mutations in this mutation batch.
   * User-provided mutations are applied both locally and remotely on the
   * backend.
   */
  constructor(e, t, r, i) {
    this.batchId = e, this.localWriteTime = t, this.baseMutations = r, this.mutations = i;
  }
  /**
   * Applies all the mutations in this MutationBatch to the specified document
   * to compute the state of the remote document
   *
   * @param document - The document to apply mutations to.
   * @param batchResult - The result of applying the MutationBatch to the
   * backend.
   */
  applyToRemoteDocument(e, t) {
    const r = t.mutationResults;
    for (let i = 0; i < this.mutations.length; i++) {
      const o = this.mutations[i];
      o.key.isEqual(e.key) && bd(o, e, r[i]);
    }
  }
  /**
   * Computes the local view of a document given all the mutations in this
   * batch.
   *
   * @param document - The document to apply mutations to.
   * @param mutatedFields - Fields that have been updated before applying this mutation batch.
   * @returns A `FieldMask` representing all the fields that are mutated.
   */
  applyToLocalView(e, t) {
    for (const r of this.baseMutations) r.key.isEqual(e.key) && (t = dn(r, e, t, this.localWriteTime));
    for (const r of this.mutations) r.key.isEqual(e.key) && (t = dn(r, e, t, this.localWriteTime));
    return t;
  }
  /**
   * Computes the local view for all provided documents given the mutations in
   * this batch. Returns a `DocumentKey` to `Mutation` map which can be used to
   * replace all the mutation applications.
   */
  applyToLocalDocumentSet(e, t) {
    const r = nl();
    return this.mutations.forEach((i) => {
      const o = e.get(i.key), l = o.overlayedDocument;
      let u = this.applyToLocalView(l, o.mutatedFields);
      u = t.has(i.key) ? null : u;
      const h = ll(l, u);
      h !== null && r.set(i.key, h), l.isValidDocument() || l.convertToNoDocument(Q.min());
    }), r;
  }
  keys() {
    return this.mutations.reduce((e, t) => e.add(t.key), pe());
  }
  isEqual(e) {
    return this.batchId === e.batchId && Dt(this.mutations, e.mutations, (t, r) => jo(t, r)) && Dt(this.baseMutations, e.baseMutations, (t, r) => jo(t, r));
  }
}
class ts {
  constructor(e, t, r, i) {
    this.batch = e, this.commitVersion = t, this.mutationResults = r, this.docVersions = i;
  }
  /**
   * Creates a new MutationBatchResult for the given batch and results. There
   * must be one result for each mutation in the batch. This static factory
   * caches a document=&gt;version mapping (docVersions).
   */
  static from(e, t, r) {
    X(e.mutations.length === r.length);
    let i = /* @__PURE__ */ function() {
      return _d;
    }();
    const o = e.mutations;
    for (let l = 0; l < o.length; l++) i = i.insert(o[l].key, r[l].version);
    return new ts(e, t, r, i);
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class kd {
  constructor(e, t) {
    this.largestBatchId = e, this.mutation = t;
  }
  getKey() {
    return this.mutation.key;
  }
  isEqual(e) {
    return e !== null && this.mutation === e.mutation;
  }
  toString() {
    return `Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Z, B;
function Nd(n) {
  switch (n) {
    default:
      return U();
    case S.CANCELLED:
    case S.UNKNOWN:
    case S.DEADLINE_EXCEEDED:
    case S.RESOURCE_EXHAUSTED:
    case S.INTERNAL:
    case S.UNAVAILABLE:
    case S.UNAUTHENTICATED:
      return !1;
    case S.INVALID_ARGUMENT:
    case S.NOT_FOUND:
    case S.ALREADY_EXISTS:
    case S.PERMISSION_DENIED:
    case S.FAILED_PRECONDITION:
    case S.ABORTED:
    case S.OUT_OF_RANGE:
    case S.UNIMPLEMENTED:
    case S.DATA_LOSS:
      return !0;
  }
}
function Dd(n) {
  if (n === void 0)
    return _t("GRPC error has no .code"), S.UNKNOWN;
  switch (n) {
    case Z.OK:
      return S.OK;
    case Z.CANCELLED:
      return S.CANCELLED;
    case Z.UNKNOWN:
      return S.UNKNOWN;
    case Z.DEADLINE_EXCEEDED:
      return S.DEADLINE_EXCEEDED;
    case Z.RESOURCE_EXHAUSTED:
      return S.RESOURCE_EXHAUSTED;
    case Z.INTERNAL:
      return S.INTERNAL;
    case Z.UNAVAILABLE:
      return S.UNAVAILABLE;
    case Z.UNAUTHENTICATED:
      return S.UNAUTHENTICATED;
    case Z.INVALID_ARGUMENT:
      return S.INVALID_ARGUMENT;
    case Z.NOT_FOUND:
      return S.NOT_FOUND;
    case Z.ALREADY_EXISTS:
      return S.ALREADY_EXISTS;
    case Z.PERMISSION_DENIED:
      return S.PERMISSION_DENIED;
    case Z.FAILED_PRECONDITION:
      return S.FAILED_PRECONDITION;
    case Z.ABORTED:
      return S.ABORTED;
    case Z.OUT_OF_RANGE:
      return S.OUT_OF_RANGE;
    case Z.UNIMPLEMENTED:
      return S.UNIMPLEMENTED;
    case Z.DATA_LOSS:
      return S.DATA_LOSS;
    default:
      return U();
  }
}
(B = Z || (Z = {}))[B.OK = 0] = "OK", B[B.CANCELLED = 1] = "CANCELLED", B[B.UNKNOWN = 2] = "UNKNOWN", B[B.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", B[B.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", B[B.NOT_FOUND = 5] = "NOT_FOUND", B[B.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", B[B.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", B[B.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", B[B.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", B[B.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", B[B.ABORTED = 10] = "ABORTED", B[B.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", B[B.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", B[B.INTERNAL = 13] = "INTERNAL", B[B.UNAVAILABLE = 14] = "UNAVAILABLE", B[B.DATA_LOSS = 15] = "DATA_LOSS";
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
new Oa([4294967295, 4294967295], 0);
class Od {
  constructor(e, t) {
    this.databaseId = e, this.useProto3Json = t;
  }
}
function Vi(n, e) {
  return n.useProto3Json ? `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z` : {
    seconds: "" + e.seconds,
    nanos: e.nanoseconds
  };
}
function Vd(n, e) {
  return n.useProto3Json ? e.toBase64() : e.toUint8Array();
}
function Md(n, e) {
  return Vi(n, e.toTimestamp());
}
function St(n) {
  return X(!!n), Q.fromTimestamp(function(t) {
    const r = yt(t);
    return new re(r.seconds, r.nanos);
  }(n));
}
function hl(n, e) {
  return Mi(n, e).canonicalString();
}
function Mi(n, e) {
  const t = function(i) {
    return new ee(["projects", i.projectId, "databases", i.database]);
  }(n).child("documents");
  return e === void 0 ? t : t.child(e);
}
function Ld(n) {
  const e = ee.fromString(n);
  return X(zd(e)), e;
}
function Li(n, e) {
  return hl(n.databaseId, e.path);
}
function xd(n) {
  const e = Ld(n);
  return e.length === 4 ? ee.emptyPath() : Fd(e);
}
function Ud(n) {
  return new ee(["projects", n.databaseId.projectId, "databases", n.databaseId.database]).canonicalString();
}
function Fd(n) {
  return X(n.length > 4 && n.get(4) === "documents"), n.popFirst(5);
}
function zo(n, e, t) {
  return {
    name: Li(n, e),
    fields: t.value.mapValue.fields
  };
}
function Bd(n, e) {
  let t;
  if (e instanceof Sn) t = {
    update: zo(n, e.key, e.value)
  };
  else if (e instanceof ul) t = {
    delete: Li(n, e.key)
  };
  else if (e instanceof Et) t = {
    update: zo(n, e.key, e.data),
    updateMask: Hd(e.fieldMask)
  };
  else {
    if (!(e instanceof Pd)) return U();
    t = {
      verify: Li(n, e.key)
    };
  }
  return e.fieldTransforms.length > 0 && (t.updateTransforms = e.fieldTransforms.map((r) => function(o, l) {
    const u = l.transform;
    if (u instanceof Er) return {
      fieldPath: l.field.canonicalString(),
      setToServerValue: "REQUEST_TIME"
    };
    if (u instanceof vn) return {
      fieldPath: l.field.canonicalString(),
      appendMissingElements: {
        values: u.elements
      }
    };
    if (u instanceof En) return {
      fieldPath: l.field.canonicalString(),
      removeAllFromArray: {
        values: u.elements
      }
    };
    if (u instanceof Tr) return {
      fieldPath: l.field.canonicalString(),
      increment: u.Pe
    };
    throw U();
  }(0, r))), e.precondition.isNone || (t.currentDocument = function(i, o) {
    return o.updateTime !== void 0 ? {
      updateTime: Md(i, o.updateTime)
    } : o.exists !== void 0 ? {
      exists: o.exists
    } : U();
  }(n, e.precondition)), t;
}
function jd(n, e) {
  return n && n.length > 0 ? (X(e !== void 0), n.map((t) => function(i, o) {
    let l = i.updateTime ? St(i.updateTime) : St(o);
    return l.isEqual(Q.min()) && // The Firestore Emulator currently returns an update time of 0 for
    // deletes of non-existing documents (rather than null). This breaks the
    // test "get deleted doc while offline with source=cache" as NoDocuments
    // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
    // TODO(#2149): Remove this when Emulator is fixed
    (l = St(o)), new Rd(l, i.transformResults || []);
  }(t, e))) : [];
}
function $d(n) {
  let e = xd(n.parent);
  const t = n.structuredQuery, r = t.from ? t.from.length : 0;
  let i = null;
  if (r > 0) {
    X(r === 1);
    const y = t.from[0];
    y.allDescendants ? i = y.collectionId : e = e.child(y.collectionId);
  }
  let o = [];
  t.where && (o = function(w) {
    const R = dl(w);
    return R instanceof it && Wa(R) ? R.getFilters() : [R];
  }(t.where));
  let l = [];
  t.orderBy && (l = function(w) {
    return w.map((R) => function(k) {
      return new yr(
        Rt(k.field),
        // visible for testing
        function(N) {
          switch (N) {
            case "ASCENDING":
              return "asc";
            case "DESCENDING":
              return "desc";
            default:
              return;
          }
        }(k.direction)
      );
    }(R));
  }(t.orderBy));
  let u = null;
  t.limit && (u = function(w) {
    let R;
    return R = typeof w == "object" ? w.value : w, Wi(R) ? null : R;
  }(t.limit));
  let h = null;
  t.startAt && (h = function(w) {
    const R = !!w.before, C = w.values || [];
    return new _r(C, R);
  }(t.startAt));
  let f = null;
  return t.endAt && (f = function(w) {
    const R = !w.before, C = w.values || [];
    return new _r(C, R);
  }(t.endAt)), ud(e, i, l, o, u, "F", h, f);
}
function dl(n) {
  return n.unaryFilter !== void 0 ? function(t) {
    switch (t.unaryFilter.op) {
      case "IS_NAN":
        const r = Rt(t.unaryFilter.field);
        return ne.create(r, "==", {
          doubleValue: NaN
        });
      case "IS_NULL":
        const i = Rt(t.unaryFilter.field);
        return ne.create(i, "==", {
          nullValue: "NULL_VALUE"
        });
      case "IS_NOT_NAN":
        const o = Rt(t.unaryFilter.field);
        return ne.create(o, "!=", {
          doubleValue: NaN
        });
      case "IS_NOT_NULL":
        const l = Rt(t.unaryFilter.field);
        return ne.create(l, "!=", {
          nullValue: "NULL_VALUE"
        });
      default:
        return U();
    }
  }(n) : n.fieldFilter !== void 0 ? function(t) {
    return ne.create(Rt(t.fieldFilter.field), function(i) {
      switch (i) {
        case "EQUAL":
          return "==";
        case "NOT_EQUAL":
          return "!=";
        case "GREATER_THAN":
          return ">";
        case "GREATER_THAN_OR_EQUAL":
          return ">=";
        case "LESS_THAN":
          return "<";
        case "LESS_THAN_OR_EQUAL":
          return "<=";
        case "ARRAY_CONTAINS":
          return "array-contains";
        case "IN":
          return "in";
        case "NOT_IN":
          return "not-in";
        case "ARRAY_CONTAINS_ANY":
          return "array-contains-any";
        default:
          return U();
      }
    }(t.fieldFilter.op), t.fieldFilter.value);
  }(n) : n.compositeFilter !== void 0 ? function(t) {
    return it.create(t.compositeFilter.filters.map((r) => dl(r)), function(i) {
      switch (i) {
        case "AND":
          return "and";
        case "OR":
          return "or";
        default:
          return U();
      }
    }(t.compositeFilter.op));
  }(n) : U();
}
function Rt(n) {
  return ae.fromServerFormat(n.fieldPath);
}
function Hd(n) {
  const e = [];
  return n.fields.forEach((t) => e.push(t.canonicalString())), {
    fieldPaths: e
  };
}
function zd(n) {
  return n.length >= 4 && n.get(0) === "projects" && n.get(2) === "databases";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class qd {
  constructor(e) {
    this.ct = e;
  }
}
function Gd(n) {
  const e = $d({
    parent: n.parent,
    structuredQuery: n.structuredQuery
  });
  return n.limitType === "LAST" ? Oi(
    e,
    e.limit,
    "L"
    /* LimitType.Last */
  ) : e;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Kd {
  constructor() {
    this.un = new Wd();
  }
  addToCollectionParentIndex(e, t) {
    return this.un.add(t), b.resolve();
  }
  getCollectionParents(e, t) {
    return b.resolve(this.un.getEntries(t));
  }
  addFieldIndex(e, t) {
    return b.resolve();
  }
  deleteFieldIndex(e, t) {
    return b.resolve();
  }
  deleteAllFieldIndexes(e) {
    return b.resolve();
  }
  createTargetIndexes(e, t) {
    return b.resolve();
  }
  getDocumentsMatchingTarget(e, t) {
    return b.resolve(null);
  }
  getIndexType(e, t) {
    return b.resolve(
      0
      /* IndexType.NONE */
    );
  }
  getFieldIndexes(e, t) {
    return b.resolve([]);
  }
  getNextCollectionGroupToUpdate(e) {
    return b.resolve(null);
  }
  getMinOffset(e, t) {
    return b.resolve(rt.min());
  }
  getMinOffsetFromCollectionGroup(e, t) {
    return b.resolve(rt.min());
  }
  updateCollectionGroup(e, t, r) {
    return b.resolve();
  }
  updateIndexEntries(e, t) {
    return b.resolve();
  }
}
class Wd {
  constructor() {
    this.index = {};
  }
  // Returns false if the entry already existed.
  add(e) {
    const t = e.lastSegment(), r = e.popLast(), i = this.index[t] || new me(ee.comparator), o = !i.has(r);
    return this.index[t] = i.add(r), o;
  }
  has(e) {
    const t = e.lastSegment(), r = e.popLast(), i = this.index[t];
    return i && i.has(r);
  }
  getEntries(e) {
    return (this.index[e] || new me(ee.comparator)).toArray();
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Lt {
  constructor(e) {
    this.Ln = e;
  }
  next() {
    return this.Ln += 2, this.Ln;
  }
  static Bn() {
    return new Lt(0);
  }
  static kn() {
    return new Lt(-1);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qd {
  constructor() {
    this.changes = new Bt((e) => e.toString(), (e, t) => e.isEqual(t)), this.changesApplied = !1;
  }
  /**
   * Buffers a `RemoteDocumentCache.addEntry()` call.
   *
   * You can only modify documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  addEntry(e) {
    this.assertNotApplied(), this.changes.set(e.key, e);
  }
  /**
   * Buffers a `RemoteDocumentCache.removeEntry()` call.
   *
   * You can only remove documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  removeEntry(e, t) {
    this.assertNotApplied(), this.changes.set(e, Ae.newInvalidDocument(e).setReadTime(t));
  }
  /**
   * Looks up an entry in the cache. The buffered changes will first be checked,
   * and if no buffered change applies, this will forward to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKey - The key of the entry to look up.
   * @returns The cached document or an invalid document if we have nothing
   * cached.
   */
  getEntry(e, t) {
    this.assertNotApplied();
    const r = this.changes.get(t);
    return r !== void 0 ? b.resolve(r) : this.getFromCache(e, t);
  }
  /**
   * Looks up several entries in the cache, forwarding to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKeys - The keys of the entries to look up.
   * @returns A map of cached documents, indexed by key. If an entry cannot be
   *     found, the corresponding key will be mapped to an invalid document.
   */
  getEntries(e, t) {
    return this.getAllFromCache(e, t);
  }
  /**
   * Applies buffered changes to the underlying RemoteDocumentCache, using
   * the provided transaction.
   */
  apply(e) {
    return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(e);
  }
  /** Helper to assert this.changes is not null  */
  assertNotApplied() {
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Jd {
  constructor(e, t) {
    this.overlayedDocument = e, this.mutatedFields = t;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Xd {
  constructor(e, t, r, i) {
    this.remoteDocumentCache = e, this.mutationQueue = t, this.documentOverlayCache = r, this.indexManager = i;
  }
  /**
   * Get the local view of the document identified by `key`.
   *
   * @returns Local view of the document or null if we don't have any cached
   * state for it.
   */
  getDocument(e, t) {
    let r = null;
    return this.documentOverlayCache.getOverlay(e, t).next((i) => (r = i, this.remoteDocumentCache.getEntry(e, t))).next((i) => (r !== null && dn(r.mutation, i, be.empty(), re.now()), i));
  }
  /**
   * Gets the local view of the documents identified by `keys`.
   *
   * If we don't have cached state for a document in `keys`, a NoDocument will
   * be stored for that key in the resulting set.
   */
  getDocuments(e, t) {
    return this.remoteDocumentCache.getEntries(e, t).next((r) => this.getLocalViewOfDocuments(e, r, pe()).next(() => r));
  }
  /**
   * Similar to `getDocuments`, but creates the local view from the given
   * `baseDocs` without retrieving documents from the local store.
   *
   * @param transaction - The transaction this operation is scoped to.
   * @param docs - The documents to apply local mutations to get the local views.
   * @param existenceStateChanged - The set of document keys whose existence state
   *   is changed. This is useful to determine if some documents overlay needs
   *   to be recalculated.
   */
  getLocalViewOfDocuments(e, t, r = pe()) {
    const i = ht();
    return this.populateOverlays(e, i, t).next(() => this.computeViews(e, t, i, r).next((o) => {
      let l = tr();
      return o.forEach((u, h) => {
        l = l.insert(u, h.overlayedDocument);
      }), l;
    }));
  }
  /**
   * Gets the overlayed documents for the given document map, which will include
   * the local view of those documents and a `FieldMask` indicating which fields
   * are mutated locally, `null` if overlay is a Set or Delete mutation.
   */
  getOverlayedDocuments(e, t) {
    const r = ht();
    return this.populateOverlays(e, r, t).next(() => this.computeViews(e, t, r, pe()));
  }
  /**
   * Fetches the overlays for {@code docs} and adds them to provided overlay map
   * if the map does not already contain an entry for the given document key.
   */
  populateOverlays(e, t, r) {
    const i = [];
    return r.forEach((o) => {
      t.has(o) || i.push(o);
    }), this.documentOverlayCache.getOverlays(e, i).next((o) => {
      o.forEach((l, u) => {
        t.set(l, u);
      });
    });
  }
  /**
   * Computes the local view for the given documents.
   *
   * @param docs - The documents to compute views for. It also has the base
   *   version of the documents.
   * @param overlays - The overlays that need to be applied to the given base
   *   version of the documents.
   * @param existenceStateChanged - A set of documents whose existence states
   *   might have changed. This is used to determine if we need to re-calculate
   *   overlays from mutation queues.
   * @return A map represents the local documents view.
   */
  computeViews(e, t, r, i) {
    let o = vr();
    const l = hn(), u = function() {
      return hn();
    }();
    return t.forEach((h, f) => {
      const y = r.get(f.key);
      i.has(f.key) && (y === void 0 || y.mutation instanceof Et) ? o = o.insert(f.key, f) : y !== void 0 ? (l.set(f.key, y.mutation.getFieldMask()), dn(y.mutation, f, y.mutation.getFieldMask(), re.now())) : (
        // no overlay exists
        // Using EMPTY to indicate there is no overlay for the document.
        l.set(f.key, be.empty())
      );
    }), this.recalculateAndSaveOverlays(e, o).next((h) => (h.forEach((f, y) => l.set(f, y)), t.forEach((f, y) => {
      var w;
      return u.set(f, new Jd(y, (w = l.get(f)) !== null && w !== void 0 ? w : null));
    }), u));
  }
  recalculateAndSaveOverlays(e, t) {
    const r = hn();
    let i = new Te((l, u) => l - u), o = pe();
    return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e, t).next((l) => {
      for (const u of l) u.keys().forEach((h) => {
        const f = t.get(h);
        if (f === null) return;
        let y = r.get(h) || be.empty();
        y = u.applyToLocalView(f, y), r.set(h, y);
        const w = (i.get(u.batchId) || pe()).add(h);
        i = i.insert(u.batchId, w);
      });
    }).next(() => {
      const l = [], u = i.getReverseIterator();
      for (; u.hasNext(); ) {
        const h = u.getNext(), f = h.key, y = h.value, w = nl();
        y.forEach((R) => {
          if (!o.has(R)) {
            const C = ll(t.get(R), r.get(R));
            C !== null && w.set(R, C), o = o.add(R);
          }
        }), l.push(this.documentOverlayCache.saveOverlays(e, f, w));
      }
      return b.waitFor(l);
    }).next(() => r);
  }
  /**
   * Recalculates overlays by reading the documents from remote document cache
   * first, and saves them after they are calculated.
   */
  recalculateAndSaveOverlaysForDocumentKeys(e, t) {
    return this.remoteDocumentCache.getEntries(e, t).next((r) => this.recalculateAndSaveOverlays(e, r));
  }
  /**
   * Performs a query against the local view of all documents.
   *
   * @param transaction - The persistence transaction.
   * @param query - The query to match documents against.
   * @param offset - Read time and key to start scanning by (exclusive).
   * @param context - A optional tracker to keep a record of important details
   *   during database local query execution.
   */
  getDocumentsMatchingQuery(e, t, r, i) {
    return function(l) {
      return L.isDocumentKey(l.path) && l.collectionGroup === null && l.filters.length === 0;
    }(t) ? this.getDocumentsMatchingDocumentQuery(e, t.path) : dd(t) ? this.getDocumentsMatchingCollectionGroupQuery(e, t, r, i) : this.getDocumentsMatchingCollectionQuery(e, t, r, i);
  }
  /**
   * Given a collection group, returns the next documents that follow the provided offset, along
   * with an updated batch ID.
   *
   * <p>The documents returned by this method are ordered by remote version from the provided
   * offset. If there are no more remote documents after the provided offset, documents with
   * mutations in order of batch id from the offset are returned. Since all documents in a batch are
   * returned together, the total number of documents returned can exceed {@code count}.
   *
   * @param transaction
   * @param collectionGroup The collection group for the documents.
   * @param offset The offset to index into.
   * @param count The number of documents to return
   * @return A LocalWriteResult with the documents that follow the provided offset and the last processed batch id.
   */
  getNextDocuments(e, t, r, i) {
    return this.remoteDocumentCache.getAllFromCollectionGroup(e, t, r, i).next((o) => {
      const l = i - o.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(e, t, r.largestBatchId, i - o.size) : b.resolve(ht());
      let u = -1, h = o;
      return l.next((f) => b.forEach(f, (y, w) => (u < w.largestBatchId && (u = w.largestBatchId), o.get(y) ? b.resolve() : this.remoteDocumentCache.getEntry(e, y).next((R) => {
        h = h.insert(y, R);
      }))).next(() => this.populateOverlays(e, f, o)).next(() => this.computeViews(e, h, f, pe())).next((y) => ({
        batchId: u,
        changes: tl(y)
      })));
    });
  }
  getDocumentsMatchingDocumentQuery(e, t) {
    return this.getDocument(e, new L(t)).next((r) => {
      let i = tr();
      return r.isFoundDocument() && (i = i.insert(r.key, r)), i;
    });
  }
  getDocumentsMatchingCollectionGroupQuery(e, t, r, i) {
    const o = t.collectionGroup;
    let l = tr();
    return this.indexManager.getCollectionParents(e, o).next((u) => b.forEach(u, (h) => {
      const f = function(w, R) {
        return new Nr(
          R,
          /*collectionGroup=*/
          null,
          w.explicitOrderBy.slice(),
          w.filters.slice(),
          w.limit,
          w.limitType,
          w.startAt,
          w.endAt
        );
      }(t, h.child(o));
      return this.getDocumentsMatchingCollectionQuery(e, f, r, i).next((y) => {
        y.forEach((w, R) => {
          l = l.insert(w, R);
        });
      });
    }).next(() => l));
  }
  getDocumentsMatchingCollectionQuery(e, t, r, i) {
    let o;
    return this.documentOverlayCache.getOverlaysForCollection(e, t.path, r.largestBatchId).next((l) => (o = l, this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, r, o, i))).next((l) => {
      o.forEach((h, f) => {
        const y = f.getKey();
        l.get(y) === null && (l = l.insert(y, Ae.newInvalidDocument(y)));
      });
      let u = tr();
      return l.forEach((h, f) => {
        const y = o.get(h);
        y !== void 0 && dn(y.mutation, f, be.empty(), re.now()), // Finally, insert the documents that still match the query
        Zi(t, f) && (u = u.insert(h, f));
      }), u;
    });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Yd {
  constructor(e) {
    this.serializer = e, this.hr = /* @__PURE__ */ new Map(), this.Pr = /* @__PURE__ */ new Map();
  }
  getBundleMetadata(e, t) {
    return b.resolve(this.hr.get(t));
  }
  saveBundleMetadata(e, t) {
    return this.hr.set(
      t.id,
      /** Decodes a BundleMetadata proto into a BundleMetadata object. */
      function(i) {
        return {
          id: i.id,
          version: i.version,
          createTime: St(i.createTime)
        };
      }(t)
    ), b.resolve();
  }
  getNamedQuery(e, t) {
    return b.resolve(this.Pr.get(t));
  }
  saveNamedQuery(e, t) {
    return this.Pr.set(t.name, function(i) {
      return {
        name: i.name,
        query: Gd(i.bundledQuery),
        readTime: St(i.readTime)
      };
    }(t)), b.resolve();
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zd {
  constructor() {
    this.overlays = new Te(L.comparator), this.Ir = /* @__PURE__ */ new Map();
  }
  getOverlay(e, t) {
    return b.resolve(this.overlays.get(t));
  }
  getOverlays(e, t) {
    const r = ht();
    return b.forEach(t, (i) => this.getOverlay(e, i).next((o) => {
      o !== null && r.set(i, o);
    })).next(() => r);
  }
  saveOverlays(e, t, r) {
    return r.forEach((i, o) => {
      this.ht(e, t, o);
    }), b.resolve();
  }
  removeOverlaysForBatchId(e, t, r) {
    const i = this.Ir.get(r);
    return i !== void 0 && (i.forEach((o) => this.overlays = this.overlays.remove(o)), this.Ir.delete(r)), b.resolve();
  }
  getOverlaysForCollection(e, t, r) {
    const i = ht(), o = t.length + 1, l = new L(t.child("")), u = this.overlays.getIteratorFrom(l);
    for (; u.hasNext(); ) {
      const h = u.getNext().value, f = h.getKey();
      if (!t.isPrefixOf(f.path)) break;
      f.path.length === o && h.largestBatchId > r && i.set(h.getKey(), h);
    }
    return b.resolve(i);
  }
  getOverlaysForCollectionGroup(e, t, r, i) {
    let o = new Te((f, y) => f - y);
    const l = this.overlays.getIterator();
    for (; l.hasNext(); ) {
      const f = l.getNext().value;
      if (f.getKey().getCollectionGroup() === t && f.largestBatchId > r) {
        let y = o.get(f.largestBatchId);
        y === null && (y = ht(), o = o.insert(f.largestBatchId, y)), y.set(f.getKey(), f);
      }
    }
    const u = ht(), h = o.getIterator();
    for (; h.hasNext() && (h.getNext().value.forEach((f, y) => u.set(f, y)), !(u.size() >= i)); )
      ;
    return b.resolve(u);
  }
  ht(e, t, r) {
    const i = this.overlays.get(r.key);
    if (i !== null) {
      const l = this.Ir.get(i.largestBatchId).delete(r.key);
      this.Ir.set(i.largestBatchId, l);
    }
    this.overlays = this.overlays.insert(r.key, new kd(t, r));
    let o = this.Ir.get(t);
    o === void 0 && (o = pe(), this.Ir.set(t, o)), this.Ir.set(t, o.add(r.key));
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ef {
  constructor() {
    this.sessionToken = ke.EMPTY_BYTE_STRING;
  }
  getSessionToken(e) {
    return b.resolve(this.sessionToken);
  }
  setSessionToken(e, t) {
    return this.sessionToken = t, b.resolve();
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ns {
  constructor() {
    this.Tr = new me(te.Er), // A set of outstanding references to a document sorted by target id.
    this.dr = new me(te.Ar);
  }
  /** Returns true if the reference set contains no references. */
  isEmpty() {
    return this.Tr.isEmpty();
  }
  /** Adds a reference to the given document key for the given ID. */
  addReference(e, t) {
    const r = new te(e, t);
    this.Tr = this.Tr.add(r), this.dr = this.dr.add(r);
  }
  /** Add references to the given document keys for the given ID. */
  Rr(e, t) {
    e.forEach((r) => this.addReference(r, t));
  }
  /**
   * Removes a reference to the given document key for the given
   * ID.
   */
  removeReference(e, t) {
    this.Vr(new te(e, t));
  }
  mr(e, t) {
    e.forEach((r) => this.removeReference(r, t));
  }
  /**
   * Clears all references with a given ID. Calls removeRef() for each key
   * removed.
   */
  gr(e) {
    const t = new L(new ee([])), r = new te(t, e), i = new te(t, e + 1), o = [];
    return this.dr.forEachInRange([r, i], (l) => {
      this.Vr(l), o.push(l.key);
    }), o;
  }
  pr() {
    this.Tr.forEach((e) => this.Vr(e));
  }
  Vr(e) {
    this.Tr = this.Tr.delete(e), this.dr = this.dr.delete(e);
  }
  yr(e) {
    const t = new L(new ee([])), r = new te(t, e), i = new te(t, e + 1);
    let o = pe();
    return this.dr.forEachInRange([r, i], (l) => {
      o = o.add(l.key);
    }), o;
  }
  containsKey(e) {
    const t = new te(e, 0), r = this.Tr.firstAfterOrEqual(t);
    return r !== null && e.isEqual(r.key);
  }
}
class te {
  constructor(e, t) {
    this.key = e, this.wr = t;
  }
  /** Compare by key then by ID */
  static Er(e, t) {
    return L.comparator(e.key, t.key) || G(e.wr, t.wr);
  }
  /** Compare by ID then by key */
  static Ar(e, t) {
    return G(e.wr, t.wr) || L.comparator(e.key, t.key);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class tf {
  constructor(e, t) {
    this.indexManager = e, this.referenceDelegate = t, /**
     * The set of all mutations that have been sent but not yet been applied to
     * the backend.
     */
    this.mutationQueue = [], /** Next value to use when assigning sequential IDs to each mutation batch. */
    this.Sr = 1, /** An ordered mapping between documents and the mutations batch IDs. */
    this.br = new me(te.Er);
  }
  checkEmpty(e) {
    return b.resolve(this.mutationQueue.length === 0);
  }
  addMutationBatch(e, t, r, i) {
    const o = this.Sr;
    this.Sr++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
    const l = new Cd(o, t, r, i);
    this.mutationQueue.push(l);
    for (const u of i) this.br = this.br.add(new te(u.key, o)), this.indexManager.addToCollectionParentIndex(e, u.key.path.popLast());
    return b.resolve(l);
  }
  lookupMutationBatch(e, t) {
    return b.resolve(this.Dr(t));
  }
  getNextMutationBatchAfterBatchId(e, t) {
    const r = t + 1, i = this.vr(r), o = i < 0 ? 0 : i;
    return b.resolve(this.mutationQueue.length > o ? this.mutationQueue[o] : null);
  }
  getHighestUnacknowledgedBatchId() {
    return b.resolve(this.mutationQueue.length === 0 ? -1 : this.Sr - 1);
  }
  getAllMutationBatches(e) {
    return b.resolve(this.mutationQueue.slice());
  }
  getAllMutationBatchesAffectingDocumentKey(e, t) {
    const r = new te(t, 0), i = new te(t, Number.POSITIVE_INFINITY), o = [];
    return this.br.forEachInRange([r, i], (l) => {
      const u = this.Dr(l.wr);
      o.push(u);
    }), b.resolve(o);
  }
  getAllMutationBatchesAffectingDocumentKeys(e, t) {
    let r = new me(G);
    return t.forEach((i) => {
      const o = new te(i, 0), l = new te(i, Number.POSITIVE_INFINITY);
      this.br.forEachInRange([o, l], (u) => {
        r = r.add(u.wr);
      });
    }), b.resolve(this.Cr(r));
  }
  getAllMutationBatchesAffectingQuery(e, t) {
    const r = t.path, i = r.length + 1;
    let o = r;
    L.isDocumentKey(o) || (o = o.child(""));
    const l = new te(new L(o), 0);
    let u = new me(G);
    return this.br.forEachWhile((h) => {
      const f = h.key.path;
      return !!r.isPrefixOf(f) && // Rows with document keys more than one segment longer than the query
      // path can't be matches. For example, a query on 'rooms' can't match
      // the document /rooms/abc/messages/xyx.
      // TODO(mcg): we'll need a different scanner when we implement
      // ancestor queries.
      (f.length === i && (u = u.add(h.wr)), !0);
    }, l), b.resolve(this.Cr(u));
  }
  Cr(e) {
    const t = [];
    return e.forEach((r) => {
      const i = this.Dr(r);
      i !== null && t.push(i);
    }), t;
  }
  removeMutationBatch(e, t) {
    X(this.Fr(t.batchId, "removed") === 0), this.mutationQueue.shift();
    let r = this.br;
    return b.forEach(t.mutations, (i) => {
      const o = new te(i.key, t.batchId);
      return r = r.delete(o), this.referenceDelegate.markPotentiallyOrphaned(e, i.key);
    }).next(() => {
      this.br = r;
    });
  }
  On(e) {
  }
  containsKey(e, t) {
    const r = new te(t, 0), i = this.br.firstAfterOrEqual(r);
    return b.resolve(t.isEqual(i && i.key));
  }
  performConsistencyCheck(e) {
    return this.mutationQueue.length, b.resolve();
  }
  /**
   * Finds the index of the given batchId in the mutation queue and asserts that
   * the resulting index is within the bounds of the queue.
   *
   * @param batchId - The batchId to search for
   * @param action - A description of what the caller is doing, phrased in passive
   * form (e.g. "acknowledged" in a routine that acknowledges batches).
   */
  Fr(e, t) {
    return this.vr(e);
  }
  /**
   * Finds the index of the given batchId in the mutation queue. This operation
   * is O(1).
   *
   * @returns The computed index of the batch with the given batchId, based on
   * the state of the queue. Note this index can be negative if the requested
   * batchId has already been removed from the queue or past the end of the
   * queue if the batchId is larger than the last added batch.
   */
  vr(e) {
    return this.mutationQueue.length === 0 ? 0 : e - this.mutationQueue[0].batchId;
  }
  /**
   * A version of lookupMutationBatch that doesn't return a promise, this makes
   * other functions that uses this code easier to read and more efficient.
   */
  Dr(e) {
    const t = this.vr(e);
    return t < 0 || t >= this.mutationQueue.length ? null : this.mutationQueue[t];
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class nf {
  /**
   * @param sizer - Used to assess the size of a document. For eager GC, this is
   * expected to just return 0 to avoid unnecessarily doing the work of
   * calculating the size.
   */
  constructor(e) {
    this.Mr = e, /** Underlying cache of documents and their read times. */
    this.docs = function() {
      return new Te(L.comparator);
    }(), /** Size of all cached documents. */
    this.size = 0;
  }
  setIndexManager(e) {
    this.indexManager = e;
  }
  /**
   * Adds the supplied entry to the cache and updates the cache size as appropriate.
   *
   * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  addEntry(e, t) {
    const r = t.key, i = this.docs.get(r), o = i ? i.size : 0, l = this.Mr(t);
    return this.docs = this.docs.insert(r, {
      document: t.mutableCopy(),
      size: l
    }), this.size += l - o, this.indexManager.addToCollectionParentIndex(e, r.path.popLast());
  }
  /**
   * Removes the specified entry from the cache and updates the cache size as appropriate.
   *
   * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  removeEntry(e) {
    const t = this.docs.get(e);
    t && (this.docs = this.docs.remove(e), this.size -= t.size);
  }
  getEntry(e, t) {
    const r = this.docs.get(t);
    return b.resolve(r ? r.document.mutableCopy() : Ae.newInvalidDocument(t));
  }
  getEntries(e, t) {
    let r = vr();
    return t.forEach((i) => {
      const o = this.docs.get(i);
      r = r.insert(i, o ? o.document.mutableCopy() : Ae.newInvalidDocument(i));
    }), b.resolve(r);
  }
  getDocumentsMatchingQuery(e, t, r, i) {
    let o = vr();
    const l = t.path, u = new L(l.child("")), h = this.docs.getIteratorFrom(u);
    for (; h.hasNext(); ) {
      const { key: f, value: { document: y } } = h.getNext();
      if (!l.isPrefixOf(f.path)) break;
      f.path.length > l.length + 1 || zh(Hh(y), r) <= 0 || (i.has(y.key) || Zi(t, y)) && (o = o.insert(y.key, y.mutableCopy()));
    }
    return b.resolve(o);
  }
  getAllFromCollectionGroup(e, t, r, i) {
    U();
  }
  Or(e, t) {
    return b.forEach(this.docs, (r) => t(r));
  }
  newChangeBuffer(e) {
    return new rf(this);
  }
  getSize(e) {
    return b.resolve(this.size);
  }
}
class rf extends Qd {
  constructor(e) {
    super(), this.cr = e;
  }
  applyChanges(e) {
    const t = [];
    return this.changes.forEach((r, i) => {
      i.isValidDocument() ? t.push(this.cr.addEntry(e, i)) : this.cr.removeEntry(r);
    }), b.waitFor(t);
  }
  getFromCache(e, t) {
    return this.cr.getEntry(e, t);
  }
  getAllFromCache(e, t) {
    return this.cr.getEntries(e, t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class sf {
  constructor(e) {
    this.persistence = e, /**
     * Maps a target to the data about that target
     */
    this.Nr = new Bt((t) => Xi(t), Yi), /** The last received snapshot version. */
    this.lastRemoteSnapshotVersion = Q.min(), /** The highest numbered target ID encountered. */
    this.highestTargetId = 0, /** The highest sequence number encountered. */
    this.Lr = 0, /**
     * A ordered bidirectional mapping between documents and the remote target
     * IDs.
     */
    this.Br = new ns(), this.targetCount = 0, this.kr = Lt.Bn();
  }
  forEachTarget(e, t) {
    return this.Nr.forEach((r, i) => t(i)), b.resolve();
  }
  getLastRemoteSnapshotVersion(e) {
    return b.resolve(this.lastRemoteSnapshotVersion);
  }
  getHighestSequenceNumber(e) {
    return b.resolve(this.Lr);
  }
  allocateTargetId(e) {
    return this.highestTargetId = this.kr.next(), b.resolve(this.highestTargetId);
  }
  setTargetsMetadata(e, t, r) {
    return r && (this.lastRemoteSnapshotVersion = r), t > this.Lr && (this.Lr = t), b.resolve();
  }
  Kn(e) {
    this.Nr.set(e.target, e);
    const t = e.targetId;
    t > this.highestTargetId && (this.kr = new Lt(t), this.highestTargetId = t), e.sequenceNumber > this.Lr && (this.Lr = e.sequenceNumber);
  }
  addTargetData(e, t) {
    return this.Kn(t), this.targetCount += 1, b.resolve();
  }
  updateTargetData(e, t) {
    return this.Kn(t), b.resolve();
  }
  removeTargetData(e, t) {
    return this.Nr.delete(t.target), this.Br.gr(t.targetId), this.targetCount -= 1, b.resolve();
  }
  removeTargets(e, t, r) {
    let i = 0;
    const o = [];
    return this.Nr.forEach((l, u) => {
      u.sequenceNumber <= t && r.get(u.targetId) === null && (this.Nr.delete(l), o.push(this.removeMatchingKeysForTargetId(e, u.targetId)), i++);
    }), b.waitFor(o).next(() => i);
  }
  getTargetCount(e) {
    return b.resolve(this.targetCount);
  }
  getTargetData(e, t) {
    const r = this.Nr.get(t) || null;
    return b.resolve(r);
  }
  addMatchingKeys(e, t, r) {
    return this.Br.Rr(t, r), b.resolve();
  }
  removeMatchingKeys(e, t, r) {
    this.Br.mr(t, r);
    const i = this.persistence.referenceDelegate, o = [];
    return i && t.forEach((l) => {
      o.push(i.markPotentiallyOrphaned(e, l));
    }), b.waitFor(o);
  }
  removeMatchingKeysForTargetId(e, t) {
    return this.Br.gr(t), b.resolve();
  }
  getMatchingKeysForTargetId(e, t) {
    const r = this.Br.yr(t);
    return b.resolve(r);
  }
  containsKey(e, t) {
    return b.resolve(this.Br.containsKey(t));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class of {
  /**
   * The constructor accepts a factory for creating a reference delegate. This
   * allows both the delegate and this instance to have strong references to
   * each other without having nullable fields that would then need to be
   * checked or asserted on every access.
   */
  constructor(e, t) {
    this.qr = {}, this.overlays = {}, this.Qr = new $a(0), this.Kr = !1, this.Kr = !0, this.$r = new ef(), this.referenceDelegate = e(this), this.Ur = new sf(this), this.indexManager = new Kd(), this.remoteDocumentCache = function(i) {
      return new nf(i);
    }((r) => this.referenceDelegate.Wr(r)), this.serializer = new qd(t), this.Gr = new Yd(this.serializer);
  }
  start() {
    return Promise.resolve();
  }
  shutdown() {
    return this.Kr = !1, Promise.resolve();
  }
  get started() {
    return this.Kr;
  }
  setDatabaseDeletedListener() {
  }
  setNetworkEnabled() {
  }
  getIndexManager(e) {
    return this.indexManager;
  }
  getDocumentOverlayCache(e) {
    let t = this.overlays[e.toKey()];
    return t || (t = new Zd(), this.overlays[e.toKey()] = t), t;
  }
  getMutationQueue(e, t) {
    let r = this.qr[e.toKey()];
    return r || (r = new tf(t, this.referenceDelegate), this.qr[e.toKey()] = r), r;
  }
  getGlobalsCache() {
    return this.$r;
  }
  getTargetCache() {
    return this.Ur;
  }
  getRemoteDocumentCache() {
    return this.remoteDocumentCache;
  }
  getBundleCache() {
    return this.Gr;
  }
  runTransaction(e, t, r) {
    D("MemoryPersistence", "Starting transaction:", e);
    const i = new af(this.Qr.next());
    return this.referenceDelegate.zr(), r(i).next((o) => this.referenceDelegate.jr(i).next(() => o)).toPromise().then((o) => (i.raiseOnCommittedEvent(), o));
  }
  Hr(e, t) {
    return b.or(Object.values(this.qr).map((r) => () => r.containsKey(e, t)));
  }
}
class af extends Gh {
  constructor(e) {
    super(), this.currentSequenceNumber = e;
  }
}
class rs {
  constructor(e) {
    this.persistence = e, /** Tracks all documents that are active in Query views. */
    this.Jr = new ns(), /** The list of documents that are potentially GCed after each transaction. */
    this.Yr = null;
  }
  static Zr(e) {
    return new rs(e);
  }
  get Xr() {
    if (this.Yr) return this.Yr;
    throw U();
  }
  addReference(e, t, r) {
    return this.Jr.addReference(r, t), this.Xr.delete(r.toString()), b.resolve();
  }
  removeReference(e, t, r) {
    return this.Jr.removeReference(r, t), this.Xr.add(r.toString()), b.resolve();
  }
  markPotentiallyOrphaned(e, t) {
    return this.Xr.add(t.toString()), b.resolve();
  }
  removeTarget(e, t) {
    this.Jr.gr(t.targetId).forEach((i) => this.Xr.add(i.toString()));
    const r = this.persistence.getTargetCache();
    return r.getMatchingKeysForTargetId(e, t.targetId).next((i) => {
      i.forEach((o) => this.Xr.add(o.toString()));
    }).next(() => r.removeTargetData(e, t));
  }
  zr() {
    this.Yr = /* @__PURE__ */ new Set();
  }
  jr(e) {
    const t = this.persistence.getRemoteDocumentCache().newChangeBuffer();
    return b.forEach(this.Xr, (r) => {
      const i = L.fromPath(r);
      return this.ei(e, i).next((o) => {
        o || t.removeEntry(i, Q.min());
      });
    }).next(() => (this.Yr = null, t.apply(e)));
  }
  updateLimboDocument(e, t) {
    return this.ei(e, t).next((r) => {
      r ? this.Xr.delete(t.toString()) : this.Xr.add(t.toString());
    });
  }
  Wr(e) {
    return 0;
  }
  ei(e, t) {
    return b.or([() => b.resolve(this.Jr.containsKey(t)), () => this.persistence.getTargetCache().containsKey(e, t), () => this.persistence.Hr(e, t)]);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class is {
  constructor(e, t, r, i) {
    this.targetId = e, this.fromCache = t, this.$i = r, this.Ui = i;
  }
  static Wi(e, t) {
    let r = pe(), i = pe();
    for (const o of t.docChanges) switch (o.type) {
      case 0:
        r = r.add(o.doc.key);
        break;
      case 1:
        i = i.add(o.doc.key);
    }
    return new is(e, t.fromCache, r, i);
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class lf {
  constructor() {
    this._documentReadCount = 0;
  }
  get documentReadCount() {
    return this._documentReadCount;
  }
  incrementDocumentReadCount(e) {
    this._documentReadCount += e;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class cf {
  constructor() {
    this.Gi = !1, this.zi = !1, /**
     * SDK only decides whether it should create index when collection size is
     * larger than this.
     */
    this.ji = 100, this.Hi = /**
    * This cost represents the evaluation result of
    * (([index, docKey] + [docKey, docContent]) per document in the result set)
    * / ([docKey, docContent] per documents in full collection scan) coming from
    * experiment [enter PR experiment URL here].
    */
    function() {
      return fu() ? 8 : Kh(ge()) > 0 ? 6 : 4;
    }();
  }
  /** Sets the document view to query against. */
  initialize(e, t) {
    this.Ji = e, this.indexManager = t, this.Gi = !0;
  }
  /** Returns all local documents matching the specified query. */
  getDocumentsMatchingQuery(e, t, r, i) {
    const o = {
      result: null
    };
    return this.Yi(e, t).next((l) => {
      o.result = l;
    }).next(() => {
      if (!o.result) return this.Zi(e, t, i, r).next((l) => {
        o.result = l;
      });
    }).next(() => {
      if (o.result) return;
      const l = new lf();
      return this.Xi(e, t, l).next((u) => {
        if (o.result = u, this.zi) return this.es(e, t, l, u.size);
      });
    }).next(() => o.result);
  }
  es(e, t, r, i) {
    return r.documentReadCount < this.ji ? (on() <= x.DEBUG && D("QueryEngine", "SDK will not create cache indexes for query:", an(t), "since it only creates cache indexes for collection contains", "more than or equal to", this.ji, "documents"), b.resolve()) : (on() <= x.DEBUG && D("QueryEngine", "Query:", an(t), "scans", r.documentReadCount, "local documents and returns", i, "documents as results."), r.documentReadCount > this.Hi * i ? (on() <= x.DEBUG && D("QueryEngine", "The SDK decides to create cache indexes for query:", an(t), "as using cache indexes may help improve performance."), this.indexManager.createTargetIndexes(e, ft(t))) : b.resolve());
  }
  /**
   * Performs an indexed query that evaluates the query based on a collection's
   * persisted index values. Returns `null` if an index is not available.
   */
  Yi(e, t) {
    if (Fo(t))
      return b.resolve(null);
    let r = ft(t);
    return this.indexManager.getIndexType(e, r).next((i) => i === 0 ? null : (t.limit !== null && i === 1 && // We cannot apply a limit for targets that are served using a partial
    // index. If a partial index will be used to serve the target, the
    // query may return a superset of documents that match the target
    // (e.g. if the index doesn't include all the target's filters), or
    // may return the correct set of documents in the wrong order (e.g. if
    // the index doesn't include a segment for one of the orderBys).
    // Therefore, a limit should not be applied in such cases.
    (t = Oi(
      t,
      null,
      "F"
      /* LimitType.First */
    ), r = ft(t)), this.indexManager.getDocumentsMatchingTarget(e, r).next((o) => {
      const l = pe(...o);
      return this.Ji.getDocuments(e, l).next((u) => this.indexManager.getMinOffset(e, r).next((h) => {
        const f = this.ts(t, u);
        return this.ns(t, f, l, h.readTime) ? this.Yi(e, Oi(
          t,
          null,
          "F"
          /* LimitType.First */
        )) : this.rs(e, f, t, h);
      }));
    })));
  }
  /**
   * Performs a query based on the target's persisted query mapping. Returns
   * `null` if the mapping is not available or cannot be used.
   */
  Zi(e, t, r, i) {
    return Fo(t) || i.isEqual(Q.min()) ? b.resolve(null) : this.Ji.getDocuments(e, r).next((o) => {
      const l = this.ts(t, o);
      return this.ns(t, l, r, i) ? b.resolve(null) : (on() <= x.DEBUG && D("QueryEngine", "Re-using previous result from %s to execute query: %s", i.toString(), an(t)), this.rs(e, l, t, $h(i, -1)).next((u) => u));
    });
  }
  /** Applies the query filter and sorting to the provided documents.  */
  ts(e, t) {
    let r = new me(pd(e));
    return t.forEach((i, o) => {
      Zi(e, o) && (r = r.add(o));
    }), r;
  }
  /**
   * Determines if a limit query needs to be refilled from cache, making it
   * ineligible for index-free execution.
   *
   * @param query - The query.
   * @param sortedPreviousResults - The documents that matched the query when it
   * was last synchronized, sorted by the query's comparator.
   * @param remoteKeys - The document keys that matched the query at the last
   * snapshot.
   * @param limboFreeSnapshotVersion - The version of the snapshot when the
   * query was last synchronized.
   */
  ns(e, t, r, i) {
    if (e.limit === null)
      return !1;
    if (r.size !== t.size)
      return !0;
    const o = e.limitType === "F" ? t.last() : t.first();
    return !!o && (o.hasPendingWrites || o.version.compareTo(i) > 0);
  }
  Xi(e, t, r) {
    return on() <= x.DEBUG && D("QueryEngine", "Using full collection scan to execute query:", an(t)), this.Ji.getDocumentsMatchingQuery(e, t, rt.min(), r);
  }
  /**
   * Combines the results from an indexed execution with the remaining documents
   * that have not yet been indexed.
   */
  rs(e, t, r, i) {
    return this.Ji.getDocumentsMatchingQuery(e, r, i).next((o) => (
      // Merge with existing results
      (t.forEach((l) => {
        o = o.insert(l.key, l);
      }), o)
    ));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class uf {
  constructor(e, t, r, i) {
    this.persistence = e, this.ss = t, this.serializer = i, /**
     * Maps a targetID to data about its target.
     *
     * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
     * of `applyRemoteEvent()` idempotent.
     */
    this.os = new Te(G), /** Maps a target to its targetID. */
    // TODO(wuandy): Evaluate if TargetId can be part of Target.
    this._s = new Bt((o) => Xi(o), Yi), /**
     * A per collection group index of the last read time processed by
     * `getNewDocumentChanges()`.
     *
     * PORTING NOTE: This is only used for multi-tab synchronization.
     */
    this.us = /* @__PURE__ */ new Map(), this.cs = e.getRemoteDocumentCache(), this.Ur = e.getTargetCache(), this.Gr = e.getBundleCache(), this.ls(r);
  }
  ls(e) {
    this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e), this.indexManager = this.persistence.getIndexManager(e), this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager), this.localDocuments = new Xd(this.cs, this.mutationQueue, this.documentOverlayCache, this.indexManager), this.cs.setIndexManager(this.indexManager), this.ss.initialize(this.localDocuments, this.indexManager);
  }
  collectGarbage(e) {
    return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (t) => e.collect(t, this.os));
  }
}
function hf(n, e, t, r) {
  return new uf(n, e, t, r);
}
async function fl(n, e) {
  const t = K(n);
  return await t.persistence.runTransaction("Handle user change", "readonly", (r) => {
    let i;
    return t.mutationQueue.getAllMutationBatches(r).next((o) => (i = o, t.ls(e), t.mutationQueue.getAllMutationBatches(r))).next((o) => {
      const l = [], u = [];
      let h = pe();
      for (const f of i) {
        l.push(f.batchId);
        for (const y of f.mutations) h = h.add(y.key);
      }
      for (const f of o) {
        u.push(f.batchId);
        for (const y of f.mutations) h = h.add(y.key);
      }
      return t.localDocuments.getDocuments(r, h).next((f) => ({
        hs: f,
        removedBatchIds: l,
        addedBatchIds: u
      }));
    });
  });
}
function df(n, e) {
  const t = K(n);
  return t.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (r) => {
    const i = e.batch.keys(), o = t.cs.newChangeBuffer({
      trackRemovals: !0
    });
    return function(u, h, f, y) {
      const w = f.batch, R = w.keys();
      let C = b.resolve();
      return R.forEach((k) => {
        C = C.next(() => y.getEntry(h, k)).next((O) => {
          const N = f.docVersions.get(k);
          X(N !== null), O.version.compareTo(N) < 0 && (w.applyToRemoteDocument(O, f), O.isValidDocument() && // We use the commitVersion as the readTime rather than the
          // document's updateTime since the updateTime is not advanced
          // for updates that do not modify the underlying document.
          (O.setReadTime(f.commitVersion), y.addEntry(O)));
        });
      }), C.next(() => u.mutationQueue.removeMutationBatch(h, w));
    }(t, r, e, o).next(() => o.apply(r)).next(() => t.mutationQueue.performConsistencyCheck(r)).next(() => t.documentOverlayCache.removeOverlaysForBatchId(r, i, e.batch.batchId)).next(() => t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r, function(u) {
      let h = pe();
      for (let f = 0; f < u.mutationResults.length; ++f)
        u.mutationResults[f].transformResults.length > 0 && (h = h.add(u.batch.mutations[f].key));
      return h;
    }(e))).next(() => t.localDocuments.getDocuments(r, i));
  });
}
function ff(n) {
  const e = K(n);
  return e.persistence.runTransaction("Get last remote snapshot version", "readonly", (t) => e.Ur.getLastRemoteSnapshotVersion(t));
}
function pf(n, e) {
  const t = K(n);
  return t.persistence.runTransaction("Get next mutation batch", "readonly", (r) => (e === void 0 && (e = -1), t.mutationQueue.getNextMutationBatchAfterBatchId(r, e)));
}
class qo {
  constructor() {
    this.activeTargetIds = Ed();
  }
  fs(e) {
    this.activeTargetIds = this.activeTargetIds.add(e);
  }
  gs(e) {
    this.activeTargetIds = this.activeTargetIds.delete(e);
  }
  /**
   * Converts this entry into a JSON-encoded format we can use for WebStorage.
   * Does not encode `clientId` as it is part of the key in WebStorage.
   */
  Vs() {
    const e = {
      activeTargetIds: this.activeTargetIds.toArray(),
      updateTimeMs: Date.now()
    };
    return JSON.stringify(e);
  }
}
class mf {
  constructor() {
    this.so = new qo(), this.oo = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
  }
  addPendingMutation(e) {
  }
  updateMutationState(e, t, r) {
  }
  addLocalQueryTarget(e, t = !0) {
    return t && this.so.fs(e), this.oo[e] || "not-current";
  }
  updateQueryState(e, t, r) {
    this.oo[e] = t;
  }
  removeLocalQueryTarget(e) {
    this.so.gs(e);
  }
  isLocalQueryTarget(e) {
    return this.so.activeTargetIds.has(e);
  }
  clearQueryState(e) {
    delete this.oo[e];
  }
  getAllActiveQueryTargets() {
    return this.so.activeTargetIds;
  }
  isActiveQueryTarget(e) {
    return this.so.activeTargetIds.has(e);
  }
  start() {
    return this.so = new qo(), Promise.resolve();
  }
  handleUserChange(e, t, r) {
  }
  setOnlineState(e) {
  }
  shutdown() {
  }
  writeSequenceNumber(e) {
  }
  notifyBundleLoaded(e) {
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gf {
  _o(e) {
  }
  shutdown() {
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Go {
  constructor() {
    this.ao = () => this.uo(), this.co = () => this.lo(), this.ho = [], this.Po();
  }
  _o(e) {
    this.ho.push(e);
  }
  shutdown() {
    window.removeEventListener("online", this.ao), window.removeEventListener("offline", this.co);
  }
  Po() {
    window.addEventListener("online", this.ao), window.addEventListener("offline", this.co);
  }
  uo() {
    D("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
    for (const e of this.ho) e(
      0
      /* NetworkStatus.AVAILABLE */
    );
  }
  lo() {
    D("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
    for (const e of this.ho) e(
      1
      /* NetworkStatus.UNAVAILABLE */
    );
  }
  // TODO(chenbrian): Consider passing in window either into this component or
  // here for testing via FakeWindow.
  /** Checks that all used attributes of window are available. */
  static D() {
    return typeof window < "u" && window.addEventListener !== void 0 && window.removeEventListener !== void 0;
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let nr = null;
function _i() {
  return nr === null ? nr = function() {
    return 268435456 + Math.round(2147483648 * Math.random());
  }() : nr++, "0x" + nr.toString(16);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _f = {
  BatchGetDocuments: "batchGet",
  Commit: "commit",
  RunQuery: "runQuery",
  RunAggregationQuery: "runAggregationQuery"
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class yf {
  constructor(e) {
    this.Io = e.Io, this.To = e.To;
  }
  Eo(e) {
    this.Ao = e;
  }
  Ro(e) {
    this.Vo = e;
  }
  mo(e) {
    this.fo = e;
  }
  onMessage(e) {
    this.po = e;
  }
  close() {
    this.To();
  }
  send(e) {
    this.Io(e);
  }
  yo() {
    this.Ao();
  }
  wo() {
    this.Vo();
  }
  So(e) {
    this.fo(e);
  }
  bo(e) {
    this.po(e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const de = "WebChannelConnection";
class vf extends /**
 * Base class for all Rest-based connections to the backend (WebChannel and
 * HTTP).
 */
class {
  constructor(t) {
    this.databaseInfo = t, this.databaseId = t.databaseId;
    const r = t.ssl ? "https" : "http", i = encodeURIComponent(this.databaseId.projectId), o = encodeURIComponent(this.databaseId.database);
    this.Do = r + "://" + t.host, this.vo = `projects/${i}/databases/${o}`, this.Co = this.databaseId.database === "(default)" ? `project_id=${i}` : `project_id=${i}&database_id=${o}`;
  }
  get Fo() {
    return !1;
  }
  Mo(t, r, i, o, l) {
    const u = _i(), h = this.xo(t, r.toUriEncodedString());
    D("RestConnection", `Sending RPC '${t}' ${u}:`, h, i);
    const f = {
      "google-cloud-resource-prefix": this.vo,
      "x-goog-request-params": this.Co
    };
    return this.Oo(f, o, l), this.No(t, h, f, i).then((y) => (D("RestConnection", `Received RPC '${t}' ${u}: `, y), y), (y) => {
      throw fr("RestConnection", `RPC '${t}' ${u} failed with error: `, y, "url: ", h, "request:", i), y;
    });
  }
  Lo(t, r, i, o, l, u) {
    return this.Mo(t, r, i, o, l);
  }
  /**
   * Modifies the headers for a request, adding any authorization token if
   * present and any additional headers for the request.
   */
  Oo(t, r, i) {
    t["X-Goog-Api-Client"] = // SDK_VERSION is updated to different value at runtime depending on the entry point,
    // so we need to get its value when we need it in a function.
    function() {
      return "gl-js/ fire/" + Ft;
    }(), // Content-Type: text/plain will avoid preflight requests which might
    // mess with CORS and redirects by proxies. If we add custom headers
    // we will need to change this code to potentially use the $httpOverwrite
    // parameter supported by ESF to avoid triggering preflight requests.
    t["Content-Type"] = "text/plain", this.databaseInfo.appId && (t["X-Firebase-GMPID"] = this.databaseInfo.appId), r && r.headers.forEach((o, l) => t[l] = o), i && i.headers.forEach((o, l) => t[l] = o);
  }
  xo(t, r) {
    const i = _f[t];
    return `${this.Do}/v1/${r}:${i}`;
  }
  /**
   * Closes and cleans up any resources associated with the connection. This
   * implementation is a no-op because there are no resources associated
   * with the RestConnection that need to be cleaned up.
   */
  terminate() {
  }
} {
  constructor(e) {
    super(e), this.forceLongPolling = e.forceLongPolling, this.autoDetectLongPolling = e.autoDetectLongPolling, this.useFetchStreams = e.useFetchStreams, this.longPollingOptions = e.longPollingOptions;
  }
  No(e, t, r, i) {
    const o = _i();
    return new Promise((l, u) => {
      const h = new Va();
      h.setWithCredentials(!0), h.listenOnce(Ma.COMPLETE, () => {
        try {
          switch (h.getLastErrorCode()) {
            case ir.NO_ERROR:
              const y = h.getResponseJson();
              D(de, `XHR for RPC '${e}' ${o} received:`, JSON.stringify(y)), l(y);
              break;
            case ir.TIMEOUT:
              D(de, `RPC '${e}' ${o} timed out`), u(new M(S.DEADLINE_EXCEEDED, "Request time out"));
              break;
            case ir.HTTP_ERROR:
              const w = h.getStatus();
              if (D(de, `RPC '${e}' ${o} failed with status:`, w, "response text:", h.getResponseText()), w > 0) {
                let R = h.getResponseJson();
                Array.isArray(R) && (R = R[0]);
                const C = R == null ? void 0 : R.error;
                if (C && C.status && C.message) {
                  const k = function(N) {
                    const H = N.toLowerCase().replace(/_/g, "-");
                    return Object.values(S).indexOf(H) >= 0 ? H : S.UNKNOWN;
                  }(C.status);
                  u(new M(k, C.message));
                } else u(new M(S.UNKNOWN, "Server responded with status " + h.getStatus()));
              } else
                u(new M(S.UNAVAILABLE, "Connection failed."));
              break;
            default:
              U();
          }
        } finally {
          D(de, `RPC '${e}' ${o} completed.`);
        }
      });
      const f = JSON.stringify(i);
      D(de, `RPC '${e}' ${o} sending request:`, i), h.send(t, "POST", f, r, 15);
    });
  }
  Bo(e, t, r) {
    const i = _i(), o = [this.Do, "/", "google.firestore.v1.Firestore", "/", e, "/channel"], l = Ua(), u = xa(), h = {
      // Required for backend stickiness, routing behavior is based on this
      // parameter.
      httpSessionIdParam: "gsessionid",
      initMessageHeaders: {},
      messageUrlParams: {
        // This param is used to improve routing and project isolation by the
        // backend and must be included in every request.
        database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
      },
      sendRawJson: !0,
      supportsCrossDomainXhr: !0,
      internalChannelParams: {
        // Override the default timeout (randomized between 10-20 seconds) since
        // a large write batch on a slow internet connection may take a long
        // time to send to the backend. Rather than have WebChannel impose a
        // tight timeout which could lead to infinite timeouts and retries, we
        // set it very large (5-10 minutes) and rely on the browser's builtin
        // timeouts to kick in if the request isn't working.
        forwardChannelRequestTimeoutMs: 6e5
      },
      forceLongPolling: this.forceLongPolling,
      detectBufferingProxy: this.autoDetectLongPolling
    }, f = this.longPollingOptions.timeoutSeconds;
    f !== void 0 && (h.longPollingTimeout = Math.round(1e3 * f)), this.useFetchStreams && (h.useFetchStreams = !0), this.Oo(h.initMessageHeaders, t, r), // Sending the custom headers we just added to request.initMessageHeaders
    // (Authorization, etc.) will trigger the browser to make a CORS preflight
    // request because the XHR will no longer meet the criteria for a "simple"
    // CORS request:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
    // Therefore to avoid the CORS preflight request (an extra network
    // roundtrip), we use the encodeInitMessageHeaders option to specify that
    // the headers should instead be encoded in the request's POST payload,
    // which is recognized by the webchannel backend.
    h.encodeInitMessageHeaders = !0;
    const y = o.join("");
    D(de, `Creating RPC '${e}' stream ${i}: ${y}`, h);
    const w = l.createWebChannel(y, h);
    let R = !1, C = !1;
    const k = new yf({
      Io: (N) => {
        C ? D(de, `Not sending because RPC '${e}' stream ${i} is closed:`, N) : (R || (D(de, `Opening RPC '${e}' stream ${i} transport.`), w.open(), R = !0), D(de, `RPC '${e}' stream ${i} sending:`, N), w.send(N));
      },
      To: () => w.close()
    }), O = (N, H, F) => {
      N.listen(H, (j) => {
        try {
          F(j);
        } catch (z) {
          setTimeout(() => {
            throw z;
          }, 0);
        }
      });
    };
    return O(w, ln.EventType.OPEN, () => {
      C || (D(de, `RPC '${e}' stream ${i} transport opened.`), k.yo());
    }), O(w, ln.EventType.CLOSE, () => {
      C || (C = !0, D(de, `RPC '${e}' stream ${i} transport closed`), k.So());
    }), O(w, ln.EventType.ERROR, (N) => {
      C || (C = !0, fr(de, `RPC '${e}' stream ${i} transport errored:`, N), k.So(new M(S.UNAVAILABLE, "The operation could not be completed")));
    }), O(w, ln.EventType.MESSAGE, (N) => {
      var H;
      if (!C) {
        const F = N.data[0];
        X(!!F);
        const j = F, z = j.error || ((H = j[0]) === null || H === void 0 ? void 0 : H.error);
        if (z) {
          D(de, `RPC '${e}' stream ${i} received error:`, z);
          const Ee = z.status;
          let Y = (
            /**
            * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
            *
            * @returns The Code equivalent to the given status string or undefined if
            *     there is no match.
            */
            function(g) {
              const _ = Z[g];
              if (_ !== void 0) return Dd(_);
            }(Ee)
          ), E = z.message;
          Y === void 0 && (Y = S.INTERNAL, E = "Unknown error status: " + Ee + " with message " + z.message), // Mark closed so no further events are propagated
          C = !0, k.So(new M(Y, E)), w.close();
        } else D(de, `RPC '${e}' stream ${i} received:`, F), k.bo(F);
      }
    }), O(u, La.STAT_EVENT, (N) => {
      N.stat === Ci.PROXY ? D(de, `RPC '${e}' stream ${i} detected buffering proxy`) : N.stat === Ci.NOPROXY && D(de, `RPC '${e}' stream ${i} detected no buffering proxy`);
    }), setTimeout(() => {
      k.wo();
    }, 0), k;
  }
}
function yi() {
  return typeof document < "u" ? document : null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Vr(n) {
  return new Od(
    n,
    /* useProto3Json= */
    !0
  );
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class pl {
  constructor(e, t, r = 1e3, i = 1.5, o = 6e4) {
    this.ui = e, this.timerId = t, this.ko = r, this.qo = i, this.Qo = o, this.Ko = 0, this.$o = null, /** The last backoff attempt, as epoch milliseconds. */
    this.Uo = Date.now(), this.reset();
  }
  /**
   * Resets the backoff delay.
   *
   * The very next backoffAndWait() will have no delay. If it is called again
   * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
   * subsequent ones will increase according to the backoffFactor.
   */
  reset() {
    this.Ko = 0;
  }
  /**
   * Resets the backoff delay to the maximum delay (e.g. for use after a
   * RESOURCE_EXHAUSTED error).
   */
  Wo() {
    this.Ko = this.Qo;
  }
  /**
   * Returns a promise that resolves after currentDelayMs, and increases the
   * delay for any subsequent attempts. If there was a pending backoff operation
   * already, it will be canceled.
   */
  Go(e) {
    this.cancel();
    const t = Math.floor(this.Ko + this.zo()), r = Math.max(0, Date.now() - this.Uo), i = Math.max(0, t - r);
    i > 0 && D("ExponentialBackoff", `Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`), this.$o = this.ui.enqueueAfterDelay(this.timerId, i, () => (this.Uo = Date.now(), e())), // Apply backoff factor to determine next delay and ensure it is within
    // bounds.
    this.Ko *= this.qo, this.Ko < this.ko && (this.Ko = this.ko), this.Ko > this.Qo && (this.Ko = this.Qo);
  }
  jo() {
    this.$o !== null && (this.$o.skipDelay(), this.$o = null);
  }
  cancel() {
    this.$o !== null && (this.$o.cancel(), this.$o = null);
  }
  /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */
  zo() {
    return (Math.random() - 0.5) * this.Ko;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ef {
  constructor(e, t, r, i, o, l, u, h) {
    this.ui = e, this.Ho = r, this.Jo = i, this.connection = o, this.authCredentialsProvider = l, this.appCheckCredentialsProvider = u, this.listener = h, this.state = 0, /**
     * A close count that's incremented every time the stream is closed; used by
     * getCloseGuardedDispatcher() to invalidate callbacks that happen after
     * close.
     */
    this.Yo = 0, this.Zo = null, this.Xo = null, this.stream = null, /**
     * Count of response messages received.
     */
    this.e_ = 0, this.t_ = new pl(e, t);
  }
  /**
   * Returns true if start() has been called and no error has occurred. True
   * indicates the stream is open or in the process of opening (which
   * encompasses respecting backoff, getting auth tokens, and starting the
   * actual RPC). Use isOpen() to determine if the stream is open and ready for
   * outbound requests.
   */
  n_() {
    return this.state === 1 || this.state === 5 || this.r_();
  }
  /**
   * Returns true if the underlying RPC is open (the onOpen() listener has been
   * called) and the stream is ready for outbound requests.
   */
  r_() {
    return this.state === 2 || this.state === 3;
  }
  /**
   * Starts the RPC. Only allowed if isStarted() returns false. The stream is
   * not immediately ready for use: onOpen() will be invoked when the RPC is
   * ready for outbound requests, at which point isOpen() will return true.
   *
   * When start returns, isStarted() will return true.
   */
  start() {
    this.e_ = 0, this.state !== 4 ? this.auth() : this.i_();
  }
  /**
   * Stops the RPC. This call is idempotent and allowed regardless of the
   * current isStarted() state.
   *
   * When stop returns, isStarted() and isOpen() will both return false.
   */
  async stop() {
    this.n_() && await this.close(
      0
      /* PersistentStreamState.Initial */
    );
  }
  /**
   * After an error the stream will usually back off on the next attempt to
   * start it. If the error warrants an immediate restart of the stream, the
   * sender can use this to indicate that the receiver should not back off.
   *
   * Each error will call the onClose() listener. That function can decide to
   * inhibit backoff if required.
   */
  s_() {
    this.state = 0, this.t_.reset();
  }
  /**
   * Marks this stream as idle. If no further actions are performed on the
   * stream for one minute, the stream will automatically close itself and
   * notify the stream's onClose() handler with Status.OK. The stream will then
   * be in a !isStarted() state, requiring the caller to start the stream again
   * before further use.
   *
   * Only streams that are in state 'Open' can be marked idle, as all other
   * states imply pending network operations.
   */
  o_() {
    this.r_() && this.Zo === null && (this.Zo = this.ui.enqueueAfterDelay(this.Ho, 6e4, () => this.__()));
  }
  /** Sends a message to the underlying stream. */
  a_(e) {
    this.u_(), this.stream.send(e);
  }
  /** Called by the idle timer when the stream should close due to inactivity. */
  async __() {
    if (this.r_())
      return this.close(
        0
        /* PersistentStreamState.Initial */
      );
  }
  /** Marks the stream as active again. */
  u_() {
    this.Zo && (this.Zo.cancel(), this.Zo = null);
  }
  /** Cancels the health check delayed operation. */
  c_() {
    this.Xo && (this.Xo.cancel(), this.Xo = null);
  }
  /**
   * Closes the stream and cleans up as necessary:
   *
   * * closes the underlying GRPC stream;
   * * calls the onClose handler with the given 'error';
   * * sets internal stream state to 'finalState';
   * * adjusts the backoff timer based on the error
   *
   * A new stream can be opened by calling start().
   *
   * @param finalState - the intended state of the stream after closing.
   * @param error - the error the connection was closed with.
   */
  async close(e, t) {
    this.u_(), this.c_(), this.t_.cancel(), // Invalidates any stream-related callbacks (e.g. from auth or the
    // underlying stream), guaranteeing they won't execute.
    this.Yo++, e !== 4 ? (
      // If this is an intentional close ensure we don't delay our next connection attempt.
      this.t_.reset()
    ) : t && t.code === S.RESOURCE_EXHAUSTED ? (
      // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
      (_t(t.toString()), _t("Using maximum backoff delay to prevent overloading the backend."), this.t_.Wo())
    ) : t && t.code === S.UNAUTHENTICATED && this.state !== 3 && // "unauthenticated" error means the token was rejected. This should rarely
    // happen since both Auth and AppCheck ensure a sufficient TTL when we
    // request a token. If a user manually resets their system clock this can
    // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
    // before we received the first message and we need to invalidate the token
    // to ensure that we fetch a new token.
    (this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), // Clean up the underlying stream because we are no longer interested in events.
    this.stream !== null && (this.l_(), this.stream.close(), this.stream = null), // This state must be assigned before calling onClose() to allow the callback to
    // inhibit backoff or otherwise manipulate the state in its non-started state.
    this.state = e, // Notify the listener that the stream closed.
    await this.listener.mo(t);
  }
  /**
   * Can be overridden to perform additional cleanup before the stream is closed.
   * Calling super.tearDown() is not required.
   */
  l_() {
  }
  auth() {
    this.state = 1;
    const e = this.h_(this.Yo), t = this.Yo;
    Promise.all([this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken()]).then(([r, i]) => {
      this.Yo === t && // Normally we'd have to schedule the callback on the AsyncQueue.
      // However, the following calls are safe to be called outside the
      // AsyncQueue since they don't chain asynchronous calls
      this.P_(r, i);
    }, (r) => {
      e(() => {
        const i = new M(S.UNKNOWN, "Fetching auth token failed: " + r.message);
        return this.I_(i);
      });
    });
  }
  P_(e, t) {
    const r = this.h_(this.Yo);
    this.stream = this.T_(e, t), this.stream.Eo(() => {
      r(() => this.listener.Eo());
    }), this.stream.Ro(() => {
      r(() => (this.state = 2, this.Xo = this.ui.enqueueAfterDelay(this.Jo, 1e4, () => (this.r_() && (this.state = 3), Promise.resolve())), this.listener.Ro()));
    }), this.stream.mo((i) => {
      r(() => this.I_(i));
    }), this.stream.onMessage((i) => {
      r(() => ++this.e_ == 1 ? this.E_(i) : this.onNext(i));
    });
  }
  i_() {
    this.state = 5, this.t_.Go(async () => {
      this.state = 0, this.start();
    });
  }
  // Visible for tests
  I_(e) {
    return D("PersistentStream", `close with error: ${e}`), this.stream = null, this.close(4, e);
  }
  /**
   * Returns a "dispatcher" function that dispatches operations onto the
   * AsyncQueue but only runs them if closeCount remains unchanged. This allows
   * us to turn auth / stream callbacks into no-ops if the stream is closed /
   * re-opened, etc.
   */
  h_(e) {
    return (t) => {
      this.ui.enqueueAndForget(() => this.Yo === e ? t() : (D("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve()));
    };
  }
}
class Tf extends Ef {
  constructor(e, t, r, i, o, l) {
    super(e, "write_stream_connection_backoff", "write_stream_idle", "health_check_timeout", t, r, i, l), this.serializer = o;
  }
  /**
   * Tracks whether or not a handshake has been successfully exchanged and
   * the stream is ready to accept mutations.
   */
  get V_() {
    return this.e_ > 0;
  }
  // Override of PersistentStream.start
  start() {
    this.lastStreamToken = void 0, super.start();
  }
  l_() {
    this.V_ && this.m_([]);
  }
  T_(e, t) {
    return this.connection.Bo("Write", e, t);
  }
  E_(e) {
    return X(!!e.streamToken), this.lastStreamToken = e.streamToken, // The first response is always the handshake response
    X(!e.writeResults || e.writeResults.length === 0), this.listener.f_();
  }
  onNext(e) {
    X(!!e.streamToken), this.lastStreamToken = e.streamToken, // A successful first write response means the stream is healthy,
    // Note, that we could consider a successful handshake healthy, however,
    // the write itself might be causing an error we want to back off from.
    this.t_.reset();
    const t = jd(e.writeResults, e.commitTime), r = St(e.commitTime);
    return this.listener.g_(r, t);
  }
  /**
   * Sends an initial streamToken to the server, performing the handshake
   * required to make the StreamingWrite RPC work. Subsequent
   * calls should wait until onHandshakeComplete was called.
   */
  p_() {
    const e = {};
    e.database = Ud(this.serializer), this.a_(e);
  }
  /** Sends a group of mutations to the Firestore backend to apply. */
  m_(e) {
    const t = {
      streamToken: this.lastStreamToken,
      writes: e.map((r) => Bd(this.serializer, r))
    };
    this.a_(t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class If extends class {
} {
  constructor(e, t, r, i) {
    super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = r, this.serializer = i, this.y_ = !1;
  }
  w_() {
    if (this.y_) throw new M(S.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  /** Invokes the provided RPC with auth and AppCheck tokens. */
  Mo(e, t, r, i) {
    return this.w_(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([o, l]) => this.connection.Mo(e, Mi(t, r), i, o, l)).catch((o) => {
      throw o.name === "FirebaseError" ? (o.code === S.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), o) : new M(S.UNKNOWN, o.toString());
    });
  }
  /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */
  Lo(e, t, r, i, o) {
    return this.w_(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([l, u]) => this.connection.Lo(e, Mi(t, r), i, l, u, o)).catch((l) => {
      throw l.name === "FirebaseError" ? (l.code === S.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), l) : new M(S.UNKNOWN, l.toString());
    });
  }
  terminate() {
    this.y_ = !0, this.connection.terminate();
  }
}
class wf {
  constructor(e, t) {
    this.asyncQueue = e, this.onlineStateHandler = t, /** The current OnlineState. */
    this.state = "Unknown", /**
     * A count of consecutive failures to open the stream. If it reaches the
     * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
     * Offline.
     */
    this.S_ = 0, /**
     * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
     * transition from OnlineState.Unknown to OnlineState.Offline without waiting
     * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
     */
    this.b_ = null, /**
     * Whether the client should log a warning message if it fails to connect to
     * the backend (initially true, cleared after a successful stream, or if we've
     * logged the message already).
     */
    this.D_ = !0;
  }
  /**
   * Called by RemoteStore when a watch stream is started (including on each
   * backoff attempt).
   *
   * If this is the first attempt, it sets the OnlineState to Unknown and starts
   * the onlineStateTimer.
   */
  v_() {
    this.S_ === 0 && (this.C_(
      "Unknown"
      /* OnlineState.Unknown */
    ), this.b_ = this.asyncQueue.enqueueAfterDelay("online_state_timeout", 1e4, () => (this.b_ = null, this.F_("Backend didn't respond within 10 seconds."), this.C_(
      "Offline"
      /* OnlineState.Offline */
    ), Promise.resolve())));
  }
  /**
   * Updates our OnlineState as appropriate after the watch stream reports a
   * failure. The first failure moves us to the 'Unknown' state. We then may
   * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
   * actually transition to the 'Offline' state.
   */
  M_(e) {
    this.state === "Online" ? this.C_(
      "Unknown"
      /* OnlineState.Unknown */
    ) : (this.S_++, this.S_ >= 1 && (this.x_(), this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`), this.C_(
      "Offline"
      /* OnlineState.Offline */
    )));
  }
  /**
   * Explicitly sets the OnlineState to the specified state.
   *
   * Note that this resets our timers / failure counters, etc. used by our
   * Offline heuristics, so must not be used in place of
   * handleWatchStreamStart() and handleWatchStreamFailure().
   */
  set(e) {
    this.x_(), this.S_ = 0, e === "Online" && // We've connected to watch at least once. Don't warn the developer
    // about being offline going forward.
    (this.D_ = !1), this.C_(e);
  }
  C_(e) {
    e !== this.state && (this.state = e, this.onlineStateHandler(e));
  }
  F_(e) {
    const t = `Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
    this.D_ ? (_t(t), this.D_ = !1) : D("OnlineStateTracker", t);
  }
  x_() {
    this.b_ !== null && (this.b_.cancel(), this.b_ = null);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Af {
  constructor(e, t, r, i, o) {
    this.localStore = e, this.datastore = t, this.asyncQueue = r, this.remoteSyncer = {}, /**
     * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
     * LocalStore via fillWritePipeline() and have or will send to the write
     * stream.
     *
     * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
     * restart the write stream. When the stream is established the writes in the
     * pipeline will be sent in order.
     *
     * Writes remain in writePipeline until they are acknowledged by the backend
     * and thus will automatically be re-sent if the stream is interrupted /
     * restarted before they're acknowledged.
     *
     * Write responses from the backend are linked to their originating request
     * purely based on order, and so we can just shift() writes from the front of
     * the writePipeline as we receive responses.
     */
    this.O_ = [], /**
     * A mapping of watched targets that the client cares about tracking and the
     * user has explicitly called a 'listen' for this target.
     *
     * These targets may or may not have been sent to or acknowledged by the
     * server. On re-establishing the listen stream, these targets should be sent
     * to the server. The targets removed with unlistens are removed eagerly
     * without waiting for confirmation from the listen stream.
     */
    this.N_ = /* @__PURE__ */ new Map(), /**
     * A set of reasons for why the RemoteStore may be offline. If empty, the
     * RemoteStore may start its network connections.
     */
    this.L_ = /* @__PURE__ */ new Set(), /**
     * Event handlers that get called when the network is disabled or enabled.
     *
     * PORTING NOTE: These functions are used on the Web client to create the
     * underlying streams (to support tree-shakeable streams). On Android and iOS,
     * the streams are created during construction of RemoteStore.
     */
    this.B_ = [], this.k_ = o, this.k_._o((l) => {
      r.enqueueAndForget(async () => {
        Cn(this) && (D("RemoteStore", "Restarting streams for network reachability change."), await async function(h) {
          const f = K(h);
          f.L_.add(
            4
            /* OfflineCause.ConnectivityChange */
          ), await Pn(f), f.q_.set(
            "Unknown"
            /* OnlineState.Unknown */
          ), f.L_.delete(
            4
            /* OfflineCause.ConnectivityChange */
          ), await Mr(f);
        }(this));
      });
    }), this.q_ = new wf(r, i);
  }
}
async function Mr(n) {
  if (Cn(n)) for (const e of n.B_) await e(
    /* enabled= */
    !0
  );
}
async function Pn(n) {
  for (const e of n.B_) await e(
    /* enabled= */
    !1
  );
}
function Cn(n) {
  return K(n).L_.size === 0;
}
async function ml(n, e, t) {
  if (!kr(e)) throw e;
  n.L_.add(
    1
    /* OfflineCause.IndexedDbFailed */
  ), // Disable network and raise offline snapshots
  await Pn(n), n.q_.set(
    "Offline"
    /* OnlineState.Offline */
  ), t || // Use a simple read operation to determine if IndexedDB recovered.
  // Ideally, we would expose a health check directly on SimpleDb, but
  // RemoteStore only has access to persistence through LocalStore.
  (t = () => ff(n.localStore)), // Probe IndexedDB periodically and re-enable network
  n.asyncQueue.enqueueRetryable(async () => {
    D("RemoteStore", "Retrying IndexedDB access"), await t(), n.L_.delete(
      1
      /* OfflineCause.IndexedDbFailed */
    ), await Mr(n);
  });
}
function gl(n, e) {
  return e().catch((t) => ml(n, t, e));
}
async function Lr(n) {
  const e = K(n), t = st(e);
  let r = e.O_.length > 0 ? e.O_[e.O_.length - 1].batchId : -1;
  for (; Rf(e); ) try {
    const i = await pf(e.localStore, r);
    if (i === null) {
      e.O_.length === 0 && t.o_();
      break;
    }
    r = i.batchId, bf(e, i);
  } catch (i) {
    await ml(e, i);
  }
  _l(e) && yl(e);
}
function Rf(n) {
  return Cn(n) && n.O_.length < 10;
}
function bf(n, e) {
  n.O_.push(e);
  const t = st(n);
  t.r_() && t.V_ && t.m_(e.mutations);
}
function _l(n) {
  return Cn(n) && !st(n).n_() && n.O_.length > 0;
}
function yl(n) {
  st(n).start();
}
async function Sf(n) {
  st(n).p_();
}
async function Pf(n) {
  const e = st(n);
  for (const t of n.O_) e.m_(t.mutations);
}
async function Cf(n, e, t) {
  const r = n.O_.shift(), i = ts.from(r, e, t);
  await gl(n, () => n.remoteSyncer.applySuccessfulWrite(i)), // It's possible that with the completion of this mutation another
  // slot has freed up.
  await Lr(n);
}
async function kf(n, e) {
  e && st(n).V_ && // This error affects the actual write.
  await async function(r, i) {
    if (function(l) {
      return Nd(l) && l !== S.ABORTED;
    }(i.code)) {
      const o = r.O_.shift();
      st(r).s_(), await gl(r, () => r.remoteSyncer.rejectFailedWrite(o.batchId, i)), // It's possible that with the completion of this mutation
      // another slot has freed up.
      await Lr(r);
    }
  }(n, e), // The write stream might have been started by refilling the write
  // pipeline for failed writes
  _l(n) && yl(n);
}
async function Ko(n, e) {
  const t = K(n);
  t.asyncQueue.verifyOperationInProgress(), D("RemoteStore", "RemoteStore received new credentials");
  const r = Cn(t);
  t.L_.add(
    3
    /* OfflineCause.CredentialChange */
  ), await Pn(t), r && // Don't set the network status to Unknown if we are offline.
  t.q_.set(
    "Unknown"
    /* OnlineState.Unknown */
  ), await t.remoteSyncer.handleCredentialChange(e), t.L_.delete(
    3
    /* OfflineCause.CredentialChange */
  ), await Mr(t);
}
async function Nf(n, e) {
  const t = K(n);
  e ? (t.L_.delete(
    2
    /* OfflineCause.IsSecondary */
  ), await Mr(t)) : e || (t.L_.add(
    2
    /* OfflineCause.IsSecondary */
  ), await Pn(t), t.q_.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function st(n) {
  return n.U_ || // Create stream (but note that it is not started yet).
  (n.U_ = function(t, r, i) {
    const o = K(t);
    return o.w_(), new Tf(r, o.connection, o.authCredentials, o.appCheckCredentials, o.serializer, i);
  }(n.datastore, n.asyncQueue, {
    Eo: () => Promise.resolve(),
    Ro: Sf.bind(null, n),
    mo: kf.bind(null, n),
    f_: Pf.bind(null, n),
    g_: Cf.bind(null, n)
  }), n.B_.push(async (e) => {
    e ? (n.U_.s_(), // This will start the write stream if necessary.
    await Lr(n)) : (await n.U_.stop(), n.O_.length > 0 && (D("RemoteStore", `Stopping write stream with ${n.O_.length} pending writes`), n.O_ = []));
  })), n.U_;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ss {
  constructor(e, t, r, i, o) {
    this.asyncQueue = e, this.timerId = t, this.targetTimeMs = r, this.op = i, this.removalCallback = o, this.deferred = new dt(), this.then = this.deferred.promise.then.bind(this.deferred.promise), // It's normal for the deferred promise to be canceled (due to cancellation)
    // and so we attach a dummy catch callback to avoid
    // 'UnhandledPromiseRejectionWarning' log spam.
    this.deferred.promise.catch((l) => {
    });
  }
  get promise() {
    return this.deferred.promise;
  }
  /**
   * Creates and returns a DelayedOperation that has been scheduled to be
   * executed on the provided asyncQueue after the provided delayMs.
   *
   * @param asyncQueue - The queue to schedule the operation on.
   * @param id - A Timer ID identifying the type of operation this is.
   * @param delayMs - The delay (ms) before the operation should be scheduled.
   * @param op - The operation to run.
   * @param removalCallback - A callback to be called synchronously once the
   *   operation is executed or canceled, notifying the AsyncQueue to remove it
   *   from its delayedOperations list.
   *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
   *   the DelayedOperation class public.
   */
  static createAndSchedule(e, t, r, i, o) {
    const l = Date.now() + r, u = new ss(e, t, l, i, o);
    return u.start(r), u;
  }
  /**
   * Starts the timer. This is called immediately after construction by
   * createAndSchedule().
   */
  start(e) {
    this.timerHandle = setTimeout(() => this.handleDelayElapsed(), e);
  }
  /**
   * Queues the operation to run immediately (if it hasn't already been run or
   * canceled).
   */
  skipDelay() {
    return this.handleDelayElapsed();
  }
  /**
   * Cancels the operation if it hasn't already been executed or canceled. The
   * promise will be rejected.
   *
   * As long as the operation has not yet been run, calling cancel() provides a
   * guarantee that the operation will not be run.
   */
  cancel(e) {
    this.timerHandle !== null && (this.clearTimeout(), this.deferred.reject(new M(S.CANCELLED, "Operation cancelled" + (e ? ": " + e : ""))));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget(() => this.timerHandle !== null ? (this.clearTimeout(), this.op().then((e) => this.deferred.resolve(e))) : Promise.resolve());
  }
  clearTimeout() {
    this.timerHandle !== null && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
  }
}
function vl(n, e) {
  if (_t("AsyncQueue", `${e}: ${n}`), kr(n)) return new M(S.UNAVAILABLE, `${e}: ${n}`);
  throw n;
}
class Df {
  constructor() {
    this.queries = Wo(), this.onlineState = "Unknown", this.Y_ = /* @__PURE__ */ new Set();
  }
  terminate() {
    (function(t, r) {
      const i = K(t), o = i.queries;
      i.queries = Wo(), o.forEach((l, u) => {
        for (const h of u.j_) h.onError(r);
      });
    })(this, new M(S.ABORTED, "Firestore shutting down"));
  }
}
function Wo() {
  return new Bt((n) => Za(n), Ya);
}
function Of(n) {
  n.Y_.forEach((e) => {
    e.next();
  });
}
var Qo, Jo;
(Jo = Qo || (Qo = {})).ea = "default", /** Listen to changes in cache only */
Jo.Cache = "cache";
class Vf {
  constructor(e, t, r, i, o, l) {
    this.localStore = e, this.remoteStore = t, this.eventManager = r, this.sharedClientState = i, this.currentUser = o, this.maxConcurrentLimboResolutions = l, this.Ca = {}, this.Fa = new Bt((u) => Za(u), Ya), this.Ma = /* @__PURE__ */ new Map(), /**
     * The keys of documents that are in limbo for which we haven't yet started a
     * limbo resolution query. The strings in this set are the result of calling
     * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
     *
     * The `Set` type was chosen because it provides efficient lookup and removal
     * of arbitrary elements and it also maintains insertion order, providing the
     * desired queue-like FIFO semantics.
     */
    this.xa = /* @__PURE__ */ new Set(), /**
     * Keeps track of the target ID for each document that is in limbo with an
     * active target.
     */
    this.Oa = new Te(L.comparator), /**
     * Keeps track of the information about an active limbo resolution for each
     * active target ID that was started for the purpose of limbo resolution.
     */
    this.Na = /* @__PURE__ */ new Map(), this.La = new ns(), /** Stores user completion handlers, indexed by User and BatchId. */
    this.Ba = {}, /** Stores user callbacks waiting for all pending writes to be acknowledged. */
    this.ka = /* @__PURE__ */ new Map(), this.qa = Lt.kn(), this.onlineState = "Unknown", // The primary state is set to `true` or `false` immediately after Firestore
    // startup. In the interim, a client should only be considered primary if
    // `isPrimary` is true.
    this.Qa = void 0;
  }
  get isPrimaryClient() {
    return this.Qa === !0;
  }
}
async function Mf(n, e, t) {
  const r = Ff(n);
  try {
    const i = await function(l, u) {
      const h = K(l), f = re.now(), y = u.reduce((C, k) => C.add(k.key), pe());
      let w, R;
      return h.persistence.runTransaction("Locally write mutations", "readwrite", (C) => {
        let k = vr(), O = pe();
        return h.cs.getEntries(C, y).next((N) => {
          k = N, k.forEach((H, F) => {
            F.isValidDocument() || (O = O.add(H));
          });
        }).next(() => h.localDocuments.getOverlayedDocuments(C, k)).next((N) => {
          w = N;
          const H = [];
          for (const F of u) {
            const j = Sd(F, w.get(F.key).overlayedDocument);
            j != null && // NOTE: The base state should only be applied if there's some
            // existing document to override, so use a Precondition of
            // exists=true
            H.push(new Et(F.key, j, qa(j.value.mapValue), xe.exists(!0)));
          }
          return h.mutationQueue.addMutationBatch(C, f, H, u);
        }).next((N) => {
          R = N;
          const H = N.applyToLocalDocumentSet(w, O);
          return h.documentOverlayCache.saveOverlays(C, N.batchId, H);
        });
      }).then(() => ({
        batchId: R.batchId,
        changes: tl(w)
      }));
    }(r.localStore, e);
    r.sharedClientState.addPendingMutation(i.batchId), function(l, u, h) {
      let f = l.Ba[l.currentUser.toKey()];
      f || (f = new Te(G)), f = f.insert(u, h), l.Ba[l.currentUser.toKey()] = f;
    }(r, i.batchId, t), await xr(r, i.changes), await Lr(r.remoteStore);
  } catch (i) {
    const o = vl(i, "Failed to persist write");
    t.reject(o);
  }
}
function Xo(n, e, t) {
  const r = K(n);
  if (r.isPrimaryClient && t === 0 || !r.isPrimaryClient && t === 1) {
    const i = [];
    r.Fa.forEach((o, l) => {
      const u = l.view.Z_(e);
      u.snapshot && i.push(u.snapshot);
    }), function(l, u) {
      const h = K(l);
      h.onlineState = u;
      let f = !1;
      h.queries.forEach((y, w) => {
        for (const R of w.j_)
          R.Z_(u) && (f = !0);
      }), f && Of(h);
    }(r.eventManager, e), i.length && r.Ca.d_(i), r.onlineState = e, r.isPrimaryClient && r.sharedClientState.setOnlineState(e);
  }
}
async function Lf(n, e) {
  const t = K(n), r = e.batch.batchId;
  try {
    const i = await df(t.localStore, e);
    Tl(
      t,
      r,
      /*error=*/
      null
    ), El(t, r), t.sharedClientState.updateMutationState(r, "acknowledged"), await xr(t, i);
  } catch (i) {
    await ja(i);
  }
}
async function xf(n, e, t) {
  const r = K(n);
  try {
    const i = await function(l, u) {
      const h = K(l);
      return h.persistence.runTransaction("Reject batch", "readwrite-primary", (f) => {
        let y;
        return h.mutationQueue.lookupMutationBatch(f, u).next((w) => (X(w !== null), y = w.keys(), h.mutationQueue.removeMutationBatch(f, w))).next(() => h.mutationQueue.performConsistencyCheck(f)).next(() => h.documentOverlayCache.removeOverlaysForBatchId(f, y, u)).next(() => h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(f, y)).next(() => h.localDocuments.getDocuments(f, y));
      });
    }(r.localStore, e);
    Tl(r, e, t), El(r, e), r.sharedClientState.updateMutationState(e, "rejected", t), await xr(r, i);
  } catch (i) {
    await ja(i);
  }
}
function El(n, e) {
  (n.ka.get(e) || []).forEach((t) => {
    t.resolve();
  }), n.ka.delete(e);
}
function Tl(n, e, t) {
  const r = K(n);
  let i = r.Ba[r.currentUser.toKey()];
  if (i) {
    const o = i.get(e);
    o && (t ? o.reject(t) : o.resolve(), i = i.remove(e)), r.Ba[r.currentUser.toKey()] = i;
  }
}
async function xr(n, e, t) {
  const r = K(n), i = [], o = [], l = [];
  r.Fa.isEmpty() || (r.Fa.forEach((u, h) => {
    l.push(r.Ka(h, e, t).then((f) => {
      var y;
      if ((f || t) && r.isPrimaryClient) {
        const w = f ? !f.fromCache : (y = void 0) === null || y === void 0 ? void 0 : y.current;
        r.sharedClientState.updateQueryState(h.targetId, w ? "current" : "not-current");
      }
      if (f) {
        i.push(f);
        const w = is.Wi(h.targetId, f);
        o.push(w);
      }
    }));
  }), await Promise.all(l), r.Ca.d_(i), await async function(h, f) {
    const y = K(h);
    try {
      await y.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (w) => b.forEach(f, (R) => b.forEach(R.$i, (C) => y.persistence.referenceDelegate.addReference(w, R.targetId, C)).next(() => b.forEach(R.Ui, (C) => y.persistence.referenceDelegate.removeReference(w, R.targetId, C)))));
    } catch (w) {
      if (!kr(w)) throw w;
      D("LocalStore", "Failed to update sequence numbers: " + w);
    }
    for (const w of f) {
      const R = w.targetId;
      if (!w.fromCache) {
        const C = y.os.get(R), k = C.snapshotVersion, O = C.withLastLimboFreeSnapshotVersion(k);
        y.os = y.os.insert(R, O);
      }
    }
  }(r.localStore, o));
}
async function Uf(n, e) {
  const t = K(n);
  if (!t.currentUser.isEqual(e)) {
    D("SyncEngine", "User change. New user:", e.toKey());
    const r = await fl(t.localStore, e);
    t.currentUser = e, // Fails tasks waiting for pending writes requested by previous user.
    function(o, l) {
      o.ka.forEach((u) => {
        u.forEach((h) => {
          h.reject(new M(S.CANCELLED, l));
        });
      }), o.ka.clear();
    }(t, "'waitForPendingWrites' promise is rejected due to a user change."), // TODO(b/114226417): Consider calling this only in the primary tab.
    t.sharedClientState.handleUserChange(e, r.removedBatchIds, r.addedBatchIds), await xr(t, r.hs);
  }
}
function Ff(n) {
  const e = K(n);
  return e.remoteStore.remoteSyncer.applySuccessfulWrite = Lf.bind(null, e), e.remoteStore.remoteSyncer.rejectFailedWrite = xf.bind(null, e), e;
}
class Ir {
  constructor() {
    this.kind = "memory", this.synchronizeTabs = !1;
  }
  async initialize(e) {
    this.serializer = Vr(e.databaseInfo.databaseId), this.sharedClientState = this.Wa(e), this.persistence = this.Ga(e), await this.persistence.start(), this.localStore = this.za(e), this.gcScheduler = this.ja(e, this.localStore), this.indexBackfillerScheduler = this.Ha(e, this.localStore);
  }
  ja(e, t) {
    return null;
  }
  Ha(e, t) {
    return null;
  }
  za(e) {
    return hf(this.persistence, new cf(), e.initialUser, this.serializer);
  }
  Ga(e) {
    return new of(rs.Zr, this.serializer);
  }
  Wa(e) {
    return new mf();
  }
  async terminate() {
    var e, t;
    (e = this.gcScheduler) === null || e === void 0 || e.stop(), (t = this.indexBackfillerScheduler) === null || t === void 0 || t.stop(), this.sharedClientState.shutdown(), await this.persistence.shutdown();
  }
}
Ir.provider = {
  build: () => new Ir()
};
class xi {
  async initialize(e, t) {
    this.localStore || (this.localStore = e.localStore, this.sharedClientState = e.sharedClientState, this.datastore = this.createDatastore(t), this.remoteStore = this.createRemoteStore(t), this.eventManager = this.createEventManager(t), this.syncEngine = this.createSyncEngine(
      t,
      /* startAsPrimary=*/
      !e.synchronizeTabs
    ), this.sharedClientState.onlineStateHandler = (r) => Xo(
      this.syncEngine,
      r,
      1
      /* OnlineStateSource.SharedClientState */
    ), this.remoteStore.remoteSyncer.handleCredentialChange = Uf.bind(null, this.syncEngine), await Nf(this.remoteStore, this.syncEngine.isPrimaryClient));
  }
  createEventManager(e) {
    return function() {
      return new Df();
    }();
  }
  createDatastore(e) {
    const t = Vr(e.databaseInfo.databaseId), r = function(o) {
      return new vf(o);
    }(e.databaseInfo);
    return function(o, l, u, h) {
      return new If(o, l, u, h);
    }(e.authCredentials, e.appCheckCredentials, r, t);
  }
  createRemoteStore(e) {
    return function(r, i, o, l, u) {
      return new Af(r, i, o, l, u);
    }(this.localStore, this.datastore, e.asyncQueue, (t) => Xo(
      this.syncEngine,
      t,
      0
      /* OnlineStateSource.RemoteStore */
    ), function() {
      return Go.D() ? new Go() : new gf();
    }());
  }
  createSyncEngine(e, t) {
    return function(i, o, l, u, h, f, y) {
      const w = new Vf(i, o, l, u, h, f);
      return y && (w.Qa = !0), w;
    }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, e.initialUser, e.maxConcurrentLimboResolutions, t);
  }
  async terminate() {
    var e, t;
    await async function(i) {
      const o = K(i);
      D("RemoteStore", "RemoteStore shutting down."), o.L_.add(
        5
        /* OfflineCause.Shutdown */
      ), await Pn(o), o.k_.shutdown(), // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
      // triggering spurious listener events with cached data, etc.
      o.q_.set(
        "Unknown"
        /* OnlineState.Unknown */
      );
    }(this.remoteStore), (e = this.datastore) === null || e === void 0 || e.terminate(), (t = this.eventManager) === null || t === void 0 || t.terminate();
  }
}
xi.provider = {
  build: () => new xi()
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Bf {
  constructor(e, t, r, i, o) {
    this.authCredentials = e, this.appCheckCredentials = t, this.asyncQueue = r, this.databaseInfo = i, this.user = fe.UNAUTHENTICATED, this.clientId = Ba.newId(), this.authCredentialListener = () => Promise.resolve(), this.appCheckCredentialListener = () => Promise.resolve(), this._uninitializedComponentsProvider = o, this.authCredentials.start(r, async (l) => {
      D("FirestoreClient", "Received user=", l.uid), await this.authCredentialListener(l), this.user = l;
    }), this.appCheckCredentials.start(r, (l) => (D("FirestoreClient", "Received new app check token=", l), this.appCheckCredentialListener(l, this.user)));
  }
  get configuration() {
    return {
      asyncQueue: this.asyncQueue,
      databaseInfo: this.databaseInfo,
      clientId: this.clientId,
      authCredentials: this.authCredentials,
      appCheckCredentials: this.appCheckCredentials,
      initialUser: this.user,
      maxConcurrentLimboResolutions: 100
    };
  }
  setCredentialChangeListener(e) {
    this.authCredentialListener = e;
  }
  setAppCheckTokenChangeListener(e) {
    this.appCheckCredentialListener = e;
  }
  terminate() {
    this.asyncQueue.enterRestrictedMode();
    const e = new dt();
    return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async () => {
      try {
        this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), // The credentials provider must be terminated after shutting down the
        // RemoteStore as it will prevent the RemoteStore from retrieving auth
        // tokens.
        this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), e.resolve();
      } catch (t) {
        const r = vl(t, "Failed to shutdown persistence");
        e.reject(r);
      }
    }), e.promise;
  }
}
async function vi(n, e) {
  n.asyncQueue.verifyOperationInProgress(), D("FirestoreClient", "Initializing OfflineComponentProvider");
  const t = n.configuration;
  await e.initialize(t);
  let r = t.initialUser;
  n.setCredentialChangeListener(async (i) => {
    r.isEqual(i) || (await fl(e.localStore, i), r = i);
  }), // When a user calls clearPersistence() in one client, all other clients
  // need to be terminated to allow the delete to succeed.
  e.persistence.setDatabaseDeletedListener(() => n.terminate()), n._offlineComponents = e;
}
async function Yo(n, e) {
  n.asyncQueue.verifyOperationInProgress();
  const t = await jf(n);
  D("FirestoreClient", "Initializing OnlineComponentProvider"), await e.initialize(t, n.configuration), // The CredentialChangeListener of the online component provider takes
  // precedence over the offline component provider.
  n.setCredentialChangeListener((r) => Ko(e.remoteStore, r)), n.setAppCheckTokenChangeListener((r, i) => Ko(e.remoteStore, i)), n._onlineComponents = e;
}
async function jf(n) {
  if (!n._offlineComponents) if (n._uninitializedComponentsProvider) {
    D("FirestoreClient", "Using user provided OfflineComponentProvider");
    try {
      await vi(n, n._uninitializedComponentsProvider._offline);
    } catch (e) {
      const t = e;
      if (!function(i) {
        return i.name === "FirebaseError" ? i.code === S.FAILED_PRECONDITION || i.code === S.UNIMPLEMENTED : !(typeof DOMException < "u" && i instanceof DOMException) || // When the browser is out of quota we could get either quota exceeded
        // or an aborted error depending on whether the error happened during
        // schema migration.
        i.code === 22 || i.code === 20 || // Firefox Private Browsing mode disables IndexedDb and returns
        // INVALID_STATE for any usage.
        i.code === 11;
      }(t)) throw t;
      fr("Error using user provided cache. Falling back to memory cache: " + t), await vi(n, new Ir());
    }
  } else D("FirestoreClient", "Using default OfflineComponentProvider"), await vi(n, new Ir());
  return n._offlineComponents;
}
async function $f(n) {
  return n._onlineComponents || (n._uninitializedComponentsProvider ? (D("FirestoreClient", "Using user provided OnlineComponentProvider"), await Yo(n, n._uninitializedComponentsProvider._online)) : (D("FirestoreClient", "Using default OnlineComponentProvider"), await Yo(n, new xi()))), n._onlineComponents;
}
function Hf(n) {
  return $f(n).then((e) => e.syncEngine);
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Il(n) {
  const e = {};
  return n.timeoutSeconds !== void 0 && (e.timeoutSeconds = n.timeoutSeconds), e;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Zo = /* @__PURE__ */ new Map();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function zf(n, e, t) {
  if (!t) throw new M(S.INVALID_ARGUMENT, `Function ${n}() cannot be called with an empty ${e}.`);
}
function qf(n, e, t, r) {
  if (e === !0 && r === !0) throw new M(S.INVALID_ARGUMENT, `${n} and ${t} cannot be used together.`);
}
function ea(n) {
  if (!L.isDocumentKey(n)) throw new M(S.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`);
}
function os(n) {
  if (n === void 0) return "undefined";
  if (n === null) return "null";
  if (typeof n == "string") return n.length > 20 && (n = `${n.substring(0, 20)}...`), JSON.stringify(n);
  if (typeof n == "number" || typeof n == "boolean") return "" + n;
  if (typeof n == "object") {
    if (n instanceof Array) return "an array";
    {
      const e = (
        /** try to get the constructor name for an object. */
        function(r) {
          return r.constructor ? r.constructor.name : null;
        }(n)
      );
      return e ? `a custom ${e} object` : "an object";
    }
  }
  return typeof n == "function" ? "a function" : U();
}
function Ui(n, e) {
  if ("_delegate" in n && // Unwrap Compat types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (n = n._delegate), !(n instanceof e)) {
    if (e.name === n.constructor.name) throw new M(S.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
    {
      const t = os(n);
      throw new M(S.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${t}`);
    }
  }
  return n;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ta {
  constructor(e) {
    var t, r;
    if (e.host === void 0) {
      if (e.ssl !== void 0) throw new M(S.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
      this.host = "firestore.googleapis.com", this.ssl = !0;
    } else this.host = e.host, this.ssl = (t = e.ssl) === null || t === void 0 || t;
    if (this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache, e.cacheSizeBytes === void 0) this.cacheSizeBytes = 41943040;
    else {
      if (e.cacheSizeBytes !== -1 && e.cacheSizeBytes < 1048576) throw new M(S.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
      this.cacheSizeBytes = e.cacheSizeBytes;
    }
    qf("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = !1 : e.experimentalAutoDetectLongPolling === void 0 ? this.experimentalAutoDetectLongPolling = !0 : (
      // For backwards compatibility, coerce the value to boolean even though
      // the TypeScript compiler has narrowed the type to boolean already.
      // noinspection PointlessBooleanExpressionJS
      this.experimentalAutoDetectLongPolling = !!e.experimentalAutoDetectLongPolling
    ), this.experimentalLongPollingOptions = Il((r = e.experimentalLongPollingOptions) !== null && r !== void 0 ? r : {}), function(o) {
      if (o.timeoutSeconds !== void 0) {
        if (isNaN(o.timeoutSeconds)) throw new M(S.INVALID_ARGUMENT, `invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);
        if (o.timeoutSeconds < 5) throw new M(S.INVALID_ARGUMENT, `invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);
        if (o.timeoutSeconds > 30) throw new M(S.INVALID_ARGUMENT, `invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`);
      }
    }(this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams;
  }
  isEqual(e) {
    return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && function(r, i) {
      return r.timeoutSeconds === i.timeoutSeconds;
    }(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams;
  }
}
class as {
  /** @hideconstructor */
  constructor(e, t, r, i) {
    this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = r, this._app = i, /**
     * Whether it's a Firestore or Firestore Lite instance.
     */
    this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new ta({}), this._settingsFrozen = !1, // A task that is assigned when the terminate() is invoked and resolved when
    // all components have shut down. Otherwise, Firestore is not terminated,
    // which can mean either the FirestoreClient is in the process of starting,
    // or restarting.
    this._terminateTask = "notTerminated";
  }
  /**
   * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
   * instance.
   */
  get app() {
    if (!this._app) throw new M(S.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return this._terminateTask !== "notTerminated";
  }
  _setSettings(e) {
    if (this._settingsFrozen) throw new M(S.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
    this._settings = new ta(e), e.credentials !== void 0 && (this._authCredentials = function(r) {
      if (!r) return new Oh();
      switch (r.type) {
        case "firstParty":
          return new xh(r.sessionIndex || "0", r.iamToken || null, r.authTokenFactory || null);
        case "provider":
          return r.client;
        default:
          throw new M(S.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
      }
    }(e.credentials));
  }
  _getSettings() {
    return this._settings;
  }
  _freezeSettings() {
    return this._settingsFrozen = !0, this._settings;
  }
  _delete() {
    return this._terminateTask === "notTerminated" && (this._terminateTask = this._terminate()), this._terminateTask;
  }
  async _restart() {
    this._terminateTask === "notTerminated" ? await this._terminate() : this._terminateTask = "notTerminated";
  }
  /** Returns a JSON-serializable representation of this `Firestore` instance. */
  toJSON() {
    return {
      app: this._app,
      databaseId: this._databaseId,
      settings: this._settings
    };
  }
  /**
   * Terminates all components used by this client. Subclasses can override
   * this method to clean up their own dependencies, but must also call this
   * method.
   *
   * Only ever called once.
   */
  _terminate() {
    return function(t) {
      const r = Zo.get(t);
      r && (D("ComponentProvider", "Removing Datastore"), Zo.delete(t), r.terminate());
    }(this), Promise.resolve();
  }
}
function Gf(n, e, t, r = {}) {
  var i;
  const o = (n = Ui(n, as))._getSettings(), l = `${e}:${t}`;
  if (o.host !== "firestore.googleapis.com" && o.host !== l && fr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."), n._setSettings(Object.assign(Object.assign({}, o), {
    host: l,
    ssl: !1
  })), r.mockUserToken) {
    let u, h;
    if (typeof r.mockUserToken == "string") u = r.mockUserToken, h = fe.MOCK_USER;
    else {
      u = ou(r.mockUserToken, (i = n._app) === null || i === void 0 ? void 0 : i.options.projectId);
      const f = r.mockUserToken.sub || r.mockUserToken.user_id;
      if (!f) throw new M(S.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
      h = new fe(f);
    }
    n._authCredentials = new Vh(new Fa(u, h));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ls {
  // This is the lite version of the Query class in the main SDK.
  /** @hideconstructor protected */
  constructor(e, t, r) {
    this.converter = t, this._query = r, /** The type of this Firestore reference. */
    this.type = "query", this.firestore = e;
  }
  withConverter(e) {
    return new ls(this.firestore, e, this._query);
  }
}
class Ue {
  /** @hideconstructor */
  constructor(e, t, r) {
    this.converter = t, this._key = r, /** The type of this Firestore reference. */
    this.type = "document", this.firestore = e;
  }
  get _path() {
    return this._key.path;
  }
  /**
   * The document's identifier within its collection.
   */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  get path() {
    return this._key.path.canonicalString();
  }
  /**
   * The collection this `DocumentReference` belongs to.
   */
  get parent() {
    return new Tn(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(e) {
    return new Ue(this.firestore, e, this._key);
  }
}
class Tn extends ls {
  /** @hideconstructor */
  constructor(e, t, r) {
    super(e, t, hd(r)), this._path = r, /** The type of this Firestore reference. */
    this.type = "collection";
  }
  /** The collection's identifier. */
  get id() {
    return this._query.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  get path() {
    return this._query.path.canonicalString();
  }
  /**
   * A reference to the containing `DocumentReference` if this is a
   * subcollection. If this isn't a subcollection, the reference is null.
   */
  get parent() {
    const e = this._path.popLast();
    return e.isEmpty() ? null : new Ue(
      this.firestore,
      /* converter= */
      null,
      new L(e)
    );
  }
  withConverter(e) {
    return new Tn(this.firestore, e, this._path);
  }
}
function Kf(n, e, ...t) {
  if (n = Ce(n), // We allow omission of 'pathString' but explicitly prohibit passing in both
  // 'undefined' and 'null'.
  arguments.length === 1 && (e = Ba.newId()), zf("doc", "path", e), n instanceof as) {
    const r = ee.fromString(e, ...t);
    return ea(r), new Ue(
      n,
      /* converter= */
      null,
      new L(r)
    );
  }
  {
    if (!(n instanceof Ue || n instanceof Tn)) throw new M(S.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const r = n._path.child(ee.fromString(e, ...t));
    return ea(r), new Ue(n.firestore, n instanceof Tn ? n.converter : null, new L(r));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class na {
  constructor(e = Promise.resolve()) {
    this.Pu = [], // Is this AsyncQueue being shut down? Once it is set to true, it will not
    // be changed again.
    this.Iu = !1, // Operations scheduled to be queued in the future. Operations are
    // automatically removed after they are run or canceled.
    this.Tu = [], // visible for testing
    this.Eu = null, // Flag set while there's an outstanding AsyncQueue operation, used for
    // assertion sanity-checks.
    this.du = !1, // Enabled during shutdown on Safari to prevent future access to IndexedDB.
    this.Au = !1, // List of TimerIds to fast-forward delays for.
    this.Ru = [], // Backoff timer used to schedule retries for retryable operations
    this.t_ = new pl(
      this,
      "async_queue_retry"
      /* TimerId.AsyncQueueRetry */
    ), // Visibility handler that triggers an immediate retry of all retryable
    // operations. Meant to speed up recovery when we regain file system access
    // after page comes into foreground.
    this.Vu = () => {
      const r = yi();
      r && D("AsyncQueue", "Visibility state changed to " + r.visibilityState), this.t_.jo();
    }, this.mu = e;
    const t = yi();
    t && typeof t.addEventListener == "function" && t.addEventListener("visibilitychange", this.Vu);
  }
  get isShuttingDown() {
    return this.Iu;
  }
  /**
   * Adds a new operation to the queue without waiting for it to complete (i.e.
   * we ignore the Promise result).
   */
  enqueueAndForget(e) {
    this.enqueue(e);
  }
  enqueueAndForgetEvenWhileRestricted(e) {
    this.fu(), // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.gu(e);
  }
  enterRestrictedMode(e) {
    if (!this.Iu) {
      this.Iu = !0, this.Au = e || !1;
      const t = yi();
      t && typeof t.removeEventListener == "function" && t.removeEventListener("visibilitychange", this.Vu);
    }
  }
  enqueue(e) {
    if (this.fu(), this.Iu)
      return new Promise(() => {
      });
    const t = new dt();
    return this.gu(() => this.Iu && this.Au ? Promise.resolve() : (e().then(t.resolve, t.reject), t.promise)).then(() => t.promise);
  }
  enqueueRetryable(e) {
    this.enqueueAndForget(() => (this.Pu.push(e), this.pu()));
  }
  /**
   * Runs the next operation from the retryable queue. If the operation fails,
   * reschedules with backoff.
   */
  async pu() {
    if (this.Pu.length !== 0) {
      try {
        await this.Pu[0](), this.Pu.shift(), this.t_.reset();
      } catch (e) {
        if (!kr(e)) throw e;
        D("AsyncQueue", "Operation failed with retryable error: " + e);
      }
      this.Pu.length > 0 && // If there are additional operations, we re-schedule `retryNextOp()`.
      // This is necessary to run retryable operations that failed during
      // their initial attempt since we don't know whether they are already
      // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
      // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
      // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
      // call scheduled here.
      // Since `backoffAndRun()` cancels an existing backoff and schedules a
      // new backoff on every call, there is only ever a single additional
      // operation in the queue.
      this.t_.Go(() => this.pu());
    }
  }
  gu(e) {
    const t = this.mu.then(() => (this.du = !0, e().catch((r) => {
      this.Eu = r, this.du = !1;
      const i = (
        /**
        * Chrome includes Error.message in Error.stack. Other browsers do not.
        * This returns expected output of message + stack when available.
        * @param error - Error or FirestoreError
        */
        function(l) {
          let u = l.message || "";
          return l.stack && (u = l.stack.includes(l.message) ? l.stack : l.message + `
` + l.stack), u;
        }(r)
      );
      throw _t("INTERNAL UNHANDLED ERROR: ", i), r;
    }).then((r) => (this.du = !1, r))));
    return this.mu = t, t;
  }
  enqueueAfterDelay(e, t, r) {
    this.fu(), // Fast-forward delays for timerIds that have been overridden.
    this.Ru.indexOf(e) > -1 && (t = 0);
    const i = ss.createAndSchedule(this, e, t, r, (o) => this.yu(o));
    return this.Tu.push(i), i;
  }
  fu() {
    this.Eu && U();
  }
  verifyOperationInProgress() {
  }
  /**
   * Waits until all currently queued tasks are finished executing. Delayed
   * operations are not run.
   */
  async wu() {
    let e;
    do
      e = this.mu, await e;
    while (e !== this.mu);
  }
  /**
   * For Tests: Determine if a delayed operation with a particular TimerId
   * exists.
   */
  Su(e) {
    for (const t of this.Tu) if (t.timerId === e) return !0;
    return !1;
  }
  /**
   * For Tests: Runs some or all delayed operations early.
   *
   * @param lastTimerId - Delayed operations up to and including this TimerId
   * will be drained. Pass TimerId.All to run all delayed operations.
   * @returns a Promise that resolves once all operations have been run.
   */
  bu(e) {
    return this.wu().then(() => {
      this.Tu.sort((t, r) => t.targetTimeMs - r.targetTimeMs);
      for (const t of this.Tu) if (t.skipDelay(), e !== "all" && t.timerId === e) break;
      return this.wu();
    });
  }
  /**
   * For Tests: Skip all subsequent delays for a timer id.
   */
  Du(e) {
    this.Ru.push(e);
  }
  /** Called once a DelayedOperation is run or canceled. */
  yu(e) {
    const t = this.Tu.indexOf(e);
    this.Tu.splice(t, 1);
  }
}
class wl extends as {
  /** @hideconstructor */
  constructor(e, t, r, i) {
    super(e, t, r, i), /**
     * Whether it's a {@link Firestore} or Firestore Lite instance.
     */
    this.type = "firestore", this._queue = new na(), this._persistenceKey = (i == null ? void 0 : i.name) || "[DEFAULT]";
  }
  async _terminate() {
    if (this._firestoreClient) {
      const e = this._firestoreClient.terminate();
      this._queue = new na(e), this._firestoreClient = void 0, await e;
    }
  }
}
function Wf(n, e) {
  const t = typeof n == "object" ? n : Gi(), r = typeof n == "string" ? n : "(default)", i = qi(t, "firestore").getImmediate({
    identifier: r
  });
  if (!i._initialized) {
    const o = iu("firestore");
    o && Gf(i, ...o);
  }
  return i;
}
function Qf(n) {
  if (n._terminated) throw new M(S.FAILED_PRECONDITION, "The client has already been terminated.");
  return n._firestoreClient || Jf(n), n._firestoreClient;
}
function Jf(n) {
  var e, t, r;
  const i = n._freezeSettings(), o = function(u, h, f, y) {
    return new Xh(u, h, f, y.host, y.ssl, y.experimentalForceLongPolling, y.experimentalAutoDetectLongPolling, Il(y.experimentalLongPollingOptions), y.useFetchStreams);
  }(n._databaseId, ((e = n._app) === null || e === void 0 ? void 0 : e.options.appId) || "", n._persistenceKey, i);
  n._componentsProvider || !((t = i.localCache) === null || t === void 0) && t._offlineComponentProvider && (!((r = i.localCache) === null || r === void 0) && r._onlineComponentProvider) && (n._componentsProvider = {
    _offline: i.localCache._offlineComponentProvider,
    _online: i.localCache._onlineComponentProvider
  }), n._firestoreClient = new Bf(n._authCredentials, n._appCheckCredentials, n._queue, o, n._componentsProvider && function(u) {
    const h = u == null ? void 0 : u._online.build();
    return {
      _offline: u == null ? void 0 : u._offline.build(h),
      _online: h
    };
  }(n._componentsProvider));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class In {
  /** @hideconstructor */
  constructor(e) {
    this._byteString = e;
  }
  /**
   * Creates a new `Bytes` object from the given Base64 string, converting it to
   * bytes.
   *
   * @param base64 - The Base64 string used to create the `Bytes` object.
   */
  static fromBase64String(e) {
    try {
      return new In(ke.fromBase64String(e));
    } catch (t) {
      throw new M(S.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + t);
    }
  }
  /**
   * Creates a new `Bytes` object from the given Uint8Array.
   *
   * @param array - The Uint8Array used to create the `Bytes` object.
   */
  static fromUint8Array(e) {
    return new In(ke.fromUint8Array(e));
  }
  /**
   * Returns the underlying bytes as a Base64-encoded string.
   *
   * @returns The Base64-encoded string created from the `Bytes` object.
   */
  toBase64() {
    return this._byteString.toBase64();
  }
  /**
   * Returns the underlying bytes in a new `Uint8Array`.
   *
   * @returns The Uint8Array created from the `Bytes` object.
   */
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  /**
   * Returns a string representation of the `Bytes` object.
   *
   * @returns A string representation of the `Bytes` object.
   */
  toString() {
    return "Bytes(base64: " + this.toBase64() + ")";
  }
  /**
   * Returns true if this `Bytes` object is equal to the provided one.
   *
   * @param other - The `Bytes` object to compare against.
   * @returns true if this `Bytes` object is equal to the provided one.
   */
  isEqual(e) {
    return this._byteString.isEqual(e._byteString);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Al {
  /**
   * Creates a `FieldPath` from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames - A list of field names.
   */
  constructor(...e) {
    for (let t = 0; t < e.length; ++t) if (e[t].length === 0) throw new M(S.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
    this._internalPath = new ae(e);
  }
  /**
   * Returns true if this `FieldPath` is equal to the provided one.
   *
   * @param other - The `FieldPath` to compare against.
   * @returns true if this `FieldPath` is equal to the provided one.
   */
  isEqual(e) {
    return this._internalPath.isEqual(e._internalPath);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Rl {
  /**
   * @param _methodName - The public API endpoint that returns this class.
   * @hideconstructor
   */
  constructor(e) {
    this._methodName = e;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class bl {
  /**
   * Creates a new immutable `GeoPoint` object with the provided latitude and
   * longitude values.
   * @param latitude - The latitude as number between -90 and 90.
   * @param longitude - The longitude as number between -180 and 180.
   */
  constructor(e, t) {
    if (!isFinite(e) || e < -90 || e > 90) throw new M(S.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
    if (!isFinite(t) || t < -180 || t > 180) throw new M(S.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
    this._lat = e, this._long = t;
  }
  /**
   * The latitude of this `GeoPoint` instance.
   */
  get latitude() {
    return this._lat;
  }
  /**
   * The longitude of this `GeoPoint` instance.
   */
  get longitude() {
    return this._long;
  }
  /**
   * Returns true if this `GeoPoint` is equal to the provided one.
   *
   * @param other - The `GeoPoint` to compare against.
   * @returns true if this `GeoPoint` is equal to the provided one.
   */
  isEqual(e) {
    return this._lat === e._lat && this._long === e._long;
  }
  /** Returns a JSON-serializable representation of this GeoPoint. */
  toJSON() {
    return {
      latitude: this._lat,
      longitude: this._long
    };
  }
  /**
   * Actually private to JS consumers of our API, so this function is prefixed
   * with an underscore.
   */
  _compareTo(e) {
    return G(this._lat, e._lat) || G(this._long, e._long);
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Sl {
  /**
   * @private
   * @internal
   */
  constructor(e) {
    this._values = (e || []).map((t) => t);
  }
  /**
   * Returns a copy of the raw number array form of the vector.
   */
  toArray() {
    return this._values.map((e) => e);
  }
  /**
   * Returns `true` if the two VectorValue has the same raw number arrays, returns `false` otherwise.
   */
  isEqual(e) {
    return function(r, i) {
      if (r.length !== i.length) return !1;
      for (let o = 0; o < r.length; ++o) if (r[o] !== i[o]) return !1;
      return !0;
    }(this._values, e._values);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Xf = /^__.*__$/;
class Yf {
  constructor(e, t, r) {
    this.data = e, this.fieldMask = t, this.fieldTransforms = r;
  }
  toMutation(e, t) {
    return this.fieldMask !== null ? new Et(e, this.data, this.fieldMask, t, this.fieldTransforms) : new Sn(e, this.data, t, this.fieldTransforms);
  }
}
function Pl(n) {
  switch (n) {
    case 0:
    case 2:
    case 1:
      return !0;
    case 3:
    case 4:
      return !1;
    default:
      throw U();
  }
}
class cs {
  /**
   * Initializes a ParseContext with the given source and path.
   *
   * @param settings - The settings for the parser.
   * @param databaseId - The database ID of the Firestore instance.
   * @param serializer - The serializer to use to generate the Value proto.
   * @param ignoreUndefinedProperties - Whether to ignore undefined properties
   * rather than throw.
   * @param fieldTransforms - A mutable list of field transforms encountered
   * while parsing the data.
   * @param fieldMask - A mutable list of field paths encountered while parsing
   * the data.
   *
   * TODO(b/34871131): We don't support array paths right now, so path can be
   * null to indicate the context represents any location within an array (in
   * which case certain features will not work and errors will be somewhat
   * compromised).
   */
  constructor(e, t, r, i, o, l) {
    this.settings = e, this.databaseId = t, this.serializer = r, this.ignoreUndefinedProperties = i, // Minor hack: If fieldTransforms is undefined, we assume this is an
    // external call and we need to validate the entire path.
    o === void 0 && this.vu(), this.fieldTransforms = o || [], this.fieldMask = l || [];
  }
  get path() {
    return this.settings.path;
  }
  get Cu() {
    return this.settings.Cu;
  }
  /** Returns a new context with the specified settings overwritten. */
  Fu(e) {
    return new cs(Object.assign(Object.assign({}, this.settings), e), this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
  }
  Mu(e) {
    var t;
    const r = (t = this.path) === null || t === void 0 ? void 0 : t.child(e), i = this.Fu({
      path: r,
      xu: !1
    });
    return i.Ou(e), i;
  }
  Nu(e) {
    var t;
    const r = (t = this.path) === null || t === void 0 ? void 0 : t.child(e), i = this.Fu({
      path: r,
      xu: !1
    });
    return i.vu(), i;
  }
  Lu(e) {
    return this.Fu({
      path: void 0,
      xu: !0
    });
  }
  Bu(e) {
    return wr(e, this.settings.methodName, this.settings.ku || !1, this.path, this.settings.qu);
  }
  /** Returns 'true' if 'fieldPath' was traversed when creating this context. */
  contains(e) {
    return this.fieldMask.find((t) => e.isPrefixOf(t)) !== void 0 || this.fieldTransforms.find((t) => e.isPrefixOf(t.field)) !== void 0;
  }
  vu() {
    if (this.path) for (let e = 0; e < this.path.length; e++) this.Ou(this.path.get(e));
  }
  Ou(e) {
    if (e.length === 0) throw this.Bu("Document fields must not be empty");
    if (Pl(this.Cu) && Xf.test(e)) throw this.Bu('Document fields cannot begin and end with "__"');
  }
}
class Zf {
  constructor(e, t, r) {
    this.databaseId = e, this.ignoreUndefinedProperties = t, this.serializer = r || Vr(e);
  }
  /** Creates a new top-level parse context. */
  Qu(e, t, r, i = !1) {
    return new cs({
      Cu: e,
      methodName: t,
      qu: r,
      path: ae.emptyPath(),
      xu: !1,
      ku: i
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
  }
}
function ep(n) {
  const e = n._freezeSettings(), t = Vr(n._databaseId);
  return new Zf(n._databaseId, !!e.ignoreUndefinedProperties, t);
}
function tp(n, e, t, r, i, o = {}) {
  const l = n.Qu(o.merge || o.mergeFields ? 2 : 0, e, t, i);
  Dl("Data must be an object, but it was:", l, r);
  const u = kl(r, l);
  let h, f;
  if (o.merge) h = new be(l.fieldMask), f = l.fieldTransforms;
  else if (o.mergeFields) {
    const y = [];
    for (const w of o.mergeFields) {
      const R = np(e, w, t);
      if (!l.contains(R)) throw new M(S.INVALID_ARGUMENT, `Field '${R}' is specified in your field mask but missing from your input data.`);
      sp(y, R) || y.push(R);
    }
    h = new be(y), f = l.fieldTransforms.filter((w) => h.covers(w.field));
  } else h = null, f = l.fieldTransforms;
  return new Yf(new Re(u), h, f);
}
function Cl(n, e) {
  if (Nl(
    // Unwrap the API type from the Compat SDK. This will return the API type
    // from firestore-exp.
    n = Ce(n)
  )) return Dl("Unsupported field value:", e, n), kl(n, e);
  if (n instanceof Rl)
    return function(r, i) {
      if (!Pl(i.Cu)) throw i.Bu(`${r._methodName}() can only be used with update() and set()`);
      if (!i.path) throw i.Bu(`${r._methodName}() is not currently supported inside arrays`);
      const o = r._toFieldTransform(i);
      o && i.fieldTransforms.push(o);
    }(n, e), null;
  if (n === void 0 && e.ignoreUndefinedProperties)
    return null;
  if (
    // If context.path is null we are inside an array and we don't support
    // field mask paths more granular than the top-level array.
    e.path && e.fieldMask.push(e.path), n instanceof Array
  ) {
    if (e.settings.xu && e.Cu !== 4) throw e.Bu("Nested arrays are not supported");
    return function(r, i) {
      const o = [];
      let l = 0;
      for (const u of r) {
        let h = Cl(u, i.Lu(l));
        h == null && // Just include nulls in the array for fields being replaced with a
        // sentinel.
        (h = {
          nullValue: "NULL_VALUE"
        }), o.push(h), l++;
      }
      return {
        arrayValue: {
          values: o
        }
      };
    }(n, e);
  }
  return function(r, i) {
    if ((r = Ce(r)) === null) return {
      nullValue: "NULL_VALUE"
    };
    if (typeof r == "number") return Td(i.serializer, r);
    if (typeof r == "boolean") return {
      booleanValue: r
    };
    if (typeof r == "string") return {
      stringValue: r
    };
    if (r instanceof Date) {
      const o = re.fromDate(r);
      return {
        timestampValue: Vi(i.serializer, o)
      };
    }
    if (r instanceof re) {
      const o = new re(r.seconds, 1e3 * Math.floor(r.nanoseconds / 1e3));
      return {
        timestampValue: Vi(i.serializer, o)
      };
    }
    if (r instanceof bl) return {
      geoPointValue: {
        latitude: r.latitude,
        longitude: r.longitude
      }
    };
    if (r instanceof In) return {
      bytesValue: Vd(i.serializer, r._byteString)
    };
    if (r instanceof Ue) {
      const o = i.databaseId, l = r.firestore._databaseId;
      if (!l.isEqual(o)) throw i.Bu(`Document reference is for database ${l.projectId}/${l.database} but should be for database ${o.projectId}/${o.database}`);
      return {
        referenceValue: hl(r.firestore._databaseId || i.databaseId, r._key.path)
      };
    }
    if (r instanceof Sl)
      return function(l, u) {
        return {
          mapValue: {
            fields: {
              __type__: {
                stringValue: "__vector__"
              },
              value: {
                arrayValue: {
                  values: l.toArray().map((h) => {
                    if (typeof h != "number") throw u.Bu("VectorValues must only contain numeric values.");
                    return es(u.serializer, h);
                  })
                }
              }
            }
          }
        };
      }(r, i);
    throw i.Bu(`Unsupported field value: ${os(r)}`);
  }(n, e);
}
function kl(n, e) {
  const t = {};
  return Ha(n) ? (
    // If we encounter an empty object, we explicitly add it to the update
    // mask to ensure that the server creates a map entry.
    e.path && e.path.length > 0 && e.fieldMask.push(e.path)
  ) : bn(n, (r, i) => {
    const o = Cl(i, e.Mu(r));
    o != null && (t[r] = o);
  }), {
    mapValue: {
      fields: t
    }
  };
}
function Nl(n) {
  return !(typeof n != "object" || n === null || n instanceof Array || n instanceof Date || n instanceof re || n instanceof bl || n instanceof In || n instanceof Ue || n instanceof Rl || n instanceof Sl);
}
function Dl(n, e, t) {
  if (!Nl(t) || !function(i) {
    return typeof i == "object" && i !== null && (Object.getPrototypeOf(i) === Object.prototype || Object.getPrototypeOf(i) === null);
  }(t)) {
    const r = os(t);
    throw r === "an object" ? e.Bu(n + " a custom object") : e.Bu(n + " " + r);
  }
}
function np(n, e, t) {
  if (
    // If required, replace the FieldPath Compat class with the firestore-exp
    // FieldPath.
    (e = Ce(e)) instanceof Al
  ) return e._internalPath;
  if (typeof e == "string") return ip(n, e);
  throw wr(
    "Field path arguments must be of type string or ",
    n,
    /* hasConverter= */
    !1,
    /* path= */
    void 0,
    t
  );
}
const rp = new RegExp("[~\\*/\\[\\]]");
function ip(n, e, t) {
  if (e.search(rp) >= 0) throw wr(
    `Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,
    n,
    /* hasConverter= */
    !1,
    /* path= */
    void 0,
    t
  );
  try {
    return new Al(...e.split("."))._internalPath;
  } catch {
    throw wr(
      `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
      n,
      /* hasConverter= */
      !1,
      /* path= */
      void 0,
      t
    );
  }
}
function wr(n, e, t, r, i) {
  const o = r && !r.isEmpty(), l = i !== void 0;
  let u = `Function ${e}() called with invalid data`;
  t && (u += " (via `toFirestore()`)"), u += ". ";
  let h = "";
  return (o || l) && (h += " (found", o && (h += ` in field ${r}`), l && (h += ` in document ${i}`), h += ")"), new M(S.INVALID_ARGUMENT, u + n + h);
}
function sp(n, e) {
  return n.some((t) => t.isEqual(e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function op(n, e, t) {
  let r;
  return r = n ? n.toFirestore(e) : e, r;
}
function ap(n, e, t) {
  n = Ui(n, Ue);
  const r = Ui(n.firestore, wl), i = op(n.converter, e);
  return lp(r, [tp(ep(r), "setDoc", n._key, i, n.converter !== null, t).toMutation(n._key, xe.none())]);
}
function lp(n, e) {
  return function(r, i) {
    const o = new dt();
    return r.asyncQueue.enqueueAndForget(async () => Mf(await Hf(r), i, o)), o.promise;
  }(Qf(n), e);
}
(function(e, t = !0) {
  (function(i) {
    Ft = i;
  })(Ut), Nt(new mt("firestore", (r, { instanceIdentifier: i, options: o }) => {
    const l = r.getProvider("app").getImmediate(), u = new wl(new Mh(r.getProvider("auth-internal")), new Fh(r.getProvider("app-check-internal")), function(f, y) {
      if (!Object.prototype.hasOwnProperty.apply(f.options, ["projectId"])) throw new M(S.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
      return new gr(f.options.projectId, y);
    }(l, i), l);
    return o = Object.assign({
      useFetchStreams: t
    }, o), u._setSettings(o), u;
  }, "PUBLIC").setMultipleInstances(!0)), nt(No, "4.7.3", e), // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
  nt(No, "4.7.3", "esm2017");
})();
function us(n, e) {
  var t = {};
  for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && e.indexOf(r) < 0 && (t[r] = n[r]);
  if (n != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(n); i < r.length; i++)
      e.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(n, r[i]) && (t[r[i]] = n[r[i]]);
  return t;
}
function Ol() {
  return {
    "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."
  };
}
const cp = Ol, Vl = new An("auth", "Firebase", Ol());
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ar = new Hi("@firebase/auth");
function up(n, ...e) {
  Ar.logLevel <= x.WARN && Ar.warn(`Auth (${Ut}): ${n}`, ...e);
}
function ar(n, ...e) {
  Ar.logLevel <= x.ERROR && Ar.error(`Auth (${Ut}): ${n}`, ...e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Be(n, ...e) {
  throw hs(n, ...e);
}
function Se(n, ...e) {
  return hs(n, ...e);
}
function Ml(n, e, t) {
  const r = Object.assign(Object.assign({}, cp()), { [e]: t });
  return new An("auth", "Firebase", r).create(e, {
    appName: n.name
  });
}
function pt(n) {
  return Ml(n, "operation-not-supported-in-this-environment", "Operations that alter the current user are not supported in conjunction with FirebaseServerApp");
}
function hs(n, ...e) {
  if (typeof n != "string") {
    const t = e[0], r = [...e.slice(1)];
    return r[0] && (r[0].appName = n.name), n._errorFactory.create(t, ...r);
  }
  return Vl.create(n, ...e);
}
function V(n, e, ...t) {
  if (!n)
    throw hs(e, ...t);
}
function Ve(n) {
  const e = "INTERNAL ASSERTION FAILED: " + n;
  throw ar(e), new Error(e);
}
function je(n, e) {
  n || Ve(e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Fi() {
  var n;
  return typeof self < "u" && ((n = self.location) === null || n === void 0 ? void 0 : n.href) || "";
}
function hp() {
  return ra() === "http:" || ra() === "https:";
}
function ra() {
  var n;
  return typeof self < "u" && ((n = self.location) === null || n === void 0 ? void 0 : n.protocol) || null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function dp() {
  return typeof navigator < "u" && navigator && "onLine" in navigator && typeof navigator.onLine == "boolean" && // Apply only for traditional web apps and Chrome extensions.
  // This is especially true for Cordova apps which have unreliable
  // navigator.onLine behavior unless cordova-plugin-network-information is
  // installed which overwrites the native navigator.onLine value and
  // defines navigator.connection.
  (hp() || uu() || "connection" in navigator) ? navigator.onLine : !0;
}
function fp() {
  if (typeof navigator > "u")
    return null;
  const n = navigator;
  return (
    // Most reliable, but only supported in Chrome/Firefox.
    n.languages && n.languages[0] || // Supported in most browsers, but returns the language of the browser
    // UI, not the language set in browser settings.
    n.language || // Couldn't determine language.
    null
  );
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class kn {
  constructor(e, t) {
    this.shortDelay = e, this.longDelay = t, je(t > e, "Short delay should be less than long delay!"), this.isMobile = au() || hu();
  }
  get() {
    return dp() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ds(n, e) {
  je(n.emulator, "Emulator should always be set here");
  const { url: t } = n.emulator;
  return e ? `${t}${e.startsWith("/") ? e.slice(1) : e}` : t;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ll {
  static initialize(e, t, r) {
    this.fetchImpl = e, t && (this.headersImpl = t), r && (this.responseImpl = r);
  }
  static fetch() {
    if (this.fetchImpl)
      return this.fetchImpl;
    if (typeof self < "u" && "fetch" in self)
      return self.fetch;
    if (typeof globalThis < "u" && globalThis.fetch)
      return globalThis.fetch;
    if (typeof fetch < "u")
      return fetch;
    Ve("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static headers() {
    if (this.headersImpl)
      return this.headersImpl;
    if (typeof self < "u" && "Headers" in self)
      return self.Headers;
    if (typeof globalThis < "u" && globalThis.Headers)
      return globalThis.Headers;
    if (typeof Headers < "u")
      return Headers;
    Ve("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static response() {
    if (this.responseImpl)
      return this.responseImpl;
    if (typeof self < "u" && "Response" in self)
      return self.Response;
    if (typeof globalThis < "u" && globalThis.Response)
      return globalThis.Response;
    if (typeof Response < "u")
      return Response;
    Ve("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pp = {
  // Custom token errors.
  CREDENTIAL_MISMATCH: "custom-token-mismatch",
  // This can only happen if the SDK sends a bad request.
  MISSING_CUSTOM_TOKEN: "internal-error",
  // Create Auth URI errors.
  INVALID_IDENTIFIER: "invalid-email",
  // This can only happen if the SDK sends a bad request.
  MISSING_CONTINUE_URI: "internal-error",
  // Sign in with email and password errors (some apply to sign up too).
  INVALID_PASSWORD: "wrong-password",
  // This can only happen if the SDK sends a bad request.
  MISSING_PASSWORD: "missing-password",
  // Thrown if Email Enumeration Protection is enabled in the project and the email or password is
  // invalid.
  INVALID_LOGIN_CREDENTIALS: "invalid-credential",
  // Sign up with email and password errors.
  EMAIL_EXISTS: "email-already-in-use",
  PASSWORD_LOGIN_DISABLED: "operation-not-allowed",
  // Verify assertion for sign in with credential errors:
  INVALID_IDP_RESPONSE: "invalid-credential",
  INVALID_PENDING_TOKEN: "invalid-credential",
  FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use",
  // This can only happen if the SDK sends a bad request.
  MISSING_REQ_TYPE: "internal-error",
  // Send Password reset email errors:
  EMAIL_NOT_FOUND: "user-not-found",
  RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests",
  EXPIRED_OOB_CODE: "expired-action-code",
  INVALID_OOB_CODE: "invalid-action-code",
  // This can only happen if the SDK sends a bad request.
  MISSING_OOB_CODE: "internal-error",
  // Operations that require ID token in request:
  CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login",
  INVALID_ID_TOKEN: "invalid-user-token",
  TOKEN_EXPIRED: "user-token-expired",
  USER_NOT_FOUND: "user-token-expired",
  // Other errors.
  TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests",
  PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password-does-not-meet-requirements",
  // Phone Auth related errors.
  INVALID_CODE: "invalid-verification-code",
  INVALID_SESSION_INFO: "invalid-verification-id",
  INVALID_TEMPORARY_PROOF: "invalid-credential",
  MISSING_SESSION_INFO: "missing-verification-id",
  SESSION_EXPIRED: "code-expired",
  // Other action code errors when additional settings passed.
  // MISSING_CONTINUE_URI is getting mapped to INTERNAL_ERROR above.
  // This is OK as this error will be caught by client side validation.
  MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name",
  UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri",
  // getProjectConfig errors when clientId is passed.
  INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id",
  // User actions (sign-up or deletion) disabled errors.
  ADMIN_ONLY_OPERATION: "admin-restricted-operation",
  // Multi factor related errors.
  INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session",
  MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found",
  MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info",
  MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session",
  SECOND_FACTOR_EXISTS: "second-factor-already-in-use",
  SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded",
  // Blocking functions related errors.
  BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error",
  // Recaptcha related errors.
  RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled",
  MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token",
  INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token",
  INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action",
  MISSING_CLIENT_TYPE: "missing-client-type",
  MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version",
  INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version",
  INVALID_REQ_TYPE: "invalid-req-type"
  /* AuthErrorCode.INVALID_REQ_TYPE */
};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const mp = new kn(3e4, 6e4);
function fs(n, e) {
  return n.tenantId && !e.tenantId ? Object.assign(Object.assign({}, e), { tenantId: n.tenantId }) : e;
}
async function jt(n, e, t, r, i = {}) {
  return xl(n, i, async () => {
    let o = {}, l = {};
    r && (e === "GET" ? l = r : o = {
      body: JSON.stringify(r)
    });
    const u = Rn(Object.assign({ key: n.config.apiKey }, l)).slice(1), h = await n._getAdditionalHeaders();
    h[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/json", n.languageCode && (h[
      "X-Firebase-Locale"
      /* HttpHeader.X_FIREBASE_LOCALE */
    ] = n.languageCode);
    const f = Object.assign({
      method: e,
      headers: h
    }, o);
    return cu() || (f.referrerPolicy = "no-referrer"), Ll.fetch()(Ul(n, n.config.apiHost, t, u), f);
  });
}
async function xl(n, e, t) {
  n._canInitEmulator = !1;
  const r = Object.assign(Object.assign({}, pp), e);
  try {
    const i = new _p(n), o = await Promise.race([
      t(),
      i.promise
    ]);
    i.clearNetworkTimeout();
    const l = await o.json();
    if ("needConfirmation" in l)
      throw rr(n, "account-exists-with-different-credential", l);
    if (o.ok && !("errorMessage" in l))
      return l;
    {
      const u = o.ok ? l.errorMessage : l.error.message, [h, f] = u.split(" : ");
      if (h === "FEDERATED_USER_ID_ALREADY_LINKED")
        throw rr(n, "credential-already-in-use", l);
      if (h === "EMAIL_EXISTS")
        throw rr(n, "email-already-in-use", l);
      if (h === "USER_DISABLED")
        throw rr(n, "user-disabled", l);
      const y = r[h] || h.toLowerCase().replace(/[_\s]+/g, "-");
      if (f)
        throw Ml(n, y, f);
      Be(n, y);
    }
  } catch (i) {
    if (i instanceof $e)
      throw i;
    Be(n, "network-request-failed", { message: String(i) });
  }
}
async function gp(n, e, t, r, i = {}) {
  const o = await jt(n, e, t, r, i);
  return "mfaPendingCredential" in o && Be(n, "multi-factor-auth-required", {
    _serverResponse: o
  }), o;
}
function Ul(n, e, t, r) {
  const i = `${e}${t}?${r}`;
  return n.config.emulator ? ds(n.config, i) : `${n.config.apiScheme}://${i}`;
}
class _p {
  constructor(e) {
    this.auth = e, this.timer = null, this.promise = new Promise((t, r) => {
      this.timer = setTimeout(() => r(Se(
        this.auth,
        "network-request-failed"
        /* AuthErrorCode.NETWORK_REQUEST_FAILED */
      )), mp.get());
    });
  }
  clearNetworkTimeout() {
    clearTimeout(this.timer);
  }
}
function rr(n, e, t) {
  const r = {
    appName: n.name
  };
  t.email && (r.email = t.email), t.phoneNumber && (r.phoneNumber = t.phoneNumber);
  const i = Se(n, e, r);
  return i.customData._tokenResponse = t, i;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function yp(n, e) {
  return jt(n, "POST", "/v1/accounts:delete", e);
}
async function Fl(n, e) {
  return jt(n, "POST", "/v1/accounts:lookup", e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function fn(n) {
  if (n)
    try {
      const e = new Date(Number(n));
      if (!isNaN(e.getTime()))
        return e.toUTCString();
    } catch {
    }
}
async function vp(n, e = !1) {
  const t = Ce(n), r = await t.getIdToken(e), i = ps(r);
  V(
    i && i.exp && i.auth_time && i.iat,
    t.auth,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const o = typeof i.firebase == "object" ? i.firebase : void 0, l = o == null ? void 0 : o.sign_in_provider;
  return {
    claims: i,
    token: r,
    authTime: fn(Ei(i.auth_time)),
    issuedAtTime: fn(Ei(i.iat)),
    expirationTime: fn(Ei(i.exp)),
    signInProvider: l || null,
    signInSecondFactor: (o == null ? void 0 : o.sign_in_second_factor) || null
  };
}
function Ei(n) {
  return Number(n) * 1e3;
}
function ps(n) {
  const [e, t, r] = n.split(".");
  if (e === void 0 || t === void 0 || r === void 0)
    return ar("JWT malformed, contained fewer than 3 sections"), null;
  try {
    const i = Aa(t);
    return i ? JSON.parse(i) : (ar("Failed to decode base64 JWT payload"), null);
  } catch (i) {
    return ar("Caught error parsing JWT payload as JSON", i == null ? void 0 : i.toString()), null;
  }
}
function ia(n) {
  const e = ps(n);
  return V(
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), V(
    typeof e.exp < "u",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), V(
    typeof e.iat < "u",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), Number(e.exp) - Number(e.iat);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function wn(n, e, t = !1) {
  if (t)
    return e;
  try {
    return await e;
  } catch (r) {
    throw r instanceof $e && Ep(r) && n.auth.currentUser === n && await n.auth.signOut(), r;
  }
}
function Ep({ code: n }) {
  return n === "auth/user-disabled" || n === "auth/user-token-expired";
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Tp {
  constructor(e) {
    this.user = e, this.isRunning = !1, this.timerId = null, this.errorBackoff = 3e4;
  }
  _start() {
    this.isRunning || (this.isRunning = !0, this.schedule());
  }
  _stop() {
    this.isRunning && (this.isRunning = !1, this.timerId !== null && clearTimeout(this.timerId));
  }
  getInterval(e) {
    var t;
    if (e) {
      const r = this.errorBackoff;
      return this.errorBackoff = Math.min(
        this.errorBackoff * 2,
        96e4
        /* Duration.RETRY_BACKOFF_MAX */
      ), r;
    } else {
      this.errorBackoff = 3e4;
      const i = ((t = this.user.stsTokenManager.expirationTime) !== null && t !== void 0 ? t : 0) - Date.now() - 3e5;
      return Math.max(0, i);
    }
  }
  schedule(e = !1) {
    if (!this.isRunning)
      return;
    const t = this.getInterval(e);
    this.timerId = setTimeout(async () => {
      await this.iteration();
    }, t);
  }
  async iteration() {
    try {
      await this.user.getIdToken(!0);
    } catch (e) {
      (e == null ? void 0 : e.code) === "auth/network-request-failed" && this.schedule(
        /* wasError */
        !0
      );
      return;
    }
    this.schedule();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Bi {
  constructor(e, t) {
    this.createdAt = e, this.lastLoginAt = t, this._initializeTime();
  }
  _initializeTime() {
    this.lastSignInTime = fn(this.lastLoginAt), this.creationTime = fn(this.createdAt);
  }
  _copy(e) {
    this.createdAt = e.createdAt, this.lastLoginAt = e.lastLoginAt, this._initializeTime();
  }
  toJSON() {
    return {
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt
    };
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Rr(n) {
  var e;
  const t = n.auth, r = await n.getIdToken(), i = await wn(n, Fl(t, { idToken: r }));
  V(
    i == null ? void 0 : i.users.length,
    t,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const o = i.users[0];
  n._notifyReloadListener(o);
  const l = !((e = o.providerUserInfo) === null || e === void 0) && e.length ? Bl(o.providerUserInfo) : [], u = wp(n.providerData, l), h = n.isAnonymous, f = !(n.email && o.passwordHash) && !(u != null && u.length), y = h ? f : !1, w = {
    uid: o.localId,
    displayName: o.displayName || null,
    photoURL: o.photoUrl || null,
    email: o.email || null,
    emailVerified: o.emailVerified || !1,
    phoneNumber: o.phoneNumber || null,
    tenantId: o.tenantId || null,
    providerData: u,
    metadata: new Bi(o.createdAt, o.lastLoginAt),
    isAnonymous: y
  };
  Object.assign(n, w);
}
async function Ip(n) {
  const e = Ce(n);
  await Rr(e), await e.auth._persistUserIfCurrent(e), e.auth._notifyListenersIfCurrent(e);
}
function wp(n, e) {
  return [...n.filter((r) => !e.some((i) => i.providerId === r.providerId)), ...e];
}
function Bl(n) {
  return n.map((e) => {
    var { providerId: t } = e, r = us(e, ["providerId"]);
    return {
      providerId: t,
      uid: r.rawId || "",
      displayName: r.displayName || null,
      email: r.email || null,
      phoneNumber: r.phoneNumber || null,
      photoURL: r.photoUrl || null
    };
  });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Ap(n, e) {
  const t = await xl(n, {}, async () => {
    const r = Rn({
      grant_type: "refresh_token",
      refresh_token: e
    }).slice(1), { tokenApiHost: i, apiKey: o } = n.config, l = Ul(n, i, "/v1/token", `key=${o}`), u = await n._getAdditionalHeaders();
    return u[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/x-www-form-urlencoded", Ll.fetch()(l, {
      method: "POST",
      headers: u,
      body: r
    });
  });
  return {
    accessToken: t.access_token,
    expiresIn: t.expires_in,
    refreshToken: t.refresh_token
  };
}
async function Rp(n, e) {
  return jt(n, "POST", "/v2/accounts:revokeToken", fs(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Pt {
  constructor() {
    this.refreshToken = null, this.accessToken = null, this.expirationTime = null;
  }
  get isExpired() {
    return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
  }
  updateFromServerResponse(e) {
    V(
      e.idToken,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), V(
      typeof e.idToken < "u",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), V(
      typeof e.refreshToken < "u",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const t = "expiresIn" in e && typeof e.expiresIn < "u" ? Number(e.expiresIn) : ia(e.idToken);
    this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
  }
  updateFromIdToken(e) {
    V(
      e.length !== 0,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const t = ia(e);
    this.updateTokensAndExpiration(e, null, t);
  }
  async getToken(e, t = !1) {
    return !t && this.accessToken && !this.isExpired ? this.accessToken : (V(
      this.refreshToken,
      e,
      "user-token-expired"
      /* AuthErrorCode.TOKEN_EXPIRED */
    ), this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null);
  }
  clearRefreshToken() {
    this.refreshToken = null;
  }
  async refresh(e, t) {
    const { accessToken: r, refreshToken: i, expiresIn: o } = await Ap(e, t);
    this.updateTokensAndExpiration(r, i, Number(o));
  }
  updateTokensAndExpiration(e, t, r) {
    this.refreshToken = t || null, this.accessToken = e || null, this.expirationTime = Date.now() + r * 1e3;
  }
  static fromJSON(e, t) {
    const { refreshToken: r, accessToken: i, expirationTime: o } = t, l = new Pt();
    return r && (V(typeof r == "string", "internal-error", {
      appName: e
    }), l.refreshToken = r), i && (V(typeof i == "string", "internal-error", {
      appName: e
    }), l.accessToken = i), o && (V(typeof o == "number", "internal-error", {
      appName: e
    }), l.expirationTime = o), l;
  }
  toJSON() {
    return {
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      expirationTime: this.expirationTime
    };
  }
  _assign(e) {
    this.accessToken = e.accessToken, this.refreshToken = e.refreshToken, this.expirationTime = e.expirationTime;
  }
  _clone() {
    return Object.assign(new Pt(), this.toJSON());
  }
  _performRefresh() {
    return Ve("not implemented");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ke(n, e) {
  V(typeof n == "string" || typeof n > "u", "internal-error", { appName: e });
}
class Me {
  constructor(e) {
    var { uid: t, auth: r, stsTokenManager: i } = e, o = us(e, ["uid", "auth", "stsTokenManager"]);
    this.providerId = "firebase", this.proactiveRefresh = new Tp(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = t, this.auth = r, this.stsTokenManager = i, this.accessToken = i.accessToken, this.displayName = o.displayName || null, this.email = o.email || null, this.emailVerified = o.emailVerified || !1, this.phoneNumber = o.phoneNumber || null, this.photoURL = o.photoURL || null, this.isAnonymous = o.isAnonymous || !1, this.tenantId = o.tenantId || null, this.providerData = o.providerData ? [...o.providerData] : [], this.metadata = new Bi(o.createdAt || void 0, o.lastLoginAt || void 0);
  }
  async getIdToken(e) {
    const t = await wn(this, this.stsTokenManager.getToken(this.auth, e));
    return V(
      t,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.accessToken !== t && (this.accessToken = t, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), t;
  }
  getIdTokenResult(e) {
    return vp(this, e);
  }
  reload() {
    return Ip(this);
  }
  _assign(e) {
    this !== e && (V(
      this.uid === e.uid,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map((t) => Object.assign({}, t)), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager));
  }
  _clone(e) {
    const t = new Me(Object.assign(Object.assign({}, this), { auth: e, stsTokenManager: this.stsTokenManager._clone() }));
    return t.metadata._copy(this.metadata), t;
  }
  _onReload(e) {
    V(
      !this.reloadListener,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.reloadListener = e, this.reloadUserInfo && (this._notifyReloadListener(this.reloadUserInfo), this.reloadUserInfo = null);
  }
  _notifyReloadListener(e) {
    this.reloadListener ? this.reloadListener(e) : this.reloadUserInfo = e;
  }
  _startProactiveRefresh() {
    this.proactiveRefresh._start();
  }
  _stopProactiveRefresh() {
    this.proactiveRefresh._stop();
  }
  async _updateTokensIfNecessary(e, t = !1) {
    let r = !1;
    e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), r = !0), t && await Rr(this), await this.auth._persistUserIfCurrent(this), r && this.auth._notifyListenersIfCurrent(this);
  }
  async delete() {
    if (Ze(this.auth.app))
      return Promise.reject(pt(this.auth));
    const e = await this.getIdToken();
    return await wn(this, yp(this.auth, { idToken: e })), this.stsTokenManager.clearRefreshToken(), this.auth.signOut();
  }
  toJSON() {
    return Object.assign(Object.assign({
      uid: this.uid,
      email: this.email || void 0,
      emailVerified: this.emailVerified,
      displayName: this.displayName || void 0,
      isAnonymous: this.isAnonymous,
      photoURL: this.photoURL || void 0,
      phoneNumber: this.phoneNumber || void 0,
      tenantId: this.tenantId || void 0,
      providerData: this.providerData.map((e) => Object.assign({}, e)),
      stsTokenManager: this.stsTokenManager.toJSON(),
      // Redirect event ID must be maintained in case there is a pending
      // redirect event.
      _redirectEventId: this._redirectEventId
    }, this.metadata.toJSON()), {
      // Required for compatibility with the legacy SDK (go/firebase-auth-sdk-persistence-parsing):
      apiKey: this.auth.config.apiKey,
      appName: this.auth.name
    });
  }
  get refreshToken() {
    return this.stsTokenManager.refreshToken || "";
  }
  static _fromJSON(e, t) {
    var r, i, o, l, u, h, f, y;
    const w = (r = t.displayName) !== null && r !== void 0 ? r : void 0, R = (i = t.email) !== null && i !== void 0 ? i : void 0, C = (o = t.phoneNumber) !== null && o !== void 0 ? o : void 0, k = (l = t.photoURL) !== null && l !== void 0 ? l : void 0, O = (u = t.tenantId) !== null && u !== void 0 ? u : void 0, N = (h = t._redirectEventId) !== null && h !== void 0 ? h : void 0, H = (f = t.createdAt) !== null && f !== void 0 ? f : void 0, F = (y = t.lastLoginAt) !== null && y !== void 0 ? y : void 0, { uid: j, emailVerified: z, isAnonymous: Ee, providerData: Y, stsTokenManager: E } = t;
    V(
      j && E,
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const p = Pt.fromJSON(this.name, E);
    V(
      typeof j == "string",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), Ke(w, e.name), Ke(R, e.name), V(
      typeof z == "boolean",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), V(
      typeof Ee == "boolean",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), Ke(C, e.name), Ke(k, e.name), Ke(O, e.name), Ke(N, e.name), Ke(H, e.name), Ke(F, e.name);
    const g = new Me({
      uid: j,
      auth: e,
      email: R,
      emailVerified: z,
      displayName: w,
      isAnonymous: Ee,
      photoURL: k,
      phoneNumber: C,
      tenantId: O,
      stsTokenManager: p,
      createdAt: H,
      lastLoginAt: F
    });
    return Y && Array.isArray(Y) && (g.providerData = Y.map((_) => Object.assign({}, _))), N && (g._redirectEventId = N), g;
  }
  /**
   * Initialize a User from an idToken server response
   * @param auth
   * @param idTokenResponse
   */
  static async _fromIdTokenResponse(e, t, r = !1) {
    const i = new Pt();
    i.updateFromServerResponse(t);
    const o = new Me({
      uid: t.localId,
      auth: e,
      stsTokenManager: i,
      isAnonymous: r
    });
    return await Rr(o), o;
  }
  /**
   * Initialize a User from an idToken server response
   * @param auth
   * @param idTokenResponse
   */
  static async _fromGetAccountInfoResponse(e, t, r) {
    const i = t.users[0];
    V(
      i.localId !== void 0,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const o = i.providerUserInfo !== void 0 ? Bl(i.providerUserInfo) : [], l = !(i.email && i.passwordHash) && !(o != null && o.length), u = new Pt();
    u.updateFromIdToken(r);
    const h = new Me({
      uid: i.localId,
      auth: e,
      stsTokenManager: u,
      isAnonymous: l
    }), f = {
      uid: i.localId,
      displayName: i.displayName || null,
      photoURL: i.photoUrl || null,
      email: i.email || null,
      emailVerified: i.emailVerified || !1,
      phoneNumber: i.phoneNumber || null,
      tenantId: i.tenantId || null,
      providerData: o,
      metadata: new Bi(i.createdAt, i.lastLoginAt),
      isAnonymous: !(i.email && i.passwordHash) && !(o != null && o.length)
    };
    return Object.assign(h, f), h;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const sa = /* @__PURE__ */ new Map();
function Le(n) {
  je(n instanceof Function, "Expected a class definition");
  let e = sa.get(n);
  return e ? (je(e instanceof n, "Instance stored in cache mismatched with class"), e) : (e = new n(), sa.set(n, e), e);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class jl {
  constructor() {
    this.type = "NONE", this.storage = {};
  }
  async _isAvailable() {
    return !0;
  }
  async _set(e, t) {
    this.storage[e] = t;
  }
  async _get(e) {
    const t = this.storage[e];
    return t === void 0 ? null : t;
  }
  async _remove(e) {
    delete this.storage[e];
  }
  _addListener(e, t) {
  }
  _removeListener(e, t) {
  }
}
jl.type = "NONE";
const oa = jl;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function lr(n, e, t) {
  return `firebase:${n}:${e}:${t}`;
}
class Ct {
  constructor(e, t, r) {
    this.persistence = e, this.auth = t, this.userKey = r;
    const { config: i, name: o } = this.auth;
    this.fullUserKey = lr(this.userKey, i.apiKey, o), this.fullPersistenceKey = lr("persistence", i.apiKey, o), this.boundEventHandler = t._onStorageEvent.bind(t), this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
  }
  setCurrentUser(e) {
    return this.persistence._set(this.fullUserKey, e.toJSON());
  }
  async getCurrentUser() {
    const e = await this.persistence._get(this.fullUserKey);
    return e ? Me._fromJSON(this.auth, e) : null;
  }
  removeCurrentUser() {
    return this.persistence._remove(this.fullUserKey);
  }
  savePersistenceForRedirect() {
    return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
  }
  async setPersistence(e) {
    if (this.persistence === e)
      return;
    const t = await this.getCurrentUser();
    if (await this.removeCurrentUser(), this.persistence = e, t)
      return this.setCurrentUser(t);
  }
  delete() {
    this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
  }
  static async create(e, t, r = "authUser") {
    if (!t.length)
      return new Ct(Le(oa), e, r);
    const i = (await Promise.all(t.map(async (f) => {
      if (await f._isAvailable())
        return f;
    }))).filter((f) => f);
    let o = i[0] || Le(oa);
    const l = lr(r, e.config.apiKey, e.name);
    let u = null;
    for (const f of t)
      try {
        const y = await f._get(l);
        if (y) {
          const w = Me._fromJSON(e, y);
          f !== o && (u = w), o = f;
          break;
        }
      } catch {
      }
    const h = i.filter((f) => f._shouldAllowMigration);
    return !o._shouldAllowMigration || !h.length ? new Ct(o, e, r) : (o = h[0], u && await o._set(l, u.toJSON()), await Promise.all(t.map(async (f) => {
      if (f !== o)
        try {
          await f._remove(l);
        } catch {
        }
    })), new Ct(o, e, r));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function aa(n) {
  const e = n.toLowerCase();
  if (e.includes("opera/") || e.includes("opr/") || e.includes("opios/"))
    return "Opera";
  if (ql(e))
    return "IEMobile";
  if (e.includes("msie") || e.includes("trident/"))
    return "IE";
  if (e.includes("edge/"))
    return "Edge";
  if ($l(e))
    return "Firefox";
  if (e.includes("silk/"))
    return "Silk";
  if (Kl(e))
    return "Blackberry";
  if (Wl(e))
    return "Webos";
  if (Hl(e))
    return "Safari";
  if ((e.includes("chrome/") || zl(e)) && !e.includes("edge/"))
    return "Chrome";
  if (Gl(e))
    return "Android";
  {
    const t = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/, r = n.match(t);
    if ((r == null ? void 0 : r.length) === 2)
      return r[1];
  }
  return "Other";
}
function $l(n = ge()) {
  return /firefox\//i.test(n);
}
function Hl(n = ge()) {
  const e = n.toLowerCase();
  return e.includes("safari/") && !e.includes("chrome/") && !e.includes("crios/") && !e.includes("android");
}
function zl(n = ge()) {
  return /crios\//i.test(n);
}
function ql(n = ge()) {
  return /iemobile/i.test(n);
}
function Gl(n = ge()) {
  return /android/i.test(n);
}
function Kl(n = ge()) {
  return /blackberry/i.test(n);
}
function Wl(n = ge()) {
  return /webos/i.test(n);
}
function ms(n = ge()) {
  return /iphone|ipad|ipod/i.test(n) || /macintosh/i.test(n) && /mobile/i.test(n);
}
function bp(n = ge()) {
  var e;
  return ms(n) && !!(!((e = window.navigator) === null || e === void 0) && e.standalone);
}
function Sp() {
  return du() && document.documentMode === 10;
}
function Ql(n = ge()) {
  return ms(n) || Gl(n) || Wl(n) || Kl(n) || /windows phone/i.test(n) || ql(n);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Jl(n, e = []) {
  let t;
  switch (n) {
    case "Browser":
      t = aa(ge());
      break;
    case "Worker":
      t = `${aa(ge())}-${n}`;
      break;
    default:
      t = n;
  }
  const r = e.length ? e.join(",") : "FirebaseCore-web";
  return `${t}/JsCore/${Ut}/${r}`;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Pp {
  constructor(e) {
    this.auth = e, this.queue = [];
  }
  pushCallback(e, t) {
    const r = (o) => new Promise((l, u) => {
      try {
        const h = e(o);
        l(h);
      } catch (h) {
        u(h);
      }
    });
    r.onAbort = t, this.queue.push(r);
    const i = this.queue.length - 1;
    return () => {
      this.queue[i] = () => Promise.resolve();
    };
  }
  async runMiddleware(e) {
    if (this.auth.currentUser === e)
      return;
    const t = [];
    try {
      for (const r of this.queue)
        await r(e), r.onAbort && t.push(r.onAbort);
    } catch (r) {
      t.reverse();
      for (const i of t)
        try {
          i();
        } catch {
        }
      throw this.auth._errorFactory.create("login-blocked", {
        originalMessage: r == null ? void 0 : r.message
      });
    }
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Cp(n, e = {}) {
  return jt(n, "GET", "/v2/passwordPolicy", fs(n, e));
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const kp = 6;
class Np {
  constructor(e) {
    var t, r, i, o;
    const l = e.customStrengthOptions;
    this.customStrengthOptions = {}, this.customStrengthOptions.minPasswordLength = (t = l.minPasswordLength) !== null && t !== void 0 ? t : kp, l.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = l.maxPasswordLength), l.containsLowercaseCharacter !== void 0 && (this.customStrengthOptions.containsLowercaseLetter = l.containsLowercaseCharacter), l.containsUppercaseCharacter !== void 0 && (this.customStrengthOptions.containsUppercaseLetter = l.containsUppercaseCharacter), l.containsNumericCharacter !== void 0 && (this.customStrengthOptions.containsNumericCharacter = l.containsNumericCharacter), l.containsNonAlphanumericCharacter !== void 0 && (this.customStrengthOptions.containsNonAlphanumericCharacter = l.containsNonAlphanumericCharacter), this.enforcementState = e.enforcementState, this.enforcementState === "ENFORCEMENT_STATE_UNSPECIFIED" && (this.enforcementState = "OFF"), this.allowedNonAlphanumericCharacters = (i = (r = e.allowedNonAlphanumericCharacters) === null || r === void 0 ? void 0 : r.join("")) !== null && i !== void 0 ? i : "", this.forceUpgradeOnSignin = (o = e.forceUpgradeOnSignin) !== null && o !== void 0 ? o : !1, this.schemaVersion = e.schemaVersion;
  }
  validatePassword(e) {
    var t, r, i, o, l, u;
    const h = {
      isValid: !0,
      passwordPolicy: this
    };
    return this.validatePasswordLengthOptions(e, h), this.validatePasswordCharacterOptions(e, h), h.isValid && (h.isValid = (t = h.meetsMinPasswordLength) !== null && t !== void 0 ? t : !0), h.isValid && (h.isValid = (r = h.meetsMaxPasswordLength) !== null && r !== void 0 ? r : !0), h.isValid && (h.isValid = (i = h.containsLowercaseLetter) !== null && i !== void 0 ? i : !0), h.isValid && (h.isValid = (o = h.containsUppercaseLetter) !== null && o !== void 0 ? o : !0), h.isValid && (h.isValid = (l = h.containsNumericCharacter) !== null && l !== void 0 ? l : !0), h.isValid && (h.isValid = (u = h.containsNonAlphanumericCharacter) !== null && u !== void 0 ? u : !0), h;
  }
  /**
   * Validates that the password meets the length options for the policy.
   *
   * @param password Password to validate.
   * @param status Validation status.
   */
  validatePasswordLengthOptions(e, t) {
    const r = this.customStrengthOptions.minPasswordLength, i = this.customStrengthOptions.maxPasswordLength;
    r && (t.meetsMinPasswordLength = e.length >= r), i && (t.meetsMaxPasswordLength = e.length <= i);
  }
  /**
   * Validates that the password meets the character options for the policy.
   *
   * @param password Password to validate.
   * @param status Validation status.
   */
  validatePasswordCharacterOptions(e, t) {
    this.updatePasswordCharacterOptionsStatuses(
      t,
      /* containsLowercaseCharacter= */
      !1,
      /* containsUppercaseCharacter= */
      !1,
      /* containsNumericCharacter= */
      !1,
      /* containsNonAlphanumericCharacter= */
      !1
    );
    let r;
    for (let i = 0; i < e.length; i++)
      r = e.charAt(i), this.updatePasswordCharacterOptionsStatuses(
        t,
        /* containsLowercaseCharacter= */
        r >= "a" && r <= "z",
        /* containsUppercaseCharacter= */
        r >= "A" && r <= "Z",
        /* containsNumericCharacter= */
        r >= "0" && r <= "9",
        /* containsNonAlphanumericCharacter= */
        this.allowedNonAlphanumericCharacters.includes(r)
      );
  }
  /**
   * Updates the running validation status with the statuses for the character options.
   * Expected to be called each time a character is processed to update each option status
   * based on the current character.
   *
   * @param status Validation status.
   * @param containsLowercaseCharacter Whether the character is a lowercase letter.
   * @param containsUppercaseCharacter Whether the character is an uppercase letter.
   * @param containsNumericCharacter Whether the character is a numeric character.
   * @param containsNonAlphanumericCharacter Whether the character is a non-alphanumeric character.
   */
  updatePasswordCharacterOptionsStatuses(e, t, r, i, o) {
    this.customStrengthOptions.containsLowercaseLetter && (e.containsLowercaseLetter || (e.containsLowercaseLetter = t)), this.customStrengthOptions.containsUppercaseLetter && (e.containsUppercaseLetter || (e.containsUppercaseLetter = r)), this.customStrengthOptions.containsNumericCharacter && (e.containsNumericCharacter || (e.containsNumericCharacter = i)), this.customStrengthOptions.containsNonAlphanumericCharacter && (e.containsNonAlphanumericCharacter || (e.containsNonAlphanumericCharacter = o));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Dp {
  constructor(e, t, r, i) {
    this.app = e, this.heartbeatServiceProvider = t, this.appCheckServiceProvider = r, this.config = i, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new la(this), this.idTokenSubscription = new la(this), this.beforeStateQueue = new Pp(this), this.redirectUser = null, this.isProactiveRefreshEnabled = !1, this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1, this._canInitEmulator = !0, this._isInitialized = !1, this._deleted = !1, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = Vl, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this._projectPasswordPolicy = null, this._tenantPasswordPolicies = {}, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = { appVerificationDisabledForTesting: !1 }, this.frameworks = [], this.name = e.name, this.clientVersion = i.sdkClientVersion;
  }
  _initializeWithPersistence(e, t) {
    return t && (this._popupRedirectResolver = Le(t)), this._initializationPromise = this.queue(async () => {
      var r, i;
      if (!this._deleted && (this.persistenceManager = await Ct.create(this, e), !this._deleted)) {
        if (!((r = this._popupRedirectResolver) === null || r === void 0) && r._shouldInitProactively)
          try {
            await this._popupRedirectResolver._initialize(this);
          } catch {
          }
        await this.initializeCurrentUser(t), this.lastNotifiedUid = ((i = this.currentUser) === null || i === void 0 ? void 0 : i.uid) || null, !this._deleted && (this._isInitialized = !0);
      }
    }), this._initializationPromise;
  }
  /**
   * If the persistence is changed in another window, the user manager will let us know
   */
  async _onStorageEvent() {
    if (this._deleted)
      return;
    const e = await this.assertedPersistence.getCurrentUser();
    if (!(!this.currentUser && !e)) {
      if (this.currentUser && e && this.currentUser.uid === e.uid) {
        this._currentUser._assign(e), await this.currentUser.getIdToken();
        return;
      }
      await this._updateCurrentUser(
        e,
        /* skipBeforeStateCallbacks */
        !0
      );
    }
  }
  async initializeCurrentUserFromIdToken(e) {
    try {
      const t = await Fl(this, { idToken: e }), r = await Me._fromGetAccountInfoResponse(this, t, e);
      await this.directlySetCurrentUser(r);
    } catch (t) {
      console.warn("FirebaseServerApp could not login user with provided authIdToken: ", t), await this.directlySetCurrentUser(null);
    }
  }
  async initializeCurrentUser(e) {
    var t;
    if (Ze(this.app)) {
      const l = this.app.settings.authIdToken;
      return l ? new Promise((u) => {
        setTimeout(() => this.initializeCurrentUserFromIdToken(l).then(u, u));
      }) : this.directlySetCurrentUser(null);
    }
    const r = await this.assertedPersistence.getCurrentUser();
    let i = r, o = !1;
    if (e && this.config.authDomain) {
      await this.getOrInitRedirectPersistenceManager();
      const l = (t = this.redirectUser) === null || t === void 0 ? void 0 : t._redirectEventId, u = i == null ? void 0 : i._redirectEventId, h = await this.tryRedirectSignIn(e);
      (!l || l === u) && (h != null && h.user) && (i = h.user, o = !0);
    }
    if (!i)
      return this.directlySetCurrentUser(null);
    if (!i._redirectEventId) {
      if (o)
        try {
          await this.beforeStateQueue.runMiddleware(i);
        } catch (l) {
          i = r, this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(l));
        }
      return i ? this.reloadAndSetCurrentUserOrClear(i) : this.directlySetCurrentUser(null);
    }
    return V(
      this._popupRedirectResolver,
      this,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === i._redirectEventId ? this.directlySetCurrentUser(i) : this.reloadAndSetCurrentUserOrClear(i);
  }
  async tryRedirectSignIn(e) {
    let t = null;
    try {
      t = await this._popupRedirectResolver._completeRedirectFn(this, e, !0);
    } catch {
      await this._setRedirectUser(null);
    }
    return t;
  }
  async reloadAndSetCurrentUserOrClear(e) {
    try {
      await Rr(e);
    } catch (t) {
      if ((t == null ? void 0 : t.code) !== "auth/network-request-failed")
        return this.directlySetCurrentUser(null);
    }
    return this.directlySetCurrentUser(e);
  }
  useDeviceLanguage() {
    this.languageCode = fp();
  }
  async _delete() {
    this._deleted = !0;
  }
  async updateCurrentUser(e) {
    if (Ze(this.app))
      return Promise.reject(pt(this));
    const t = e ? Ce(e) : null;
    return t && V(
      t.auth.config.apiKey === this.config.apiKey,
      this,
      "invalid-user-token"
      /* AuthErrorCode.INVALID_AUTH */
    ), this._updateCurrentUser(t && t._clone(this));
  }
  async _updateCurrentUser(e, t = !1) {
    if (!this._deleted)
      return e && V(
        this.tenantId === e.tenantId,
        this,
        "tenant-id-mismatch"
        /* AuthErrorCode.TENANT_ID_MISMATCH */
      ), t || await this.beforeStateQueue.runMiddleware(e), this.queue(async () => {
        await this.directlySetCurrentUser(e), this.notifyAuthListeners();
      });
  }
  async signOut() {
    return Ze(this.app) ? Promise.reject(pt(this)) : (await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(
      null,
      /* skipBeforeStateCallbacks */
      !0
    ));
  }
  setPersistence(e) {
    return Ze(this.app) ? Promise.reject(pt(this)) : this.queue(async () => {
      await this.assertedPersistence.setPersistence(Le(e));
    });
  }
  _getRecaptchaConfig() {
    return this.tenantId == null ? this._agentRecaptchaConfig : this._tenantRecaptchaConfigs[this.tenantId];
  }
  async validatePassword(e) {
    this._getPasswordPolicyInternal() || await this._updatePasswordPolicy();
    const t = this._getPasswordPolicyInternal();
    return t.schemaVersion !== this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION ? Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version", {})) : t.validatePassword(e);
  }
  _getPasswordPolicyInternal() {
    return this.tenantId === null ? this._projectPasswordPolicy : this._tenantPasswordPolicies[this.tenantId];
  }
  async _updatePasswordPolicy() {
    const e = await Cp(this), t = new Np(e);
    this.tenantId === null ? this._projectPasswordPolicy = t : this._tenantPasswordPolicies[this.tenantId] = t;
  }
  _getPersistence() {
    return this.assertedPersistence.persistence.type;
  }
  _updateErrorMap(e) {
    this._errorFactory = new An("auth", "Firebase", e());
  }
  onAuthStateChanged(e, t, r) {
    return this.registerStateListener(this.authStateSubscription, e, t, r);
  }
  beforeAuthStateChanged(e, t) {
    return this.beforeStateQueue.pushCallback(e, t);
  }
  onIdTokenChanged(e, t, r) {
    return this.registerStateListener(this.idTokenSubscription, e, t, r);
  }
  authStateReady() {
    return new Promise((e, t) => {
      if (this.currentUser)
        e();
      else {
        const r = this.onAuthStateChanged(() => {
          r(), e();
        }, t);
      }
    });
  }
  /**
   * Revokes the given access token. Currently only supports Apple OAuth access tokens.
   */
  async revokeAccessToken(e) {
    if (this.currentUser) {
      const t = await this.currentUser.getIdToken(), r = {
        providerId: "apple.com",
        tokenType: "ACCESS_TOKEN",
        token: e,
        idToken: t
      };
      this.tenantId != null && (r.tenantId = this.tenantId), await Rp(this, r);
    }
  }
  toJSON() {
    var e;
    return {
      apiKey: this.config.apiKey,
      authDomain: this.config.authDomain,
      appName: this.name,
      currentUser: (e = this._currentUser) === null || e === void 0 ? void 0 : e.toJSON()
    };
  }
  async _setRedirectUser(e, t) {
    const r = await this.getOrInitRedirectPersistenceManager(t);
    return e === null ? r.removeCurrentUser() : r.setCurrentUser(e);
  }
  async getOrInitRedirectPersistenceManager(e) {
    if (!this.redirectPersistenceManager) {
      const t = e && Le(e) || this._popupRedirectResolver;
      V(
        t,
        this,
        "argument-error"
        /* AuthErrorCode.ARGUMENT_ERROR */
      ), this.redirectPersistenceManager = await Ct.create(
        this,
        [Le(t._redirectPersistence)],
        "redirectUser"
        /* KeyName.REDIRECT_USER */
      ), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
    }
    return this.redirectPersistenceManager;
  }
  async _redirectUserForId(e) {
    var t, r;
    return this._isInitialized && await this.queue(async () => {
    }), ((t = this._currentUser) === null || t === void 0 ? void 0 : t._redirectEventId) === e ? this._currentUser : ((r = this.redirectUser) === null || r === void 0 ? void 0 : r._redirectEventId) === e ? this.redirectUser : null;
  }
  async _persistUserIfCurrent(e) {
    if (e === this.currentUser)
      return this.queue(async () => this.directlySetCurrentUser(e));
  }
  /** Notifies listeners only if the user is current */
  _notifyListenersIfCurrent(e) {
    e === this.currentUser && this.notifyAuthListeners();
  }
  _key() {
    return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
  }
  _startProactiveRefresh() {
    this.isProactiveRefreshEnabled = !0, this.currentUser && this._currentUser._startProactiveRefresh();
  }
  _stopProactiveRefresh() {
    this.isProactiveRefreshEnabled = !1, this.currentUser && this._currentUser._stopProactiveRefresh();
  }
  /** Returns the current user cast as the internal type */
  get _currentUser() {
    return this.currentUser;
  }
  notifyAuthListeners() {
    var e, t;
    if (!this._isInitialized)
      return;
    this.idTokenSubscription.next(this.currentUser);
    const r = (t = (e = this.currentUser) === null || e === void 0 ? void 0 : e.uid) !== null && t !== void 0 ? t : null;
    this.lastNotifiedUid !== r && (this.lastNotifiedUid = r, this.authStateSubscription.next(this.currentUser));
  }
  registerStateListener(e, t, r, i) {
    if (this._deleted)
      return () => {
      };
    const o = typeof t == "function" ? t : t.next.bind(t);
    let l = !1;
    const u = this._isInitialized ? Promise.resolve() : this._initializationPromise;
    if (V(
      u,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), u.then(() => {
      l || o(this.currentUser);
    }), typeof t == "function") {
      const h = e.addObserver(t, r, i);
      return () => {
        l = !0, h();
      };
    } else {
      const h = e.addObserver(t);
      return () => {
        l = !0, h();
      };
    }
  }
  /**
   * Unprotected (from race conditions) method to set the current user. This
   * should only be called from within a queued callback. This is necessary
   * because the queue shouldn't rely on another queued callback.
   */
  async directlySetCurrentUser(e) {
    this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(), e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(), this.currentUser = e, e ? await this.assertedPersistence.setCurrentUser(e) : await this.assertedPersistence.removeCurrentUser();
  }
  queue(e) {
    return this.operations = this.operations.then(e, e), this.operations;
  }
  get assertedPersistence() {
    return V(
      this.persistenceManager,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.persistenceManager;
  }
  _logFramework(e) {
    !e || this.frameworks.includes(e) || (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = Jl(this.config.clientPlatform, this._getFrameworks()));
  }
  _getFrameworks() {
    return this.frameworks;
  }
  async _getAdditionalHeaders() {
    var e;
    const t = {
      "X-Client-Version": this.clientVersion
    };
    this.app.options.appId && (t[
      "X-Firebase-gmpid"
      /* HttpHeader.X_FIREBASE_GMPID */
    ] = this.app.options.appId);
    const r = await ((e = this.heartbeatServiceProvider.getImmediate({
      optional: !0
    })) === null || e === void 0 ? void 0 : e.getHeartbeatsHeader());
    r && (t[
      "X-Firebase-Client"
      /* HttpHeader.X_FIREBASE_CLIENT */
    ] = r);
    const i = await this._getAppCheckToken();
    return i && (t[
      "X-Firebase-AppCheck"
      /* HttpHeader.X_FIREBASE_APP_CHECK */
    ] = i), t;
  }
  async _getAppCheckToken() {
    var e;
    const t = await ((e = this.appCheckServiceProvider.getImmediate({ optional: !0 })) === null || e === void 0 ? void 0 : e.getToken());
    return t != null && t.error && up(`Error while retrieving App Check token: ${t.error}`), t == null ? void 0 : t.token;
  }
}
function gs(n) {
  return Ce(n);
}
class la {
  constructor(e) {
    this.auth = e, this.observer = null, this.addObserver = Eu((t) => this.observer = t);
  }
  get next() {
    return V(
      this.observer,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.observer.next.bind(this.observer);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let _s = {
  async loadJS() {
    throw new Error("Unable to load external scripts");
  },
  recaptchaV2Script: "",
  recaptchaEnterpriseScript: "",
  gapiScript: ""
};
function Op(n) {
  _s = n;
}
function Vp(n) {
  return _s.loadJS(n);
}
function Mp() {
  return _s.gapiScript;
}
function Lp(n) {
  return `__${n}${Math.floor(Math.random() * 1e6)}`;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function xp(n, e) {
  const t = qi(n, "auth");
  if (t.isInitialized()) {
    const i = t.getImmediate(), o = t.getOptions();
    if (dr(o, e ?? {}))
      return i;
    Be(
      i,
      "already-initialized"
      /* AuthErrorCode.ALREADY_INITIALIZED */
    );
  }
  return t.initialize({ options: e });
}
function Up(n, e) {
  const t = (e == null ? void 0 : e.persistence) || [], r = (Array.isArray(t) ? t : [t]).map(Le);
  e != null && e.errorMap && n._updateErrorMap(e.errorMap), n._initializeWithPersistence(r, e == null ? void 0 : e.popupRedirectResolver);
}
function Fp(n, e, t) {
  const r = gs(n);
  V(
    r._canInitEmulator,
    r,
    "emulator-config-failed"
    /* AuthErrorCode.EMULATOR_CONFIG_FAILED */
  ), V(
    /^https?:\/\//.test(e),
    r,
    "invalid-emulator-scheme"
    /* AuthErrorCode.INVALID_EMULATOR_SCHEME */
  );
  const i = !1, o = Xl(e), { host: l, port: u } = Bp(e), h = u === null ? "" : `:${u}`;
  r.config.emulator = { url: `${o}//${l}${h}/` }, r.settings.appVerificationDisabledForTesting = !0, r.emulatorConfig = Object.freeze({
    host: l,
    port: u,
    protocol: o.replace(":", ""),
    options: Object.freeze({ disableWarnings: i })
  }), jp();
}
function Xl(n) {
  const e = n.indexOf(":");
  return e < 0 ? "" : n.substr(0, e + 1);
}
function Bp(n) {
  const e = Xl(n), t = /(\/\/)?([^?#/]+)/.exec(n.substr(e.length));
  if (!t)
    return { host: "", port: null };
  const r = t[2].split("@").pop() || "", i = /^(\[[^\]]+\])(:|$)/.exec(r);
  if (i) {
    const o = i[1];
    return { host: o, port: ca(r.substr(o.length + 1)) };
  } else {
    const [o, l] = r.split(":");
    return { host: o, port: ca(l) };
  }
}
function ca(n) {
  if (!n)
    return null;
  const e = Number(n);
  return isNaN(e) ? null : e;
}
function jp() {
  function n() {
    const e = document.createElement("p"), t = e.style;
    e.innerText = "Running in emulator mode. Do not use with production credentials.", t.position = "fixed", t.width = "100%", t.backgroundColor = "#ffffff", t.border = ".1em solid #000000", t.color = "#b50000", t.bottom = "0px", t.left = "0px", t.margin = "0px", t.zIndex = "10000", t.textAlign = "center", e.classList.add("firebase-emulator-warning"), document.body.appendChild(e);
  }
  typeof console < "u" && typeof console.info == "function" && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."), typeof window < "u" && typeof document < "u" && (document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", n) : n());
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Yl {
  /** @internal */
  constructor(e, t) {
    this.providerId = e, this.signInMethod = t;
  }
  /**
   * Returns a JSON-serializable representation of this object.
   *
   * @returns a JSON-serializable representation of this object.
   */
  toJSON() {
    return Ve("not implemented");
  }
  /** @internal */
  _getIdTokenResponse(e) {
    return Ve("not implemented");
  }
  /** @internal */
  _linkToIdToken(e, t) {
    return Ve("not implemented");
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    return Ve("not implemented");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function kt(n, e) {
  return gp(n, "POST", "/v1/accounts:signInWithIdp", fs(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const $p = "http://localhost";
class vt extends Yl {
  constructor() {
    super(...arguments), this.pendingToken = null;
  }
  /** @internal */
  static _fromParams(e) {
    const t = new vt(e.providerId, e.signInMethod);
    return e.idToken || e.accessToken ? (e.idToken && (t.idToken = e.idToken), e.accessToken && (t.accessToken = e.accessToken), e.nonce && !e.pendingToken && (t.nonce = e.nonce), e.pendingToken && (t.pendingToken = e.pendingToken)) : e.oauthToken && e.oauthTokenSecret ? (t.accessToken = e.oauthToken, t.secret = e.oauthTokenSecret) : Be(
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), t;
  }
  /** {@inheritdoc AuthCredential.toJSON}  */
  toJSON() {
    return {
      idToken: this.idToken,
      accessToken: this.accessToken,
      secret: this.secret,
      nonce: this.nonce,
      pendingToken: this.pendingToken,
      providerId: this.providerId,
      signInMethod: this.signInMethod
    };
  }
  /**
   * Static method to deserialize a JSON representation of an object into an
   * {@link  AuthCredential}.
   *
   * @param json - Input can be either Object or the stringified representation of the object.
   * When string is provided, JSON.parse would be called first.
   *
   * @returns If the JSON input does not represent an {@link  AuthCredential}, null is returned.
   */
  static fromJSON(e) {
    const t = typeof e == "string" ? JSON.parse(e) : e, { providerId: r, signInMethod: i } = t, o = us(t, ["providerId", "signInMethod"]);
    if (!r || !i)
      return null;
    const l = new vt(r, i);
    return l.idToken = o.idToken || void 0, l.accessToken = o.accessToken || void 0, l.secret = o.secret, l.nonce = o.nonce, l.pendingToken = o.pendingToken || null, l;
  }
  /** @internal */
  _getIdTokenResponse(e) {
    const t = this.buildRequest();
    return kt(e, t);
  }
  /** @internal */
  _linkToIdToken(e, t) {
    const r = this.buildRequest();
    return r.idToken = t, kt(e, r);
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    const t = this.buildRequest();
    return t.autoCreate = !1, kt(e, t);
  }
  buildRequest() {
    const e = {
      requestUri: $p,
      returnSecureToken: !0
    };
    if (this.pendingToken)
      e.pendingToken = this.pendingToken;
    else {
      const t = {};
      this.idToken && (t.id_token = this.idToken), this.accessToken && (t.access_token = this.accessToken), this.secret && (t.oauth_token_secret = this.secret), t.providerId = this.providerId, this.nonce && !this.pendingToken && (t.nonce = this.nonce), e.postBody = Rn(t);
    }
    return e;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zl {
  /**
   * Constructor for generic OAuth providers.
   *
   * @param providerId - Provider for which credentials should be generated.
   */
  constructor(e) {
    this.providerId = e, this.defaultLanguageCode = null, this.customParameters = {};
  }
  /**
   * Set the language gode.
   *
   * @param languageCode - language code
   */
  setDefaultLanguage(e) {
    this.defaultLanguageCode = e;
  }
  /**
   * Sets the OAuth custom parameters to pass in an OAuth request for popup and redirect sign-in
   * operations.
   *
   * @remarks
   * For a detailed list, check the reserved required OAuth 2.0 parameters such as `client_id`,
   * `redirect_uri`, `scope`, `response_type`, and `state` are not allowed and will be ignored.
   *
   * @param customOAuthParameters - The custom OAuth parameters to pass in the OAuth request.
   */
  setCustomParameters(e) {
    return this.customParameters = e, this;
  }
  /**
   * Retrieve the current list of {@link CustomParameters}.
   */
  getCustomParameters() {
    return this.customParameters;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Nn extends Zl {
  constructor() {
    super(...arguments), this.scopes = [];
  }
  /**
   * Add an OAuth scope to the credential.
   *
   * @param scope - Provider OAuth scope to add.
   */
  addScope(e) {
    return this.scopes.includes(e) || this.scopes.push(e), this;
  }
  /**
   * Retrieve the current list of OAuth scopes.
   */
  getScopes() {
    return [...this.scopes];
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qe extends Nn {
  constructor() {
    super(
      "facebook.com"
      /* ProviderId.FACEBOOK */
    );
  }
  /**
   * Creates a credential for Facebook.
   *
   * @example
   * ```javascript
   * // `event` from the Facebook auth.authResponseChange callback.
   * const credential = FacebookAuthProvider.credential(event.authResponse.accessToken);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param accessToken - Facebook access token.
   */
  static credential(e) {
    return vt._fromParams({
      providerId: Qe.PROVIDER_ID,
      signInMethod: Qe.FACEBOOK_SIGN_IN_METHOD,
      accessToken: e
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return Qe.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return Qe.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken)
      return null;
    try {
      return Qe.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
Qe.FACEBOOK_SIGN_IN_METHOD = "facebook.com";
Qe.PROVIDER_ID = "facebook.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Je extends Nn {
  constructor() {
    super(
      "google.com"
      /* ProviderId.GOOGLE */
    ), this.addScope("profile");
  }
  /**
   * Creates a credential for Google. At least one of ID token and access token is required.
   *
   * @example
   * ```javascript
   * // \`googleUser\` from the onsuccess Google Sign In callback.
   * const credential = GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param idToken - Google ID token.
   * @param accessToken - Google access token.
   */
  static credential(e, t) {
    return vt._fromParams({
      providerId: Je.PROVIDER_ID,
      signInMethod: Je.GOOGLE_SIGN_IN_METHOD,
      idToken: e,
      accessToken: t
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return Je.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return Je.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e)
      return null;
    const { oauthIdToken: t, oauthAccessToken: r } = e;
    if (!t && !r)
      return null;
    try {
      return Je.credential(t, r);
    } catch {
      return null;
    }
  }
}
Je.GOOGLE_SIGN_IN_METHOD = "google.com";
Je.PROVIDER_ID = "google.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Xe extends Nn {
  constructor() {
    super(
      "github.com"
      /* ProviderId.GITHUB */
    );
  }
  /**
   * Creates a credential for GitHub.
   *
   * @param accessToken - GitHub access token.
   */
  static credential(e) {
    return vt._fromParams({
      providerId: Xe.PROVIDER_ID,
      signInMethod: Xe.GITHUB_SIGN_IN_METHOD,
      accessToken: e
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return Xe.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return Xe.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken)
      return null;
    try {
      return Xe.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
Xe.GITHUB_SIGN_IN_METHOD = "github.com";
Xe.PROVIDER_ID = "github.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ye extends Nn {
  constructor() {
    super(
      "twitter.com"
      /* ProviderId.TWITTER */
    );
  }
  /**
   * Creates a credential for Twitter.
   *
   * @param token - Twitter access token.
   * @param secret - Twitter secret.
   */
  static credential(e, t) {
    return vt._fromParams({
      providerId: Ye.PROVIDER_ID,
      signInMethod: Ye.TWITTER_SIGN_IN_METHOD,
      oauthToken: e,
      oauthTokenSecret: t
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return Ye.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return Ye.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e)
      return null;
    const { oauthAccessToken: t, oauthTokenSecret: r } = e;
    if (!t || !r)
      return null;
    try {
      return Ye.credential(t, r);
    } catch {
      return null;
    }
  }
}
Ye.TWITTER_SIGN_IN_METHOD = "twitter.com";
Ye.PROVIDER_ID = "twitter.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class xt {
  constructor(e) {
    this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType;
  }
  static async _fromIdTokenResponse(e, t, r, i = !1) {
    const o = await Me._fromIdTokenResponse(e, r, i), l = ua(r);
    return new xt({
      user: o,
      providerId: l,
      _tokenResponse: r,
      operationType: t
    });
  }
  static async _forOperation(e, t, r) {
    await e._updateTokensIfNecessary(
      r,
      /* reload */
      !0
    );
    const i = ua(r);
    return new xt({
      user: e,
      providerId: i,
      _tokenResponse: r,
      operationType: t
    });
  }
}
function ua(n) {
  return n.providerId ? n.providerId : "phoneNumber" in n ? "phone" : null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class br extends $e {
  constructor(e, t, r, i) {
    var o;
    super(t.code, t.message), this.operationType = r, this.user = i, Object.setPrototypeOf(this, br.prototype), this.customData = {
      appName: e.name,
      tenantId: (o = e.tenantId) !== null && o !== void 0 ? o : void 0,
      _serverResponse: t.customData._serverResponse,
      operationType: r
    };
  }
  static _fromErrorAndOperation(e, t, r, i) {
    return new br(e, t, r, i);
  }
}
function ec(n, e, t, r) {
  return (e === "reauthenticate" ? t._getReauthenticationResolver(n) : t._getIdTokenResponse(n)).catch((o) => {
    throw o.code === "auth/multi-factor-auth-required" ? br._fromErrorAndOperation(n, o, e, r) : o;
  });
}
async function Hp(n, e, t = !1) {
  const r = await wn(n, e._linkToIdToken(n.auth, await n.getIdToken()), t);
  return xt._forOperation(n, "link", r);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function zp(n, e, t = !1) {
  const { auth: r } = n;
  if (Ze(r.app))
    return Promise.reject(pt(r));
  const i = "reauthenticate";
  try {
    const o = await wn(n, ec(r, i, e, n), t);
    V(
      o.idToken,
      r,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const l = ps(o.idToken);
    V(
      l,
      r,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const { sub: u } = l;
    return V(
      n.uid === u,
      r,
      "user-mismatch"
      /* AuthErrorCode.USER_MISMATCH */
    ), xt._forOperation(n, i, o);
  } catch (o) {
    throw (o == null ? void 0 : o.code) === "auth/user-not-found" && Be(
      r,
      "user-mismatch"
      /* AuthErrorCode.USER_MISMATCH */
    ), o;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function qp(n, e, t = !1) {
  if (Ze(n.app))
    return Promise.reject(pt(n));
  const r = "signIn", i = await ec(n, r, e), o = await xt._fromIdTokenResponse(n, r, i);
  return t || await n._updateCurrentUser(o.user), o;
}
function Gp(n, e, t, r) {
  return Ce(n).onIdTokenChanged(e, t, r);
}
function Kp(n, e, t) {
  return Ce(n).beforeAuthStateChanged(e, t);
}
const Sr = "__sak";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class tc {
  constructor(e, t) {
    this.storageRetriever = e, this.type = t;
  }
  _isAvailable() {
    try {
      return this.storage ? (this.storage.setItem(Sr, "1"), this.storage.removeItem(Sr), Promise.resolve(!0)) : Promise.resolve(!1);
    } catch {
      return Promise.resolve(!1);
    }
  }
  _set(e, t) {
    return this.storage.setItem(e, JSON.stringify(t)), Promise.resolve();
  }
  _get(e) {
    const t = this.storage.getItem(e);
    return Promise.resolve(t ? JSON.parse(t) : null);
  }
  _remove(e) {
    return this.storage.removeItem(e), Promise.resolve();
  }
  get storage() {
    return this.storageRetriever();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Wp = 1e3, Qp = 10;
class nc extends tc {
  constructor() {
    super(
      () => window.localStorage,
      "LOCAL"
      /* PersistenceType.LOCAL */
    ), this.boundEventHandler = (e, t) => this.onStorageEvent(e, t), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.fallbackToPolling = Ql(), this._shouldAllowMigration = !0;
  }
  forAllChangedKeys(e) {
    for (const t of Object.keys(this.listeners)) {
      const r = this.storage.getItem(t), i = this.localCache[t];
      r !== i && e(t, i, r);
    }
  }
  onStorageEvent(e, t = !1) {
    if (!e.key) {
      this.forAllChangedKeys((l, u, h) => {
        this.notifyListeners(l, h);
      });
      return;
    }
    const r = e.key;
    t ? this.detachListener() : this.stopPolling();
    const i = () => {
      const l = this.storage.getItem(r);
      !t && this.localCache[r] === l || this.notifyListeners(r, l);
    }, o = this.storage.getItem(r);
    Sp() && o !== e.newValue && e.newValue !== e.oldValue ? setTimeout(i, Qp) : i();
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const r = this.listeners[e];
    if (r)
      for (const i of Array.from(r))
        i(t && JSON.parse(t));
  }
  startPolling() {
    this.stopPolling(), this.pollTimer = setInterval(() => {
      this.forAllChangedKeys((e, t, r) => {
        this.onStorageEvent(
          new StorageEvent("storage", {
            key: e,
            oldValue: t,
            newValue: r
          }),
          /* poll */
          !0
        );
      });
    }, Wp);
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
  }
  attachListener() {
    window.addEventListener("storage", this.boundEventHandler);
  }
  detachListener() {
    window.removeEventListener("storage", this.boundEventHandler);
  }
  _addListener(e, t) {
    Object.keys(this.listeners).length === 0 && (this.fallbackToPolling ? this.startPolling() : this.attachListener()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this.localCache[e] = this.storage.getItem(e)), this.listeners[e].add(t);
  }
  _removeListener(e, t) {
    this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && (this.detachListener(), this.stopPolling());
  }
  // Update local cache on base operations:
  async _set(e, t) {
    await super._set(e, t), this.localCache[e] = JSON.stringify(t);
  }
  async _get(e) {
    const t = await super._get(e);
    return this.localCache[e] = JSON.stringify(t), t;
  }
  async _remove(e) {
    await super._remove(e), delete this.localCache[e];
  }
}
nc.type = "LOCAL";
const Jp = nc;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class rc extends tc {
  constructor() {
    super(
      () => window.sessionStorage,
      "SESSION"
      /* PersistenceType.SESSION */
    );
  }
  _addListener(e, t) {
  }
  _removeListener(e, t) {
  }
}
rc.type = "SESSION";
const ic = rc;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Xp(n) {
  return Promise.all(n.map(async (e) => {
    try {
      return {
        fulfilled: !0,
        value: await e
      };
    } catch (t) {
      return {
        fulfilled: !1,
        reason: t
      };
    }
  }));
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ur {
  constructor(e) {
    this.eventTarget = e, this.handlersMap = {}, this.boundEventHandler = this.handleEvent.bind(this);
  }
  /**
   * Obtain an instance of a Receiver for a given event target, if none exists it will be created.
   *
   * @param eventTarget - An event target (such as window or self) through which the underlying
   * messages will be received.
   */
  static _getInstance(e) {
    const t = this.receivers.find((i) => i.isListeningto(e));
    if (t)
      return t;
    const r = new Ur(e);
    return this.receivers.push(r), r;
  }
  isListeningto(e) {
    return this.eventTarget === e;
  }
  /**
   * Fans out a MessageEvent to the appropriate listeners.
   *
   * @remarks
   * Sends an {@link Status.ACK} upon receipt and a {@link Status.DONE} once all handlers have
   * finished processing.
   *
   * @param event - The MessageEvent.
   *
   */
  async handleEvent(e) {
    const t = e, { eventId: r, eventType: i, data: o } = t.data, l = this.handlersMap[i];
    if (!(l != null && l.size))
      return;
    t.ports[0].postMessage({
      status: "ack",
      eventId: r,
      eventType: i
    });
    const u = Array.from(l).map(async (f) => f(t.origin, o)), h = await Xp(u);
    t.ports[0].postMessage({
      status: "done",
      eventId: r,
      eventType: i,
      response: h
    });
  }
  /**
   * Subscribe an event handler for a particular event.
   *
   * @param eventType - Event name to subscribe to.
   * @param eventHandler - The event handler which should receive the events.
   *
   */
  _subscribe(e, t) {
    Object.keys(this.handlersMap).length === 0 && this.eventTarget.addEventListener("message", this.boundEventHandler), this.handlersMap[e] || (this.handlersMap[e] = /* @__PURE__ */ new Set()), this.handlersMap[e].add(t);
  }
  /**
   * Unsubscribe an event handler from a particular event.
   *
   * @param eventType - Event name to unsubscribe from.
   * @param eventHandler - Optional event handler, if none provided, unsubscribe all handlers on this event.
   *
   */
  _unsubscribe(e, t) {
    this.handlersMap[e] && t && this.handlersMap[e].delete(t), (!t || this.handlersMap[e].size === 0) && delete this.handlersMap[e], Object.keys(this.handlersMap).length === 0 && this.eventTarget.removeEventListener("message", this.boundEventHandler);
  }
}
Ur.receivers = [];
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ys(n = "", e = 10) {
  let t = "";
  for (let r = 0; r < e; r++)
    t += Math.floor(Math.random() * 10);
  return n + t;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Yp {
  constructor(e) {
    this.target = e, this.handlers = /* @__PURE__ */ new Set();
  }
  /**
   * Unsubscribe the handler and remove it from our tracking Set.
   *
   * @param handler - The handler to unsubscribe.
   */
  removeMessageHandler(e) {
    e.messageChannel && (e.messageChannel.port1.removeEventListener("message", e.onMessage), e.messageChannel.port1.close()), this.handlers.delete(e);
  }
  /**
   * Send a message to the Receiver located at {@link target}.
   *
   * @remarks
   * We'll first wait a bit for an ACK , if we get one we will wait significantly longer until the
   * receiver has had a chance to fully process the event.
   *
   * @param eventType - Type of event to send.
   * @param data - The payload of the event.
   * @param timeout - Timeout for waiting on an ACK from the receiver.
   *
   * @returns An array of settled promises from all the handlers that were listening on the receiver.
   */
  async _send(e, t, r = 50) {
    const i = typeof MessageChannel < "u" ? new MessageChannel() : null;
    if (!i)
      throw new Error(
        "connection_unavailable"
        /* _MessageError.CONNECTION_UNAVAILABLE */
      );
    let o, l;
    return new Promise((u, h) => {
      const f = ys("", 20);
      i.port1.start();
      const y = setTimeout(() => {
        h(new Error(
          "unsupported_event"
          /* _MessageError.UNSUPPORTED_EVENT */
        ));
      }, r);
      l = {
        messageChannel: i,
        onMessage(w) {
          const R = w;
          if (R.data.eventId === f)
            switch (R.data.status) {
              case "ack":
                clearTimeout(y), o = setTimeout(
                  () => {
                    h(new Error(
                      "timeout"
                      /* _MessageError.TIMEOUT */
                    ));
                  },
                  3e3
                  /* _TimeoutDuration.COMPLETION */
                );
                break;
              case "done":
                clearTimeout(o), u(R.data.response);
                break;
              default:
                clearTimeout(y), clearTimeout(o), h(new Error(
                  "invalid_response"
                  /* _MessageError.INVALID_RESPONSE */
                ));
                break;
            }
        }
      }, this.handlers.add(l), i.port1.addEventListener("message", l.onMessage), this.target.postMessage({
        eventType: e,
        eventId: f,
        data: t
      }, [i.port2]);
    }).finally(() => {
      l && this.removeMessageHandler(l);
    });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Pe() {
  return window;
}
function Zp(n) {
  Pe().location.href = n;
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function sc() {
  return typeof Pe().WorkerGlobalScope < "u" && typeof Pe().importScripts == "function";
}
async function em() {
  if (!(navigator != null && navigator.serviceWorker))
    return null;
  try {
    return (await navigator.serviceWorker.ready).active;
  } catch {
    return null;
  }
}
function tm() {
  var n;
  return ((n = navigator == null ? void 0 : navigator.serviceWorker) === null || n === void 0 ? void 0 : n.controller) || null;
}
function nm() {
  return sc() ? self : null;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const oc = "firebaseLocalStorageDb", rm = 1, Pr = "firebaseLocalStorage", ac = "fbase_key";
class Dn {
  constructor(e) {
    this.request = e;
  }
  toPromise() {
    return new Promise((e, t) => {
      this.request.addEventListener("success", () => {
        e(this.request.result);
      }), this.request.addEventListener("error", () => {
        t(this.request.error);
      });
    });
  }
}
function Fr(n, e) {
  return n.transaction([Pr], e ? "readwrite" : "readonly").objectStore(Pr);
}
function im() {
  const n = indexedDB.deleteDatabase(oc);
  return new Dn(n).toPromise();
}
function ji() {
  const n = indexedDB.open(oc, rm);
  return new Promise((e, t) => {
    n.addEventListener("error", () => {
      t(n.error);
    }), n.addEventListener("upgradeneeded", () => {
      const r = n.result;
      try {
        r.createObjectStore(Pr, { keyPath: ac });
      } catch (i) {
        t(i);
      }
    }), n.addEventListener("success", async () => {
      const r = n.result;
      r.objectStoreNames.contains(Pr) ? e(r) : (r.close(), await im(), e(await ji()));
    });
  });
}
async function ha(n, e, t) {
  const r = Fr(n, !0).put({
    [ac]: e,
    value: t
  });
  return new Dn(r).toPromise();
}
async function sm(n, e) {
  const t = Fr(n, !1).get(e), r = await new Dn(t).toPromise();
  return r === void 0 ? null : r.value;
}
function da(n, e) {
  const t = Fr(n, !0).delete(e);
  return new Dn(t).toPromise();
}
const om = 800, am = 3;
class lc {
  constructor() {
    this.type = "LOCAL", this._shouldAllowMigration = !0, this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.pendingWrites = 0, this.receiver = null, this.sender = null, this.serviceWorkerReceiverAvailable = !1, this.activeServiceWorker = null, this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then(() => {
    }, () => {
    });
  }
  async _openDb() {
    return this.db ? this.db : (this.db = await ji(), this.db);
  }
  async _withRetries(e) {
    let t = 0;
    for (; ; )
      try {
        const r = await this._openDb();
        return await e(r);
      } catch (r) {
        if (t++ > am)
          throw r;
        this.db && (this.db.close(), this.db = void 0);
      }
  }
  /**
   * IndexedDB events do not propagate from the main window to the worker context.  We rely on a
   * postMessage interface to send these events to the worker ourselves.
   */
  async initializeServiceWorkerMessaging() {
    return sc() ? this.initializeReceiver() : this.initializeSender();
  }
  /**
   * As the worker we should listen to events from the main window.
   */
  async initializeReceiver() {
    this.receiver = Ur._getInstance(nm()), this.receiver._subscribe("keyChanged", async (e, t) => ({
      keyProcessed: (await this._poll()).includes(t.key)
    })), this.receiver._subscribe("ping", async (e, t) => [
      "keyChanged"
      /* _EventType.KEY_CHANGED */
    ]);
  }
  /**
   * As the main window, we should let the worker know when keys change (set and remove).
   *
   * @remarks
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready | ServiceWorkerContainer.ready}
   * may not resolve.
   */
  async initializeSender() {
    var e, t;
    if (this.activeServiceWorker = await em(), !this.activeServiceWorker)
      return;
    this.sender = new Yp(this.activeServiceWorker);
    const r = await this.sender._send(
      "ping",
      {},
      800
      /* _TimeoutDuration.LONG_ACK */
    );
    r && !((e = r[0]) === null || e === void 0) && e.fulfilled && !((t = r[0]) === null || t === void 0) && t.value.includes(
      "keyChanged"
      /* _EventType.KEY_CHANGED */
    ) && (this.serviceWorkerReceiverAvailable = !0);
  }
  /**
   * Let the worker know about a changed key, the exact key doesn't technically matter since the
   * worker will just trigger a full sync anyway.
   *
   * @remarks
   * For now, we only support one service worker per page.
   *
   * @param key - Storage key which changed.
   */
  async notifyServiceWorker(e) {
    if (!(!this.sender || !this.activeServiceWorker || tm() !== this.activeServiceWorker))
      try {
        await this.sender._send(
          "keyChanged",
          { key: e },
          // Use long timeout if receiver has previously responded to a ping from us.
          this.serviceWorkerReceiverAvailable ? 800 : 50
          /* _TimeoutDuration.ACK */
        );
      } catch {
      }
  }
  async _isAvailable() {
    try {
      if (!indexedDB)
        return !1;
      const e = await ji();
      return await ha(e, Sr, "1"), await da(e, Sr), !0;
    } catch {
    }
    return !1;
  }
  async _withPendingWrite(e) {
    this.pendingWrites++;
    try {
      await e();
    } finally {
      this.pendingWrites--;
    }
  }
  async _set(e, t) {
    return this._withPendingWrite(async () => (await this._withRetries((r) => ha(r, e, t)), this.localCache[e] = t, this.notifyServiceWorker(e)));
  }
  async _get(e) {
    const t = await this._withRetries((r) => sm(r, e));
    return this.localCache[e] = t, t;
  }
  async _remove(e) {
    return this._withPendingWrite(async () => (await this._withRetries((t) => da(t, e)), delete this.localCache[e], this.notifyServiceWorker(e)));
  }
  async _poll() {
    const e = await this._withRetries((i) => {
      const o = Fr(i, !1).getAll();
      return new Dn(o).toPromise();
    });
    if (!e)
      return [];
    if (this.pendingWrites !== 0)
      return [];
    const t = [], r = /* @__PURE__ */ new Set();
    if (e.length !== 0)
      for (const { fbase_key: i, value: o } of e)
        r.add(i), JSON.stringify(this.localCache[i]) !== JSON.stringify(o) && (this.notifyListeners(i, o), t.push(i));
    for (const i of Object.keys(this.localCache))
      this.localCache[i] && !r.has(i) && (this.notifyListeners(i, null), t.push(i));
    return t;
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const r = this.listeners[e];
    if (r)
      for (const i of Array.from(r))
        i(t);
  }
  startPolling() {
    this.stopPolling(), this.pollTimer = setInterval(async () => this._poll(), om);
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
  }
  _addListener(e, t) {
    Object.keys(this.listeners).length === 0 && this.startPolling(), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this._get(e)), this.listeners[e].add(t);
  }
  _removeListener(e, t) {
    this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && this.stopPolling();
  }
}
lc.type = "LOCAL";
const lm = lc;
new kn(3e4, 6e4);
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function cm(n, e) {
  return e ? Le(e) : (V(
    n._popupRedirectResolver,
    n,
    "argument-error"
    /* AuthErrorCode.ARGUMENT_ERROR */
  ), n._popupRedirectResolver);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class vs extends Yl {
  constructor(e) {
    super(
      "custom",
      "custom"
      /* ProviderId.CUSTOM */
    ), this.params = e;
  }
  _getIdTokenResponse(e) {
    return kt(e, this._buildIdpRequest());
  }
  _linkToIdToken(e, t) {
    return kt(e, this._buildIdpRequest(t));
  }
  _getReauthenticationResolver(e) {
    return kt(e, this._buildIdpRequest());
  }
  _buildIdpRequest(e) {
    const t = {
      requestUri: this.params.requestUri,
      sessionId: this.params.sessionId,
      postBody: this.params.postBody,
      tenantId: this.params.tenantId,
      pendingToken: this.params.pendingToken,
      returnSecureToken: !0,
      returnIdpCredential: !0
    };
    return e && (t.idToken = e), t;
  }
}
function um(n) {
  return qp(n.auth, new vs(n), n.bypassAuthState);
}
function hm(n) {
  const { auth: e, user: t } = n;
  return V(
    t,
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), zp(t, new vs(n), n.bypassAuthState);
}
async function dm(n) {
  const { auth: e, user: t } = n;
  return V(
    t,
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), Hp(t, new vs(n), n.bypassAuthState);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class cc {
  constructor(e, t, r, i, o = !1) {
    this.auth = e, this.resolver = r, this.user = i, this.bypassAuthState = o, this.pendingPromise = null, this.eventManager = null, this.filter = Array.isArray(t) ? t : [t];
  }
  execute() {
    return new Promise(async (e, t) => {
      this.pendingPromise = { resolve: e, reject: t };
      try {
        this.eventManager = await this.resolver._initialize(this.auth), await this.onExecution(), this.eventManager.registerConsumer(this);
      } catch (r) {
        this.reject(r);
      }
    });
  }
  async onAuthEvent(e) {
    const { urlResponse: t, sessionId: r, postBody: i, tenantId: o, error: l, type: u } = e;
    if (l) {
      this.reject(l);
      return;
    }
    const h = {
      auth: this.auth,
      requestUri: t,
      sessionId: r,
      tenantId: o || void 0,
      postBody: i || void 0,
      user: this.user,
      bypassAuthState: this.bypassAuthState
    };
    try {
      this.resolve(await this.getIdpTask(u)(h));
    } catch (f) {
      this.reject(f);
    }
  }
  onError(e) {
    this.reject(e);
  }
  getIdpTask(e) {
    switch (e) {
      case "signInViaPopup":
      case "signInViaRedirect":
        return um;
      case "linkViaPopup":
      case "linkViaRedirect":
        return dm;
      case "reauthViaPopup":
      case "reauthViaRedirect":
        return hm;
      default:
        Be(
          this.auth,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  resolve(e) {
    je(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp();
  }
  reject(e) {
    je(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp();
  }
  unregisterAndCleanUp() {
    this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fm = new kn(2e3, 1e4);
class bt extends cc {
  constructor(e, t, r, i, o) {
    super(e, t, i, o), this.provider = r, this.authWindow = null, this.pollId = null, bt.currentPopupAction && bt.currentPopupAction.cancel(), bt.currentPopupAction = this;
  }
  async executeNotNull() {
    const e = await this.execute();
    return V(
      e,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), e;
  }
  async onExecution() {
    je(this.filter.length === 1, "Popup operations only handle one event");
    const e = ys();
    this.authWindow = await this.resolver._openPopup(
      this.auth,
      this.provider,
      this.filter[0],
      // There's always one, see constructor
      e
    ), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch((t) => {
      this.reject(t);
    }), this.resolver._isIframeWebStorageSupported(this.auth, (t) => {
      t || this.reject(Se(
        this.auth,
        "web-storage-unsupported"
        /* AuthErrorCode.WEB_STORAGE_UNSUPPORTED */
      ));
    }), this.pollUserCancellation();
  }
  get eventId() {
    var e;
    return ((e = this.authWindow) === null || e === void 0 ? void 0 : e.associatedEvent) || null;
  }
  cancel() {
    this.reject(Se(
      this.auth,
      "cancelled-popup-request"
      /* AuthErrorCode.EXPIRED_POPUP_REQUEST */
    ));
  }
  cleanUp() {
    this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, bt.currentPopupAction = null;
  }
  pollUserCancellation() {
    const e = () => {
      var t, r;
      if (!((r = (t = this.authWindow) === null || t === void 0 ? void 0 : t.window) === null || r === void 0) && r.closed) {
        this.pollId = window.setTimeout(
          () => {
            this.pollId = null, this.reject(Se(
              this.auth,
              "popup-closed-by-user"
              /* AuthErrorCode.POPUP_CLOSED_BY_USER */
            ));
          },
          8e3
          /* _Timeout.AUTH_EVENT */
        );
        return;
      }
      this.pollId = window.setTimeout(e, fm.get());
    };
    e();
  }
}
bt.currentPopupAction = null;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pm = "pendingRedirect", cr = /* @__PURE__ */ new Map();
class mm extends cc {
  constructor(e, t, r = !1) {
    super(e, [
      "signInViaRedirect",
      "linkViaRedirect",
      "reauthViaRedirect",
      "unknown"
      /* AuthEventType.UNKNOWN */
    ], t, void 0, r), this.eventId = null;
  }
  /**
   * Override the execute function; if we already have a redirect result, then
   * just return it.
   */
  async execute() {
    let e = cr.get(this.auth._key());
    if (!e) {
      try {
        const r = await gm(this.resolver, this.auth) ? await super.execute() : null;
        e = () => Promise.resolve(r);
      } catch (t) {
        e = () => Promise.reject(t);
      }
      cr.set(this.auth._key(), e);
    }
    return this.bypassAuthState || cr.set(this.auth._key(), () => Promise.resolve(null)), e();
  }
  async onAuthEvent(e) {
    if (e.type === "signInViaRedirect")
      return super.onAuthEvent(e);
    if (e.type === "unknown") {
      this.resolve(null);
      return;
    }
    if (e.eventId) {
      const t = await this.auth._redirectUserForId(e.eventId);
      if (t)
        return this.user = t, super.onAuthEvent(e);
      this.resolve(null);
    }
  }
  async onExecution() {
  }
  cleanUp() {
  }
}
async function gm(n, e) {
  const t = vm(e), r = ym(n);
  if (!await r._isAvailable())
    return !1;
  const i = await r._get(t) === "true";
  return await r._remove(t), i;
}
function _m(n, e) {
  cr.set(n._key(), e);
}
function ym(n) {
  return Le(n._redirectPersistence);
}
function vm(n) {
  return lr(pm, n.config.apiKey, n.name);
}
async function Em(n, e, t = !1) {
  if (Ze(n.app))
    return Promise.reject(pt(n));
  const r = gs(n), i = cm(r, e), l = await new mm(r, i, t).execute();
  return l && !t && (delete l.user._redirectEventId, await r._persistUserIfCurrent(l.user), await r._setRedirectUser(null, e)), l;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Tm = 10 * 60 * 1e3;
class Im {
  constructor(e) {
    this.auth = e, this.cachedEventUids = /* @__PURE__ */ new Set(), this.consumers = /* @__PURE__ */ new Set(), this.queuedRedirectEvent = null, this.hasHandledPotentialRedirect = !1, this.lastProcessedEventTime = Date.now();
  }
  registerConsumer(e) {
    this.consumers.add(e), this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, e) && (this.sendToConsumer(this.queuedRedirectEvent, e), this.saveEventToCache(this.queuedRedirectEvent), this.queuedRedirectEvent = null);
  }
  unregisterConsumer(e) {
    this.consumers.delete(e);
  }
  onEvent(e) {
    if (this.hasEventBeenHandled(e))
      return !1;
    let t = !1;
    return this.consumers.forEach((r) => {
      this.isEventForConsumer(e, r) && (t = !0, this.sendToConsumer(e, r), this.saveEventToCache(e));
    }), this.hasHandledPotentialRedirect || !wm(e) || (this.hasHandledPotentialRedirect = !0, t || (this.queuedRedirectEvent = e, t = !0)), t;
  }
  sendToConsumer(e, t) {
    var r;
    if (e.error && !uc(e)) {
      const i = ((r = e.error.code) === null || r === void 0 ? void 0 : r.split("auth/")[1]) || "internal-error";
      t.onError(Se(this.auth, i));
    } else
      t.onAuthEvent(e);
  }
  isEventForConsumer(e, t) {
    const r = t.eventId === null || !!e.eventId && e.eventId === t.eventId;
    return t.filter.includes(e.type) && r;
  }
  hasEventBeenHandled(e) {
    return Date.now() - this.lastProcessedEventTime >= Tm && this.cachedEventUids.clear(), this.cachedEventUids.has(fa(e));
  }
  saveEventToCache(e) {
    this.cachedEventUids.add(fa(e)), this.lastProcessedEventTime = Date.now();
  }
}
function fa(n) {
  return [n.type, n.eventId, n.sessionId, n.tenantId].filter((e) => e).join("-");
}
function uc({ type: n, error: e }) {
  return n === "unknown" && (e == null ? void 0 : e.code) === "auth/no-auth-event";
}
function wm(n) {
  switch (n.type) {
    case "signInViaRedirect":
    case "linkViaRedirect":
    case "reauthViaRedirect":
      return !0;
    case "unknown":
      return uc(n);
    default:
      return !1;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Am(n, e = {}) {
  return jt(n, "GET", "/v1/projects", e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Rm = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, bm = /^https?/;
async function Sm(n) {
  if (n.config.emulator)
    return;
  const { authorizedDomains: e } = await Am(n);
  for (const t of e)
    try {
      if (Pm(t))
        return;
    } catch {
    }
  Be(
    n,
    "unauthorized-domain"
    /* AuthErrorCode.INVALID_ORIGIN */
  );
}
function Pm(n) {
  const e = Fi(), { protocol: t, hostname: r } = new URL(e);
  if (n.startsWith("chrome-extension://")) {
    const l = new URL(n);
    return l.hostname === "" && r === "" ? t === "chrome-extension:" && n.replace("chrome-extension://", "") === e.replace("chrome-extension://", "") : t === "chrome-extension:" && l.hostname === r;
  }
  if (!bm.test(t))
    return !1;
  if (Rm.test(n))
    return r === n;
  const i = n.replace(/\./g, "\\.");
  return new RegExp("^(.+\\." + i + "|" + i + ")$", "i").test(r);
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Cm = new kn(3e4, 6e4);
function pa() {
  const n = Pe().___jsl;
  if (n != null && n.H) {
    for (const e of Object.keys(n.H))
      if (n.H[e].r = n.H[e].r || [], n.H[e].L = n.H[e].L || [], n.H[e].r = [...n.H[e].L], n.CP)
        for (let t = 0; t < n.CP.length; t++)
          n.CP[t] = null;
  }
}
function km(n) {
  return new Promise((e, t) => {
    var r, i, o;
    function l() {
      pa(), gapi.load("gapi.iframes", {
        callback: () => {
          e(gapi.iframes.getContext());
        },
        ontimeout: () => {
          pa(), t(Se(
            n,
            "network-request-failed"
            /* AuthErrorCode.NETWORK_REQUEST_FAILED */
          ));
        },
        timeout: Cm.get()
      });
    }
    if (!((i = (r = Pe().gapi) === null || r === void 0 ? void 0 : r.iframes) === null || i === void 0) && i.Iframe)
      e(gapi.iframes.getContext());
    else if (!((o = Pe().gapi) === null || o === void 0) && o.load)
      l();
    else {
      const u = Lp("iframefcb");
      return Pe()[u] = () => {
        gapi.load ? l() : t(Se(
          n,
          "network-request-failed"
          /* AuthErrorCode.NETWORK_REQUEST_FAILED */
        ));
      }, Vp(`${Mp()}?onload=${u}`).catch((h) => t(h));
    }
  }).catch((e) => {
    throw ur = null, e;
  });
}
let ur = null;
function Nm(n) {
  return ur = ur || km(n), ur;
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Dm = new kn(5e3, 15e3), Om = "__/auth/iframe", Vm = "emulator/auth/iframe", Mm = {
  style: {
    position: "absolute",
    top: "-100px",
    width: "1px",
    height: "1px"
  },
  "aria-hidden": "true",
  tabindex: "-1"
}, Lm = /* @__PURE__ */ new Map([
  ["identitytoolkit.googleapis.com", "p"],
  ["staging-identitytoolkit.sandbox.googleapis.com", "s"],
  ["test-identitytoolkit.sandbox.googleapis.com", "t"]
  // test
]);
function xm(n) {
  const e = n.config;
  V(
    e.authDomain,
    n,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  );
  const t = e.emulator ? ds(e, Vm) : `https://${n.config.authDomain}/${Om}`, r = {
    apiKey: e.apiKey,
    appName: n.name,
    v: Ut
  }, i = Lm.get(n.config.apiHost);
  i && (r.eid = i);
  const o = n._getFrameworks();
  return o.length && (r.fw = o.join(",")), `${t}?${Rn(r).slice(1)}`;
}
async function Um(n) {
  const e = await Nm(n), t = Pe().gapi;
  return V(
    t,
    n,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), e.open({
    where: document.body,
    url: xm(n),
    messageHandlersFilter: t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
    attributes: Mm,
    dontclear: !0
  }, (r) => new Promise(async (i, o) => {
    await r.restyle({
      // Prevent iframe from closing on mouse out.
      setHideOnLeave: !1
    });
    const l = Se(
      n,
      "network-request-failed"
      /* AuthErrorCode.NETWORK_REQUEST_FAILED */
    ), u = Pe().setTimeout(() => {
      o(l);
    }, Dm.get());
    function h() {
      Pe().clearTimeout(u), i(r);
    }
    r.ping(h).then(h, () => {
      o(l);
    });
  }));
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Fm = {
  location: "yes",
  resizable: "yes",
  statusbar: "yes",
  toolbar: "no"
}, Bm = 500, jm = 600, $m = "_blank", Hm = "http://localhost";
class ma {
  constructor(e) {
    this.window = e, this.associatedEvent = null;
  }
  close() {
    if (this.window)
      try {
        this.window.close();
      } catch {
      }
  }
}
function zm(n, e, t, r = Bm, i = jm) {
  const o = Math.max((window.screen.availHeight - i) / 2, 0).toString(), l = Math.max((window.screen.availWidth - r) / 2, 0).toString();
  let u = "";
  const h = Object.assign(Object.assign({}, Fm), {
    width: r.toString(),
    height: i.toString(),
    top: o,
    left: l
  }), f = ge().toLowerCase();
  t && (u = zl(f) ? $m : t), $l(f) && (e = e || Hm, h.scrollbars = "yes");
  const y = Object.entries(h).reduce((R, [C, k]) => `${R}${C}=${k},`, "");
  if (bp(f) && u !== "_self")
    return qm(e || "", u), new ma(null);
  const w = window.open(e || "", u, y);
  V(
    w,
    n,
    "popup-blocked"
    /* AuthErrorCode.POPUP_BLOCKED */
  );
  try {
    w.focus();
  } catch {
  }
  return new ma(w);
}
function qm(n, e) {
  const t = document.createElement("a");
  t.href = n, t.target = e;
  const r = document.createEvent("MouseEvent");
  r.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null), t.dispatchEvent(r);
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Gm = "__/auth/handler", Km = "emulator/auth/handler", Wm = encodeURIComponent("fac");
async function ga(n, e, t, r, i, o) {
  V(
    n.config.authDomain,
    n,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  ), V(
    n.config.apiKey,
    n,
    "invalid-api-key"
    /* AuthErrorCode.INVALID_API_KEY */
  );
  const l = {
    apiKey: n.config.apiKey,
    appName: n.name,
    authType: t,
    redirectUrl: r,
    v: Ut,
    eventId: i
  };
  if (e instanceof Zl) {
    e.setDefaultLanguage(n.languageCode), l.providerId = e.providerId || "", vu(e.getCustomParameters()) || (l.customParameters = JSON.stringify(e.getCustomParameters()));
    for (const [y, w] of Object.entries({}))
      l[y] = w;
  }
  if (e instanceof Nn) {
    const y = e.getScopes().filter((w) => w !== "");
    y.length > 0 && (l.scopes = y.join(","));
  }
  n.tenantId && (l.tid = n.tenantId);
  const u = l;
  for (const y of Object.keys(u))
    u[y] === void 0 && delete u[y];
  const h = await n._getAppCheckToken(), f = h ? `#${Wm}=${encodeURIComponent(h)}` : "";
  return `${Qm(n)}?${Rn(u).slice(1)}${f}`;
}
function Qm({ config: n }) {
  return n.emulator ? ds(n, Km) : `https://${n.authDomain}/${Gm}`;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ti = "webStorageSupport";
class Jm {
  constructor() {
    this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = ic, this._completeRedirectFn = Em, this._overrideRedirectResult = _m;
  }
  // Wrapping in async even though we don't await anywhere in order
  // to make sure errors are raised as promise rejections
  async _openPopup(e, t, r, i) {
    var o;
    je((o = this.eventManagers[e._key()]) === null || o === void 0 ? void 0 : o.manager, "_initialize() not called before _openPopup()");
    const l = await ga(e, t, r, Fi(), i);
    return zm(e, l, ys());
  }
  async _openRedirect(e, t, r, i) {
    await this._originValidation(e);
    const o = await ga(e, t, r, Fi(), i);
    return Zp(o), new Promise(() => {
    });
  }
  _initialize(e) {
    const t = e._key();
    if (this.eventManagers[t]) {
      const { manager: i, promise: o } = this.eventManagers[t];
      return i ? Promise.resolve(i) : (je(o, "If manager is not set, promise should be"), o);
    }
    const r = this.initAndGetManager(e);
    return this.eventManagers[t] = { promise: r }, r.catch(() => {
      delete this.eventManagers[t];
    }), r;
  }
  async initAndGetManager(e) {
    const t = await Um(e), r = new Im(e);
    return t.register("authEvent", (i) => (V(
      i == null ? void 0 : i.authEvent,
      e,
      "invalid-auth-event"
      /* AuthErrorCode.INVALID_AUTH_EVENT */
    ), {
      status: r.onEvent(i.authEvent) ? "ACK" : "ERROR"
      /* GapiOutcome.ERROR */
    }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = { manager: r }, this.iframes[e._key()] = t, r;
  }
  _isIframeWebStorageSupported(e, t) {
    this.iframes[e._key()].send(Ti, { type: Ti }, (i) => {
      var o;
      const l = (o = i == null ? void 0 : i[0]) === null || o === void 0 ? void 0 : o[Ti];
      l !== void 0 && t(!!l), Be(
        e,
        "internal-error"
        /* AuthErrorCode.INTERNAL_ERROR */
      );
    }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
  }
  _originValidation(e) {
    const t = e._key();
    return this.originValidationPromises[t] || (this.originValidationPromises[t] = Sm(e)), this.originValidationPromises[t];
  }
  get _shouldInitProactively() {
    return Ql() || Hl() || ms();
  }
}
const Xm = Jm;
var _a = "@firebase/auth", ya = "1.7.9";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ym {
  constructor(e) {
    this.auth = e, this.internalListeners = /* @__PURE__ */ new Map();
  }
  getUid() {
    var e;
    return this.assertAuthConfigured(), ((e = this.auth.currentUser) === null || e === void 0 ? void 0 : e.uid) || null;
  }
  async getToken(e) {
    return this.assertAuthConfigured(), await this.auth._initializationPromise, this.auth.currentUser ? { accessToken: await this.auth.currentUser.getIdToken(e) } : null;
  }
  addAuthTokenListener(e) {
    if (this.assertAuthConfigured(), this.internalListeners.has(e))
      return;
    const t = this.auth.onIdTokenChanged((r) => {
      e((r == null ? void 0 : r.stsTokenManager.accessToken) || null);
    });
    this.internalListeners.set(e, t), this.updateProactiveRefresh();
  }
  removeAuthTokenListener(e) {
    this.assertAuthConfigured();
    const t = this.internalListeners.get(e);
    t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh());
  }
  assertAuthConfigured() {
    V(
      this.auth._initializationPromise,
      "dependent-sdk-initialized-before-auth"
      /* AuthErrorCode.DEPENDENT_SDK_INIT_BEFORE_AUTH */
    );
  }
  updateProactiveRefresh() {
    this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Zm(n) {
  switch (n) {
    case "Node":
      return "node";
    case "ReactNative":
      return "rn";
    case "Worker":
      return "webworker";
    case "Cordova":
      return "cordova";
    case "WebExtension":
      return "web-extension";
    default:
      return;
  }
}
function eg(n) {
  Nt(new mt(
    "auth",
    (e, { options: t }) => {
      const r = e.getProvider("app").getImmediate(), i = e.getProvider("heartbeat"), o = e.getProvider("app-check-internal"), { apiKey: l, authDomain: u } = r.options;
      V(l && !l.includes(":"), "invalid-api-key", { appName: r.name });
      const h = {
        apiKey: l,
        authDomain: u,
        clientPlatform: n,
        apiHost: "identitytoolkit.googleapis.com",
        tokenApiHost: "securetoken.googleapis.com",
        apiScheme: "https",
        sdkClientVersion: Jl(n)
      }, f = new Dp(r, i, o, h);
      return Up(f, t), f;
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ).setInstanceCreatedCallback((e, t, r) => {
    e.getProvider(
      "auth-internal"
      /* _ComponentName.AUTH_INTERNAL */
    ).initialize();
  })), Nt(new mt(
    "auth-internal",
    (e) => {
      const t = gs(e.getProvider(
        "auth"
        /* _ComponentName.AUTH */
      ).getImmediate());
      return ((r) => new Ym(r))(t);
    },
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  )), nt(_a, ya, Zm(n)), nt(_a, ya, "esm2017");
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const tg = 5 * 60, ng = Sa("authIdTokenMaxAge") || tg;
let va = null;
const rg = (n) => async (e) => {
  const t = e && await e.getIdTokenResult(), r = t && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(t.issuedAtTime)) / 1e3;
  if (r && r > ng)
    return;
  const i = t == null ? void 0 : t.token;
  va !== i && (va = i, await fetch(n, {
    method: i ? "POST" : "DELETE",
    headers: i ? {
      Authorization: `Bearer ${i}`
    } : {}
  }));
};
function ig(n = Gi()) {
  const e = qi(n, "auth");
  if (e.isInitialized())
    return e.getImmediate();
  const t = xp(n, {
    popupRedirectResolver: Xm,
    persistence: [
      lm,
      Jp,
      ic
    ]
  }), r = Sa("authTokenSyncURL");
  if (r && typeof isSecureContext == "boolean" && isSecureContext) {
    const o = new URL(r, location.origin);
    if (location.origin === o.origin) {
      const l = rg(o.toString());
      Kp(t, l, () => l(t.currentUser)), Gp(t, (u) => l(u));
    }
  }
  const i = Ra("auth");
  return i && Fp(t, `http://${i}`), t;
}
function sg() {
  var n, e;
  return (e = (n = document.getElementsByTagName("head")) === null || n === void 0 ? void 0 : n[0]) !== null && e !== void 0 ? e : document;
}
Op({
  loadJS(n) {
    return new Promise((e, t) => {
      const r = document.createElement("script");
      r.setAttribute("src", n), r.onload = e, r.onerror = (i) => {
        const o = Se(
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
        o.customData = i, t(o);
      }, r.type = "text/javascript", r.charset = "UTF-8", sg().appendChild(r);
    });
  },
  gapiScript: "https://apis.google.com/js/api.js",
  recaptchaV2Script: "https://www.google.com/recaptcha/api.js",
  recaptchaEnterpriseScript: "https://www.google.com/recaptcha/enterprise.js?render="
});
eg(
  "Browser"
  /* ClientPlatform.BROWSER */
);
const Ea = {
  apiKey: "AIzaSyAmeikvmS_z60M_gRE_9Xfi8CLkRas-i7U",
  authDomain: "autoapplyai-3e61d.firebaseapp.com",
  projectId: "autoapplyai-3e61d",
  storageBucket: "autoapplyai-3e61d.firebasestorage.app",
  messagingSenderId: "214768128640",
  appId: "1:214768128640:web:55984bbc287b77ee034c65"
};
let Ii = null, og = null, $i = null;
if (Ea.apiKey)
  try {
    Ii = Th().length === 0 ? ka(Ea) : Gi(), og = ig(Ii), $i = Wf(Ii);
  } catch (n) {
    console.error("Firebase initialization failed. Make sure you set your Firebase env variables.", n);
  }
else
  console.warn("Firebase apiKey is missing. Firebase features are disabled.");
async function wi(n, e) {
  if (!$i) return;
  const t = Kf($i, "users", n, "jobs", e.id);
  await ap(t, e);
}
const ag = {
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
      trajectory: "Replace entirely with the word 'journey' when discussing career progression"
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
    required: !1,
    format_string: "\\footnotesize \\textbf{ATS STRATEGY MATCH TARGET:} 95\\%+ Optimization (Keywords: {keywords})"
  },
  file_naming: {
    output_dir: "output"
  }
};
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: !0 }).catch((n) => {
    console.error("Failed to set sidepanel behavior:", n);
  });
});
function We(n, e, t, r) {
  n && chrome.tabs.sendMessage(n, {
    action: "UPDATE_WIDGET",
    step: e,
    state: t,
    labelText: r
  }).catch(() => {
  });
}
chrome.runtime.onMessage.addListener((n, e, t) => {
  var r, i;
  if (n.action === "OPEN_SIDEPANEL") {
    const o = (r = e.tab) == null ? void 0 : r.id;
    if (o)
      return chrome.sidePanel.open({ tabId: o }).then(() => t({ success: !0 })).catch((l) => {
        console.error("Error opening sidepanel:", l), t({ success: !1, error: l.message });
      }), !0;
    t({ success: !1, error: "No tab ID" });
    return;
  }
  if (n.action === "TAILOR_JOB") {
    const { jobDescription: o, jobUrl: l } = n, u = (i = e.tab) == null ? void 0 : i.id;
    return (async () => {
      try {
        const h = await chrome.storage.local.get(["geminiApiKey", "resumeRules", "userId", "candidateProfile"]), f = h.geminiApiKey, y = h.userId, w = h.candidateProfile || Kc;
        let R = ag;
        if (h.resumeRules)
          try {
            R = JSON.parse(h.resumeRules);
          } catch (T) {
            console.error("Failed to parse custom rules, using defaults:", T);
          }
        if (!f)
          throw new Error("Gemini API Key is not configured. Please open settings in the sidepanel.");
        const C = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`, k = (/* @__PURE__ */ new Date()).toISOString(), O = {
          id: C,
          jobTitle: "Queued...",
          companyName: "Pending...",
          jobUrl: l || "Manual Input",
          jobDescription: o,
          atsScore: 0,
          analysis: "Analysis in progress...",
          summary: "",
          competencies: "",
          coverLetter: "",
          keywords: [],
          date: k,
          status: "processing"
        };
        if (y)
          await wi(y, O);
        else {
          const { localHistory: T = [] } = await chrome.storage.local.get("localHistory");
          await chrome.storage.local.set({ localHistory: [O, ...T] });
        }
        We(u, 2, "active", "Analyzing job & generating draft...");
        const N = await Qc(f, o, R, w), H = N.jobTitle || "Role", F = N.companyName || "Company";
        We(u, 2, "active", `Optimizing for ${F}...`);
        const j = {
          ...O,
          jobTitle: H,
          companyName: F
        };
        if (y)
          await wi(y, j);
        else {
          const { localHistory: T = [] } = await chrome.storage.local.get("localHistory"), m = T.map((_e) => _e.id === C ? j : _e);
          await chrome.storage.local.set({ localHistory: m });
        }
        const z = await Jc(f, o, R, w, {
          jobTitle: H,
          companyName: F,
          summary: N.summary,
          competencies: N.competencies,
          cover_letter: N.cover_letter
        });
        We(u, 2, "success", `✓ Tailored: ${F} (${z.atsScore}% Match)`), We(u, 3, "active", "Syncing files...");
        const Ee = ui(z.summary, R, { isCompetencies: !1 }), Y = hi(Ee, R), E = ui(z.competencies, R, { isCompetencies: !0 }), p = hi(E, R), g = ui(z.cover_letter, R, { isCoverLetter: !0 }), _ = hi(g, R), v = {
          ...j,
          atsScore: z.atsScore || 90,
          analysis: z.analysis || "",
          summary: Y,
          competencies: p,
          coverLetter: _,
          keywords: z.keywords || [],
          status: "completed"
        };
        if (y)
          await wi(y, v);
        else {
          const { localHistory: T = [] } = await chrome.storage.local.get("localHistory"), m = T.map((_e) => _e.id === C ? v : _e);
          await chrome.storage.local.set({ localHistory: m });
        }
        We(u, 3, "success", "✓ Synced to Firestore"), We(u, 4, "success", "✓ Finished! Ready in side panel");
      } catch (h) {
        console.error("Tailoring error:", h), We(u, 2, "failed", "✗ Processing failed"), We(u, 4, "failed", h.message || "Unknown processing error");
      }
    })(), t({ success: !0 }), !0;
  }
});
