import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import type { FC } from 'hono/jsx'
import { raw } from 'hono/html'
import { dashboardStats, emailInUse, getUser, listUsers, recentUsers, updateUser } from './db.js'
import type { User, UserEdit } from './db.js'

const app = new Hono()

app.get('/webawesome/*', serveStatic({
  root: `${process.cwd()}/node_modules/@awesome.me/webawesome/dist-cdn`,
  rewriteRequestPath: path => path.replace(/^\/webawesome/, '')
}))

const styles = `
  html, body { min-height: 100%; margin: 0; padding: 0; }
  @view-transition { navigation: auto; }
  ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 180ms; }
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 0ms; }
  }
  wa-page { --menu-width: 15rem; }
  wa-page[view='mobile'] { --menu-width: auto; }
  .brand { font-weight: var(--wa-font-weight-bold); font-size: var(--wa-font-size-l); }
  .app-header { padding-inline: var(--wa-space-l); }
  .app-nav { padding: var(--wa-space-l); }
  .app-nav a { display: block; padding: var(--wa-space-s) var(--wa-space-m); border-radius: var(--wa-border-radius-m); color: var(--wa-color-text-normal); text-decoration: none; }
  .app-nav a[aria-current='page'] { color: var(--wa-color-brand-on-quiet); background: var(--wa-color-brand-fill-quiet); font-weight: var(--wa-font-weight-semibold); }
  .app-main { width: min(100%, 78rem); margin-inline: auto; padding: var(--wa-space-xl); box-sizing: border-box; }
  .page-title { margin: 0; }
  .page-intro { margin: 0; color: var(--wa-color-text-quiet); }
  .stat-grid { --min-column-size: 12rem; }
  .stat-value { display: block; font-size: var(--wa-font-size-2xl); font-weight: var(--wa-font-weight-bold); line-height: var(--wa-line-height-condensed); }
  .stat-label { color: var(--wa-color-text-quiet); }
  .panel { padding: var(--wa-space-l); border: var(--wa-border-width-s) solid var(--wa-color-surface-border); border-radius: var(--wa-border-radius-l); background: var(--wa-color-surface-raised); }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; text-align: left; }
  th, td { padding: var(--wa-space-s) var(--wa-space-m); border-bottom: var(--wa-border-width-s) solid var(--wa-color-surface-border); }
  th { color: var(--wa-color-text-quiet); font-size: var(--wa-font-size-s); font-weight: var(--wa-font-weight-semibold); }
  tbody tr:last-child td { border-bottom: 0; }
  td a { color: var(--wa-color-text-link); font-weight: var(--wa-font-weight-semibold); }
  .filters { align-items: end; }
  .filters wa-input { min-width: 16ch; flex: 2; }
  .filters wa-select { min-width: 12ch; flex: 1; }
  .details-grid { --min-column-size: 17rem; }
  .detail-label { color: var(--wa-color-text-quiet); font-size: var(--wa-font-size-s); }
  .detail-value { margin: var(--wa-space-2xs) 0 0; font-weight: var(--wa-font-weight-semibold); }
  .form-grid { --min-column-size: 17rem; }
  .form-shell { max-width: 50rem; }
  .field-error { margin: var(--wa-space-2xs) 0 0; color: var(--wa-color-danger-on-quiet); font-size: var(--wa-font-size-s); }
  .pagination { justify-content: space-between; align-items: center; }
  @media (max-width: 40rem) { .app-main { padding: var(--wa-space-l); } .hide-small { display: none; } }
`

const speculationRules = JSON.stringify({ prefetch: [{ where: { href_matches: '/users' }, eagerness: 'moderate' }] })

const Layout: FC<{ title: string; active: 'dashboard' | 'users'; children: any }> = ({ title, active, children }) => (
  <>
  {raw('<!doctype html>')}
  <html lang="en" class="wa-theme-default wa-palette-default wa-light">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title} · User management</title>
      <link rel="stylesheet" href="/webawesome/styles/webawesome.css" />
      <script type="module" src="/webawesome/webawesome.loader.js"></script>
      <script type="speculationrules" dangerouslySetInnerHTML={{ __html: speculationRules }}></script>
      <style dangerouslySetInnerHTML={{ __html: styles }}></style>
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

