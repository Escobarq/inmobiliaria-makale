# Accessibility WCAG AA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Makale homepage usable with keyboard navigation, screen readers, visible focus, sufficient contrast, and reduced-motion preferences.

**Architecture:** Keep the existing Astro page structure and vanilla CSS/JavaScript. Add accessibility behavior at the owning layer: semantic markup in `index.astro`, interaction state in `site.js`, and visual/focus behavior in `global.css`.

**Tech Stack:** Astro 5, Astro Image, vanilla HTML, CSS, and JavaScript; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-01-accessibility-design.md`

## Global Constraints

- Preserve Astro + vanilla CSS + vanilla JavaScript; do not add UI libraries.
- Preserve the existing visual identity and responsive layout.
- Keep optimized Astro `Image` components and explicit image dimensions.
- Do not claim formal legal WCAG certification.

## Review Focus

- Keyboard users can skip repetitive navigation and reach every interactive element; test the skip link and tab order in `src/pages/index.astro`.
- Screen-reader users receive correct menu state and can understand form feedback; test `aria-expanded`, `aria-controls`, `aria-live`, and labels.
- Users who prefer reduced motion do not receive smooth scrolling or hover movement; test the `prefers-reduced-motion` CSS branch and JavaScript scroll behavior.
- Long or empty search input does not produce broken feedback; test trimmed and blank location values in `src/scripts/site.js`.
- Focus remains visible on links, buttons, selects, and inputs at desktop and mobile widths; test the shared `:focus-visible` rules in `src/styles/global.css`.

---

### Task 1: Semantic page landmarks and accessible controls

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces a skip link targeting `#main-content`.
- Produces a `main` landmark with `id="main-content"`.
- Preserves existing labels, `aria-live`, image alt text, and navigation links.

- [ ] Add a visually hidden but focusable “Saltar al contenido principal” link before the header, and add `id="main-content"` to the page’s `<main>`.
- [ ] Add `autocomplete="organization"` only where relevant to the brand metadata if needed; keep the existing document language and add a matching `theme-color` metadata value.
- [ ] Add `autocomplete="off"` to the non-authenticated property search form and `autocomplete="address-level2"` to the location input.
- [ ] Ensure the mobile menu button text and state are understandable without relying on the icon; keep `aria-label`, `aria-expanded`, and `aria-controls` synchronized.
- [ ] Ensure all meaningful images have descriptive `alt` text and decorative SVGs retain `aria-hidden="true"`.
- [ ] Run `npm test` and confirm the existing 2 tests still pass.

### Task 2: Keyboard focus, contrast, anchors, and reduced motion

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Provides visible `:focus-visible` styles for links, buttons, selects, and text inputs.
- Provides reduced-motion behavior for smooth scrolling and hover transforms.

- [ ] Add a `.skip-link` style that is visually hidden until focused and remains readable above the header.
- [ ] Add consistent `:focus-visible` styles using a high-contrast outline and offset; do not remove native focus without a replacement.
- [ ] Add `scroll-margin-top` to major section targets so keyboard focus is not hidden under the header.
- [ ] Add `@media (prefers-reduced-motion: reduce)` to disable smooth scrolling and transform transitions.
- [ ] Adjust only low-contrast secondary text colors that fail against their backgrounds; preserve the existing red, black, cream, and white palette.

### Task 3: Accessible menu interaction and search behavior

**Files:**
- Modify: `src/scripts/site.js`

**Interfaces:**
- Menu button controls `#main-nav` with `aria-expanded` and `aria-hidden`.
- Escape closes the menu and returns focus to the menu button.
- Search feedback remains written to `#search-feedback` and respects reduced-motion preference.

- [ ] Set the menu’s initial `aria-hidden` state from JavaScript and update it whenever the menu opens or closes.
- [ ] On menu open, keep focus behavior predictable; on Escape or link activation, close the menu and return focus to the toggle when appropriate.
- [ ] Respect `window.matchMedia('(prefers-reduced-motion: reduce)')` when scrolling to the properties section.
- [ ] Keep the existing trimmed-location behavior and avoid errors if the feedback element is absent.
- [ ] Run `npm test` and confirm all tests pass.

### Task 4: Build and manual accessibility verification

**Files:**
- Verify: `src/pages/index.astro`
- Verify: `src/styles/global.css`
- Verify: `src/scripts/site.js`

- [ ] Run `npm test`; expected result is 2 passing tests and 0 failures.
- [ ] Run `npm run build`; expected result is a successful Astro static build with no accessibility warning or compilation error.
- [ ] Inspect the generated HTML for the skip link, `main` landmark, eager hero/header images, labels, and menu ARIA state.
- [ ] Manually verify keyboard order: skip link → header links → phone/menu → main controls; verify visible focus and Escape menu close.
- [ ] Manually verify at mobile width that the menu remains reachable and the phone icon remains labeled for assistive technology.
