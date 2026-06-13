# Resume Engine & Artifact Specification

**AutoApplyAI — canonical spec for Phase 1 resume generation, tailoring, and exports.**

Status: **Locked for implementation** (implement only after explicit “implement Phase 1” approval).  
Companion doc: [FLOW.md](./FLOW.md) (application pipeline and onboarding flow).

---

## 1. Product principles

1. **Quality over cost** — Full tailor pass (summary, competencies, experience bullets, skills). Do not reduce AI depth to save tokens.
2. **No “ATS” on the resume document** — The PDF/DOCX/`.tex` must read like a human resume. In-app analysis uses **Job fit** language, not ATS jargon.
3. **Parse-first layout** — Optimize for strict parsers (Workday-first); single column, standard headers, contact in body.
4. **One content model, many exports** — Structured generator for PDF/DOCX; assembled `.tex` as audit/edit path (Option C “both done right”).
5. **Minimal cloud storage** — JSON snapshot per job; binaries generated locally on demand.
6. **Integer pages only** — No 1.5-page layouts; engine chooses 1–6 full pages with user-facing justification.

---

## 2. Architecture overview

```
CustomerConfig.parsedResume          (cloud, once per user — base truth)
        +
TailoredResumeSnapshot               (cloud, per job — tailored deltas)
        +
Local Job.jobDescription             (full JD text while in pipeline)
        ↓
resume-engine/
  resolve-document.ts                  → ResolvedResumeDocument
  compute-page-budget.ts               → layoutDecision + limits
  validate-document.ts               → pass/fail + regen hints
  format-rules.ts                      → headers, fonts, dates
  export-pdf.ts | export-docx.ts | export-tex.ts
  export-cover-letter.ts
  platform-format.ts                 → portal upload recommendation
  fit-report.ts                      → matchScore, bands, gap checklist
  jd-hash.ts                         → jdHash, urlHash
        ↓
Local files (on demand): PDF, DOCX, .tex, cover letter files
```

**Callers:** background tailor, artifact save, sidepanel/dashboard download, future apply layer (Phase 2+).

---

## 3. Data model

### 3.1 Firestore paths

| Collection | Path |
|------------|------|
| Customer config | `users/{uid}/config/customerConfig` |
| Job (mirror) | `users/{uid}/jobs/{jobId}` |
| Tailored snapshot | `users/{uid}/resumes/{resumeId}` |

**Single `jobId`** everywhere (pipeline queue, Firestore job, snapshot linkage). Fix current ID split during Phase 1.

### 3.2 `ParsedResume` (base — `CustomerConfig.parsedResume`)

Read-only input for tailoring. Never mutated by tailor; `baseVersion = scannedAt || sourceFileName || hash`.

### 3.3 `TailoredResumeSnapshot` (cloud — minimal JSON)

```typescript
interface TailoredResumeSnapshot {
  snapshotVersion: 1;

  id: string;              // resumeId
  jobId: string;

  jobUrl: string;
  urlHash: string;         // SHA-256 normalized URL (identity)
  jdHash: string;          // SHA-256 normalized JD at tailor time
  jdFetchedAt: string;     // ISO

  jobTitle: string;        // denormalized for lists
  companyName: string;
  platform?: ApplicationPlatform;

  baseVersion: string;     // links to ParsedResume version

  summary: string;
  competencies: string;  // flat \item lines (no itemize wrapper)
  coverLetter: string;     // text always stored; files on demand

  tailoredSkills: string[];
  tailoredExperience: {
    experienceIndex: number;
    tailoredJobTitle: string;
    bullets: string[];
  }[];

  matchScore?: number;     // 0–100, internal / UI only
  matchAnalysis?: string;
  keywords?: string[];     // in-app gap analysis only — never on resume

  layoutDecision?: {
    pages: number;         // integer 1–6
    reason: string;        // UI justification note
    experienceYears?: number;
    roleCount?: number;
  };

  aiProvider?: string;
  aiModel?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Not stored in cloud:** PDF, DOCX, `.tex` binaries, full `jobDescription` (see local Job).

### 3.4 `Job` (local pipeline + light Firestore mirror)

```typescript
// Content: read via resumeId → TailoredResumeSnapshot (single source)
// Workflow + local paths only on Job:

interface Job {
  id: string;              // === jobId
  resumeId: string;
  jobUrl: string;
  platform?: ApplicationPlatform;

  jobDescription: string;  // LOCAL full JD for tailor + re-tailor

