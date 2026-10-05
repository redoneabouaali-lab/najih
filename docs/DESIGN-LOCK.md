# Najih — Design Lock

Reference lock and decision ledger. Once committed, tokens and rules below are the source of
truth for the UI. Deviations require updating this file in the same change.

- **Date locked:** 2026-10-03
- **Method:** bundled `refero-design` references (`typography.md`, `color.md`,
  `anti-ai-slop.md`). Live Refero was unavailable (`NO_SUBSCRIPTION`), and the bundled
  fallback was explicitly approved.
- **Scope:** light theme only. Dark mode is not part of this system.

---

## 1. North star

**Exam paper precision.**

Najih prepares Moroccan students for a national exam. The interface should read like a
well-set, authoritative study document that happens to be a fast product: high contrast,
quiet surfaces, deliberate type, and a single restrained brand voice. Confidence comes
from precision and whitespace, never from decoration.

Success criteria for any new surface:

1. A new user can tell what to do next without reading body copy.
2. Nothing on screen moves unless it communicates state or feedback.
3. There is exactly one thing that looks clickable per group of content.

---

## 2. Signature move

**Hairline structure over boxed chrome.** Content groups are separated by 1px rules,
whitespace, and type weight. Surfaces appear only where something is genuinely
interactive. Most screens should contain fewer bordered boxes than the previous version,
not more.

Second move: **numerals as evidence.** Statistics and progress numbers are set in
Space Grotesk at display size in solid ink, never gradient-filled, never animated
continuously. They count up once on entry and then hold still.

---

## 3. Color

### Tokens

| Token | Value | Role |
| --- | --- | --- |
| `--canvas` | `#F7F7F5` | page background, faint warm neutral |
| `--surface` | `#FFFFFF` | cards, panels, menus, overlays |
| `--surface-sunk` | `#F1F1EE` | inset wells, table stripes, input fills |
| `--ink` | `#15181C` | headings, primary text, strong fills |
| `--ink-2` | `#3B424A` | body copy |
| `--ink-3` | `#6B7280` | meta, captions, helper text |
| `--line` | `#E4E4E0` | hairline border, divider |
| `--line-strong` | `#CDCDC7` | emphasized border, input resting |
| `--brand` | `#1B3A63` | primary action, active nav, links, focus |
| `--brand-strong` | `#14294A` | primary action hover/active |
| `--brand-tint` | `#EDF1F6` | section bands, subtle fills |
| `--success` | `#0E7A55` | correct answers, progress, completion |
| `--success-tint` | `#E9F4EF` | success surface |
| `--warn` | `#9A6200` | caution, pending |
| `--danger` | `#B3261E` | incorrect answers, destructive actions |

`--success` is reserved. Because the brand is blue, green never reads as "brand" here,
so it carries one unambiguous meaning: the student got it right.

### Rules

- One brand hue. Green, amber, and red are **semantic only** — never decoration.
- No gradient text, no multi-hue gradients, no gradient fills on text.
- No gradient on scrollbars, borders, or progress tracks.
- Contrast: body text ≥ 4.5:1, large text and UI ≥ 3:1. White on `--brand` is 11.4:1.
- Color is never the only signal; pair it with a label, icon, or border change.

### Explicitly rejected

Indigo/violet primaries and every `indigo → sky` gradient; purple, pink, and amber as
decorative accents; a second "tech blue" beside the brand blue; blue-tinted slate neutrals
that read as generic SaaS.

---

## 4. Typography

Two families, each with an explicit job. This is the one defensible reason to use two.

| Role | Family | Use |
| --- | --- | --- |
| Display + numerals | Space Grotesk | headlines, statistics, exam codes, buttons, logo |
| Text | IBM Plex Sans Arabic | body copy, UI labels, forms, long reading |

Weights resolve to 400/500/600/700 in the stack, but the app self-hosts only what
it uses: the Latin subset of Space Grotesk and the Arabic subset of IBM Plex Sans
Arabic. Space Grotesk earns its place through its distinctive numerals in
statistics and exam references; IBM Plex Sans Arabic is a highly legible Arabic
text face, so Arabic and French share one rhythm.

