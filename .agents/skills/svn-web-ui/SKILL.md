---
name: svn-web-ui
description: Build or change server-rendered web UIs with native browser enhancements and component-local HTML, CSS, and scripts. Use for page architecture, styling, navigation, forms, dialogs, and interactions. Server and component-library agnostic.
---

# SVN web UI architecture

Build a multi-page application whose server returns a complete, meaningful HTML document for every page URL. Each page must work when opened directly, refreshed, or reached through a normal link or form. Use the project's existing server, templates, and component system; this skill does not prescribe Hono or Web Awesome.

Aim for the responsiveness of a single-page application with the browser's own navigation and interaction features. Add an enhancement only when it improves a real interaction. Keep ordinary links and forms as document navigations; do not add a client router, fetch-and-swap page navigation, or a persistent client-side application shell. Use URLs for shareable state and the server for durable data.

## Component-local markup, styles, and behavior

- Treat a server-rendered component file as a native single-file component when it helps ownership: keep its HTML/JSX, component styles, and small optional behavior together. The rendered HTML is the component boundary; no client framework or build-time CSS scoping is required.
- Prefer a `<style>` child directly inside the component's root element with a prelude-free `@scope { ... }`. The parent of `<style>` becomes the scope root. Use `:scope` to style that root; use short selectors inside it. Use `@scope to (...)` when a nested component must be excluded. For CSS kept in a shared stylesheet, use an explicit root such as `@scope (.user-card) { ... }`.
- Keep resets, design tokens, typography, and other genuinely shared rules in shared stylesheets. Component styles may still inherit properties and custom properties, and `@scope` does not create Shadow DOM isolation. Use the component library's documented styling surface for its internals.
- Put a small `<script type="module">` beside the markup only when HTML and the component library do not already provide the needed behavior. Module scope is JavaScript lexical scope, not DOM scope: find the intended component root explicitly, bind within it, and make initialization safe when the component appears more than once. Do not rely on `document.currentScript` in a module. Use a shared module when behavior is substantial or repeated inline code would be costly.
- Keep content and actions useful without JavaScript where possible. If the deployment's content security policy disallows inline style or script, use external scoped CSS and module files while preserving the same component ownership.

For a minimal HTML pattern and repetition-safe script, read [references/single-file-components.md](references/single-file-components.md) when building or changing a component with local behavior. Check [MDN's `@scope` reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40scope) for syntax and browser support.

## Page state and scripts

- Use the Navigation API's `navigation.currentEntry` for transient, per-history-entry UI state such as an open panel or a local selection. Save serializable state with `navigation.updateCurrentEntry({ state })` when it changes, and read `navigation.currentEntry.getState()` when initializing a document. Preserve other state fields when updating one feature. Do not put secrets or the sole copy of user data there.
- A full-document navigation does not transfer the `state` option of `navigation.navigate()` to the destination document. Save the **current** entry before leaving it; the destination renders from its URL and server response, then restores any state already associated with that destination entry when revisited.
- Let the browser restore a page from its back/forward cache when possible. Do not recreate or reset an already-live page merely because `pageshow` fires. Avoid `unload` handlers and do not depend on a last-second navigation handler as the only state save.
- Use small `type="module"` scripts for behavior local to a page or shared element. Keep their ownership and cleanup clear; avoid a global state store, framework runtime, or scripting for behavior HTML already provides.

## Choosing native browser features

Start from the interaction the user needs. Check semantic HTML and the component library first, then choose a browser API or CSS feature only if it removes custom state, code, or dependencies. For each candidate, verify current browser support and its no-script or unsupported behavior against the project's target browsers; keep the server-rendered path complete. Add guidance to this skill when a feature recurs across tasks and its use has a non-obvious rule or failure mode, rather than accumulating a catalog of APIs.

Useful candidates to assess include native forms and constraint validation for data entry; `<details>`, `<dialog>`, popovers, and command buttons for disclosure and overlays; CSS container queries, `:has()`, and `@scope` for local presentation; and the Navigation API, speculation rules, and view transitions for page navigation. Prefer the simplest feature that meets the interaction and accessibility needs. Check MDN or another primary source before prescribing a new API or relying on a recent browser feature.

## Fast and seamless navigation

- Start with speculation rules that **prefetch** eligible same-origin, safe GET destinations at `moderate` eagerness. Narrow the rule to pages users are likely to open. Exclude actions, logout, downloads, and destinations whose GET has side effects or exposes sensitive content. Use prerender only when a measured use case justifies its extra work and the destination is safe to execute before activation.
- For same-origin page transitions, opt both documents in with `@view-transition { navigation: auto; }`. Begin with a restrained default transition; add stable, unique `view-transition-name` values only for elements that benefit from continuity. Honor `prefers-reduced-motion`, and check that transitions do not hide content or disrupt focus and scroll behavior.
- Prefer native buttons with `commandfor` and `command` for suitable `<dialog>` and popover controls. Use the component library's own interaction API when controlling one of its components. Keep actions semantic and keyboard accessible.

## Check the result

Exercise direct load, refresh, link and form navigation, Back and Forward, and state restoration after a full-document revisit. Check prefetch eligibility and view transitions in a supporting browser; verify that unsupported enhancements simply leave ordinary document navigation intact. Do not add a test runner solely for this skill.
