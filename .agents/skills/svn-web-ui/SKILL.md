---
name: svn-web-ui
description: Build or change web user interfaces with server-rendered pages and native browser enhancements. Use for any web UI work, including page architecture, navigation, forms, dialogs, and page-specific interactions. Server and component-library agnostic.
---

# SVN web UI architecture

Build a multi-page application whose server returns a complete, meaningful HTML document for every page URL. Each page must work when opened directly, refreshed, or reached through a normal link or form. Use the project's existing server, templates, and component system; this skill does not prescribe Hono or Web Awesome.

Aim for the responsiveness of a single-page application with the browser's own navigation and interaction features. Add an enhancement only when it improves a real interaction. Keep ordinary links and forms as document navigations; do not add a client router, fetch-and-swap page navigation, or a persistent client-side application shell. Use URLs for shareable state and the server for durable data.

## Page state and scripts

- Use the Navigation API's `navigation.currentEntry` for transient, per-history-entry UI state such as an open panel or a local selection. Save serializable state with `navigation.updateCurrentEntry({ state })` when it changes, and read `navigation.currentEntry.getState()` when initializing a document. Preserve other state fields when updating one feature. Do not put secrets or the sole copy of user data there.
- A full-document navigation does not transfer the `state` option of `navigation.navigate()` to the destination document. Save the **current** entry before leaving it; the destination renders from its URL and server response, then restores any state already associated with that destination entry when revisited.
- Let the browser restore a page from its back/forward cache when possible. Do not recreate or reset an already-live page merely because `pageshow` fires. Avoid `unload` handlers and do not depend on a last-second navigation handler as the only state save.
- Use small `type="module"` scripts for behavior local to a page or shared element. Keep their ownership and cleanup clear; avoid a global state store, framework runtime, or scripting for behavior HTML already provides.

## Fast and seamless navigation

- Start with speculation rules that **prefetch** eligible same-origin, safe GET destinations at `moderate` eagerness. Narrow the rule to pages users are likely to open. Exclude actions, logout, downloads, and destinations whose GET has side effects or exposes sensitive content. Use prerender only when a measured use case justifies its extra work and the destination is safe to execute before activation.
- For same-origin page transitions, opt both documents in with `@view-transition { navigation: auto; }`. Begin with a restrained default transition; add stable, unique `view-transition-name` values only for elements that benefit from continuity. Honor `prefers-reduced-motion`, and check that transitions do not hide content or disrupt focus and scroll behavior.
- Prefer native buttons with `commandfor` and `command` for suitable `<dialog>` and popover controls. Use the component library's own interaction API when controlling one of its components. Keep actions semantic and keyboard accessible.

## Check the result

Exercise direct load, refresh, link and form navigation, Back and Forward, and state restoration after a full-document revisit. Check prefetch eligibility and view transitions in a supporting browser; verify that unsupported enhancements simply leave ordinary document navigation intact. Do not add a test runner solely for this skill.
