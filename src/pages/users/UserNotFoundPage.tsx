import { Layout } from '../../components/Layout.js'
import { PageHeader } from '../../components/PageHeader.js'

export function UserNotFoundPage() {
  return <Layout title="User not found" active="users">
    <PageHeader title="User not found" intro="This user does not exist or is no longer available." />
    <wa-button href="/users" variant="brand">Back to users</wa-button>
  </Layout>
}
