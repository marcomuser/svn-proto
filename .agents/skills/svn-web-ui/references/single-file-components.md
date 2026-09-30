# Native single-file components

A server-rendered component can emit one root containing its markup and a child `<style>` block. Prelude-free `@scope` binds CSS to the `<style>` element's parent. The source file may also emit an inline module for a small behavior:

```html
<section data-density-panel>
  <style>
    @scope {
      :scope { padding: 1rem; }
      .item { padding-block: .75rem; }
      :scope[data-compact] .item { padding-block: .25rem; }
    }
  </style>

  <h2>Items</h2>
  <button type="button" data-density-toggle aria-pressed="false" hidden>Compact view</button>
  <ul><li class="item">An item</li></ul>

  <script type="module">
    for (const root of document.querySelectorAll('[data-density-panel]:not([data-enhanced])')) {
      root.dataset.enhanced = '';
      const button = root.querySelector('[data-density-toggle]');
      button.hidden = false;
      button.addEventListener('click', () => {
        const compact = root.toggleAttribute('data-compact');
        button.setAttribute('aria-pressed', String(compact));
      });
    }
  </script>
</section>
```

In a template or JSX file, keep these parts beside the component markup. Render dynamic text and attributes through the template engine's escaping rules; never interpolate untrusted values into raw CSS or JavaScript. An inline module runs in document context and may run once per rendered copy, so the `data-enhanced` guard prevents duplicate listeners. Use a shared module when the repeated script outweighs the benefit of colocation. A module script cannot use `document.currentScript` to find its root.

Scope proximity resolves some equal-priority CSS conflicts, but specificity, cascade layers, and inheritance still apply. A scope limit excludes matching descendants from selector matching; inherited properties can still flow into them. For a shared stylesheet, write `@scope (.density-panel) { ... }` and give the root that class. Verify `@scope` support in target browsers; if unsupported browsers matter, provide equivalent ordinary CSS or keep essential styling outside `@scope`.

The CSS pattern works in browsers, but the current HTML Standard lists `<style>` as metadata content, so a `<style>` child of an ordinary body component can fail strict HTML conformance checks. If HTML validation is a project requirement, keep the component's CSS alongside its source when practical and emit it in the document head or an external stylesheet with an explicit `@scope (.component-root)` selector.
