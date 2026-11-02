# CSS Responsive Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the homepage CSS with scalable units, browser-safe fallbacks, and purposeful accessible animations without changing the visual identity.

**Architecture:** Keep `src/styles/global.css` as the single style entry point. Consolidate reusable values into CSS custom properties, use fluid CSS functions for layout and type, and keep interaction state in the existing `src/scripts/site.js`. Use CSS transforms and opacity for motion, with reduced-motion overrides.

**Tech Stack:** Astro 7, vanilla CSS, vanilla JavaScript, no animation dependencies.

**Spec:** `docs/superpowers/specs/2026-11-01-css-responsive-motion-design.md`

## Global Constraints

- Preserve Astro + vanilla CSS + vanilla JavaScript; add no UI libraries.
- Preserve Makale’s existing content, palette, typography, and section structure.
- Prefer `rem`, `%`, `fr`, `clamp()`, `min()`, `max()`, and viewport units for scalable values.
- Keep pixel-equivalent hairlines, SVG geometry, and other precision values when replacing them would reduce clarity or compatibility.
- Animate `transform` and `opacity` before layout properties.
- Respect `prefers-reduced-motion: reduce` by disabling non-essential motion.
- Preserve visible focus, contrast, keyboard access, and touch target sizes.

## Review Focus

- At narrow widths, no horizontal overflow is introduced by fluid sizing or navigation transitions; verify at 320px, 375px, and 800px.
- At wide widths, content remains bounded and does not become excessively large; verify at 1440px.
- With reduced motion enabled, no reveal, hover, menu, or scroll animation persists; verify CSS and existing JavaScript behavior.
- In browsers without newer CSS features, the page retains readable spacing and usable controls through fallback declarations and `@supports` guards.
- Keyboard focus remains visible during animated hover/focus states and the menu remains reachable while opening and closing.

---

### Task 1: Add CSS tokens and fluid sizing foundation

**Files:**
- Modify: `src/styles/global.css`
- Modify: `test/properties.test.mjs`

**Interfaces:**
- Produces reusable tokens for spacing, type scale, motion duration/easing, and hairline borders.
- Keeps existing selectors and markup unchanged.

- [ ] Add failing assertions for CSS tokens, fluid typography, and non-pixel responsive breakpoints.
- [ ] Run `npm test` and confirm the new assertions fail for the current stylesheet.
- [ ] Add a compact `:root` token set and migrate repeated spacing, typography, and breakpoint values to `rem`, `clamp()`, `%`, `fr`, `min()`, or `max()` where appropriate.
- [ ] Keep a documented small set of precision values for hairlines, SVG strokes, and image geometry instead of forcing unsuitable conversions.
- [ ] Replace the current `px` media-query thresholds with `rem` thresholds and retain the existing responsive behavior.
- [ ] Run `npm test` and confirm all tests pass.

### Task 2: Improve cross-browser CSS behavior

**Files:**
- Modify: `src/styles/global.css`
- Modify: `test/properties.test.mjs`

**Interfaces:**
- Provides fallback-first declarations for modern layout and visual features.
- Does not require JavaScript feature detection or new dependencies.

- [ ] Add failing assertions for fallback declarations, logical spacing where safe, and guarded modern features.
- [ ] Run `npm test` and confirm the new assertions fail.
- [ ] Add fallback-first rules for sticky/transparent header behavior, text wrapping, focus appearance, and backdrop effects if used.
- [ ] Add `@supports` only around optional enhancements such as `backdrop-filter`; keep a usable base style before the feature block.
- [ ] Replace fragile fixed widths/heights with `min()`, `max()`, `clamp()`, `aspect-ratio`, or `min-block-size` only where the rendered layout remains equivalent.
- [ ] Run `npm test` and confirm all tests pass.

### Task 3: Add purposeful animations and accessible menu motion

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/scripts/site.js`
- Modify: `test/properties.test.mjs`

**Interfaces:**
- Adds CSS keyframes/classes for hero entrance, section reveal, cards, buttons, service links, and menu transitions.
- Preserves the existing `menuToggle` state contract: `.is-open` and `aria-expanded`.
- Keeps `prefersReducedMotion` behavior in JavaScript for scrolling.

- [ ] Add failing assertions for animation keyframes, transform/opacity transitions, menu transition states, and a reduced-motion override.
- [ ] Run `npm test` and confirm the new assertions fail.
- [ ] Add short, non-looping entrance motion using `opacity` and `transform`; avoid animating layout-heavy properties.
- [ ] Replace menu `display`-only visibility switching with an animatable opacity/visibility/pointer-events pattern while preserving keyboard usability and the `.is-open` state.
- [ ] Add hover/focus motion for cards, buttons, and service links without hiding focus indicators.
- [ ] Add `@media (prefers-reduced-motion: reduce)` overrides that disable keyframes, transitions, transforms, and delayed reveals.
- [ ] Update JavaScript only if needed to synchronize menu state or prevent focus entering a closed menu; do not add a new animation library.
- [ ] Run `npm test` and confirm all tests pass.

### Task 4: Validate responsive rendering and audits

**Files:**
- Verify: `src/styles/global.css`
- Verify: `src/scripts/site.js`
- Verify: `src/pages/index.astro`

- [ ] Run `npm test`; expected result is 5 passing tests and 0 failures.
- [ ] Run `npm run build`; expected result is a successful Astro static build.
- [ ] Run `npm audit`; expected result is 0 vulnerabilities.
- [ ] Run Lighthouse against the local homepage and confirm accessibility remains passing, including contrast and reduced-motion-related checks.
- [ ] Inspect the page at 320px, 375px, 800px, and 1440px for overflow, clipped content, menu usability, visible focus, and animation quality.
- [ ] Confirm no unnecessary fixed-pixel declarations remain in layout, type, or breakpoints; retain only justified precision values.