  pipelineStage: PipelineStage;
  applyResumeFormat?: 'pdf' | 'docx';  // per-job user override at download/apply

  resumePdfPath?: string;   // local relative paths when generated
  resumeDocxPath?: string;
  resumeTexPath?: string;
  coverLetterTexPath?: string;
  // ... existing pipeline fields
}
```

### 3.5 Stale profile warning (O4)

If `snapshot.baseVersion !== current ParsedResume baseVersion`:

- Show **“Re-tailor recommended”** (non-blocking).
- Phase 1: manual re-tailor only (no auto-queue).

---

## 4. Onboarding changes (Phase 1)

**Remove:** `resumePageLimit` UI (no 1–4 page picker).

**Keep:**

- Resume scan / `ParsedResume` build
- `outputDir` (local artifact folder)
- Optional `resumeContext` (ground truth for tailor)
- API keys, contact fields

**Do not add:** PDF/DOCX/`.tex` toggles — engine generates all formats on demand.

**Soft prompt (not a hard setting):** If experience **> 10 years** (date math), show note: *“Profiles with 10+ years often fit 2 pages better — the engine will recommend page count when you tailor.”*

---

## 5. Smart page engine

### 5.1 Integer pages only

- Allowed: **1, 2, 3, 4, 5, 6** (hard max **6**).
- **Never** ship visual “1.5 pages” — compress to N or expand to N+1 via re-tailor/validation.
- Default corporate/tech: **1–2 pages** (most users).
- **Federal / academic signals** in JD or profile → allow up to **6**.

### 5.2 Selection signals

| Signal | Effect |
|--------|--------|
| 0–5 years experience | Prefer **1** page |
| 5–10 years | **1**, suggest **2** if content dense |
| **> 10 years** | Prefer **2** pages |
| Director+ / executive titles | Bias **2** pages |
| JD: USAJobs, federal, academic, publications | Up to **3–6** |
| Role count, bullet volume, skills count | Drives minimum pages needed |

### 5.3 Layout budgets (quality-first, not token-capped)

Engine sets limits passed into AI prompts and validation.

| Pages | Roles detailed | Bullets/role | Competencies | Skills (parse cap) |
|-------|----------------|--------------|--------------|------------------|
| 1 | 2–3 | 4–5 | 6 | ~25–30 total |
| 2 | 3–4 | 5–6 | 8 | ~40 |
| 3 | 4–5 | 6–7 | 10 | ~50 |
| 4 | 5+ | 6–7 | 12 | ~60 |
| 5–6 | As required | As required | As required | Per group 8–12 |

### 5.4 UI justification note

After tailor/generate, show engine copy, e.g.:

> **2 pages** — 14 years of experience across 4 roles; second page preserves metrics without cramming.

Store in `layoutDecision.reason`.

### 5.5 Phase 1.5 (deferred)

Collapsed **Advanced → Layout** on job detail: Force 1 page · Use recommended · Allow up to N.  
**Not in first release.**

---

## 6. Section titles & format rules (D1–D8)

### 6.1 Document section headers (generic — all users)

| Order | Header |
|-------|--------|
| (header block) | Name, contact, **TARGET_ROLE** |
| 1 | **Professional Summary** |
| 2 | **Core Competencies** |
| 3 | **Skills** (omit entire section if empty) |
| 4 | **Professional Experience** |
| 5 | **Education** (or **Education and Certifications**) |

Role/industry flavor lives in **content** (summary, competency lead-ins, skills), not branded section names.

### 6.2 Typography & layout

- **10pt** body, Helvetica/Arial equivalent (`helvet` / system sans in exports).
- **Single column**, black text, **0.35in** margins (adjust only via `ResumeRules` if needed).
- Contact in **body**, not header/footer.
- Dates: **`MMM YYYY -- MMM YYYY`** or **`Present`** (normalized at render).
- Experience: **reverse chronological** sort by `endDate`.
- Skills: comma-separated within groups; **8–12 items per group** max (Greenhouse parse limit).
- No tables, columns, graphics, skill bars.

### 6.3 Forbidden on resume document

- The words “ATS”, “keyword optimization”, match percentages, keyword dumps, white/hidden text.
- Product branding footer.

---

## 7. Tailoring rules (AI)

### 7.1 Fields tailored per job (stored in snapshot)

| Field | Rule |
|-------|------|
| `jobTitle` / header **TARGET_ROLE** | Mirror JD title when credible |
| `summary` | Plain paragraph; JD keywords; target title in first sentences; acronym expansion once |
| `competencies` | `\item \textbf{Lead-in:} detail` — count = page budget |
| `tailoredExperience[]` | Per recent role: **retitle to match JD** (see §7.3), rewrite bullets with metrics |
| `tailoredSkills[]` | Smart merge (see §7.4) |
| `coverLetter` | Full text in snapshot; files generated on demand |

**Pass 2** audit remains enabled (quality over cost). On validation failure, one automatic tighten/expand retry.

### 7.2 Prompt principles

- Mirror **literal JD phrasing** where truthful.
- **Full Term (ACR)** on first use.
- **~70% bullets** with quantified outcomes.
- Keyword in **Skills AND** at least one bullet where possible.
- No fabrication beyond `ParsedResume` + `resumeContext`.
- Replace internal prompt wording “ATS optimization” → **“job description alignment”**.

### 7.3 Experience title retitle policy

| Never change | Company, dates, location |
| Allow | `tailoredJobTitle` per role toward JD wording |
| Header | JD-aligned target role |
| Guardrail | Same function; ≤ one seniority step up if bullets prove scope; never invent promotions |

Render: `tailoredJobTitle ?? profile.jobTitle`.

### 7.4 Smart skills merge

1. Start from `ParsedResume.skills`.
2. Parse JD for required/preferred skills/tools.
3. **Add** if: already in profile OR in JD with evidence in bullets/competencies OR direct synonym (e.g. K8s ↔ Kubernetes).
4. **Do not add** if JD-only with no profile evidence.
5. **Promote** JD-matched skills to top of list.
6. **Omit Skills section** if `tailoredSkills.length === 0`.

Optional buckets inside Skills: **AI/ML · Cloud/Data · Engineering** (labels only; section title stays **Skills**).

---

## 8. Job fit UI (in-app only)

### 8.1 Naming

| Old | New |
|-----|-----|
| ATS Report | **Job fit** (tab) |
| ATS Compliance Match Score | **Fit score** |
| ATS Keywords Injected | **Keywords matched** (checklist context) |

Subtitle: *Compared to this job description.*

### 8.2 Score display (v1 bands — config in `fit-bands.ts`)

| Label | Range |
|-------|-------|
| **Strong fit** | 80–100 |
| **Good fit** | 65–79 |
| **Fair fit** | 50–64 |
| **Needs work** | < 50 |

**UI:** Label primary + percentage secondary (e.g. **Strong fit · 82%**).  
**Hero:** Gap checklist (missing skills, title alignment, bullet suggestions) — not the score alone.

Note in UI for scores > 85: diminishing returns; avoid keyword stuffing.

Rename code field over time: `atsScore` → `matchScore`.

---

## 9. Exports & platform recommendations

### 9.1 Generation

All formats from **`ResolvedResumeDocument`** (same content):

| Format | Generator | When |
|--------|-----------|------|
| PDF | Structured | On demand |
| DOCX | Structured | On demand |
| `.tex` | Template assembly | On demand |
| Cover letter PDF/DOCX/tex | CL template | On demand |

**Replace** `createSimpleTextPdf` stub — stub must not be used for apply/upload.

### 9.2 Upload filename

`{FirstName}_{LastName}_Resume_{Company}.{pdf|docx}`

Folder organization may still use `{company}_{jobTitle}` internally.

### 9.3 Portal recommendation (user choice final)

Show recommendation at download/apply; user overrides per job.

| Platform | Recommended |
|----------|-------------|
| LinkedIn | PDF |
| Indeed | PDF |
| Workday | DOCX |
| Greenhouse | DOCX |
| Lever, Ashby, SmartRecruiters | DOCX |
| Generic / unknown | DOCX |

Logic: `job.applyResumeFormat` ?? platform default ?? DOCX.

---

## 10. JD URL, hash, and refetch (O1, A, B, #5)

### 10.1 Cloud stores

- `jobUrl`
- `urlHash` — normalized URL (strip `#`, sort query params, trim trailing `/`; lowercase host for hash input; preserve stored URL case for click-through)
- `jdHash` — SHA-256 of normalized JD text at tailor time
- `jdFetchedAt`

