# Mindful Companion — Brand Kit

> A quiet space to journal and feel heard.

Open [`brand-sheet.html`](brand-sheet.html) in a browser for the visual version of this
guide. Everything generated (logos, PNGs, tokens, OG image, the palette inside the
brand sheet) is rebuilt by [`tools/build.py`](tools/build.py); edit the source there,
not the outputs.

---

## 1. The idea

**A person, deeply heard and held.**

Someone opens this app on a heavy morning. They are not here to be fixed or
optimised; they want to put the morning into words and have something warm sit
with them while they do. This is not a conversation. It is one person being
listened to so closely that they hear themselves.

The mark says it in one line: **you arrive as a line; the mirror gives you back
in colour.** A face in profile, eyes closed, drawn in ink. Across a hairline,
its reflection returns in the four brand colours. "Mirroring" is what reflective
listening is called, and "reflection" is already the app's own word for the
companion's response.

**Personality:** quiet, warm, unhurried, honest. Light and airy.
**Not:** clinical, cheerful, gamified, "wellness industry".

Five principles that decide most design questions:

1. **Paper first.** Warm cream ground, plum ink. Never pure white, never pure black.
2. **Colour is what comes back.** The four families appear together only as the
   reflection (mark, wash, rule). Everywhere else they take turns.
3. **Serif for the human voice, sans for the interface.**
4. **Motion breathes.** Things fade and rise; nothing bounces, spins, or pops.
5. **Safety is always in view and never loud.**

---

## 2. Logo

### Files

| File | Use |
|---|---|
| `logo/lockup.svg` | **Default.** Horizontal lockup on light grounds (header, docs, email, decks). |
| `logo/lockup-dark.svg` | Same on dark grounds: the line and wordmark lift to night ink, the reflection keeps its colour. |
| `logo/lockup-mono.svg` | Single colour, inherits `currentColor`; the reflection is the same colour at 45%. |
| `logo/lockup-stacked.svg`, `-dark.svg` | Square placements, splash screens, story formats. |
| `logo/mark.svg`, `mark-dark.svg` | The mark alone, 32 px and up: app icon, avatar, inline UI. |
| `logo/mark-favicon.svg` | **The small cut**, 16–31 px: no eye, heavier line, flat lavender reflection. |
| `logo/mark-soft.svg` | Hero treatment: the reflection slightly blurred, as in still water. 96 px and up only. |
| `logo/mark-mono.svg` | Mark in `currentColor`. |
| `logo/wordmark.svg`, `-dark.svg`, `-mono.svg` | Wordmark alone, outlined (no font needed). |
| `logo/png/` | Raster exports: `mark-{16,32}` (favicon cut), `mark-{48,192,512}`, `favicon.ico`, `apple-touch-icon-180`, `avatar-1024`, `avatar-dark-1024`, lockups at 1200/800 wide. |
| `social/og-image.png` | 1200×630 share image (source: `social/og-image.svg`). |

### Anatomy

- **The line** is a right-facing profile in `ink`, stroke 2.8 on the 64-unit
  grid, drawn to classic proportions: hairline to brow, brow to nose base, nose
  base to chin in thirds. Forehead, brow, rounded nose, two soft lips, chin, and
  a neck that angles back.
- **The eye** is closed: a small arc tucked behind the brow, at 80% of the line
  weight. It is what makes this a person at rest rather than line art.
- **The glass** is a hairline at the centre, `ink` at 28%.
- **The reflection** is the same path mirrored across the glass, stroked with
  the reflection gradient, top to bottom: dawn, lavender, sky, mint. Nose to
  reflected nose is 12 units: enough air that it reads as a reflection, not a kiss.
- **Wordmark**: Fraunces, `opsz` 48, `SOFT` 60, `WONK` 0. "Mindful" at weight
  450 in `ink`; "Companion" italic at weight 400 in `lav-deep`. In the
  horizontal lockup the mark stands 1.45× the cap height on the baseline, gap
  0.22 em to the wordmark.

### Rules

- **Clear space:** a quarter of the mark's height on every side.
- **Sizes:** master mark from 32 px; favicon cut from 16 px; nothing below 16.
  Horizontal lockup from 140 px wide; stacked from 96 px.
- **Colour is fixed.** The line is `ink` (or night ink on dark grounds); the
  reflection is always the four-stop gradient. On busy grounds use `-mono`.
- **The soft-focus variant** is for hero moments only (landing, OG, splash). It
  is a treatment of the master, never a replacement for it.
