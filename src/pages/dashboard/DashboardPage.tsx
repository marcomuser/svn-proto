import type { User } from '../../db.js'
import { Layout } from '../../components/Layout.js'
import { PageHeader } from '../../components/PageHeader.js'
import { UserTable } from '../../components/UserComponents.js'

type DashboardStats = { total: number; active: number; admins: number; recent: number }

export function DashboardPage({ stats, recentUsers }: { stats: DashboardStats; recentUsers: User[] }) {
  const cards = [
    ['Registered users', stats.total, '/users'],
    ['Active users', stats.active, '/users?status=active'],
    ['Administrators', stats.admins, '/users'],
    ['Joined in 30 days', stats.recent, '/users']
  ] as const

  return <Layout title="Dashboard" active="dashboard">
    <PageHeader title="Dashboard" intro="A quick view of your user community." action={<wa-button href="/users" variant="brand">View all users</wa-button>} />
    <section class="wa-grid wa-gap-l stat-grid" aria-label="User statistics">
      {cards.map(([label, value, href]) => <wa-card><div class="wa-stack wa-gap-xs"><span class="stat-label">{label}</span><strong class="stat-value">{value}</strong><a href={href}>Explore users</a></div></wa-card>)}
    </section>
    <section class="panel wa-stack wa-gap-m" aria-labelledby="recent-heading">
      <div class="wa-split wa-align-items-center"><h2 id="recent-heading">Recently registered</h2><a href="/users">All users</a></div>
      <UserTable users={recentUsers} />
    </section>
  </Layout>
}
