'use client'


import { useState } from 'react'
import CameraCard from '@/components/CameraCard'
import ResultCard from '@/components/ResultCard'
import type { ThaiIdCardData } from '@/lib/types'


export default function Page() {
const [img, setImg] = useState<string | null>(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [data, setData] = useState<ThaiIdCardData | null>(null)
const [rawText, setRawText] = useState<string>('')


const handleCapture = async (dataUrl: string) => {
setImg(dataUrl)
setError(null)
setData(null)
setRawText('')
setLoading(true)
try {
const res = await fetch('/api/ocr', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ imageBase64: dataUrl }),
})
if (!res.ok) {
const j = await res.json().catch(() => ({}))
throw new Error(j?.message || `HTTP ${res.status}`)
}
const j = await res.json() as { data: ThaiIdCardData | null, rawText: string }
setData(j.data)
setRawText(j.rawText)
} catch (e: any) {
setError(e?.message || 'เกิดข้อผิดพลาดในการ OCR')
} finally {
setLoading(false)
}
}


return (
<main className="mx-auto max-w-5xl p-4 md:p-6 space-y-6">
<h1 className="text-2xl font-semibold">สแกนบัตรประชาชนไทย (OCR)</h1>
<p className="text-sm text-gray-600">วางบัตรให้อยู่ในกรอบ แล้วกดถ่าย ระบบจะครอปอัตโนมัติและส่งไป OCR</p>


<CameraCard onCapture={handleCapture} />


{loading && (
<div className="rounded-xl border bg-white p-4">กำลังประมวลผล OCR…</div>
)}


{error && (
<div className="rounded-xl border bg-white p-4 text-red-600">{error}</div>
)}


{(data || rawText || img) && (
<ResultCard img={img} data={data} rawText={rawText} />)
}
</main>
)
}