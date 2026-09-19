import http from 'node:http'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import initSqlJs from 'sql.js'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(rootDir, 'data')
const distDir = path.join(rootDir, 'dist')
const databasePath = path.join(dataDir, 'salik.sqlite')
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001)
const sessions = new Map()

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16)
  const key = crypto.scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${key.toString('hex')}`
}

const verifyPassword = (password, storedHash) => {
  const [saltHex, keyHex] = String(storedHash).split(':')
  if (!saltHex || !keyHex) return false
  const key = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64)
  return crypto.timingSafeEqual(key, Buffer.from(keyHex, 'hex'))
}
const json = (response, status, body) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  })
  response.end(JSON.stringify(body))
}

const readBody = (request) => new Promise((resolve, reject) => {
  let body = ''
  request.on('data', (chunk) => { body += chunk })
  request.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {})
    } catch {
      reject(new Error('Invalid JSON'))
    }
  })
  request.on('error', reject)
})

const saveDatabase = (database) => {
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(databasePath, Buffer.from(database.export()))
}

const seedDatabase = (database) => {
  database.run(`
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      username TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      school_id INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      FOREIGN KEY (school_id) REFERENCES schools(id)
    );
    CREATE TABLE IF NOT EXISTS bus_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bus_id INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL,
      speed REAL,
      heading REAL,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  const usersSchema = database.exec("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'")[0]?.values[0]?.[0] ?? ''
  if (String(usersSchema).includes("'driver'") || String(usersSchema).includes("'admin'")) {
    database.run(`
      PRAGMA foreign_keys = OFF;
      ALTER TABLE users RENAME TO users_legacy;
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        username TEXT UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        school_id INTEGER,
        status TEXT NOT NULL DEFAULT 'active',
        FOREIGN KEY (school_id) REFERENCES schools(id)
      );
      INSERT INTO users (id, full_name, username, email, password_hash, role, school_id, status)
      SELECT id, full_name, lower(replace(email, '@', '_')), email, password_hash,
             CASE role WHEN 'admin' THEN 'school_admin' ELSE role END,
             school_id, 'active'
      FROM users_legacy;
      DROP TABLE users_legacy;
      PRAGMA foreign_keys = ON;
    `)
  }

  const columns = database.exec('PRAGMA table_info(users)')[0]?.values.map((column) => column[1]) ?? []
  if (!columns.includes('username')) database.run('ALTER TABLE users ADD COLUMN username TEXT')
  if (!columns.includes('status')) database.run("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'")
  database.run("UPDATE users SET role = 'school_admin' WHERE role = 'admin'")
  database.run("UPDATE users SET username = lower(replace(email, '@', '_')) WHERE username IS NULL")
  database.run("UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''")

  const existingSchools = database.exec('SELECT COUNT(*) AS count FROM schools')[0]?.values[0][0] ?? 0
  if (existingSchools === 0) {
    const schoolInsert = database.prepare('INSERT INTO schools (slug, name, city) VALUES (?, ?, ?)')
    schoolInsert.run(['mySchool', 'مدرسة النور الابتدائية', 'الرياض'])
    schoolInsert.run(['fajrSchool', 'مدرسة الفجر المتوسطة', 'الرياض'])
    schoolInsert.free()
  }

  const users = [
    ['student01', 'طالب سالك', 'student01@myschool.sa', 'student', 'mySchool'],
    ['parent01', 'ولي أمر سالك', 'parent01@myschool.sa', 'parent', 'mySchool'],
    ['schooladmin01', 'إدارة مدرسة سالك', 'schooladmin01@myschool.sa', 'school_admin', 'mySchool'],
    ['authority01', 'مشرف الجهة المختصة', 'authority01@salik.sa', 'authority', null],
  ]
  const userInsert = database.prepare(`
    INSERT OR IGNORE INTO users (username, full_name, email, password_hash, role, school_id, status)
    VALUES (?, ?, ?, ?, ?, (SELECT id FROM schools WHERE slug = ?), 'active')
  `)
  for (const [username, fullName, email, role, schoolSlug] of users) {
    userInsert.run([username, fullName, email, hashPassword('123456'), role, schoolSlug])
  }
  userInsert.free()
  database.run("UPDATE users SET password_hash = ? WHERE username = 'parent01' AND password_hash NOT LIKE '%:%'", [hashPassword('123456')])
  saveDatabase(database)
}

const getRow = (database, username, password) => {
  const statement = database.prepare(`
    SELECT users.id, users.username, users.full_name, users.role, users.school_id, users.status,
           schools.slug AS school_slug, schools.name AS school_name, schools.city AS school_city,
           users.password_hash
    FROM users
    LEFT JOIN schools ON schools.id = users.school_id
    WHERE lower(users.username) = lower(?)
  `)
  statement.bind([username.trim()])
  const row = statement.step() ? statement.getAsObject() : null
  statement.free()
  if (!row || row.status !== 'active' || !verifyPassword(password, row.password_hash)) return null
  delete row.password_hash
  return row
}

const getSession = (request) => {
  const token = request.headers.authorization?.replace('Bearer ', '')
  return token ? sessions.get(token) : null
}

const serveStaticFile = (response, filePath) => {
  try {
    const content = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.txt': 'text/plain; charset=utf-8',
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
    })
    response.end(content)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  }
}

