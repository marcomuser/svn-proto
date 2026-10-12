import type { MiddlewareHandler } from "hono";

// Adds a render-blocking import to <head> for every Web Awesome element used in an HTML response.
export const webawesomeImports: MiddlewareHandler = async (c, next) => {
  await next();
  if (!c.res.headers.get("content-type")?.startsWith("text/html")) return;
  const html = await c.res.text();
  const names = new Set(
    Array.from(html.matchAll(/<wa-([a-z][a-z0-9-]*)/g), (match) => match[1]),
  );
  const imports = [...names]
    .map(
      (name) =>
        `<script type="module" blocking="render" src="/webawesome/components/${name}/${name}.js"></script>`,
    )
    .join("");
  const headers = new Headers(c.res.headers);
  headers.delete("content-length");
  c.res = new Response(html.replace("</head>", `${imports}</head>`), {
    status: c.res.status,
    statusText: c.res.statusText,
    headers,
  });
};