### 10.2 JD normalization for `jdHash`

```
trim → collapse whitespace → lowercase (optional) → strip zero-width chars
→ SHA-256 → hex
```

### 10.3 Re-tailor when fetch fails

1. Use existing **snapshot** content.
2. Banner: **“Listing unavailable — using last tailored version.”**
3. **Retry** fetch.
4. **Paste job description** → updates local `Job.jobDescription`, re-tailor, new `jdHash`.

### 10.4 JD changed

If refetch succeeds and `jdHash !== snapshot.jdHash`:

**“Job description updated since last tailor — Re-tailor recommended?”**

---

## 11. Validation catalog (engine)

Minimum Phase 1 checks:

| Rule | Action on fail |
|------|----------------|
| Integer pages 1–6 | Re-tailor or block export |
| Fill ratio not “half page” awkward zone | Compress or expand |
| Standard section headers only | Reject non-standard AI output |
| No empty Skills section | Omit section |
| Contact fields present | Warn |
| Dates normalized | Auto-fix at render |
| Bullet length ~70–180 chars target | Pass 2 adjust |
| ≥ ~70% bullets with metrics | Pass 2 adjust |
| No forbidden phrases on document | Strip / fail |
| LaTeX-safe escaping | Auto-fix |
| Competency count = budget | Pass 2 adjust |
| Skills per group ≤ 12 | Trim lowest relevance |
| Plain-text paste order sane | Preflight (Phase 1 or 1.1) |
| Job title in summary | Pass 2 enforce |

