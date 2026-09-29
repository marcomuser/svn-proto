import type { User, UserEdit } from '../../db.js'
import { Layout } from '../../components/Layout.js'
import { PageHeader } from '../../components/PageHeader.js'
import { formatDate } from '../../formatDate.js'

export type EditErrors = Partial<Record<keyof UserEdit, string>>

type EditUserPageProps = { user: User; values: UserEdit; errors?: EditErrors }

export function EditUserPage({ user, values, errors = {} }: EditUserPageProps) {
  return <Layout title={`Edit ${user.name}`} active="users">
    <a href={`/users/${user.id}`}>← {user.name}</a>
    <PageHeader title="Edit user" intro="Update the profile and account access details." />
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
