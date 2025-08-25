// ครอปจากศูนย์กลางของเฟรมวิดีโอตามอัตราส่วน (เช่น 1.586) และสเกลบางส่วนของภาพ (0..1)
export async function centerCropToDataUrl(video: HTMLVideoElement, ratio: number, scale = 0.78): Promise<string> {
const vw = video.videoWidth
const vh = video.videoHeight
if (!vw || !vh) {
throw new Error('Video not ready')
}


const canvas = document.createElement('canvas')


// กำหนดกรอบครอปจากกลางภาพ โดยให้ความสูงเป็นสัดส่วนจากภาพ หรือจำกัดด้วยอัตราส่วน
const targetH = Math.min(vh * scale, vw / ratio)
const targetW = targetH * ratio
const sx = Math.max(0, (vw - targetW) / 2)
const sy = Math.max(0, (vh - targetH) / 2)


canvas.width = targetW
canvas.height = targetH
const ctx = canvas.getContext('2d')!
ctx.drawImage(video, sx, sy, targetW, targetH, 0, 0, targetW, targetH)
return canvas.toDataURL('image/jpeg', 0.92)
}