---

## 12. Local artifacts & pipeline fixes (Phase 1)

### 12.1 Artifact save

- **Background worker** saves/generates — not sidepanel-only listener.
- Dashboard tailor path must also trigger artifact flow.
- Do not skip regeneration when re-tailoring (remove stale path short-circuit or invalidate paths on new tailor).

### 12.2 Local folders (under user `outputDir`)

```
resume_pdf/
resume_docx/
resume_tex/
coverletter_tex/    (when generated)
coverletter_pdf/
coverletter_docx/
```

### 12.3 Tailor failure

- Do **not** write partial snapshot.
- Job → `failed` with retry; user can re-run tailor.

---

## 13. Phase boundaries

### Phase 1 (first release)

- [ ] `resume-engine` module + `ResolvedResumeDocument`
- [ ] Smart page budget + `layoutDecision` note
- [ ] Full tailor: summary, competencies, experience (retitle + bullets), skills
- [ ] PDF + DOCX + `.tex` structured exports
- [ ] Cover letter text in snapshot; CL files on demand
- [ ] `TailoredResumeSnapshot` + Job/`resumeId` single-source content
- [ ] `jdHash` / `urlHash` + stale JD / stale profile warnings
- [ ] Job fit UI rebrand + bands + gap checklist
- [ ] Generic section headers; validation catalog
- [ ] Background artifact save; kill stub PDF
- [ ] Unified `jobId`
- [ ] Onboarding: remove page limit picker

### Phase 1.5

- [ ] Advanced layout overrides (Force 1 / recommended / allow N)
- [ ] Band threshold tuning from usage telemetry
- [ ] Plain-text preflight UI gate

### Phase 2+

- [ ] Auto-apply file upload
- [ ] Platform adapters (Workday, Indeed, iframes)
- [ ] EEO / work authorization mapping
- [ ] Optional LaTeX-compile PDF for power users
- [ ] Federal template presets

---

## 14. Quality & release policy

| Topic | Decision |
|-------|----------|
| AI depth | Full Pass 1 + Pass 2; no token caps for cost |
| Beta flag | **No** — new engine replaces stub path when tests pass |
| Implementation gate | This spec reviewed → explicit **“implement Phase 1”** |
| Tests | Golden fixtures: page count, section order, text extraction order |

---

## 15. Implementation order

1. **`resume-engine/`** — resolve, page budget, validate, format rules, jd-hash, fit bands  
2. **Tailor schema + AI prompts** — snapshot fields, retitle, skills merge  
3. **Exports** — PDF, DOCX, `.tex`, cover letter  
4. **Pipeline** — background artifacts, unified jobId, Firestore sync  
5. **UI** — Job fit tab, layout justification, re-tailor warnings, platform recommendation on download  
6. **Onboarding** — remove page picker; experience > 10y note  
7. **Cleanup** — remove demo copy, `ats_target_block` defaults, misleading UI strings  

---

## 16. Glossary

| Term | Meaning |
|------|---------|
| **Base profile** | `ParsedResume` from onboarding scan |
| **Snapshot** | `TailoredResumeSnapshot` per job (cloud JSON) |
| **Resolved document** | Merged base + snapshot ready for export |
| **Job fit** | In-app match analysis (never printed on resume) |
| **Layout decision** | Engine-chosen integer page count + reason |
| **On demand** | User or apply flow triggers binary generation locally |

---

*End of spec v1. Update `snapshotVersion` and this document when breaking schema changes occur.*
