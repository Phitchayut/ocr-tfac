'use client'


import { useCallback, useEffect, useRef, useState } from 'react'
import { centerCropToDataUrl } from '@/lib/image/crop'


interface Props { onCapture: (dataUrl: string) => void }


const CARD_RATIO = 85.6 / 53.98 // ≈ 1.586


export default function CameraCard({ onCapture }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [support, setSupport] = useState<boolean>(true)
    const [usingFile, setUsingFile] = useState<boolean>(false)
    const [err, setErr] = useState<string | null>(null)


    const startCamera = useCallback(async () => {
        setErr(null)
        setUsingFile(false)
        try {
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('No getUserMedia')
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            })
            const v = videoRef.current!
            v.srcObject = stream
            await v.play()
        } catch (e: any) {
            setErr('ไม่สามารถเปิดกล้องได้ ใช้การอัปโหลดรูปแทน')
            setSupport(false)
            setUsingFile(true)
        }
    }, [])


    useEffect(() => {
        // เริ่มกล้องเมื่อ mount
        startCamera()
        return () => {
            const v = videoRef.current
            const s = v?.srcObject as MediaStream | null
            s?.getTracks().forEach(t => t.stop())
        }
    }, [startCamera])


    const handleCapture = async () => {
        const v = videoRef.current
        if (!v) return
        const dataUrl = await centerCropToDataUrl(v, CARD_RATIO, Number(process.env.NEXT_PUBLIC_CROP_SCALE) || Number(process.env.CROP_SCALE) || 0.78)
        onCapture(dataUrl)
    }
    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = async () => {
            const img = new Image()
            img.onload = async () => {
                // แปลง Image → dataUrl ตามสัดส่วนบัตรและครอปกลางภาพ
                const canvas = document.createElement('canvas')
                const ratio = CARD_RATIO
                const scale = 0.78
                const w = img.width
                const h = img.height
                let targetH = Math.min(h * scale, w / ratio)
                let targetW = targetH * ratio
                const sx = Math.max(0, (w - targetW) / 2)
                const sy = Math.max(0, (h - targetH) / 2)
                canvas.width = targetW
                canvas.height = targetH
                const ctx = canvas.getContext('2d')!
                ctx.drawImage(img, sx, sy, targetW, targetH, 0, 0, targetW, targetH)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
                onCapture(dataUrl)
            }
            img.src = reader.result as string
        }
        reader.readAsDataURL(file)
    }
    return (
        <div ref={containerRef} className="rounded-2xl border bg-white p-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-xl border">
                        {support && !usingFile ? (
                            <>
                                <video
                                    ref={videoRef}
                                    className="h-full w-full object-contain bg-black"
                                    playsInline
                                    muted
                                    autoPlay
                                />
                                {/* กรอบช่วยเล็ง */}
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="border-2 border-white/90 outline outline-2 outline-black/50 rounded-md shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" style={{ aspectRatio: CARD_RATIO.toString(), width: '80%' }} />
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-600">
                                เลือกไฟล์ภาพจากเครื่อง
                            </div>
                        )}
                    </div>


                    <div className="flex items-center gap-2">
                        {support && !usingFile && (
                            <button onClick={handleCapture} className="rounded-xl bg-black text-white px-4 py-2">ถ่ายรูป</button>
                        )}
                        <label className="rounded-xl bg-gray-900 text-white px-4 py-2 cursor-pointer">
                            อัปโหลดรูป
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
                        </label>
                        <button onClick={startCamera} className="rounded-xl border px-3 py-2">รีสตาร์ทกล้อง</button>
                    </div>


                    {err && <div className="text-sm text-red-600">{err}</div>}
                    <p className="text-xs text-gray-500">คำแนะนำ: เปิดใช้งาน HTTPS, อนุญาตกล้อง, วางบัตรให้อยู่ในกรอบ</p>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-medium">เคล็ดลับความคมชัด</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>ถ่ายในที่สว่าง และหลีกเลี่ยงแสงสะท้อน</li>
                        <li>ให้กรอบบัตรเต็มกรอบช่วยเล็ง ~80%</li>
                        <li>หลีกเลี่ยงการเอียง/สั่น (ถือให้นิ่ง)</li>
                        <li>หาก iOS ไม่ยอมเปิดกล้อง ใช้ปุ่มอัปโหลดรูป (จะเปิดกล้องของระบบเอง)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}