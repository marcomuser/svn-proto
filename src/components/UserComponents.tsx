import type { User } from '../db.js'
import { formatDate } from '../formatDate.js'

export function StatusBadge({ status }: { status: User['status'] }) {
  return <wa-badge variant={status === 'active' ? 'success' : 'neutral'} pill>{status === 'active' ? 'Active' : 'Inactive'}</wa-badge>
}

export function UserTable({ users }: { users: User[] }) {
  return <div class="table-wrap"><table>
    <thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col" class="hide-small">Joined</th></tr></thead>
    <tbody>{users.map(user => <tr>
      <td><a href={`/users/${user.id}`}>{user.name}</a><br /><span class="wa-caption-s">{user.email}</span></td>
      <td>{user.role === 'admin' ? 'Administrator' : 'Member'}</td>
      <td><StatusBadge status={user.status} /></td>
      <td class="hide-small"><time dateTime={user.joined_at}>{formatDate(user.joined_at)}</time></td>
    </tr>)}</tbody>
  </table></div>
}
