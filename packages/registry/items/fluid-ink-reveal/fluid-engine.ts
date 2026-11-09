// SPDX-License-Identifier: MIT
// Copyright (c) 2017 Pavel Dobryakov
// Source: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation/blob/a2d2929/script.js
// Modified by Motif; see the item's provenance.
import { createProgram, releaseContext } from '@motif/runtime'

type GL = WebGL2RenderingContext

export interface InkConfig {
  simResolution: number
  dyeResolution: number
  densityDissipation: number
  velocityDissipation: number
  pressure: number
  curl: number
  splatRadius: number
  /** 0–1：墨迹边缘从清晰到柔和。 */
  edgeSoftness: number
  /** 墨迹边缘的染色，0–1 的 RGB。 */
  edgeTint: [number, number, number]
}

export type InkLayer = 'cover' | 'hidden'

interface Format {
  internalFormat: number
  format: number
}

interface FBO {
  texture: WebGLTexture
  fbo: WebGLFramebuffer
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  attach: (id: number) => number
}

interface DoubleFBO {
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  read: FBO
  write: FBO
  swap: () => void
}

interface Program {
  program: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation | null>
}

export interface InkEngine {
  /** 画布像素尺寸变了就重建帧缓冲（保留已有内容）。 */
  syncSize: () => void
  /** 推进一步模拟，dt 以秒计。 */
  step: (dt: number) => void
  /** 按染料浓度把两层画面合成到画布上。 */
  render: () => void
  /** 在纹理坐标 (x, y) 注入一团速度和墨（amount 是墨的浓度）。 */
  splat: (x: number, y: number, dx: number, dy: number, amount: number) => void
  /** 上传一层画面（cover 在上，hidden 被墨迹揭开）。 */
  setImage: (layer: InkLayer, image: HTMLImageElement | HTMLCanvasElement) => void
  /** 清空所有场。 */
  reset: () => void
  dispose: () => void
}

const PRESSURE_ITERATIONS = 20
/** 墨的浓度到这里时两层各占一半；染料在注入时最多饱和到 1。 */
const MASK_THRESHOLD = 0.35

const BASE_VERTEX = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;

  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

const COPY_FRAGMENT = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  void main () {
    gl_FragColor = texture2D(uTexture, vUv);
  }
`

const CLEAR_FRAGMENT = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`

// 上游的显示着色器把染料当颜色画出来；这里改成把染料浓度当遮罩：
// 浓度低处是上层画面，高处露出下层，边缘一圈染上 tint。上游的 shading（按染料梯度算法线）保留，
// 法线还顺带让边缘的画面轻微折射。
const DISPLAY_FRAGMENT = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uTexture;
  uniform sampler2D uCover;
  uniform sampler2D uHidden;
  uniform vec2 texelSize;
  uniform float canvasAspect;
  uniform float imageAspect;
  uniform float softness;
  uniform vec3 tint;

  vec2 coverUv (vec2 uv) {
    vec2 p = uv - 0.5;
    float r = canvasAspect / imageAspect;
    if (r > 1.0) p.y /= r;
    else p.x *= r;
    return p + 0.5;
  }

  void main () {
    float c = texture2D(uTexture, vUv).r;

    float lc = texture2D(uTexture, vL).r;
    float rc = texture2D(uTexture, vR).r;
    float tc = texture2D(uTexture, vT).r;
    float bc = texture2D(uTexture, vB).r;

    float dx = rc - lc;
    float dy = tc - bc;

    vec3 n = normalize(vec3(dx, dy, length(texelSize)));
    vec3 l = vec3(0.0, 0.0, 1.0);
    float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);

    float edge = 0.03 + softness * 0.52;
    float mask = smoothstep(${MASK_THRESHOLD.toFixed(2)} - edge * 0.5, ${MASK_THRESHOLD.toFixed(2)} + edge * 0.5, c);

    // 阈值以下的淡墨不碰上层画面：shading 和折射只在墨里、墨边上生效，上层保持干净。
    float rim = 4.0 * mask * (1.0 - mask);
    float ink = max(mask, rim);

    vec2 uv = coverUv(vUv - n.xy * 0.01 * ink);
    vec3 cover = texture2D(uCover, uv).rgb;
    vec3 hidden = texture2D(uHidden, uv).rgb;
    vec3 color = mix(cover, hidden, mask);

    color = mix(color, tint, rim * 0.6);
    color *= mix(1.0, diffuse, 0.6 * ink);

    gl_FragColor = vec4(color, 1.0);
  }
