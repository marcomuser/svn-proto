import type { User } from '../../db.js'
import { Layout } from '../../components/Layout.js'
import { PageHeader } from '../../components/PageHeader.js'
import { Panel } from '../../components/Panel.js'
import { UserTable } from '../../components/UserComponents.js'

type UsersPageProps = { search: string; status: string; users: User[]; count: number; page: number; totalPages: number }

function userUrl(search: string, status: string, page: number) {
  const query = new URLSearchParams()
  if (search) query.set('q', search)
  if (status) query.set('status', status)
  if (page > 1) query.set('page', String(page))
  return `/users${query.size ? `?${query}` : ''}`
}

export function UsersPage({ search, status, users, count, page, totalPages }: UsersPageProps) {
  return <Layout title="Users" active="users">
    <PageHeader title="Users" intro={`${count} ${count === 1 ? 'person' : 'people'} found`} />
    <form method="get" action="/users" class="wa-cluster wa-gap-m">
      <style>{`@scope {
        :scope { align-items: end; }
        wa-input { min-width: 16ch; flex: 2; }
        wa-select { min-width: 12ch; flex: 1; }
      }`}</style>
      <wa-input type="search" label="Search users" name="q" value={search} placeholder="Name or email"></wa-input>
      <wa-select label="Status" name="status" value={status}>
        <wa-option value="">All statuses</wa-option>
        <wa-option value="active">Active</wa-option>
        <wa-option value="inactive">Inactive</wa-option>
      </wa-select>
      <wa-button type="submit" variant="brand">Apply filters</wa-button>
      <wa-button href="/users" appearance="plain">Clear</wa-button>
    </form>
    <Panel label="User list">
      {users.length ? <UserTable users={users} /> : <p>No users match your search. Try another name, email, or status.</p>}
    </Panel>
    {totalPages > 1 && <nav class="wa-cluster wa-gap-m" aria-label="Pagination">
      <style>{`@scope { :scope { justify-content: space-between; align-items: center; } }`}</style>
      <span>Page {page} of {totalPages}</span>
      <div class="wa-cluster wa-gap-s">
        {page > 1 && <wa-button href={userUrl(search, status, page - 1)} appearance="outlined">Previous</wa-button>}
        {page < totalPages && <wa-button href={userUrl(search, status, page + 1)} appearance="outlined">Next</wa-button>}
      </div>
    </nav>}
  </Layout>
}
