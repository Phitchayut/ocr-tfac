import { NextRequest } from 'next/server'
import { parseThaiIdFromText } from '@/lib/ocr/thaiParser'


export async function POST(req: NextRequest) {
try {
const { imageBase64 } = await req.json()
if (!imageBase64 || typeof imageBase64 !== 'string') {
return new Response(JSON.stringify({ message: 'imageBase64 is required' }), { status: 400 })
}


const apiKey = process.env.VISION_API_KEY
if (!apiKey) {
return new Response(JSON.stringify({ message: 'Missing VISION_API_KEY' }), { status: 500 })
}


const content = imageBase64.replace(/^data:image\/\w+;base64,/, '')


const payload = {
requests: [
{
image: { content },
features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
imageContext: { languageHints: ['th', 'en'] },
},
],
}


const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
{
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload),
})


if (!res.ok) {
const j = await res.json().catch(() => ({}))
return new Response(JSON.stringify({ message: j?.error?.message || `Vision HTTP ${res.status}` }), { status: 500 })
}


const json = await res.json() as any
const text: string = json?.responses?.[0]?.fullTextAnnotation?.text || json?.responses?.[0]?.textAnnotations?.[0]?.description || ''


const data = parseThaiIdFromText(text || '')


return new Response(JSON.stringify({ data, rawText: text }), { status: 200 })
} catch (e: any) {
return new Response(JSON.stringify({ message: e?.message || 'Unhandled error' }), { status: 500 })
}
}