`

const SPLAT_FRAGMENT = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;

  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
  #ifdef SATURATE
    gl_FragColor = vec4(min(base + splat, vec3(1.0)), 1.0);
  #else
    gl_FragColor = vec4(base + splat, 1.0);
  #endif
  }
`

const ADVECTION_FRAGMENT = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform vec2 dyeTexelSize;
  uniform float dt;
  uniform float dissipation;

  vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }

  void main () {
  #ifdef MANUAL_FILTERING
    vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
    vec4 result = bilerp(uSource, coord, dyeTexelSize);
  #else
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = texture2D(uSource, coord);
  #endif
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
  }
`

const DIVERGENCE_FRAGMENT = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uVelocity;

  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;

    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }

    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`

const CURL_FRAGMENT = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uVelocity;

  void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`

const VORTICITY_FRAGMENT = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;

  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;

    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;

    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * dt;
    velocity = min(max(velocity, -1000.0), 1000.0);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`

const PRESSURE_FRAGMENT = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;

  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`

const GRADIENT_SUBTRACT_FRAGMENT = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;

  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`

function supportsRenderFormat(gl: GL, internalFormat: number, format: number, type: number): boolean {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.deleteFramebuffer(fbo)
  gl.deleteTexture(texture)
  return ok
}

/** 不支持某个单通道/双通道格式时，依次退到更宽的格式。 */
function supportedFormat(gl: GL, internalFormat: number, format: number, type: number): Format | null {
  if (!supportsRenderFormat(gl, internalFormat, format, type)) {
    if (internalFormat === gl.R16F) return supportedFormat(gl, gl.RG16F, gl.RG, type)
    if (internalFormat === gl.RG16F) return supportedFormat(gl, gl.RGBA16F, gl.RGBA, type)
    return null
  }
  return { internalFormat, format }
}

function uniformsOf(gl: GL, program: WebGLProgram): Record<string, WebGLUniformLocation | null> {
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < count; i++) {
    const name = gl.getActiveUniform(program, i)?.name
    if (name) uniforms[name] = gl.getUniformLocation(program, name)
  }
  return uniforms
}

