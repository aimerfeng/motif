// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/condensation/condensationRenderer.ts
// Modified by Motif; see the item's provenance.

export type CondensationOptions = {
  dropAmount: number
  bubbleTint: string
  maxRadius: number
  gravity: number
  splashRings: boolean
}

type Drop = {
  x: number
  y: number
  r: number
  rMax: number
  grow: number
  running: boolean
  vy: number
}

type Splash = {
  x: number
  y: number
  r0: number
  born: number
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean.padEnd(6, '0').slice(0, 6)
  const value = Number.parseInt(full, 16)
  if (Number.isNaN(value)) return [96, 139, 196]
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const shade = ([r, g, b]: [number, number, number], k: number) => `${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)}`

export function createCondensationRenderer(canvas: HTMLCanvasElement, getOptions: () => CondensationOptions) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Condensation requires Canvas 2D')

  let width = 1
  let height = 1
  let dpr = 1
  let floorY = 1
  let baseMaxDrops = 120
  let maxDrops = 120
  let lastCascade = 0
  let simulatedNow = 0
  let drops: Drop[] = []
  let splashes: Splash[] = []
  let spriteKey = ''
  const bubbleSprites = new Map<number, HTMLCanvasElement>()

  const getBubbleSprite = (radius: number, options: CondensationOptions) => {
    const key = `${options.bubbleTint}|${options.maxRadius}`
    if (key !== spriteKey) {
      spriteKey = key
      bubbleSprites.clear()
    }
    const spriteRadius = Math.max(0.5, Math.round(radius * 2) / 2)
    const cached = bubbleSprites.get(spriteRadius)
    if (cached) return cached

    const tint = parseHex(options.bubbleTint)
    const padding = Math.ceil(2 * dpr)
    const size = Math.ceil(spriteRadius * 2 + padding * 2)
    const sprite = document.createElement('canvas')
    sprite.width = size
    sprite.height = size
    const spriteContext = sprite.getContext('2d')
    if (!spriteContext) throw new Error('Condensation bubble sprite unavailable')
    const center = size / 2
    const lit = Math.min(1.6, spriteRadius / (options.maxRadius * dpr))
    spriteContext.fillStyle = `rgba(${shade(tint, 1)},${0.18 + lit * 0.22})`
    spriteContext.beginPath()
    spriteContext.arc(center, center, spriteRadius, 0, Math.PI * 2)
    spriteContext.fill()
    spriteContext.strokeStyle = `rgba(${shade(tint, 0.74)},${0.35 + lit * 0.35})`
    spriteContext.lineWidth = 0.9 * dpr
    spriteContext.stroke()
    spriteContext.fillStyle = `rgba(255,255,255,${0.32 + lit * 0.3})`
    spriteContext.beginPath()
    spriteContext.arc(center - spriteRadius * 0.32, center - spriteRadius * 0.36, Math.max(0.45 * dpr, spriteRadius * 0.24), 0, Math.PI * 2)
    spriteContext.fill()
    bubbleSprites.set(spriteRadius, sprite)
    return sprite
  }

  const seedDrop = (headStart = 0) => {
    const options = getOptions()
    const margin = 8 * dpr
    const availableWidth = Math.max(1, width - margin * 2)
    const availableHeight = Math.max(1, floorY - margin * 2)
    drops.push({
      x: margin + Math.random() * availableWidth,
      y: margin + Math.random() * availableHeight,
      r: (0.5 + headStart * 0.7) * dpr,
      rMax: (2.1 + Math.random() * Math.max(0.2, options.maxRadius - 2.1)) * dpr,
      grow: (0.0022 + Math.random() * 0.0032) * dpr,
      running: false,
      vy: 0,
    })
  }

  /** 尺寸由 useCanvasSize 管理；这里只读取像素尺寸并重新播种。 */
  const resize = (pixelWidth: number, pixelHeight: number, pixelRatio: number) => {
    dpr = pixelRatio
    width = Math.max(1, pixelWidth)
    height = Math.max(1, pixelHeight)
    floorY = Math.max(1, height - 2 * dpr)
    baseMaxDrops = Math.max(80, Math.min(240, Math.round((width * height) / (dpr * dpr) / 5200)))
    maxDrops = Math.round(baseMaxDrops * getOptions().dropAmount)
    drops = []
    splashes = []
    bubbleSprites.clear()
    const seedCount = Math.round(maxDrops * 0.62)
    for (let index = 0; index < seedCount; index += 1) seedDrop(Math.random() * 3)
  }

  const step = (now: number, motionScale: number, options: CondensationOptions) => {
    if (motionScale <= 0) return
    if (drops.length < maxDrops && Math.random() < 0.34 * motionScale) seedDrop()
    if (now - lastCascade > 6400) {
      lastCascade = now
      drops
        .filter((drop) => !drop.running)
        .sort((a, b) => b.r - a.r)
        .slice(0, 3)
        .forEach((drop) => {
          drop.running = true
          drop.vy = 0.35 * dpr
        })
    }

    for (let index = drops.length - 1; index >= 0; index -= 1) {
      const drop = drops[index]!
      if (!drop.running) {
        drop.r += drop.grow * motionScale
        if (drop.r >= drop.rMax) {
          drop.running = true
          drop.vy = 0.3 * dpr
        }
        continue
      }

      drop.vy = Math.min(drop.vy + options.gravity * dpr * motionScale, 5.4 * dpr)
      drop.y += drop.vy * motionScale
      for (let otherIndex = drops.length - 1; otherIndex >= 0; otherIndex -= 1) {
        const other = drops[otherIndex]!
        if (other === drop || other.running) continue
        const overlapsX = Math.abs(other.x - drop.x) < drop.r + other.r + 1.5 * dpr
        const overlapsY = other.y > drop.y - drop.r && other.y < drop.y + drop.vy + drop.r
        if (overlapsX && overlapsY) {
          drop.r = Math.sqrt(drop.r * drop.r + other.r * other.r)
          drops.splice(otherIndex, 1)
          if (otherIndex < index) index -= 1
        }
      }

      if (drop.y >= floorY) {
        if (options.splashRings) splashes.push({ x: drop.x, y: floorY, r0: drop.r, born: now })
        drops.splice(index, 1)
      }
    }
    splashes = splashes.filter((splash) => now - splash.born < 760)
  }

  const draw = (now: number, options: CondensationOptions) => {
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, width, height)
    drops.forEach((drop) => {
      const sprite = getBubbleSprite(drop.r, options)
      context.drawImage(sprite, drop.x - sprite.width / 2, drop.y - sprite.height / 2)
    })

    const ring = shade(parseHex(options.bubbleTint), 0.78)
    splashes.forEach((splash) => {
      const progress = (now - splash.born) / 760
      if (progress < 0 || progress > 1) return
      const radius = splash.r0 + progress * 16 * dpr
      context.strokeStyle = `rgba(${ring},${(1 - progress) * 0.52})`
      context.lineWidth = 1.1 * dpr
      context.beginPath()
      context.ellipse(splash.x, splash.y, radius, radius * 0.34, 0, 0, Math.PI * 2)
      context.stroke()
    })
  }

  return {
    resize,
    /** deltaMs 由 useFrameLoop 给出（已乘 speed）；为 0 时只重画当前状态。 */
    render(deltaMs: number) {
      const options = getOptions()
      maxDrops = Math.round(baseMaxDrops * options.dropAmount)
      const delta = Math.min(50, Math.max(0, deltaMs))
      simulatedNow += delta
      step(simulatedNow, delta / 16.67, options)
      draw(simulatedNow, options)
    },
    dispose() {
      drops = []
      splashes = []
      bubbleSprites.clear()
    },
  }
}
