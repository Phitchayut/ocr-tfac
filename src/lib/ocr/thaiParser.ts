import type { ThaiIdCardData } from '@/lib/types'


const THAI_DIGIT_MAP: Record<string, string> = {
'๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4',
'๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9',
}


const TH_MONTHS: Record<string, number> = {
'มกราคม': 1,
'กุมภาพันธ์': 2,
'มีนาคม': 3,
'เมษายน': 4,
'พฤษภาคม': 5,
'มิถุนายน': 6,
'กรกฎาคม': 7,
'สิงหาคม': 8,
'กันยายน': 9,
'ตุลาคม': 10,
'พฤศจิกายน': 11,
'ธันวาคม': 12,
}


const EN_MONTHS: Record<string, number> = {
'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
}
function normalizeThaiDigits(s: string) {
return s.replace(/[๐-๙]/g, d => THAI_DIGIT_MAP[d] || d)
}


function toISO(y: number, m: number, d: number) {
const mm = String(m).padStart(2, '0')
const dd = String(d).padStart(2, '0')
return `${y}-${mm}-${dd}`
}
function parseThaiDate(input: string): string | undefined {
// รับทั้ง 01/01/2560, 1 มกราคม 2560, 01-01-2560, etc.
const s = normalizeThaiDigits(input).toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim()


// แบบตัวเลข 01/01/2560 หรือ 01-01-2560
let m = s.match(/(\d{1,2})[\/\- ](\d{1,2})[\/\- ](\d{4})/)
if (m) {
let d = parseInt(m[1], 10)
let mo = parseInt(m[2], 10)
let y = parseInt(m[3], 10)
if (y > 2400) y -= 543 // แปลง พ.ศ. → ค.ศ.
if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return toISO(y, mo, d)
}


// แบบข้อความ 1 มกราคม 2560
m = s.match(/(\d{1,2})\s+([\u0E00-\u0E7F]+)\s+(\d{4})/)
if (m) {
const d = parseInt(m[1], 10)
const name = m[2]
const yRaw = parseInt(m[3], 10)
const mo = TH_MONTHS[name]
let y = yRaw
if (y > 2400) y -= 543
if (mo) return toISO(y, mo, d)
}


// ภาษาอังกฤษ (บางบัตรมีบรรทัดภาษาอังกฤษ)
m = s.match(/(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/)
if (m) {
const d = parseInt(m[1], 10)
const mo = EN_MONTHS[m[2]]
const y = parseInt(m[3], 10)
if (mo) return toISO(y, mo, d)
}


return undefined
}
function extractCitizenId(lines: string[]): string | undefined {
// รองรับรูปแบบมีขีด/เว้นวรรค และเลขไทย
const all = normalizeThaiDigits(lines.join(' ')).replace(/[^0-9\-\s]/g, ' ')
// 1-2345-67890-12-3 หรือ 1234567890123
const m = all.match(/(\d[\-\s]?\d{4}[\-\s]?\d{5}[\-\s]?\d{2}[\-\s]?\d)/)
if (m) {
const digits = m[1].replace(/[^0-9]/g, '')
if (digits.length === 13) {
// format ใส่ขีด
return `${digits[0]}-${digits.slice(1,5)}-${digits.slice(5,10)}-${digits.slice(10,12)}-${digits[12]}`
}
}
return undefined
}
function extractNames(lines: string[]) {
// heuristic: มองหาบรรทัดมีคำว่า ชื่อ / นามสกุล และ Name / Surname
let firstTh: string | undefined
let lastTh: string | undefined
let title: string | undefined
let firstEn: string | undefined
let lastEn: string | undefined


for (const raw of lines) {
const line = raw.trim()
const l = line.replace(/[:：]/g, ' ').replace(/\s+/g, ' ')
if (/^ชื่อ\b/.test(l)) {
// "ชื่อ นายสมชาย" หรือ "ชื่อ สมชาย"
const parts = l.split(/\s+/)
// parts[0] = ชื่อ
const rest = parts.slice(1).join(' ')
// ตัดคำนำหน้า (นาย/นาง/นางสาว/เด็กชาย/เด็กหญิง)
const titleMatch = rest.match(/^(นาย|นางสาว|นาง|เด็กชาย|เด็กหญิง)/)
if (titleMatch) title = titleMatch[0]
const name = rest.replace(/^(นาย|นางสาว|นาง|เด็กชาย|เด็กหญิง)\s*/, '').split(' ')[0]
if (name) firstTh = name
}
if (/^นามสกุล\b/.test(l)) {
const parts = l.split(/\s+/)
const last = parts.slice(1).join(' ').trim()
if (last) lastTh = last
}


// อังกฤษ
if (/^name\b/i.test(l)) {
const parts = l.split(/\s+/)
const f = parts.slice(1).join(' ').trim()
if (f) firstEn = f
}
if (/^(surname|last name)\b/i.test(l)) {
const parts = l.split(/\s+/)
const la = parts.slice(1).join(' ').trim()
if (la) lastEn = la
}
}
return { title, firstTh, lastTh, firstEn, lastEn }
}
function extractDates(lines: string[]) {
let birth: string | undefined
let issue: string | undefined
let expiry: string | undefined


for (const raw of lines) {
const line = raw.replace(/[|]/g, ' ').replace(/\s+/g, ' ').trim()
const lower = line.toLowerCase()


if (lower.includes('วันเกิด') || lower.includes('date of birth')) {
const found = parseThaiDate(line)
if (found) birth = found
}
if (lower.includes('วันออกบัตร') || lower.includes('date of issue')) {
const found = parseThaiDate(line)
if (found) issue = found
}
if (lower.includes('วันบัตรหมดอายุ') || lower.includes('วันหมดอายุ') || lower.includes('date of expiry')) {
const found = parseThaiDate(line)
if (found) expiry = found
}


// หากอยู่คนละบรรทัด: ลองจับรูปแบบวันที่โดด ๆ
if (!birth) {
const maybe = parseThaiDate(line)
if (maybe && lower.includes('เกิด')) birth = maybe
}
if (!issue && (lower.includes('ออก') || lower.includes('issue'))) {
const maybe = parseThaiDate(line)
if (maybe) issue = maybe
}
if (!expiry && (lower.includes('หมด') || lower.includes('expiry'))) {
const maybe = parseThaiDate(line)
if (maybe) expiry = maybe
}
}


return { birth, issue, expiry }
}
export function parseThaiIdFromText(text: string): ThaiIdCardData | null {
if (!text) return null
const cleaned = text.replace(/[\u200B-\u200D\uFEFF]/g, '')
const lines = cleaned.split(/\r?\n/).map(s => s.trim()).filter(Boolean)


const citizenId = extractCitizenId(lines)
const names = extractNames(lines)
const dates = extractDates(lines)


const result: ThaiIdCardData = {
citizenId,
title: names.title,
firstNameTh: names.firstTh,
lastNameTh: names.lastTh,
firstNameEn: names.firstEn,
lastNameEn: names.lastEn,
birthDate: dates.birth,
issueDate: dates.issue,
expiryDate: dates.expiry,
}


// ถ้าหาว่างเปล่าทั้งหมด ให้คืน null
const hasAny = Object.values(result).some(Boolean)
return hasAny ? result : null
}