- **Don't:** recolour the line, use a single flat colour for the reflection
  outside the favicon cut, open the eye, add a second person, close the head
  into a silhouette, rotate or skew, animate the mark itself, or bring back the
  rainbow ensō, the lucide `Cloud`, or the sun-and-cloud mark from v1.

### In the app

Keep the header wordmark as live text ("Mindful" + italic "Companion"); swap
the icon for inline `mark.svg` and the favicon set for `logo/png/`. If you want
the soft-focus look on the landing hero, apply `filter: blur(0.35px)` to the
reflection group of the inline SVG rather than shipping a second file.

---

## 3. Colour

Tokens live in [`colors/tokens.css`](colors/tokens.css) (light + `prefers-color-scheme: dark`)
and [`colors/tokens.json`](colors/tokens.json). Names match the Tailwind utilities
in `frontend/src/index.css`, with two changes the app has to adopt: `sage` is now
**`mint`**, and there is a new **`on-dawn`** token for text on the primary button.

**Proportions on any screen:** paper ≈ 70%, ink ≈ 20%, colour in the rest. The
four families appear *together* only as the reflection (mark, wash, rule); in
the UI they take turns as help-type tints.

### Palette

| Token | Light | Night | Role |
|---|---|---|---|
| `paper` | `#fcfaf6` | `#1b1a24` | Page ground |
| `card` | `#fffdfa` | `#23222e` | Cards, modals, header pills |
| `mist` | `#f4f1ea` | `#2b2a37` | Input wells |
| `ink` | `#46425c` | `#e8e5f0` | Primary text, the line of the mark |
| `ink-soft` | `#6f6b86` | `#a49fb8` | Secondary text, placeholders |
| **`dawn`** | `#f0916f` | same | Reflection stop 1. Decorative only |
| `dawn-deep` | `#d4603a` | same | The emphasised word in display headings (large text) |
| `dawn-soft` | `#fde6dc` | `#3d2a25` | Tint · *Learn patterns* |
| `dawn-strong` | `#b0472a` | `#f3a58a` | **Primary button fill**; text on dawn-soft |
| `dawn-stronger` | `#9c3d23` | `#f7b9a3` | Primary button hover |
| `on-dawn` | `#ffffff` | `#1b1a24` | Text on dawn-strong |
| **`lav`** | `#a98be0` | same | Reflection stop 2; favicon reflection |
| `lav-deep` | `#6e50b3` | `#c2aaee` | "Companion" in the wordmark; text on lav-soft |
| `lav-soft` | `#eee7fa` | `#2b2440` | Tint · *Ongoing support* |
| **`sky`** | `#6fa8e8` | same | Reflection stop 3; focus ring |
| `sky-deep` | `#3068a9` | `#8fc0f2` | Links; text on sky-soft |
| `sky-soft` | `#e2eefb` | `#1f2a3d` | Tint · *Just listen* |
| **`mint`** | `#6ec9a5` | same | Reflection stop 4. Decorative only |
| `mint-deep` | `#24765a` | `#86d6b6` | Text on mint-soft |
| `mint-soft` | `#e0f5ec` | `#1f3129` | Tint · *Quick help* |
| `alert` | `#a94a40` | `#f0a094` | Errors, destructive actions |
| `alert-soft` | `#fdebe9` | `#3a2426` | Alert background |
| `alert-fg` | `#ffffff` | `#1b1a24` | Text on an alert fill |
| `dusk` | `#575377` | same | Modal backdrop wash |

Gradients: `--gradient-reflection` (dawn → lav → sky → mint, top to bottom) is
the mark's reflection and the only place the four appear at full strength.
`--gradient-wash` (the four `-soft` tints, 135°) is the ambient page wash,
replacing the v1 `sky-wash` and `dawn-glow`.

### Rules

- **The bright four are decorative.** `dawn`, `lav`, `sky`, `mint` never carry
  text. Text on a tint is that family's `-deep`. Never cross families.
- **Buttons** are `dawn-strong` with `on-dawn` text in both themes. Never
  hardcode white on the button; night flips the pair.
- **Links** are `sky-deep`, underlined in running text.
- **"Companion"** in the wordmark is `lav-deep`. The gradient is never used on
  text below 32 px.
- **Alert** only for errors and destructive actions.
- **Hairlines** are `ink` at 10–14% alpha. Never a border and a shadow on the
  same element.

### Contrast (WCAG, measured by the build, which fails if any drops below 4.5)

