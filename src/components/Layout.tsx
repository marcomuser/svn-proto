import type { FC, PropsWithChildren } from 'hono/jsx'
import { raw } from 'hono/html'

type LayoutProps = PropsWithChildren<{ title: string; active: 'dashboard' | 'users' }>

const speculationRules = JSON.stringify({ prefetch: [{ where: { href_matches: ['/', '/users', '/users/:id', '/users/:id/edit'] }, eagerness: 'moderate' }] })

export const Layout: FC<LayoutProps> = ({ title, active, children }) => (
  <>
    {raw('<!doctype html>')}
    <html lang="en" class="wa-theme-default wa-palette-default wa-light wa-cloak">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title} · User management</title>
        <link rel="stylesheet" href="/webawesome/styles/webawesome.css" />
        <link rel="stylesheet" href="/styles.css" />
        <script type="module" src="/webawesome/webawesome.loader.js"></script>
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: speculationRules }}></script>
      </head>
      <body>
        <wa-page>
          <style>{`
            @scope {
              :scope { --menu-width: 30ch; }
              :scope[view=mobile] { --menu-width: auto; }
              .brand { font-weight: var(--wa-font-weight-bold); font-size: var(--wa-font-size-l); }
              .app-header { padding-inline: var(--wa-space-l); }
              .app-nav { padding: var(--wa-space-l); }
              .app-nav a { display: block; padding: var(--wa-space-s) var(--wa-space-m); border-radius: var(--wa-border-radius-m); color: var(--wa-color-text-normal); text-decoration: none; }
              .app-nav a[aria-current=page] { color: var(--wa-color-brand-on-quiet); background: var(--wa-color-brand-fill-quiet); font-weight: var(--wa-font-weight-semibold); }
              .app-main { width: min(100%, 110ch); margin-inline: auto; padding: var(--wa-space-xl); box-sizing: border-box; }
              @media (max-width: 40em) { .app-main { padding: var(--wa-space-l); } }
            }
          `}</style>
          <header slot="header" class="app-header wa-split wa-align-items-center">
            <span class="brand">Northstar Admin</span>
            <span class="wa-caption-m">User management</span>
          </header>
          <nav slot="navigation" class="app-nav wa-stack wa-gap-2xs" aria-label="Main navigation">
            <a href="/" aria-current={active === 'dashboard' ? 'page' : undefined} data-drawer="close">Dashboard</a>
            <a href="/users" aria-current={active === 'users' ? 'page' : undefined} data-drawer="close">Users</a>
          </nav>
          <main class="app-main wa-stack wa-gap-xl" id="main">{children}</main>
        </wa-page>
      </body>
    </html>
  </>
)