function pageHeader(title: string, intro: string, action?: any) {
  return <header class="wa-split wa-align-items-center wa-gap-m">
    <div class="wa-stack wa-gap-xs"><h1 class="page-title">{title}</h1><p class="page-intro">{intro}</p></div>
    {action}
  </header>
}

function statusBadge(status: User['status']) {
  return <wa-badge variant={status === 'active' ? 'success' : 'neutral'} pill>{status === 'active' ? 'Active' : 'Inactive'}</wa-badge>
}

function userTable(users: User[]) {
  return <div class="table-wrap"><table>
    <thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col" class="hide-small">Joined</th></tr></thead>
    <tbody>{users.map(user => <tr>
      <td><a href={`/users/${user.id}`}>{user.name}</a><br /><span class="wa-caption-s">{user.email}</span></td>
      <td>{user.role === 'admin' ? 'Administrator' : 'Member'}</td>
      <td>{statusBadge(user.status)}</td>
      <td class="hide-small"><time dateTime={user.joined_at}>{formatDate(user.joined_at)}</time></td>
    </tr>)}</tbody>
  </table></div>
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

function userUrl(search: string, status: string, page: number) {
  const query = new URLSearchParams()
  if (search) query.set('q', search)
  if (status) query.set('status', status)
  if (page > 1) query.set('page', String(page))
  return `/users${query.size ? `?${query}` : ''}`
}

app.get('/', c => {
  const stats = dashboardStats()
  const cards = [
    ['Registered users', stats.total, '/users'],
    ['Active users', stats.active, '/users?status=active'],
    ['Administrators', stats.admins, '/users'],
    ['Joined in 30 days', stats.recent, '/users']
  ] as const
  return c.html(<Layout title="Dashboard" active="dashboard">
    {pageHeader('Dashboard', 'A quick view of your user community.', <wa-button href="/users" variant="brand">View all users</wa-button>)}
    <section class="wa-grid wa-gap-l stat-grid" aria-label="User statistics">
      {cards.map(([label, value, href]) => <wa-card><div class="wa-stack wa-gap-xs"><span class="stat-label">{label}</span><strong class="stat-value">{value}</strong><a href={href}>Explore users</a></div></wa-card>)}
    </section>
    <section class="panel wa-stack wa-gap-m" aria-labelledby="recent-heading">
      <div class="wa-split wa-align-items-center"><h2 id="recent-heading">Recently registered</h2><a href="/users">All users</a></div>
      {userTable(recentUsers())}
    </section>
  </Layout>)
})

app.get('/users', c => {
  const search = (c.req.query('q') ?? '').trim().slice(0, 100)
  const statusInput = c.req.query('status') ?? ''
  const status = statusInput === 'active' || statusInput === 'inactive' ? statusInput : ''
  const requestedPage = Number.parseInt(c.req.query('page') ?? '1', 10)
  const { users, count, page, totalPages } = listUsers(search, status, Number.isFinite(requestedPage) ? requestedPage : 1)
  return c.html(<Layout title="Users" active="users">
    {pageHeader('Users', `${count} ${count === 1 ? 'person' : 'people'} found`)}
    <form method="get" action="/users" class="filters wa-cluster wa-gap-m">
      <wa-input type="search" label="Search users" name="q" value={search} placeholder="Name or email"></wa-input>
      <wa-select label="Status" name="status" value={status}>
        <wa-option value="">All statuses</wa-option>
        <wa-option value="active">Active</wa-option>
        <wa-option value="inactive">Inactive</wa-option>
      </wa-select>
      <wa-button type="submit" variant="brand">Apply filters</wa-button>
      <wa-button href="/users" appearance="plain">Clear</wa-button>
    </form>
    <section class="panel wa-stack wa-gap-m" aria-label="User list">
      {users.length ? userTable(users) : <p>No users match your search. Try another name, email, or status.</p>}
    </section>
    {totalPages > 1 && <nav class="pagination wa-cluster wa-gap-m" aria-label="Pagination">
      <span>Page {page} of {totalPages}</span>
      <div class="wa-cluster wa-gap-s">
        {page > 1 && <wa-button href={userUrl(search, status, page - 1)} appearance="outlined">Previous</wa-button>}
        {page < totalPages && <wa-button href={userUrl(search, status, page + 1)} appearance="outlined">Next</wa-button>}
      </div>
    </nav>}
  </Layout>)
})

function detailItem(label: string, value: any) {
  return <div><dt class="detail-label">{label}</dt><dd class="detail-value">{value}</dd></div>
}

app.get('/users/:id', c => {
  const user = getUser(Number(c.req.param('id')))
  if (!user) return notFound(c)
  return c.html(<Layout title={user.name} active="users">
    <a href="/users">← All users</a>
    {pageHeader(user.name, user.email, <wa-button href={`/users/${user.id}/edit`} variant="brand">Edit user</wa-button>)}
    <section class="panel wa-stack wa-gap-l" aria-labelledby="profile-heading">
      <h2 id="profile-heading">Profile</h2>
      <dl class="wa-grid wa-gap-l details-grid">
        {detailItem('Full name', user.name)}
        {detailItem('Email address', <a href={`mailto:${user.email}`}>{user.email}</a>)}
        {detailItem('Role', user.role === 'admin' ? 'Administrator' : 'Member')}
        {detailItem('Status', statusBadge(user.status))}
        {detailItem('Joined', <time dateTime={user.joined_at}>{formatDate(user.joined_at)}</time>)}
      </dl>
    </section>
  </Layout>)
})

type Errors = Partial<Record<keyof UserEdit, string>>

function editPage(user: User, values: UserEdit, errors: Errors = {}) {
  return <Layout title={`Edit ${user.name}`} active="users">
    <a href={`/users/${user.id}`}>← {user.name}</a>
    {pageHeader('Edit user', 'Update the profile and account access details.')}
    <form class="panel form-shell wa-stack wa-gap-xl" method="post" action={`/users/${user.id}`}>
      <div class="wa-grid wa-gap-l form-grid">
        <div><wa-input label="Full name" name="name" value={values.name} required maxlength="100"></wa-input>{errors.name && <p class="field-error" role="alert">{errors.name}</p>}</div>
        <div><wa-input label="Email address" name="email" type="email" value={values.email} required maxlength="254"></wa-input>{errors.email && <p class="field-error" role="alert">{errors.email}</p>}</div>
        <div><wa-select label="Role" name="role" value={values.role} required>
          <wa-option value="admin">Administrator</wa-option><wa-option value="member">Member</wa-option>
        </wa-select>{errors.role && <p class="field-error" role="alert">{errors.role}</p>}</div>
        <div><wa-select label="Status" name="status" value={values.status} required>
          <wa-option value="active">Active</wa-option><wa-option value="inactive">Inactive</wa-option>
        </wa-select>{errors.status && <p class="field-error" role="alert">{errors.status}</p>}</div>
      </div>
      <p class="page-intro">Joined {formatDate(user.joined_at)} · Join date cannot be changed.</p>
      <div class="wa-cluster wa-gap-s"><wa-button type="submit" variant="brand">Save changes</wa-button><wa-button href={`/users/${user.id}`} appearance="outlined">Cancel</wa-button></div>
    </form>
  </Layout>
}

app.get('/users/:id/edit', c => {
  const user = getUser(Number(c.req.param('id')))
  return user ? c.html(editPage(user, user)) : notFound(c)
})

app.post('/users/:id', async c => {
  const user = getUser(Number(c.req.param('id')))
  if (!user) return notFound(c)
  const form = await c.req.formData()
  const values = {
    name: String(form.get('name') ?? '').trim(),
    email: String(form.get('email') ?? '').trim(),
    role: String(form.get('role') ?? ''),
    status: String(form.get('status') ?? '')
  }
  const errors: Errors = {}
  if (!values.name || values.name.length > 100) errors.name = 'Enter a name of up to 100 characters.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 254) errors.email = 'Enter a valid email address.'
  else if (emailInUse(values.email, user.id)) errors.email = 'This email address is already in use.'
  if (values.role !== 'admin' && values.role !== 'member') errors.role = 'Choose a valid role.'
  if (values.status !== 'active' && values.status !== 'inactive') errors.status = 'Choose a valid status.'
  if (Object.keys(errors).length) return c.html(editPage(user, values as UserEdit, errors), 422)
  updateUser(user.id, values as UserEdit)
  return c.redirect(`/users/${user.id}`, 303)
})

function notFound(c: any) {
  return c.html(<Layout title="User not found" active="users">
    {pageHeader('User not found', 'This user does not exist or is no longer available.')}
    <wa-button href="/users" variant="brand">Back to users</wa-button>
  </Layout>, 404)
}

app.notFound(c => notFound(c))

serve({ fetch: app.fetch, port: 3000 }, info => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
