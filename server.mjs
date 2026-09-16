import 'dotenv/config'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 8787)
const isProduction = process.env.NODE_ENV === 'production'
const dataDirectory = path.join(__dirname, 'data')
const uploadDirectory = path.join(dataDirectory, 'uploads')
const dataFile = path.join(dataDirectory, 'career-minute.json')
const settingsFile = path.join(__dirname, 'config', 'site-settings.json')
const settingsExampleFile = path.join(__dirname, 'config', 'site-settings.example.json')
const adminPassword = process.env.ADMIN_PASSWORD || ''
const sessionSecret = process.env.SESSION_SECRET || ''
const sessions = new Map()

const allowedExtensions = new Set(['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'])
const allowedMimes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
])
const orderStatuses = new Set(['new', 'pending', 'information-review', 'in-progress', 'first-draft', 'revision', 'final-review', 'completed', 'cancelled'])
const paymentStatuses = new Set(['pending', 'paid', 'failed', 'refunded'])

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-origin' },
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://www.googletagmanager.com', 'https://connect.facebook.net'],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", 'data:', 'https://www.facebook.com'],
      connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://www.facebook.com'], 
      frameAncestors: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  } : false,
}))
app.use(express.json({ limit: '300kb' }))
app.use(express.urlencoded({ extended: false, limit: '300kb' }))
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }))