/** 在画布上创建一个墨迹揭示用的流体模拟。不支持所需的浮点纹理时返回 null。 */
export function createInkEngine(canvas: HTMLCanvasElement, getConfig: () => InkConfig): InkEngine | null {
  const attributes: WebGLContextAttributes = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' }
  let context = canvas.getContext('webgl2', attributes) as GL | null
  const isWebGL2 = Boolean(context)
  if (!context) context = canvas.getContext('webgl', attributes) as GL | null
  if (!context) return null
  const gl: GL = context

  let halfFloat: { HALF_FLOAT_OES: number } | null = null
  let linearFiltering: unknown
  if (isWebGL2) {
    gl.getExtension('EXT_color_buffer_float')
    linearFiltering = gl.getExtension('OES_texture_float_linear')
  } else {
    halfFloat = gl.getExtension('OES_texture_half_float')
    linearFiltering = gl.getExtension('OES_texture_half_float_linear')
  }
  const texType = isWebGL2 ? gl.HALF_FLOAT : halfFloat?.HALF_FLOAT_OES
  if (texType === undefined) return null

  const formatRGBA = isWebGL2 ? supportedFormat(gl, gl.RGBA16F, gl.RGBA, texType) : supportedFormat(gl, gl.RGBA, gl.RGBA, texType)
  const formatRG = isWebGL2 ? supportedFormat(gl, gl.RG16F, gl.RG, texType) : formatRGBA
  const formatR = isWebGL2 ? supportedFormat(gl, gl.R16F, gl.RED, texType) : formatRGBA
  if (!formatRGBA || !formatRG || !formatR) return null

  const filtering = linearFiltering ? gl.LINEAR : gl.NEAREST

  const build = (fragment: string, keywords: string[] = []) => {
    const source = keywords.map((keyword) => `#define ${keyword}\n`).join('') + fragment
    const program = createProgram(gl, BASE_VERTEX, source)
    return { program, uniforms: uniformsOf(gl, program) } satisfies Program
  }

  const copyProgram = build(COPY_FRAGMENT)
  const clearProgram = build(CLEAR_FRAGMENT)
  const splatProgram = build(SPLAT_FRAGMENT)
  // 墨在注入时饱和到 1：一直搅也不会越积越浓，停手后按 heal 的速度退回去。
  const dyeSplatProgram = build(SPLAT_FRAGMENT, ['SATURATE'])
  const advectionProgram = build(ADVECTION_FRAGMENT, linearFiltering ? [] : ['MANUAL_FILTERING'])
  const divergenceProgram = build(DIVERGENCE_FRAGMENT)
  const curlProgram = build(CURL_FRAGMENT)
  const vorticityProgram = build(VORTICITY_FRAGMENT)
  const pressureProgram = build(PRESSURE_FRAGMENT)
  const gradientSubtractProgram = build(GRADIENT_SUBTRACT_FRAGMENT)
  const displayProgram = build(DISPLAY_FRAGMENT)
  const allPrograms = [copyProgram, clearProgram, splatProgram, dyeSplatProgram, advectionProgram, divergenceProgram, curlProgram, vorticityProgram, pressureProgram, gradientSubtractProgram, displayProgram]

  // 所有程序都只有 aPosition 一个属性，它在每个程序里都是 0 号位置，四边形只需绑定一次。
  const quadBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(0)

  // 两层画面：图片加载完之前先用 1×1 的深色占位。
  const placeholder = new Uint8Array([11, 11, 16, 255])
  const layers: Record<InkLayer, { texture: WebGLTexture; aspect: number }> = {
    cover: { texture: gl.createTexture(), aspect: 1 },
    hidden: { texture: gl.createTexture(), aspect: 1 },
  }
  for (const layer of Object.values(layers)) {
    gl.bindTexture(gl.TEXTURE_2D, layer.texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, placeholder)
  }

  const setImage = (name: InkLayer, image: HTMLImageElement | HTMLCanvasElement) => {
    const layer = layers[name]
    const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width
    const height = image instanceof HTMLImageElement ? image.naturalHeight : image.height
    if (width < 1 || height < 1) return
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, layer.texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    layer.aspect = width / height
  }

  const blit = (target: FBO | null) => {
    if (target === null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    } else {
      gl.viewport(0, 0, target.width, target.height)
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  const createFBO = (w: number, h: number, format: Format, param: number): FBO => {
    gl.activeTexture(gl.TEXTURE0)
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, format.internalFormat, w, h, 0, format.format, texType, null)
    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.viewport(0, 0, w, h)
    gl.clear(gl.COLOR_BUFFER_BIT)
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        return id
      },
    }
  }

  const deleteFBO = (target: FBO) => {
    gl.deleteFramebuffer(target.fbo)
    gl.deleteTexture(target.texture)
  }

  const createDoubleFBO = (w: number, h: number, format: Format, param: number): DoubleFBO => {
    let fbo1 = createFBO(w, h, format, param)
    let fbo2 = createFBO(w, h, format, param)
    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1
      },
      set read(value) {
        fbo1 = value
      },
      get write() {
        return fbo2
      },
      set write(value) {
        fbo2 = value
      },
      swap() {
        const temp = fbo1
        fbo1 = fbo2
        fbo2 = temp
      },
    }
  }

  const resizeFBO = (target: FBO, w: number, h: number, format: Format, param: number): FBO => {
    const next = createFBO(w, h, format, param)
    gl.useProgram(copyProgram.program)
    gl.uniform1i(copyProgram.uniforms.uTexture!, target.attach(0))
    blit(next)
    deleteFBO(target)
    return next
  }

  const resizeDoubleFBO = (target: DoubleFBO, w: number, h: number, format: Format, param: number): DoubleFBO => {
    if (target.width === w && target.height === h) return target
    target.read = resizeFBO(target.read, w, h, format, param)
    deleteFBO(target.write)
    target.write = createFBO(w, h, format, param)
    target.width = w
    target.height = h
    target.texelSizeX = 1 / w
    target.texelSizeY = 1 / h
    return target
  }

  const resolution = (base: number) => {
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight
    if (aspect < 1) aspect = 1 / aspect
    const min = Math.round(base)
    const max = Math.round(base * aspect)
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max }
  }

  let dye: DoubleFBO | null = null
  let velocity: DoubleFBO | null = null
  let divergence: FBO | null = null
  let curl: FBO | null = null
  let pressure: DoubleFBO | null = null
  let sizeKey = ''

  const releaseFields = () => {
    for (const double of [dye, velocity, pressure]) {
      if (!double) continue
      deleteFBO(double.read)
      deleteFBO(double.write)
    }
    for (const single of [divergence, curl]) if (single) deleteFBO(single)
    dye = velocity = pressure = null
    divergence = curl = null
  }

  const initFramebuffers = () => {
    const config = getConfig()
    const simRes = resolution(config.simResolution)
    // 没有线性过滤时降到 512，与上游一致。
    const dyeRes = resolution(linearFiltering ? config.dyeResolution : Math.min(config.dyeResolution, 512))

    gl.disable(gl.BLEND)
    dye = dye ? resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, formatRGBA, filtering) : createDoubleFBO(dyeRes.width, dyeRes.height, formatRGBA, filtering)
    velocity = velocity ? resizeDoubleFBO(velocity, simRes.width, simRes.height, formatRG, filtering) : createDoubleFBO(simRes.width, simRes.height, formatRG, filtering)

    if (divergence) deleteFBO(divergence)
    if (curl) deleteFBO(curl)
    if (pressure) {
      deleteFBO(pressure.read)
      deleteFBO(pressure.write)
    }
    divergence = createFBO(simRes.width, simRes.height, formatR, gl.NEAREST)
    curl = createFBO(simRes.width, simRes.height, formatR, gl.NEAREST)
    pressure = createDoubleFBO(simRes.width, simRes.height, formatR, gl.NEAREST)
    sizeKey = `${gl.drawingBufferWidth}x${gl.drawingBufferHeight}:${config.simResolution}:${config.dyeResolution}`
  }

  const syncSize = () => {
    const config = getConfig()
    const key = `${gl.drawingBufferWidth}x${gl.drawingBufferHeight}:${config.simResolution}:${config.dyeResolution}`
    if (key !== sizeKey || !dye) initFramebuffers()
  }

  const step = (dt: number) => {
    syncSize()
    const config = getConfig()
    const v = velocity!
    const d = dye!
    const p = pressure!
    gl.disable(gl.BLEND)

    gl.useProgram(curlProgram.program)
    gl.uniform2f(curlProgram.uniforms.texelSize!, v.texelSizeX, v.texelSizeY)
    gl.uniform1i(curlProgram.uniforms.uVelocity!, v.read.attach(0))
    blit(curl)

    gl.useProgram(vorticityProgram.program)
    gl.uniform2f(vorticityProgram.uniforms.texelSize!, v.texelSizeX, v.texelSizeY)
    gl.uniform1i(vorticityProgram.uniforms.uVelocity!, v.read.attach(0))
    gl.uniform1i(vorticityProgram.uniforms.uCurl!, curl!.attach(1))
    gl.uniform1f(vorticityProgram.uniforms.curl!, config.curl)
    gl.uniform1f(vorticityProgram.uniforms.dt!, dt)
    blit(v.write)
    v.swap()

    gl.useProgram(divergenceProgram.program)
    gl.uniform2f(divergenceProgram.uniforms.texelSize!, v.texelSizeX, v.texelSizeY)
    gl.uniform1i(divergenceProgram.uniforms.uVelocity!, v.read.attach(0))
    blit(divergence)

    gl.useProgram(clearProgram.program)
    gl.uniform1i(clearProgram.uniforms.uTexture!, p.read.attach(0))
    gl.uniform1f(clearProgram.uniforms.value!, config.pressure)
    blit(p.write)
    p.swap()

    gl.useProgram(pressureProgram.program)
    gl.uniform2f(pressureProgram.uniforms.texelSize!, v.texelSizeX, v.texelSizeY)
    gl.uniform1i(pressureProgram.uniforms.uDivergence!, divergence!.attach(0))
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureProgram.uniforms.uPressure!, p.read.attach(1))
      blit(p.write)
      p.swap()
    }

    gl.useProgram(gradientSubtractProgram.program)
    gl.uniform2f(gradientSubtractProgram.uniforms.texelSize!, v.texelSizeX, v.texelSizeY)
    gl.uniform1i(gradientSubtractProgram.uniforms.uPressure!, p.read.attach(0))
    gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity!, v.read.attach(1))
    blit(v.write)
    v.swap()

    gl.useProgram(advectionProgram.program)
    gl.uniform2f(advectionProgram.uniforms.texelSize!, v.texelSizeX, v.texelSizeY)
    if (!linearFiltering) gl.uniform2f(advectionProgram.uniforms.dyeTexelSize!, v.texelSizeX, v.texelSizeY)
    const velocityId = v.read.attach(0)
    gl.uniform1i(advectionProgram.uniforms.uVelocity!, velocityId)
    gl.uniform1i(advectionProgram.uniforms.uSource!, velocityId)
    gl.uniform1f(advectionProgram.uniforms.dt!, dt)
    gl.uniform1f(advectionProgram.uniforms.dissipation!, config.velocityDissipation)
    blit(v.write)
    v.swap()

    if (!linearFiltering) gl.uniform2f(advectionProgram.uniforms.dyeTexelSize!, d.texelSizeX, d.texelSizeY)
    gl.uniform1i(advectionProgram.uniforms.uVelocity!, v.read.attach(0))
    gl.uniform1i(advectionProgram.uniforms.uSource!, d.read.attach(1))
    gl.uniform1f(advectionProgram.uniforms.dissipation!, config.densityDissipation)
    blit(d.write)
    d.swap()
  }

  const render = () => {
    syncSize()
    const config = getConfig()
    gl.disable(gl.BLEND)
    gl.useProgram(displayProgram.program)
    const u = displayProgram.uniforms
    gl.uniform2f(u.texelSize!, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight)
    gl.uniform1f(u.canvasAspect!, gl.drawingBufferWidth / Math.max(1, gl.drawingBufferHeight))
    gl.uniform1f(u.imageAspect!, layers.cover.aspect)
    gl.uniform1f(u.softness!, Math.min(1, Math.max(0, config.edgeSoftness)))
    gl.uniform3f(u.tint!, config.edgeTint[0], config.edgeTint[1], config.edgeTint[2])
    gl.uniform1i(u.uTexture!, dye!.read.attach(0))
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, layers.cover.texture)
    gl.uniform1i(u.uCover!, 1)
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, layers.hidden.texture)
    gl.uniform1i(u.uHidden!, 2)
    blit(null)
  }

  const splat = (x: number, y: number, dx: number, dy: number, amount: number) => {
    syncSize()
    const config = getConfig()
    const v = velocity!
    const d = dye!
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight
    // 宽屏时把半径按宽高比放大，让斑点在屏幕上看起来是圆的（上游的 correctRadius）。
    const radius = (config.splatRadius / 100) * (aspect > 1 ? aspect : 1)
    gl.disable(gl.BLEND)
    gl.useProgram(splatProgram.program)
    gl.uniform1i(splatProgram.uniforms.uTarget!, v.read.attach(0))
    gl.uniform1f(splatProgram.uniforms.aspectRatio!, aspect)
    gl.uniform2f(splatProgram.uniforms.point!, x, y)
    gl.uniform3f(splatProgram.uniforms.color!, dx, dy, 0)
    gl.uniform1f(splatProgram.uniforms.radius!, radius)
    blit(v.write)
    v.swap()

    gl.useProgram(dyeSplatProgram.program)
    gl.uniform1i(dyeSplatProgram.uniforms.uTarget!, d.read.attach(0))
    gl.uniform1f(dyeSplatProgram.uniforms.aspectRatio!, aspect)
    gl.uniform2f(dyeSplatProgram.uniforms.point!, x, y)
    gl.uniform3f(dyeSplatProgram.uniforms.color!, amount, amount, amount)
    gl.uniform1f(dyeSplatProgram.uniforms.radius!, radius)
    blit(d.write)
    d.swap()
  }

  const reset = () => {
    releaseFields()
    initFramebuffers()
  }

  initFramebuffers()

  return {
    syncSize,
    step,
    render,
    splat,
    setImage,
    reset,
    dispose: () => {
      releaseFields()
      for (const program of allPrograms) gl.deleteProgram(program.program)
      gl.deleteTexture(layers.cover.texture)
      gl.deleteTexture(layers.hidden.texture)
      gl.deleteBuffer(quadBuffer)
      releaseContext(gl)
    },
  }
}
