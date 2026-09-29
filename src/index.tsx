import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { dashboardStats, emailInUse, getUser, listUsers, recentUsers, updateUser } from './db.js'
import type { UserEdit } from './db.js'
import { DashboardPage } from './pages/dashboard/DashboardPage.js'
import { EditUserPage } from './pages/users/EditUserPage.js'
import type { EditErrors } from './pages/users/EditUserPage.js'
import { UserDetailPage } from './pages/users/UserDetailPage.js'
import { UserNotFoundPage } from './pages/users/UserNotFoundPage.js'
import { UsersPage } from './pages/users/UsersPage.js'

const app = new Hono()

app.get('/webawesome/*', serveStatic({
  root: `${process.cwd()}/node_modules/@awesome.me/webawesome/dist-cdn`,
  rewriteRequestPath: path => path.replace(/^\/webawesome/, '')
}))

app.get('/styles.css', serveStatic({ root: `${process.cwd()}/public` }))

app.get('/', c => c.html(<DashboardPage stats={dashboardStats()} recentUsers={recentUsers()} />))

app.get('/users', c => {
  const search = (c.req.query('q') ?? '').trim().slice(0, 100)
  const statusInput = c.req.query('status') ?? ''
  const status = statusInput === 'active' || statusInput === 'inactive' ? statusInput : ''
  const requestedPage = Number.parseInt(c.req.query('page') ?? '1', 10)
  const result = listUsers(search, status, Number.isFinite(requestedPage) ? requestedPage : 1)
  return c.html(<UsersPage search={search} status={status} {...result} />)
})

app.get('/users/:id', c => {
  const user = getUser(Number(c.req.param('id')))
  return user ? c.html(<UserDetailPage user={user} />) : notFound(c)
})

app.get('/users/:id/edit', c => {
  const user = getUser(Number(c.req.param('id')))
  return user ? c.html(<EditUserPage user={user} values={user} />) : notFound(c)
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
  const errors: EditErrors = {}
  if (!values.name || values.name.length > 100) errors.name = 'Enter a name of up to 100 characters.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 254) errors.email = 'Enter a valid email address.'
  else if (emailInUse(values.email, user.id)) errors.email = 'This email address is already in use.'
  if (values.role !== 'admin' && values.role !== 'member') errors.role = 'Choose a valid role.'
  if (values.status !== 'active' && values.status !== 'inactive') errors.status = 'Choose a valid status.'
  if (Object.keys(errors).length) return c.html(<EditUserPage user={user} values={values as UserEdit} errors={errors} />, 422)
  updateUser(user.id, values as UserEdit)
  return c.redirect(`/users/${user.id}`, 303)
})

function notFound(c: Context) {
  return c.html(<UserNotFoundPage />, 404)
}

app.notFound(c => notFound(c))

serve({ fetch: app.fetch, port: 3000 }, info => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
