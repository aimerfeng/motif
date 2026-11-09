import { useDrawnImage } from '@motif/runtime'
import { PixelImage, type PixelImageProps } from './image-tile-reveal'

const S = 768

function drawDunes(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, S * 0.6)
  sky.addColorStop(0, '#2b2a5c')
  sky.addColorStop(0.55, '#c46a6a')
  sky.addColorStop(1, '#f6c27d')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = '#fff1d2'
  ctx.beginPath()
  ctx.arc(S * 0.66, S * 0.46, S * 0.07, 0, Math.PI * 2)
  ctx.fill()
  const dunes: [number, number, string, string][] = [
    [0.52, 0.05, '#d98a5c', '#b0603f'],
    [0.6, 0.07, '#b8603d', '#8a3f2c'],
    [0.7, 0.06, '#8c3f2e', '#5e2620'],
    [0.82, 0.08, '#5b2420', '#2e1214'],
  ]
  dunes.forEach(([base, amp, light, dark], i) => {
    const g = ctx.createLinearGradient(0, S * (base - amp), S, S)
    g.addColorStop(0, light)
    g.addColorStop(1, dark)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(0, S)
    for (let x = 0; x <= S; x += 8) {
      const t = x / S
      ctx.lineTo(x, S * (base - amp * Math.sin(t * Math.PI * (1.2 + i * 0.35) + i * 1.7)))
    }
    ctx.lineTo(S, S)
    ctx.closePath()
    ctx.fill()
  })
}

function drawTide(ctx: CanvasRenderingContext2D) {
  const sea = ctx.createLinearGradient(0, 0, 0, S)
  sea.addColorStop(0, '#0d3b52')
  sea.addColorStop(0.5, '#137a86')
  sea.addColorStop(1, '#e9d9b4')
  ctx.fillStyle = sea
  ctx.fillRect(0, 0, S, S)
  for (let i = 0; i < 14; i++) {
    const y = S * (0.12 + i * 0.065)
    ctx.strokeStyle = `rgba(236, 252, 255, ${(0.16 + (i % 3) * 0.12).toFixed(2)})`
    ctx.lineWidth = 3 + (i % 4) * 2
    ctx.beginPath()
    for (let x = 0; x <= S; x += 6) {
      const yy = y + Math.sin(x / (40 + i * 4) + i) * (8 + i * 1.5)
      if (x === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
  ctx.fillStyle = '#f3e6c8'
  ctx.beginPath()
  ctx.moveTo(0, S)
  ctx.bezierCurveTo(S * 0.3, S * 0.8, S * 0.6, S * 0.92, S, S * 0.78)
  ctx.lineTo(S, S)
  ctx.closePath()
  ctx.fill()
}

function drawBloom(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#1d1630'
  ctx.fillRect(0, 0, S, S)
  const cx = S / 2
  const cy = S / 2
  const petals = 9
  const hues = [330, 16, 46]
  for (let ring = 0; ring < 3; ring++) {
    const r = S * (0.36 - ring * 0.1)
    const hue = hues[ring] ?? 0
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2 + ring * 0.35
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(a)
      const g = ctx.createLinearGradient(0, 0, r, 0)
      g.addColorStop(0, `hsl(${hue} 80% 40%)`)
      g.addColorStop(1, `hsl(${hue + 20} 90% 72%)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(r * 0.55, 0, r * 0.5, r * 0.2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
  ctx.fillStyle = '#ffe9a8'
  ctx.beginPath()
  ctx.arc(cx, cy, S * 0.05, 0, Math.PI * 2)
  ctx.fill()
}

const ART = {
  dunes: { draw: drawDunes, alt: 'Layered sand dunes under a low sun', caption: 'Erg Lune · 06:12' },
  tide: { draw: drawTide, alt: 'Waves rolling onto a pale beach, seen from above', caption: 'Low tide · Coast study 03' },
  bloom: { draw: drawBloom, alt: 'A stylised flower in rose, coral and gold petals', caption: 'Bloom · Print series' },
}

export function Demo({ artwork = 'dunes', ...props }: Omit<PixelImageProps, 'src'>) {
  const art = ART[artwork as keyof typeof ART] ?? ART.dunes
  const src = useDrawnImage(`tile-reveal-${artwork}`, art.draw, { width: S, height: S })
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <figure className="m-0 flex flex-col items-center">
        <PixelImage {...props} src={src} alt={art.alt} />
        <figcaption className="mt-4 text-xs text-muted-foreground">{art.caption}</figcaption>
      </figure>
    </div>
  )
}
