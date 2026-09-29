import type { Child } from 'hono/jsx'
import type { User } from '../../db.js'
import { Layout } from '../../components/Layout.js'
import { PageHeader } from '../../components/PageHeader.js'
import { StatusBadge } from '../../components/UserComponents.js'
import { formatDate } from '../../formatDate.js'

function DetailItem({ label, value }: { label: string; value: Child }) {
  return <div><dt class="detail-label">{label}</dt><dd class="detail-value">{value}</dd></div>
}

export function UserDetailPage({ user }: { user: User }) {
  return <Layout title={user.name} active="users">
    <a href="/users">← All users</a>
    <PageHeader title={user.name} intro={user.email} action={<wa-button href={`/users/${user.id}/edit`} variant="brand">Edit user</wa-button>} />
    <section class="panel wa-stack wa-gap-l" aria-labelledby="profile-heading">
      <h2 id="profile-heading">Profile</h2>
      <dl class="wa-grid wa-gap-l details-grid">
        <DetailItem label="Full name" value={user.name} />
        <DetailItem label="Email address" value={<a href={`mailto:${user.email}`}>{user.email}</a>} />
        <DetailItem label="Role" value={user.role === 'admin' ? 'Administrator' : 'Member'} />
        <DetailItem label="Status" value={<StatusBadge status={user.status} />} />
        <DetailItem label="Joined" value={<time dateTime={user.joined_at}>{formatDate(user.joined_at)}</time>} />
      </dl>
    </section>
  </Layout>
}