| Pair | Light | Night |
|---|---|---|
| ink on paper | 9.2 | 13.9 |
| ink-soft on paper | 4.9 | 6.8 |
| on-dawn on dawn-strong (button) | 5.6 | 8.7 |
| sky-deep on paper / on sky-soft | 5.5 / 4.9 | 9.0 / 7.5 |
| lav-deep on paper / on lav-soft | 5.8 / 5.0 | 8.4 / 7.2 |
| mint-deep on paper / on mint-soft | 5.3 / 4.8 | 10.1 / 8.1 |
| dawn-strong on dawn-soft / on paper | 4.6 / 5.3 | 6.8 / 8.7 |
| alert on alert-soft / on paper | 4.9 / 5.4 | 7.0 / 8.3 |

This closes the v1 ceiling where the help-type chips sat at 3.3–3.9:1. The
exact numbers are also written into `colors/tokens.json`.

---

## 4. Typography

Both families are variable fonts under the SIL Open Font License, shipped in
[`fonts/`](fonts/) with [`fonts.css`](fonts/fonts.css) (`@font-face` for the
local files, plus the Google Fonts link the app uses today).

### Fraunces — the voice

Headings, the AI reflection, the wordmark, pull quotes. Used light it feels
like a good book, used bold it feels like a wine label. We stay light.

- **Weights:** 300 for display and titles, 400 for prose, 450–500 only in the
  wordmark. Never 600+.
- **Italic is the companion's voice:** the emphasised word in a heading
  (*today*), "Companion" in the wordmark, quotes inside a reflection.
- **Axes:** `opsz` auto (leave `font-optical-sizing: auto`). `SOFT` 0 in UI
  text, 60 in the logo. `WONK` 0 always.

### Nunito Sans — the interface

Body copy, buttons, labels, forms, tables, the footer.

- **Weights:** 400 body, 500 button labels, 600 chip labels and eyebrows.
  Never below 300.

### Scale

| Style | Face | Size / line | Notes |
|---|---|---|---|
| Display | Fraunces 300 | 36 / 1.15 | Page question. One per page. Emphasised word in `dawn-deep` italic. |
| Title | Fraunces 300 | 24 / 1.25 | Section and modal titles |
| Reflection | Fraunces 400 | 17.2 / 1.75 | The AI response (`.prose-calm`), max 62 ch, markers and rules in `dawn` |
| Card title | Fraunces 400 | 20 / 1.3 | Entry titles |
| Body | Nunito Sans 400 | 16 / 1.6 | Everything else |
| Small | Nunito Sans 400 | 14 / 1.5 | `ink-soft`; captions, the footer |
| Eyebrow | Nunito Sans 400 | 12 / 1 | Uppercase, `letter-spacing: 0.15em`, `ink-soft` ("From your companion") |
| Button | Nunito Sans 500 | 16 / 1 | Sentence case, never uppercase |

Sentence case everywhere except eyebrows. No underlines except on links inside
running text.

---

## 5. Shape, space, elevation

| Token | Value | Where |
|---|---|---|
| `radius-pill` | 9999px | Every button, chip, nav item. If you can press it in a row, it is a pill. |
| `radius-card` | 24px | Cards, modals, the writing surface |
| `radius-field` | 16px | Inputs and wells |
| Spacing base | 4px | Tailwind scale; component padding 16–24, section gaps 32–48 |
| Page gutter | 24px | `px-6`; content max-width 896px (`max-w-4xl`) |
| `shadow-soft` | `0 6px 24px ink/8%` | Resting cards and the primary button |
| `shadow-lift` | `0 12px 36px ink/14%` | Hover, modals |

Cards sit on paper with the soft shadow and no border. Wells sit inside cards
on mist with no shadow. Focus is a 2 px `sky` outline, offset 2 px, on every
control; the writing surface shows focus on its card instead.

---

## 6. Motion

| Name | Duration / easing | Use |
|---|---|---|
| `fade-rise` | 400 ms `cubic-bezier(0.22, 1, 0.36, 1)` | Anything entering: cards, reflections, modals |
| `fade-in` | 350 ms ease-out | Overlays, backdrops |
| hover | 200 ms | Colour and shadow changes |
| `breathe` | 2.6 s ease-in-out, loop | Waiting states (opacity 0.55 → 1) |
| `cloud-drift` | 75–185 s linear, loop | Ambient background clouds only |
| `write-line` / `write-nib` | 2.8 s / 1.15 s | The "companion is writing" loader |

Nothing bounces, overshoots, spins or scales past 1. Under
`prefers-reduced-motion` every loop stops and entrances become plain fades.
The logo itself never animates; the reflection may fade in after the line on a
splash screen, once.

---

## 7. Iconography and imagery

