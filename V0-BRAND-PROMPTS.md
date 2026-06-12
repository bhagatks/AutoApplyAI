# Using v0.app for AutoApplyAI Brand & Logo

v0 excels at **React + Tailwind UI** and **inline SVG icons**. Use it to explore the mark, preview lockups on real screens, and export SVG from generated components.

**Less ideal in v0 alone:** final 16×16 PNG favicons, print-ready brand guidelines. Export SVG from v0, then use [SVGOMG](https://jakearchibald.github.io/svgomg/) + a PNG converter for Chrome store assets.

---

## Recommended workflow

1. **Prompt 1** → icon + wordmark as SVG React component  
2. **Prompt 2** → brand preview page (all variants on dark/light)  
3. **Prompt 3** → Chrome extension sidepanel shell with logo in header  
4. Copy SVG paths from v0 output → save as `public/logo.svg`, `public/icon.svg`  
5. Generate PNGs: export 512 from preview, resize to 128/48/16  

Attach **`LOGO-BRIEF.md`** in v0 chat if the product supports file context, or paste the **Short context block** below into every prompt.

---

## Short context block (paste at top of every v0 prompt)

```
Product: auto·apply — Chrome extension that tailors resumes to job descriptions with AI.
Brand feel: modern premium AI SaaS (like bol-ai.com), professional, fast, trustworthy.
Colors: background #070B18, panels #111834, gradient #7C5CFF → #4F9DFF → #27E0C0, text #EAF0FF, muted #9AA6C8.
Wordmark: lowercase "auto·apply" with middle dot (·), font Sora or Plus Jakarta Sans.
Icon concept: letter A + checkmark (success) + 2 speed lines (automation). Optional rounded-square gradient tile behind icon.
Do NOT: black square background, robots, briefcases, copy bol-ai wave bars exactly, spell "AI" in the logo.
```

---

## Prompt 1 — Logo icon (SVG component)

Use this first. Ask v0 to output a **single React component** with inline SVG only.

```
Create a React component `AutoApplyLogo` with inline SVG (no img tags, no external assets).

Icon mark:
- Stylized capital "A" with a checkmark forming the crossbar (application success)
- Two horizontal speed lines on the left (automation / fast)
- Clean geometric shapes, works at 16px — no hairlines thinner than 2px at 32px viewBox
- viewBox="0 0 32 32"

Variants via props:
- `variant`: "icon-only" | "horizontal" | "stacked"
- `theme`: "dark" | "light"
- `showTile`: boolean — when true, wrap icon in rounded square (radius 37%) with gradient fill linear-gradient(120deg, #7C5CFF, #4F9DFF, #27E0C0) and white mark inside

Wordmark for horizontal/stacked: "auto·apply" lowercase, Sora or system sans, weight 600.

For dark theme: wordmark #EAF0FF on transparent.
For light theme: wordmark #0F172A on transparent.

Export three sizes in a demo row: 16px, 32px, 64px to prove legibility.

Return only the component + a small preview grid. No backend.
```

**After generation:** Copy the `<svg>...</svg>` block into `public/icon.svg`. Simplify paths with SVGOMG if needed.

---

## Prompt 2 — Brand preview page

Use to compare directions and pick a winner.

```
Build a single-page brand preview for "auto·apply" (dark theme).

Layout:
- Hero: horizontal logo (gradient tile + wordmark) + tagline "Tailored applications in one click."
- Section "Icon only": 16, 32, 48, 128px sizes on checkerboard + on #070B18
- Section "Lockups": horizontal, stacked, monochrome white, monochrome black
- Section "Color palette": swatches for #070B18, #111834, #7C5CFF, #4F9DFF, #27E0C0, #EAF0FF, #9AA6C8
- Section "Buttons": primary pill CTA with same gradient as logo tile + soft glow shadow
- Section "Typography": Sora/Plus Jakarta Sans samples for H1, body, caption

Background: #070B18 with subtle purple/teal corner radial glows (very subtle, like bol-ai.com).

All logo graphics must be inline SVG in React — no placeholder images.
```

---

## Prompt 3 — Direction B alternate (pipeline icon)

If Prompt 1 feels too close to your old logo, try this alternate.

```
Create `AutoApplyLogoPipeline` — alternate icon direction for auto·apply.

Icon: 3 vertical bars suggesting job → AI → done (document in, tailored resume out).
- Left bar shortest, middle tallest, right bar medium with small check cutout or check above
- Bars use gradient fill #7C5CFF → #4F9DFF → #27E0C0
- Inside rounded square tile 32x32, radius 12px
- Must read clearly at 16px — simplify to 3 solid rounded rects, no thin gaps

Include horizontal lockup: tile + "auto·apply" wordmark.
Dark preview page only. Inline SVG only.
Compare side-by-side with a text label "Direction B — Pipeline"
```

---

## Prompt 4 — Extension sidepanel mock (logo in context)

Validates header size and dark UI together.

```
Chrome extension sidepanel mockup, 360px wide, full height, dark theme.

Header (fixed):
- Left: auto·apply logo (32px gradient tile + wordmark, inline SVG)
- Right: settings icon button ghost style

Body:
- Title "Get started" as muted section label (not huge centered gradient text)
- Card with dashed border: "Upload resume PDF or DOCX"
- Primary pill button: "Verify API key" with gradient #7C5CFF → #27E0C0
- Form fields: dark panels #111834, border rgba(255,255,255,0.09), radius 12px

Colors from brand: bg #070B18, text #EAF0FF, muted #9AA6C8.
Font: Plus Jakarta Sans.

This is a static UI mock — no real file upload logic.
```

---

## Prompt 5 — App icon / Chrome store tile

```
Square app icon 512×512 for Chrome Web Store, React component with SVG.

Design:
- Rounded square app icon shape (iOS style superellipse or 22% corner radius)
- Background: gradient 120deg #7C5CFF → #4F9DFF → #27E0C0
- Center: white simplified A + checkmark + 2 speed lines (no speed lines if too busy at small size)
- Safe padding 10% from edges
- Show preview at 512, 128, 48, 16 in a grid

Must be recognizable at 16px — test by rendering 16px preview next to 512.
Inline SVG only.
```

---

## Iteration prompts (after first result)

**Simplify for small sizes:**
```
Simplify the icon for 16px favicon: remove speed lines, thicken strokes, merge paths to single white silhouette on gradient tile.
```

**Closer to bol·ai tone:**
```
Make the UI feel more like bol-ai.com: softer glow on CTA, pill nav buttons, larger border-radius on cards (18px), section eyebrow labels in muted uppercase tracking.
```

**Light mode variant:**
```
Duplicate the sidepanel mock in light mode: bg #F8FAFC, panels white, wordmark #0F172A, keep gradient tile icon unchanged.
```

**Fix wordmark:**
```
Change wordmark to exactly "auto·apply" with Unicode middle dot U+00B7 between auto and apply. Lowercase only. Weight 600.
```

---

## Exporting from v0 into this repo

| v0 output | Save as | Used in |
|-----------|---------|---------|
| Icon SVG paths | `public/icon.svg` | Extension icons, favicon source |
| Horizontal logo SVG | `public/logo.svg` | Sidepanel/dashboard header |
| Brand preview | Reference only | Pick colors before editing `style.css` |
| Sidepanel mock | Reference / copy layout | `MicroOnboarding.tsx`, `style.css` |

**PNG generation (after SVG is final):**
```bash
# Example with rsvg-convert or any SVG→PNG tool
rsvg-convert -w 128 -h 128 public/icon.svg -o public/icon-128.png
rsvg-convert -w 48 -h 48 public/icon.svg -o public/icon-48.png
rsvg-convert -w 16 -h 16 public/icon.svg -o public/icon-16.png
```

Or use Figma / Photopea: import SVG, export @1x and @2x.

---

## What to send back when ready

When you have a v0 design you like, share:
1. Link to v0 chat or exported SVG  
2. Which direction (A evolve / B pipeline)  
3. Palette choice (gradient AI vs blue professional)  

We can wire assets into `public/`, update `manifest.json` icons, and apply dark theme tokens in `src/sidepanel/style.css`.
