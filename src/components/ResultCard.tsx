'use client'


import type { ThaiIdCardData } from '@/lib/types'


export default function ResultCard({ img, data, rawText }: { img: string | null, data: ThaiIdCardData | null, rawText: string }) {
return (
<div className="rounded-2xl border bg-white p-4 grid md:grid-cols-2 gap-4">
<div className="space-y-3">
<p className="font-medium">ภาพที่ใช้ OCR</p>
{img ? (
<img src={img} alt="Capture" className="w-full rounded-lg border" />
) : (
<div className="w-full aspect-video rounded-lg border bg-gray-100" />
)}
</div>


<div className="space-y-3">
<p className="font-medium">ผลลัพธ์ที่ดึงได้</p>
{data ? (
<div className="text-sm">
<div><span className="text-gray-500">เลขประจำตัวประชาชน:</span> <b>{data.citizenId || '-'}</b></div>
<div><span className="text-gray-500">คำนำหน้า:</span> {data.title || '-'}</div>
<div><span className="text-gray-500">ชื่อ (TH):</span> {data.firstNameTh || '-'}</div>
<div><span className="text-gray-500">นามสกุล (TH):</span> {data.lastNameTh || '-'}</div>
<div><span className="text-gray-500">ชื่อ (EN):</span> {data.firstNameEn || '-'}</div>
<div><span className="text-gray-500">นามสกุล (EN):</span> {data.lastNameEn || '-'}</div>
<div><span className="text-gray-500">วันเกิด (YYYY-MM-DD):</span> {data.birthDate || '-'}</div>
<div><span className="text-gray-500">วันออกบัตร (YYYY-MM-DD):</span> {data.issueDate || '-'}</div>
<div><span className="text-gray-500">วันหมดอายุ (YYYY-MM-DD):</span> {data.expiryDate || '-'}</div>
</div>
) : (
<div className="text-sm text-gray-500">ยังไม่มีข้อมูล/อ่านไม่ออก</div>
)}


<details className="text-xs text-gray-600">
<summary className="cursor-pointer">ดูข้อความ OCR ทั้งหมด</summary>
<pre className="mt-2 whitespace-pre-wrap break-words p-2 bg-gray-50 rounded border max-h-72 overflow-auto">{rawText || '-'}</pre>
</details>
</div>
</div>
)
}