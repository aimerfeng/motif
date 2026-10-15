/*
 * 工作台的参考图（用户附上的截图、设计稿）：在浏览器里缩小再上传。
 * 交给模型的版本长边不超过 1568px（再大模型也会先缩小，只是白白多传），缩略图只用来在对话里显示。
 */

export interface Attachment {
  mediaType: 'image/jpeg'
  /** base64，不带 data: 前缀。 */
  data: string
  /** 对话里显示的小图（data URL）。 */
  thumbnail: string
}

export const MAX_ATTACHMENTS = 2
const MODEL_EDGE = 1568
const THUMB_EDGE = 160
const MAX_SOURCE_BYTES = 20_000_000

async function encode(bitmap: ImageBitmap, edge: number, quality: number): Promise<string> {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')!
  // 透明的 PNG 转成 JPEG 时底色会变黑：先铺白底。
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

/** 读一张图片文件，返回缩小后的参考图和缩略图。不是图片或太大时抛错（错误信息给界面显示）。 */
export async function prepareAttachment(file: File): Promise<Attachment> {
  if (!file.type.startsWith('image/')) throw new Error('not-image')
  if (file.size > MAX_SOURCE_BYTES) throw new Error('too-large')
  const bitmap = await createImageBitmap(file)
  try {
    const full = await encode(bitmap, MODEL_EDGE, 0.85)
    const thumbnail = await encode(bitmap, THUMB_EDGE, 0.7)
    return { mediaType: 'image/jpeg', data: full.slice(full.indexOf(',') + 1), thumbnail }
  } finally {
    bitmap.close()
  }
}
