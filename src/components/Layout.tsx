import type { FC, PropsWithChildren } from 'hono/jsx'
import { raw } from 'hono/html'

type LayoutProps = PropsWithChildren<{ title: string; active: 'dashboard' | 'users' }>

const speculationRules = JSON.stringify({ prefetch: [{ where: { href_matches: '/users' }, eagerness: 'moderate' }] })

export const Layout: FC<LayoutProps> = ({ title, active, children }) => (
  <>
    {raw('<!doctype html>')}
    <html lang="en" class="wa-theme-default wa-palette-default wa-light">
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