const saveBusLocation = (database, location) => {
  const statement = database.prepare(`
    INSERT INTO bus_locations (bus_id, latitude, longitude, accuracy, speed, heading, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  statement.run([
    location.bus_id,
    location.latitude,
    location.longitude,
    location.accuracy ?? null,
    location.speed ?? null,
    location.heading ?? null,
    location.timestamp,
  ])
  statement.free()
  saveDatabase(database)
}

const getBusLocations = (database, busId, limit = 100) => {
  const statement = database.prepare(`
    SELECT id, bus_id, latitude, longitude, accuracy, speed, heading, timestamp
    FROM bus_locations
    WHERE bus_id = ?
    ORDER BY datetime(timestamp) DESC, id DESC
    LIMIT ?
  `)
  statement.bind([busId, limit])
  const rows = []
  while (statement.step()) rows.push(statement.getAsObject())
  statement.free()
  return rows.reverse()
}

const main = async () => {
  const SQL = await initSqlJs({ locateFile: (file) => path.join(rootDir, 'node_modules', 'sql.js', 'dist', file) })
  const database = fs.existsSync(databasePath)
    ? new SQL.Database(new Uint8Array(fs.readFileSync(databasePath)))
    : new SQL.Database()
  seedDatabase(database)

  const server = http.createServer(async (request, response) => {
    if (request.method === 'OPTIONS') {
      response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' })
      response.end()
      return
    }

    if (request.method === 'GET' && request.url === '/api/health') {
      json(response, 200, { ok: true, database: path.basename(databasePath) })
      return
    }

    if (request.method === 'POST' && request.url === '/api/auth/login') {
      try {
        const body = await readBody(request)
        if (!body.username || !body.password) {
          json(response, 400, { success: false, message: 'اسم المستخدم وكلمة المرور مطلوبة.' })
          return
        }
        const user = getRow(database, body.username, body.password)
        if (!user) {
          json(response, 401, { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' })
          return
        }
        const token = crypto.randomBytes(32).toString('hex')
        sessions.set(token, { userId: user.id, role: user.role, schoolId: user.school_id })
        json(response, 200, { success: true, token, user })
      } catch {
        json(response, 400, { success: false, message: 'تعذر قراءة طلب تسجيل الدخول.' })
      }
      return
    }

    if (request.method === 'GET' && request.url === '/api/auth/session') {
      const session = getSession(request)
      if (!session) {
        json(response, 401, { success: false, message: 'الجلسة غير صالحة.' })
        return
      }
      json(response, 200, { success: true, session })
      return
    }

    if (request.method === 'POST' && request.url === '/api/bus/location') {
      const session = getSession(request)
      if (!session || !['authority', 'school_admin'].includes(session.role)) {
        json(response, 403, { success: false, message: 'ليس لديك صلاحية تحديث موقع الحافلة.' })
        return
      }
      try {
        const body = await readBody(request)
        const latitude = Number(body.latitude)
        const longitude = Number(body.longitude)
        const busId = Number(body.bus_id)
        if (!Number.isInteger(busId) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || !body.timestamp) {
          json(response, 400, { success: false, message: 'إحداثيات GPS غير صالحة.' })
          return
        }
        const location = {
          bus_id: busId,
          latitude,
          longitude,
          accuracy: body.accuracy == null ? null : Number(body.accuracy),
          speed: body.speed == null ? null : Number(body.speed),
          heading: body.heading == null ? null : Number(body.heading),
          timestamp: new Date(body.timestamp).toISOString(),
        }
        if (Number.isNaN(Date.parse(location.timestamp))) {
          json(response, 400, { success: false, message: 'وقت GPS غير صالح.' })
          return
        }
        saveBusLocation(database, location)
        json(response, 201, { success: true, location })
      } catch {
        json(response, 400, { success: false, message: 'تعذر حفظ موقع الحافلة.' })
      }
      return
    }

    if (request.method === 'GET' && request.url.startsWith('/api/bus/location')) {
      const busId = Number(new URL(request.url, `http://${request.headers.host}`).searchParams.get('bus_id'))
      if (!Number.isInteger(busId)) {
        json(response, 400, { success: false, message: 'bus_id مطلوب.' })
        return
      }
      const locations = getBusLocations(database, busId)
      json(response, 200, { success: true, bus_id: busId, latest: locations.at(-1) ?? null, locations })
      return
    }

    if (request.method === 'POST' && request.url === '/api/auth/forgot-password') {
      json(response, 200, { success: true, message: 'تم تسجيل طلب الاستعادة التجريبي. راجع مسؤول النظام لإعادة تعيين كلمة المرور.' })
      return
    }

    if (request.method === 'GET' && !request.url.startsWith('/api/')) {
      const safePath = request.url === '/' ? '/index.html' : request.url.split('?')[0]
      const filePath = path.normalize(path.join(distDir, safePath))
      if (filePath.startsWith(distDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        serveStaticFile(response, filePath)
        return
      }

      if (fs.existsSync(path.join(distDir, 'index.html'))) {
        serveStaticFile(response, path.join(distDir, 'index.html'))
        return
      }
    }

    json(response, 404, { message: 'المسار غير موجود.' })
  })

  server.listen(port, () => {
    console.log(`SALIK API listening on http://localhost:${port}`)
    console.log(`SQLite database: ${databasePath}`)
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
