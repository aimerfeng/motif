// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/aurora-curtain/index.tsx
// Shader code unchanged.
export const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform float uBands;
uniform float uSpeed;
uniform float uBlur;
uniform float uIntensity;
uniform float uDirection;
uniform float uGrain;
uniform float uSeed;
uniform float uPixel;
uniform int uColorCount;
uniform vec3 uColors[6];

const int MAX_BANDS = 8;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Grain hash: the per-frame seed is folded in so the pattern is reborn every
// frame instead of sitting on the screen like dust on the glass.
float grainHash(vec2 p, float seed) {
  return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed * 1.6180339) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Two-octave detail, normalised to 0..1. Used where a second octave changes
// the silhouette; anything that only needs a slow scalar uses sines instead,
// because every octave is four more transcendentals per fragment.
float fbm2(vec2 p) {
  float value = vnoise(p) * 0.5 + vnoise(p * 2.07 + 9.31) * 0.25;
  return value * 1.3333333;
}

// Three-octave meander for the ribbon path, normalised to 0..1.
float fbm3(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * vnoise(p);
    p = p * 2.03 + 7.13;
    amplitude *= 0.5;
  }
  return value * 1.1428571;
}

vec3 bandColor(int index) {
  int count = max(uColorCount, 1);
  int slot = index - (index / count) * count;
  return uColors[slot];
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float flow = mix(1.0, -1.0, uDirection);
  float y = mix(uv.y, 1.0 - uv.y, uDirection);

  // Vertical falloff: dense near the base, dissolving towards the far edge
  // the way a real aurora thins out as it climbs.
  float rise = smoothstep(-0.10, 0.26, y);
  float fade = 1.0 - smoothstep(0.16, 1.08, y);
  float envelope = rise * fade * fade;

  vec3 accum = vec3(0.0);
  float alpha = 0.0;
  float bandCount = clamp(uBands, 1.0, float(MAX_BANDS));
  float spacing = 0.92 / bandCount;
  float t = uTime * uSpeed;

  for (int i = 0; i < MAX_BANDS; i++) {
    if (float(i) >= bandCount) {
      break;
    }
    float fi = float(i);
    float seed = fi * 13.37;

    // Path: a three-octave meander, a faster single-octave wobble and a slow
    // sine fold, all evaluated per height, so each ribbon folds along its own
    // length instead of sliding across as a rigid bar.
    float driftA = fbm3(vec2(y * 1.35 + seed, t * 0.16 + seed)) - 0.5;
    float driftB = vnoise(vec2(y * 3.40 - seed, t * 0.27 + seed * 0.5)) - 0.5;
    float fold = sin(y * 4.1 + t * 0.42 * flow + seed) * 0.045;
    float center = 0.04 + spacing * (fi + 0.5) + driftA * 0.52 + driftB * 0.18 + fold;

    // Width and softness vary ALONG the ribbon, pinching towards both ends.
    float widthNoise = fbm2(vec2(y * 2.7 + seed * 2.0, t * 0.22 + seed));
    float pinch = smoothstep(0.0, 0.22, y) * (1.0 - smoothstep(0.55, 1.08, y));
    float width = (0.010 + uBlur * 0.052)
      * mix(0.30, 1.85, widthNoise)
      * (0.45 + 0.75 * pinch);
    width = max(width, 0.0025);

    // A bright narrow core wrapped in a much wider halo that falls off at the
    // edges, rather than one flat gaussian per ribbon.
    float dx = (uv.x - center) / width;
    float d2 = dx * dx;
    float core = exp(-d2 * 2.60);
    float halo = exp(-d2 * 0.22);
    float ribbon = core * 1.30 + halo * 0.34;

    // Fine vertical striations scrolling along the flow direction, and a slow
    // brightness swell. The swell is two sines, not another noise octave.
    float rays = 0.45 + 0.85 * fbm2(vec2(uv.x * 13.0 + seed, y * 1.7 - flow * t * 0.55));
    float breathe = 0.78 + 0.22 * sin(t * 0.31 + seed) * cos(t * 0.17 + seed * 0.7);

    float weight = ribbon * envelope * rays * breathe * 0.46;
    vec3 hot = mix(bandColor(i), vec3(1.0), clamp(core * 0.42, 0.0, 0.45));
    accum += hot * weight;
    alpha += weight;
  }

  // Ground haze so the ribbons sit inside atmosphere rather than on nothing.
  float haze = envelope * (1.0 - smoothstep(0.0, 0.58, y)) * 0.10;
  accum += bandColor(0) * haze;
  alpha += haze;

  alpha = clamp(alpha * uIntensity, 0.0, 1.0);
  accum = max(accum * uIntensity, vec3(0.0));

  if (uGrain > 0.0) {
    // One grain cell per CSS pixel. Two hashes averaged give a triangular
    // distribution, which reads far more photographic than a flat one, and
    // costs two extra sines rather than a whole extra noise octave.
    vec2 cell = floor(gl_FragCoord.xy / max(uPixel, 1.0));
    float g = grainHash(cell, uSeed) + grainHash(cell + vec2(41.7, 17.3), uSeed + 7.31) - 1.0;
    float amp = uGrain * 0.42;

    // Modulate the light where there is light...
    accum *= 1.0 + g * amp * 1.10;

    // ...then lay a symmetric veil over the WHOLE surface. Positive grain adds
    // light; negative grain adds coverage with no colour, which darkens the
    // backdrop through the premultiplied blend. Without the second half the
    // grain would only ever brighten, and empty areas would stay glassy.
    float bright = max(g, 0.0) * amp * 0.48;
    float dark = max(-g, 0.0) * amp * 0.34;
    accum += vec3(bright);
    alpha = clamp(alpha + bright + dark, 0.0, 1.0);
  }

  fragColor = vec4(max(accum, vec3(0.0)), alpha);
}`;
