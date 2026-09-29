---
name: motif-shaders
description: "Build and tune GPU fragment-shader effects for web UIs with raw WebGL or WebGL2: full-screen gradients, noise fields, ray-marched shapes, image distortions. Covers render loops, device pixel ratio, pausing offscreen, context loss, precision, performance budgets and reduced-motion fallbacks. Use when writing or porting a GLSL shader, or when a canvas effect is slow, blurry, leaks WebGL contexts or ignores reduced motion."
license: MIT
compatibility: Browsers with WebGL 1 or 2. React examples use hooks; the rules apply to any framework.
metadata:
  source: "https://github.com/aimerfeng/motif"
---

# Shader effects

## The shape of a good shader component

1. One `<canvas>` absolutely filling a positioned host element.
2. Setup once in an effect: context, program, full-screen quad, uniform locations.
3. Parameters live in a ref that is updated on every render; changing a parameter never rebuilds the GL context.
4. One animation loop that pauses offscreen and in hidden tabs, and renders a single still frame under reduced motion.
5. Resize via `ResizeObserver`, with DPR and total pixels capped.
6. Handle `webglcontextlost` / `webglcontextrestored`; release the context on unmount.

## Rules

### Cap the pixel ratio

```ts
// Incorrect — 3× phones and 4K monitors render 9× the pixels
canvas.width = rect.width * devicePixelRatio
// Correct
let dpr = Math.min(devicePixelRatio, 1.5)
const pixels = rect.width * rect.height * dpr * dpr
if (pixels > 2560 * 1440) dpr *= Math.sqrt((2560 * 1440) / pixels)
canvas.width = Math.round(rect.width * dpr)
```

Heavy shaders (ray marching, many octaves of noise): 1–1.5. Simple gradients: up to 2.

### Pause when nobody can see it

```ts
const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
document.addEventListener('visibilitychange', () => (hidden = document.hidden))
// in the loop: if (!visible || hidden) stop requesting frames; restart when both are true again
```

Keep an accumulated time that only advances while running, so the animation resumes without a jump.

### Don't rebuild GL on parameter changes

```tsx
// Incorrect — every slider move recompiles the program
useEffect(() => setupGL(props), [props.speed, props.color])
// Correct
const options = useRef(props); options.current = props
useEffect(() => setupGL(), [])            // once
// in the frame callback: gl.uniform1f(uSpeed, options.current.speed)
```

### Survive context loss and free the context

```ts
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); state = null })
canvas.addEventListener('webglcontextrestored', setup)
// on unmount
gl.deleteProgram(program); gl.deleteBuffer(buffer)
gl.getExtension('WEBGL_lose_context')?.loseContext()
```

Browsers keep only ~16 live WebGL contexts per page and silently kill the oldest. A gallery of effects must mount previews lazily and release them.

### Time and precision

- Pass time in seconds, already multiplied by speed. Wrap long-running time (`mod(t, 1000.0)`) before feeding trig functions on `mediump` devices.
- Use `highp` in fragment shaders when available; test on a phone.
- Loop counts must be constants; expose "quality" as a small integer uniform with a fixed maximum.

### Colors and output

- Mix in linear space and gamma-correct once at the end (`pow(col, vec3(1.0/2.2))`) if the shader does its own lighting.
- Add a little grain (`fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453)`) to kill banding in dark gradients.
- Transparent canvases (`alpha: true`) need premultiplied output; opaque (`alpha: false`) is cheaper when the effect covers the area.

### Reduced motion

Render one frame at a chosen time (pick the most beautiful moment) and stop. Do not simply slow it down unless the effect is essential.

## Licensing

Much shader code online is not free to reuse. Shadertoy defaults to CC BY-NC-SA; LYGIA uses a non-commercial license. Only copy code whose license allows it (MIT, Apache-2.0, BSD, CC0) and keep its header.

## Checklist

- [ ] DPR capped; pixel budget respected on 4K.
- [ ] Paused offscreen and in hidden tabs; resumes without a jump.
- [ ] Parameters update uniforms, not the program.
- [ ] Context loss handled; context released on unmount.
- [ ] Static frame under reduced motion.
- [ ] ≥ 55 fps on a mid-range laptop at 1440×900.
