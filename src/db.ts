import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export type UserRole = 'admin' | 'member'
export type UserStatus = 'active' | 'inactive'

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  joined_at: string
}

export type UserEdit = Pick<User, 'name' | 'email' | 'role' | 'status'>

const dataDir = join(process.cwd(), 'data')
mkdirSync(dataDir, { recursive: true })
const db = new DatabaseSync(join(dataDir, 'users.sqlite'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
    joined_at TEXT NOT NULL
  )
`)

const names = [
  'Avery Morgan', 'Jordan Lee', 'Taylor Brooks', 'Casey Rivera',
  'Riley Chen', 'Morgan Patel', 'Alex Johnson', 'Samira Ahmed',
  'Jamie Kim', 'Cameron Diaz', 'Quinn Parker', 'Robin Müller',
  'Harper Wilson', 'Emerson Gray', 'Noah Schmidt', 'Mia Rossi',
  'Luca Fischer', 'Sofia Martinez', 'Elliot Reed', 'Amara Okafor',
  'Theo Bennett', 'Nina Weber', 'Leo Dubois', 'Isla Campbell'
]

if ((db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }).count === 0) {
  const insert = db.prepare('INSERT INTO users (name, email, role, status, joined_at) VALUES (?, ?, ?, ?, ?)')
  const today = new Date()
  for (const [index, name] of names.entries()) {
    const joined = new Date(today)
    joined.setUTCDate(joined.getUTCDate() - index * 9)
    insert.run(
      name,
      `${name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]+/g, '.').replace(/\.$/, '')}@example.com`,
      index < 3 ? 'admin' : 'member',
      index % 6 === 5 ? 'inactive' : 'active',
      joined.toISOString().slice(0, 10)
    )
  }
}

export function getUser(id: number): User | undefined {
  if (!Number.isSafeInteger(id) || id < 1) return undefined
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined
}

export function listUsers(search: string, status: string, page: number, perPage = 10) {
  const match = `%${search.replace(/[\\%_]/g, '\\$&')}%`
  const where = `WHERE (name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\') ${status ? 'AND status = ?' : ''}`
  const args = status ? [match, match, status] : [match, match]
  const count = (db.prepare(`SELECT COUNT(*) AS count FROM users ${where}`).get(...args) as { count: number }).count
  const totalPages = Math.max(1, Math.ceil(count / perPage))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const users = db.prepare(`SELECT * FROM users ${where} ORDER BY joined_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...args, perPage, (currentPage - 1) * perPage) as User[]
  return { users, count, page: currentPage, totalPages }
}

export function dashboardStats() {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - 30)
  return db.prepare(`
    SELECT COUNT(*) AS total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins,
      SUM(CASE WHEN joined_at >= ? THEN 1 ELSE 0 END) AS recent
    FROM users
  `).get(since.toISOString().slice(0, 10)) as { total: number; active: number; admins: number; recent: number }
}

export function recentUsers(): User[] {
  return db.prepare('SELECT * FROM users ORDER BY joined_at DESC, id DESC LIMIT 5').all() as User[]
}

export function emailInUse(email: string, exceptId: number): boolean {
  return !!db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE AND id != ?').get(email, exceptId)
}

export function updateUser(id: number, user: UserEdit): void {
  db.prepare('UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?')
    .run(user.name, user.email, user.role, user.status, id)
}
