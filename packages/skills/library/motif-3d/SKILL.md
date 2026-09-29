---
name: motif-3d
description: "Add 3D visuals to web pages with three.js, react-three-fiber or lightweight WebGL libraries such as cobe: globes, hero objects, product scenes and spatial backgrounds. Covers render-on-demand, disposal, color management, loading, performance budgets and static fallbacks. Use when adding a 3D scene or globe, or when one is slow, dark, washed out or leaking memory."
license: MIT
compatibility: three.js r150+ (examples assume r160+ color management), react-three-fiber 8/9, or cobe 2.
metadata:
  source: "https://github.com/aimerfeng/motif"
---

# 3D on the web

## Rules

### Choose the lightest tool

| Need | Use |
| --- | --- |
| A dotted globe with markers | cobe (~5 KB) |
| A single full-screen effect | a fragment shader (see `motif-shaders`) |
| Real geometry, lights, models | three.js / react-three-fiber |

### One canvas, rendered on demand when possible

```tsx
// react-three-fiber: static or interaction-driven scenes
<Canvas frameloop="demand" dpr={[1, 1.5]}>…</Canvas>
// call invalidate() when something changes
```

Continuous animation: keep `frameloop="always"` but pause when offscreen (unmount or `frameloop="never"`).

### Color management (three r152+)

Textures that hold colors are sRGB; data textures (normals, roughness) are not.

```ts
colorTexture.colorSpace = THREE.SRGBColorSpace
renderer.outputColorSpace = THREE.SRGBColorSpace // default in recent versions
```

A scene that looks "washed out" or "too dark" after upgrading three.js is almost always this.

### Dispose everything you create

```ts
geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose()
renderer.forceContextLoss()
```

react-three-fiber disposes JSX-created objects automatically; dispose objects you create imperatively.

### Load well

- Compress models (Draco/Meshopt) and textures (KTX2); keep hero models < 1–2 MB.
- Show a static poster (a rendered image of the scene) until the scene is ready; don't show a spinner in the hero.
- Environment maps: use 1k HDRIs; host them yourself.

### Lighting that looks good cheaply

An environment map + one key light beats five point lights. Bake what doesn't move.

### Fallbacks

- `prefers-reduced-motion`: no auto-rotation; a still frame or the poster image.
- No WebGL / low-power devices: the poster image.
- Touch: don't capture page scrolling with orbit controls; require two fingers or disable.

## Checklist

- [ ] Lightest tool for the job.
- [ ] DPR capped; renders on demand or pauses offscreen.
- [ ] Color spaces set correctly.
- [ ] Everything disposed on unmount.
- [ ] Poster fallback for loading, reduced motion and no-WebGL.