- **Icons:** [lucide](https://lucide.dev), `strokeWidth` 1.75, 18 px inline, 26 px
  in the header. Help types keep their icons: Ear, Sparkles, Sprout, Waves.
- **Illustration:** single-weight line drawings in `ink`, colour only where
  something is returned or reflected. Soft blurred ellipses for clouds over the
  wash. The mark sets the style; follow it.
- **Never:** stock photos of people meditating, brains, heads with gears,
  puzzle pieces, lotuses, filled head silhouettes, two different people
  talking, chat bubbles with robot faces.

---

## 8. Voice

Second person, present tense, sentences that could be said softly across a
table. The companion reflects; it does not diagnose, prescribe or cheer.

**Say**

- "Save quietly" — verbs stay gentle and specific.
- "Just listen" · "I need someone to hear me" — the user's words, not clinical labels.
- "From your companion" — companion, never therapist, coach or assistant.
- "When you're ready" — permission, not prompts.
- "A space for reflection, not a substitute for professional care."

**Don't**

- "Unlock your best self!" — no hype, no exclamation marks, ever.
- "Your therapist is typing…" — never imply clinical care.
- "Streak: 7 days 🔥" — no gamification, no emojis, no guilt.
- "Journey", "wellness", "self-care routine" — industry words; say what you mean.
- "You should…" — the companion does not tell people what to do.

**Safety line.** Every surface where someone can write carries, within reach
and in `small`: *If you are in crisis or thinking about harming yourself, call
or text 988 (US) or find a helpline where you are.* It is never hidden behind a
click and never styled as an alert.

---

## 9. What this kit changes (v2, after the logo workshop)

| Was | Now | Why |
|---|---|---|
| Rainbow brush-stroke ensō favicon | The profile mark, with a dedicated 16–31 px cut | The ensō had no relation to the type or copy; the new favicon is the brand at small size. |
| lucide `Cloud` as the logo, then a sun-and-cloud mark (v1) | A face and its reflection | Six workshop rounds: the brief became "deeply heard and held", and the mirror is the one image that says listening without saying conversation. |
| Muted plum + terracotta as the only accents | Four light, bright families (dawn, lavender, sky, mint) over the same ink and paper | The old pair was mid-value and low-chroma on both sides, so it read as bland. Colour is now what the mirror gives back. |
| `sage` family | `mint` | The hue moved from grey-green to mint; the name should say so. |
| White hardcoded on the primary button | `on-dawn` token | Night flips the button to light peach with dark text so the chip and the button can share `dawn-strong`. |
| Help-type chips at 3.3–3.9:1 | All `-deep` on `-soft` pairs ≥ 4.6:1, enforced by the build | The build asserts every text pair in both themes. |
| Button labels at weight 400 | 500 | Pills at 400 read as text. |

Typefaces, radii, shadows, motion and OS-only dark mode are unchanged.

### Adopting it in the app

Done in September 2026; kept as the checklist for any future rebuild.

1. Copy `logo/png/favicon.ico`, `mark-192.png`, `mark-512.png`,
   `apple-touch-icon-180.png` into `frontend/public/`; delete `favicon.png`
   (the 1 MB ensō); update the `<link rel="icon">` tags.
2. Replace `social/og-image.png` → `frontend/public/og-image.png`.
3. In `Header.tsx`, inline `logo/mark.svg` in place of `<Cloud>` (keep the
   `aria-label`, keep the live-text wordmark).
4. Replace the `@theme` colour block in `frontend/src/index.css` with
   `colors/tokens.css` values; rename `sage-*` utilities to `mint-*`; change
   the primary button's `text-white` to `text-on-dawn`; swap `sky-wash` +
   `dawn-glow` for `--gradient-wash`.
5. Optional: `font-medium` on the primary and outline buttons.

---

## 10. Files

```
branding-kit/
├── README.md               this guide
├── brand-sheet.html        visual one-pager (open in a browser)
├── logo/                   SVG masters + png/ exports
├── colors/                 tokens.css, tokens.json (with measured contrast)
├── fonts/                  Fraunces + Nunito Sans (variable TTF), OFL licences, fonts.css
├── social/                 og-image.svg / .png
└── tools/build.py          regenerates everything above except fonts and this guide
```

### Rebuilding

```sh
python3 -m venv .venv && .venv/bin/pip install fonttools uharfbuzz pillow resvg-py
.venv/bin/python branding-kit/tools/build.py
```

The wordmark is outlined from the real Fraunces file with HarfBuzz shaping, so
kerning is the font's own and no viewer needs the font installed. The palette,
the profile path and the lockup proportions are constants at the top of the
script, and the build fails if any text pair falls below AA.