function clean(value, max = 1000) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
function createReference() {
  return `CM-${new Date().getFullYear()}${crypto.randomInt(1000, 10000)}`
}
function createId(prefix) {
  return `${prefix}_${crypto.randomBytes(10).toString('hex')}`
}
function sessionToken() {
  return crypto.randomBytes(32).toString('base64url')
}
function readCookies(header = '') {
  return Object.fromEntries(header.split(';').map((piece) => piece.trim().split('=').map(decodeURIComponent)).filter(([key]) => key))
}
function secureCookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${isProduction ? '; Secure' : ''}`
}
function requireAdmin(req, res, next) {
  const token = readCookies(req.headers.cookie).cm_admin
  const session = token && sessions.get(token)
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token)
    return res.status(401).json({ error: 'Admin authentication required.' })
  }
  req.admin = session
  next()
}

async function ensureStorage() {
  await fs.mkdir(uploadDirectory, { recursive: true })
  await fs.mkdir(path.dirname(settingsFile), { recursive: true })
  try { await fs.access(dataFile) } catch { await writeData({ orders: [], contacts: [], subscribers: [], events: [] }) }
  try { await fs.access(settingsFile) } catch {
    try { await fs.copyFile(settingsExampleFile, settingsFile) } catch { await writeSettings(defaultSettings()) }
  }
}
function defaultSettings() {
  return {
    brandName: 'Career Minute',
    businessEmail: '',
    businessHours: 'Saturday–Thursday, 10:00 AM–8:00 PM',
    whatsappNumber: '8801814716713',
    facebookUrl: 'https://www.facebook.com/careerminute',
    analytics: { googleMeasurementId: '', metaPixelId: '' },
    payment: {
      bKash: { enabled: false, account: '', instruction: '' },
      Nagad: { enabled: false, account: '', instruction: '' },
      Rocket: { enabled: false, account: '', instruction: '' },
      Card: { enabled: false, account: '', instruction: '' },
    },
    packages: {
      'cv-foundation': { name: 'CV Foundation', price: '', deliveryDays: '', revisions: '' },
      'cv-momentum': { name: 'CV Momentum', price: '', deliveryDays: '', revisions: '' },
      'portfolio-showcase': { name: 'Portfolio Showcase', price: '', deliveryDays: '', revisions: '' },
      'personal-brand-pack': { name: 'Personal Brand Pack', price: '', deliveryDays: '', revisions: '' },
    },
  }
}
async function readData() {
  try { return JSON.parse(await fs.readFile(dataFile, 'utf8')) } catch { return { orders: [], contacts: [], subscribers: [], events: [] } }
}
async function writeData(data) {
  const temporary = `${dataFile}.${process.pid}.tmp`
  await fs.writeFile(temporary, JSON.stringify(data, null, 2), { mode: 0o600 })
  await fs.rename(temporary, dataFile)
}
async function readSettings() {
  try { return { ...defaultSettings(), ...JSON.parse(await fs.readFile(settingsFile, 'utf8')) } } catch { return defaultSettings() }
}
async function writeSettings(settings) {
  const temporary = `${settingsFile}.${process.pid}.tmp`
  await fs.writeFile(temporary, JSON.stringify(settings, null, 2), { mode: 0o600 })
  await fs.rename(temporary, settingsFile)
}
function publicSettings(settings) {
  return {
    brandName: settings.brandName,
    businessEmail: settings.businessEmail,
    businessHours: settings.businessHours,
    whatsappNumber: settings.whatsappNumber,
    facebookUrl: settings.facebookUrl,
    analytics: settings.analytics,
    payment: Object.fromEntries(Object.entries(settings.payment || {}).map(([key, value]) => [key, { enabled: Boolean(value.enabled), account: clean(value.account, 160), instruction: clean(value.instruction, 300) }])), 
    packages: settings.packages,
  }
}
async function sendResendEmail(message) {
  if (!process.env.RESEND_API_KEY) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || 'Career Minute <orders@careerminute.com>', ...message }),
    })
  } catch { /* email delivery failures never expose private form content to the visitor */ }
}
async function sendOrderEmail(order, settings) {
  // Optional Resend integration: notify the business and provide the customer a clear request reference.
  const messages = []
  if (settings.businessEmail) messages.push({ to: [settings.businessEmail], subject: `New Career Minute request ${order.reference}`, text: `A new ${order.service} request was submitted by ${order.fullName}. Reference: ${order.reference}. Log in to the admin area to review it.` })
  if (order.email) messages.push({ to: [order.email], subject: `Career Minute received your request ${order.reference}`, text: `Hello ${order.fullName}, Career Minute has received your ${order.service} request. Your reference is ${order.reference}. We will review your information and follow up with the next steps, scope and payment instructions.` })
  await Promise.all(messages.map(sendResendEmail))
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${crypto.randomBytes(10).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    if (allowedExtensions.has(extension) && (allowedMimes.has(file.mimetype) || file.mimetype === 'application/octet-stream')) return callback(null, true)
    callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
  },
})

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'career-minute-api' }))
app.get('/api/settings', async (_req, res, next) => {
  try { res.json(publicSettings(await readSettings())) } catch (error) { next(error) }
})
app.post('/api/orders', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'paymentScreenshot', maxCount: 1 }]), async (req, res, next) => {
  try {
    const fullName = clean(req.body.fullName, 100)
    const email = clean(req.body.email, 180).toLowerCase()
    const phone = clean(req.body.phone, 30)
    const profession = clean(req.body.profession, 150)
    const goal = clean(req.body.goal, 2000)
    const service = clean(req.body.service, 120)
    const transactionId = clean(req.body.transactionId, 100)
    const paymentMethod = clean(req.body.paymentMethod, 40)
    if (!fullName || !validEmail(email) || !phone || !profession || !goal || !service || req.body.consent !== 'on') {
      return res.status(422).json({ error: 'Please complete all required request details.' })
    }
    const files = req.files || {}
    const document = files.file?.[0]
    const paymentScreenshot = files.paymentScreenshot?.[0]
    const order = {
      id: createId('order'), reference: createReference(), service, fullName, email, phone, profession, goal,
      status: 'new', paymentStatus: transactionId ? 'pending' : 'pending', paymentMethod, transactionId,
      document: document ? { fileName: clean(document.originalname, 180), storageName: document.filename, mime: document.mimetype, size: document.size } : null,
      paymentScreenshot: paymentScreenshot ? { fileName: clean(paymentScreenshot.originalname, 180), storageName: paymentScreenshot.filename, mime: paymentScreenshot.mimetype, size: paymentScreenshot.size } : null,
      adminNote: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    const data = await readData(); data.orders.unshift(order); await writeData(data)
    const settings = await readSettings(); await sendOrderEmail(order, settings)
    res.status(201).json({ reference: order.reference, status: order.status })
  } catch (error) { next(error) }
})
app.post('/api/contact', async (req, res, next) => {
  try {
    const name = clean(req.body.name, 100), email = clean(req.body.email, 180).toLowerCase(), topic = clean(req.body.topic, 100), message = clean(req.body.message, 1500)
    if (!name || !validEmail(email) || !topic || !message) return res.status(422).json({ error: 'Please complete all contact fields.' })
    const data = await readData(); data.contacts.unshift({ id: createId('contact'), name, email, topic, message, createdAt: new Date().toISOString() }); await writeData(data)
    res.status(201).json({ received: true })
  } catch (error) { next(error) }
})
app.post('/api/subscribers', async (req, res, next) => {
  try {
    const email = clean(req.body.email, 180).toLowerCase()
    const name = clean(req.body.name, 100)
    if (!name || !validEmail(email)) return res.status(422).json({ error: 'Please enter a valid email address.' })
    const data = await readData()
    if (!data.subscribers.some((subscriber) => subscriber.email === email)) data.subscribers.unshift({ email, name, createdAt: new Date().toISOString() })
    await writeData(data); res.status(201).json({ subscribed: true, downloadUrl: '/cv-checklist/' })
  } catch (error) { next(error) }
})
app.post('/api/events', async (req, res, next) => {
  try {
    const event = clean(req.body.event, 80)
    if (!event) return res.status(422).json({ error: 'Event name required.' })
    const data = await readData(); data.events.unshift({ event, page: clean(req.body.page, 160), detail: clean(req.body.detail, 160), createdAt: new Date().toISOString() }); data.events = data.events.slice(0, 5000); await writeData(data)
    res.status(201).json({ tracked: true })
  } catch (error) { next(error) }
})

app.post('/api/admin/login', (req, res) => {
  if (!adminPassword || !sessionSecret) return res.status(503).json({ error: 'Admin login is not configured. Set ADMIN_PASSWORD and SESSION_SECRET on the server.' })
  const password = String(req.body.password || '')
  const input = crypto.createHash('sha256').update(password).digest()
  const expected = crypto.createHash('sha256').update(adminPassword).digest()
  if (input.length !== expected.length || !crypto.timingSafeEqual(input, expected)) return res.status(401).json({ error: 'Invalid password.' })
  const token = sessionToken(); sessions.set(token, { createdAt: Date.now(), expiresAt: Date.now() + 12 * 60 * 60 * 1000, signature: crypto.createHmac('sha256', sessionSecret).update(token).digest('hex') })
  res.setHeader('Set-Cookie', secureCookie('cm_admin', token, 12 * 60 * 60)).json({ authenticated: true })
})
app.post('/api/admin/logout', requireAdmin, (req, res) => { sessions.delete(readCookies(req.headers.cookie).cm_admin); res.setHeader('Set-Cookie', secureCookie('cm_admin', '', 0)).json({ loggedOut: true }) })
app.get('/api/admin/orders', requireAdmin, async (req, res, next) => {
  try {
    const data = await readData(); const status = clean(req.query.status, 40)
    res.json({ orders: status ? data.orders.filter((order) => order.status === status) : data.orders })
  } catch (error) { next(error) }
})
app.patch('/api/admin/orders/:id', requireAdmin, async (req, res, next) => {
  try {
    const data = await readData(); const order = data.orders.find((item) => item.id === req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found.' })
    const status = clean(req.body.status, 40); const paymentStatus = clean(req.body.paymentStatus, 40)
    if (status && !orderStatuses.has(status)) return res.status(422).json({ error: 'Invalid order status.' })
    if (paymentStatus && !paymentStatuses.has(paymentStatus)) return res.status(422).json({ error: 'Invalid payment status.' })
    if (status) order.status = status
    if (paymentStatus) order.paymentStatus = paymentStatus
    if (typeof req.body.adminNote === 'string') order.adminNote = clean(req.body.adminNote, 2000)
    order.updatedAt = new Date().toISOString(); await writeData(data); res.json({ order })
  } catch (error) { next(error) }
})
app.get('/api/admin/settings', requireAdmin, async (_req, res, next) => { try { res.json(await readSettings()) } catch (error) { next(error) } })
app.put('/api/admin/settings', requireAdmin, async (req, res, next) => {
  try {
    const current = await readSettings(); const incoming = req.body || {}
    const settings = {
      ...current,
      businessEmail: clean(incoming.businessEmail, 180), businessHours: clean(incoming.businessHours, 160),
      whatsappNumber: clean(incoming.whatsappNumber, 25), facebookUrl: clean(incoming.facebookUrl, 300),
      analytics: { googleMeasurementId: clean(incoming.analytics?.googleMeasurementId, 80), metaPixelId: clean(incoming.analytics?.metaPixelId, 80) },
      payment: incoming.payment && typeof incoming.payment === 'object' ? incoming.payment : current.payment,
      packages: incoming.packages && typeof incoming.packages === 'object' ? incoming.packages : current.packages,
    }
    await writeSettings(settings); res.json({ settings: publicSettings(settings) })
  } catch (error) { next(error) }
})

app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'), { maxAge: isProduction ? '30d' : 0, immutable: isProduction }))
app.use(express.static(path.join(__dirname, 'dist'), { extensions: ['html'], maxAge: isProduction ? '1h' : 0 }))
app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'dist', '404.html')))
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(422).json({ error: 'Upload must be a PDF, DOC, DOCX, JPG or PNG under 10 MB.' })
  console.error(error)
  res.status(500).json({ error: 'Something went wrong. Please try again or contact Career Minute on WhatsApp.' })
})

await ensureStorage()
if (!adminPassword || !sessionSecret) console.warn('Admin login is disabled until ADMIN_PASSWORD and SESSION_SECRET are configured.')
app.listen(PORT, '0.0.0.0', () => console.log(`Career Minute production server listening on http://0.0.0.0:${PORT}`))