### Scale — 6 steps, no more

| Token | Size | Use |
| --- | --- | --- |
| `--text-caption` | 13px | captions, meta, table headers |
| `--text-body` | 17px | body copy (unchanged for Arabic readability) |
| `--text-lead` | 20px | lead paragraph under a headline |
| `--text-subheading` | 24px | card and section sub-headings |
| `--text-heading` | `clamp(32px, 4.2vw, 46px)` | section headings |
| `--text-display` | `clamp(38px, 5.6vw, 62px)` | hero only |

Rules: headline tracking `-0.02em`, never below `-0.03em`. Body line-height `1.6`.
Arabic and French share one scale — do not size French down. No 11px or 12px text.

---

## 5. Spacing, radius, elevation

Spacing keeps the existing section rhythm (`--section-gap: 64px`, `--card-padding: 22px`).

| Token | Value | Use |
| --- | --- | --- |
| `--r-sm` | 8px | inputs, small controls |
| `--r-md` | 12px | buttons, chips |
| `--r-lg` | 16px | cards, panels, overlays |
| `--r-pill` | 999px | genuine pills only: tags, status dots, avatars |

- No default container radius above 16px.
- Pills are for tags and statuses, not for buttons, inputs, or navigation rails.
- Elevation is reserved for things that float: header when scrolled, menus, modals,
  the AI panel, the mobile drawer. `--shadow-md` and `--shadow-lg` use **ink-tinted**
  neutral shadows, never brand-tinted shadows.
- Static content has no shadow.

---

## 6. Surfaces and components

- **Card** — only when the whole card is one click target. White surface, 1px
  `--line`, radius 16, no shadow at rest. Hover: border → `--line-strong`,
  `translateY(-2px)`, `--shadow-sm`.
- **Button** — solid `--brand`, white text, radius 12, `--shadow-sm`. Hover
  darkens to `--brand-strong` and lifts 1px. Secondary is transparent with a 1px
  `--line-strong` border. No sheen, no gradient, no shimmer sweep.
- **Navigation** — flat text links on the header surface. The active item is marked by
  `--brand` text plus a 2px underline, not by a filled gradient pill with a glow.
- **Stat** — not a card. Values sit in a row separated by hairlines, directly on the
  canvas.
- **Tag** — neutral tint, hairline border, radius pill. Reserved for counts and labels.
- **Overlay** — scrim `rgba(21,24,28,.5)` with a 4px blur; surface white, radius 16,
  `--shadow-lg`.

---

## 7. Icons

Emoji are **not** icons. Subject and feature iconography uses one inline SVG line set at
`stroke-width: 1.5`, 20–24px, `currentColor`, round caps and joins. The same set is used
everywhere so weights match.

Emoji may still appear inside `<title>` and headings where they act as a compact subject
shorthand for search, but never as a UI affordance or as the only label.

---

## 8. Motion

- Two durations only: `--dur-1: 160ms`, `--dur-2: 240ms`. One easing curve.
- Motion must communicate state, feedback, or hierarchy. It is never ambient.
- **No** infinite decorative animation: aurora, blobs, orbits, sparkles, confetti,
  marquees, sheen sweeps, gradient shifts, pulse glows, floating loops, 3D tilt.
- Allowed: page enter, scroll reveal (opacity + 8–18px), count-up on entry, button
  press, panel and menu open, focus and hover transitions.
- Hover movement never exceeds 2px and never scales an element past 1.02.
- `prefers-reduced-motion: reduce` must leave all content visible and static. Scroll
  reveals fall back to visible; smooth scrolling is disabled.

---

## 9. Do / don't

**Do** — one brand hue, hairline structure, real whitespace, a 6-step type scale,
functional motion, SVG line icons, semantic green/amber/red, bilingual parity.

**Don't** — introduce indigo or violet, add a second accent hue, add a gradient to
text or borders, put content in a card merely to group it, restore a left accent stripe,
return emoji to the UI, add shadow to static content, or add motion that no one asked
for.