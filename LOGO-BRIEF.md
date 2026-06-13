# AutoApplyAI — Logo & Brand Mark Brief

**Version:** 1.0  
**Date:** June 2025  
**Product:** AutoApplyAI Bot — Chrome extension + web dashboard  
**Audience for this doc:** Logo designer, brand freelancer, or Figma exploration  

---

## 1. Project summary

AutoApplyAI helps job seekers **tailor resumes and cover letters** to job descriptions using client-side AI. Users install a Chrome extension, upload a resume, paste or scrape a job posting, and receive ATS-optimized LaTeX/PDF output in seconds.

The brand should feel:
- **Modern AI product** — trustworthy, fast, intelligent (not gimmicky)
- **Professional** — career/resume context; credible for senior roles
- **Automated but human** — speed + quality, not “spam apply bot”

**Reference aesthetic (inspiration only, do not copy):** [bol·ai](https://bol-ai.com/) — dark premium SaaS, gradient accents, rounded icon tile, lowercase wordmark with middle dot.

---

## 2. Current assets

| Asset | Location | Notes |
|-------|----------|--------|
| Full logo (icon + wordmark) | `dist/logo.png` | White mark on **solid black** background |
| App icon | `dist/icon-16.png`, `icon-48.png`, `icon-128.png` | A + checkmark + speed lines, black bg |
| In-app usage | Sidepanel header (~28px), login screens (~48–64px) | PNG on **light UI** — black square reads heavy |

### Current mark elements (keep the idea, refine execution)

1. **Letter “A”** — primary brand initial  
2. **Checkmark** — integrated as crossbar; success, completion, “application submitted”  
3. **Speed lines** (left) — automation, fast tailoring  

**Problem:** Baked-in black background, stacked wordmark too tall for extension chrome, visual language (sharp monochrome) doesn’t match planned UI direction (gradient tile, dark theme, pill CTAs).

---

## 3. Brand name & naming rules

| Context | Recommended form | Example |
|---------|------------------|---------|
| **Logo / wordmark** | Lowercase with optional middle dot | `auto·apply` |
| **Legal / store listing** | Title case | AutoApplyAI |
| **Extension name (Chrome)** | AutoApplyAI Bot | (unchanged for now) |
| **Tagline (optional, not in logo)** | Short benefit line | “Tailored applications in one click.” |

**Avoid in the logo lockup:** spelling out “AI” in large type (feels dated; bol·ai uses `bol·ai` not “BOL AI Voice Agent”). “AI” can appear in tagline or footer only.

**Pronunciation:** “auto apply” (two words). Middle dot is visual separator only — like bol·ai, not a literal bullet in speech.

---

## 4. Design direction (pick one primary; others as alternates)

### Direction A — **Evolve current mark** (preferred starting point)

Refine existing A + check + speed lines; make it production-ready.

- Simplify geometry: cleaner A, one confident check stroke, **2 speed lines** (not 3 heavy bars)
- **No background in master SVG** — transparent only
- Optional **container tile**: rounded square (12–16px radius at 32px size) with brand gradient fill; white or light mark inside
- Wordmark beside tile: `auto·apply` lowercase, medium weight on “auto”, slightly lighter on “·apply” OR single weight

**Why:** Preserves equity in check + speed metaphor; lowest confusion for existing users.

---

### Direction B — **Pipeline / flow mark** (bol·ai-adjacent)

Abstract icon suggesting **input → AI → output**:

- 3 vertical elements: document stack / bars → sparkle or node → check or arrow  
- Gradient fill on bars (purple → blue → teal) similar energy to bol·ai’s wave icon **without copying their exact shape**
- Reads as “job in → tailored resume out”

**Why:** Strong for dark UI headers and favicon at 16px if simplified aggressively.

---

### Direction C — **Wordmark-first**

Minimal symbol (small check in circle or dot) + strong typographic `auto·apply`.

- Symbol must work at **16×16** in Chrome toolbar  
- Wordmark carries brand on login/dashboard; icon-only in extension header  

**Why:** Fastest to ship if icon exploration stalls; less distinctive in store search.

---

## 5. Color system

**Implementation:** `src/shared/brand-tokens.css` — single source of truth for the app UI.

Align logo with UI tokens. Two acceptable palettes — **pick one primary** for v1. **Active in app + v0 landing: Palette 1.**

### Palette 1 — Gradient AI (bol·ai-inspired)

| Token | Hex | Use |
|-------|-----|-----|
| Brand purple | `#7C5CFF` | Gradient start, icon accent |
| Brand blue | `#4F9DFF` | Gradient mid |
| Accent teal | `#27E0C0` | Gradient end, success highlights |
| Background | `#070B18` | Dark UI, optional logo presentation |
| Panel | `#111834` | Cards, tile fallback |
| Text on dark | `#EAF0FF` | Wordmark on dark |
| Muted | `#9AA6C8` | Secondary text |

**Primary gradient:** `linear-gradient(120deg, #7C5CFF 0%, #4F9DFF 50%, #27E0C0 100%)`

### Palette 2 — Blue professional (closer to current app)

| Token | Hex | Use |
|-------|-----|-----|
| Brand | `#2563EB` | Primary |
| Accent | `#6366F1` | Gradient partner |
| Background light | `#F8FAFC` | Current dashboard light mode |
| Text | `#0F172A` | Wordmark on light |

**Note:** Resume PDF template uses orange `#FF8000` today — **do not** introduce orange into the logo unless product explicitly rebrands PDF accent too. One hero gradient is enough.

---

## 6. Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| **Wordmark** | [Sora](https://fonts.google.com/specimen/Sora) or [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | 600–700 | Lowercase `auto·apply`; letter-spacing +0.02em max |
| **UI body** (separate from logo) | Plus Jakarta Sans or Inter | 400–600 | Already using Inter in app |
| **Avoid** | Script, serif, all-caps wordmark, “tech” stencil fonts | — | |

**Middle dot:** Use literal middle dot `·` (U+00B7), not bullet `•`. Vertically centered with x-height of lowercase letters.

---

## 7. Logo lockups (deliverables)

Design **all** of the following:

### 7.1 Primary lockups

1. **Horizontal** — icon tile + `auto·apply` (default for dashboard header)  
2. **Icon only** — for extension toolbar, favicon, app icon  
3. **Stacked** — icon above wordmark (login hero only; not sidepanel)

### 7.2 Color variants (each lockup)

| Variant | Background | Mark / type |
|---------|------------|-------------|
| On dark | `#070B18` or transparent | White or gradient mark; wordmark `#EAF0FF` |
| On light | `#FFFFFF` or transparent | Gradient tile + dark wordmark `#0F172A`, OR dark mark on light |
| Monochrome white | Transparent | For gradient/marketing overlays |
| Monochrome black | Transparent | For print / fax / strict B&W |

### 7.3 Minimum sizes (must pass clarity test)

| Size | Context | Requirement |
|------|---------|-------------|
| **16×16** | Chrome favicon / toolbar | Icon only; no wordmark; no hairlines < 1px |
| **32×32** | Sidepanel header | Icon tile or icon only |
| **48×48** | Extension management | Icon with clear silhouette |
| **128×128** | Chrome Web Store | Full icon; subtle gradient OK |
| **512×512** | Store / marketing | Master app icon with safe padding (~10%) |

**Clear space:** Minimum padding = height of the “A” or icon tile on all sides.

---

## 8. Icon tile specification (if used)

Match bol·ai-style container without copying their wave graphic:

- **Shape:** Rounded square  
- **Corner radius:** ~37.5% of tile width (e.g. 12px at 32px)  
- **Fill:** Primary gradient (Palette 1) or solid brand blue (Palette 2)  
- **Mark inside:** White, single color, no extra drop shadow  
- **Optional:** Very subtle outer glow for marketing only — not in 16px favicon  

---

## 9. What to avoid

- Black square baked into PNG (always transparent master)  
- Clip-art briefcases, paper planes, robots, generic “AI brain”  
- Gradients on thin strokes at 16px (mud at small size)  
- “AutoApplyAI” in all caps in the primary lockup  
- Competing accent colors (orange + purple + blue in one mark)  
- Copying bol·ai’s exact wave/bar icon layout  

---

## 10. File delivery checklist

Provide to development team:

```
brand/
  logo-autoapply-horizontal-dark.svg
  logo-autoapply-horizontal-light.svg
  logo-autoapply-stacked-dark.svg
  logo-autoapply-icon-only.svg
  logo-autoapply-monochrome-white.svg
  logo-autoapply-monochrome-black.svg
  app-icon-16.png
  app-icon-48.png
  app-icon-128.png
  app-icon-512.png
  logo-preview-sheet.pdf          # all lockups on one page
  Figma source (optional)
```

**Format rules:**
- SVG: outlines converted to paths OR clean strokes; viewBox square for icon  
- PNG: @1x and @2x for 16, 48, 128, 512  
- No embedded raster inside SVG  

---

## 11. Usage mockups (designer to include in presentation)

Show logo on at least these surfaces:

1. Chrome extension sidepanel header (dark, ~360px wide)  
2. Dashboard login card (dark or light)  
3. Chrome Web Store listing icon (128px on white/gray checker)  
4. Browser tab favicon (16px)  

Optional: single primary CTA button beside logo using same gradient as mark.

---

## 12. Decision criteria (how we’ll choose)

| Criterion | Weight |
|-----------|--------|
| Readable at 16px | High |
| Says “automation + success” without text | High |
| Feels premium / modern AI (bol·ai tier) | High |
| Works on dark UI (primary product direction) | High |
| Distinct from bol·ai and job-board clichés | Medium |
| Continuity with current A + check concept | Medium |

---

## 13. Timeline & rounds

| Round | Output |
|-------|--------|
| **Round 1** | 3 rough concepts (A/B/C directions), B&W + one color |
| **Round 2** | 1 selected direction, all lockups + 16px test |
| **Round 3** | Final SVG/PNG export + preview sheet |

---

## 14. Contact & product links

- **Repo assets:** `/dist/logo.png`, `/dist/icon-*.png`  
- **Inspiration:** https://bol-ai.com/ (palette and tone only)  
- **Product:** Chrome extension — sidepanel onboarding + Firebase-backed dashboard  

---

## 15. One-sentence creative brief

> Design a compact, gradient-friendly mark for **auto·apply** that combines **speed** and **successful completion** (evolved from A + check + motion), works at 16px in Chrome, and feels as modern and premium as bol·ai — without copying their icon.
