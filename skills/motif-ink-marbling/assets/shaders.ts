import { GROUND_CELL, MAX_OPS } from './marbling'

export const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

/**
 * 逐像素按操作从新到旧求逆（与 marbling.ts 的 trace 一致），同时用前向自动微分带着雅可比矩阵 J
 * （原坐标对屏幕像素的导数）：落进墨滴时，用它把到圆边的距离换算成屏幕像素，得到解析的抗锯齿覆盖率。
 * 边缘像素记下这一滴的颜色和覆盖率，再从圆外侧继续逆推出「后面」的颜色，两者混合。
 *
 * 两种用法：
 * - 缓存：u_useCache = false，逆推 [u_first, u_total) 这段较旧、已经静止的操作，画进带边距的纹理；
 * - 画面：u_useCache = true，先逆推最近的 [0, u_end)，走出它们以后到缓存里取色。缓存在这里会被放大
 *   （新墨滴边缘一圈，旧墨被切向拉开）或超出缓存范围时，不取缓存，接着把旧操作也逆推完。
 */
export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

#define MAX_OPS ${MAX_OPS}
#define GROUND_CELL ${GROUND_CELL.toFixed(4)}

uniform sampler2D u_ops;
uniform sampler2D u_cache;
uniform int u_first;
uniform int u_end;
uniform int u_total;
uniform bool u_useCache;
uniform vec2 u_size;
uniform vec2 u_cacheSize;
uniform float u_unit;
uniform vec3 u_palette[5];
uniform int u_paletteSize;
uniform vec3 u_paper;
uniform float u_opacity;
uniform float u_grain;

out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float sstep(float e0, float e1, float x) {
  float t = clamp((x - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float sslope(float e0, float e1, float x) {
  float t = clamp((x - e0) / (e1 - e0), 0.0, 1.0);
  return 6.0 * t * (1.0 - t) / (e1 - e0);
}

float strokeWindow(float a, float len, float w) {
  return sstep(-w, 0.0, a) * (1.0 - sstep(len, len + w, a));
}

float strokeSlope(float a, float len, float w) {
  return sslope(-w, 0.0, a) * (1.0 - sstep(len, len + w, a)) - sstep(-w, 0.0, a) * sslope(len, len + w, a);
}

// 一滴墨在它自己那一刻的样子：颜料在边缘堆积成一圈略深的「潮线」，内部有随墨一起被拉伸的细微颗粒。
// footprint 是一个屏幕像素在这滴墨原坐标里的大小：墨被压得很细时颗粒会变成噪点，所以按它淡出。
vec3 inkOf(float slot, float seed, vec2 q, float t, float footprint) {
  if (slot < 0.0) return u_paper;
  int index = int(mod(slot, float(u_paletteSize)));
  vec3 ink = u_palette[index];
  float rim = sstep(0.8, 1.0, t);
  float grain = (0.65 * noise(q * 40.0 + seed) + 0.35 * noise(q * 97.0 - seed)) * (1.0 - sstep(0.003, 0.01, footprint));
  ink *= 1.0 - 0.13 * rim - 0.05 * grain;
  return mix(u_paper, ink, u_opacity);
}

// 底墨：逆推到底（走出所有操作）的点，按原坐标分格轮流取墨色。
vec3 groundOf(vec2 p) {
  float h = hash(floor(p / GROUND_CELL) + 7.0);
  return inkOf(floor(h * float(u_paletteSize)), floor(h * 997.0), p, 0.5, 1.0);
}

// 一个采样点的颜色；a = 1 表示这里的墨比像素还细（被压成了亚像素的细丝），需要多采样。
vec4 shade(vec2 frag) {
  vec2 p = vec2(frag.x - 0.5 * u_size.x, 0.5 * u_size.y - frag.y) / u_unit;
  mat2 J = mat2(1.0 / u_unit);
  vec3 color = vec3(0.0);
  vec3 front = vec3(0.0);
  float alpha = 0.0;
  bool partial = false;
  bool found = false;
  bool fine = false;

  for (int j = 0; j < MAX_OPS; j++) {
    int i = u_first + j;
    if (i >= u_total) break;
    if (u_useCache && i == u_end) {
      // 走出最近的操作：能取缓存就取缓存。
      vec2 uv = vec2(0.5 * u_cacheSize.x + p.x * u_unit, 0.5 * u_cacheSize.y - p.y * u_unit) / u_cacheSize;
      bool inside = all(greaterThan(uv, vec2(0.0))) && all(lessThan(uv, vec2(1.0)));
      // 最小奇异值的下界 |det J| / |J|：像素在原坐标里最窄的那个方向，比缓存的一个纹素小就是被放大了。
      float narrow = abs(determinant(J)) / max(sqrt(dot(J[0], J[0]) + dot(J[1], J[1])), 1e-12);
      float magnified = 1.0 / (u_unit * max(narrow, 1e-12));
      if (inside && magnified < 1.5) {
        color = texture(u_cache, uv).rgb;
        found = true;
        break;
      }
    }
    vec4 a = texelFetch(u_ops, ivec2(i, 0), 0);
    vec4 b = texelFetch(u_ops, ivec2(i, 1), 0);
    int type = int(a.x + 0.5);

    if (type == 0) {
      // 墨滴：圆内就是这滴墨；圆外沿径向收回 r²。
      float r = a.w;
      if (r <= 0.0) continue;
      vec2 c = a.yz;
      vec2 d = p - c;
      float l2 = dot(d, d);
      float dist = sqrt(l2);
      if (partial) {
        if (dist < r) {
          color = inkOf(b.x, b.y, p, dist / r, 1.0);
          found = true;
          break;
        }
      } else {
        vec2 n = d / max(dist, 1e-7);
        float g = max(length(n * J), 1e-9);
        float px = (r - dist) / g;
        if (px > -0.5) {
          float footprint = max(length(J[0]), length(J[1]));
          // 墨被压到像素尺度：离边不到几个像素，或整滴墨比像素还细时，多采样。
          fine = footprint > 0.5 * r || (footprint > 0.1 * r && px < 3.0);
          vec3 ink = inkOf(b.x, b.y, p, min(dist / r, 1.0), footprint);
          if (px >= 0.5) {
            color = ink;
            found = true;
            break;
          }
          partial = true;
          front = ink;
          alpha = px + 0.5;
          // 从圆外半个像素处接着逆推「后面」的颜色。紧贴圆边的那一圈是落墨前圆心处的墨被压成的细环，
          // 比像素细得多，用它当背景会在边缘画出一串虚线。
          d = n * max(dist, r + 0.5 * g);
          l2 = dot(d, d);
        }
      }
      float s = sqrt(max(1.0 - r * r / l2, 0.0));
      J = (s * mat2(1.0) + (r * r / (max(s, 1e-4) * l2 * l2)) * outerProduct(d, d)) * J;
      p = c + s * d;
    } else if (type == 1) {
      // 梳子：一排平行的齿线，离最近的齿越近，沿梳理方向移得越多。
      vec2 m = a.yz;
      vec2 nrm = vec2(-m.y, m.x);
      float gap = a.w;
      float q = dot(p, nrm) - b.x;
      float t = q - gap * floor(q / gap);
      float sgn = t < 0.5 * gap ? 1.0 : -1.0;
      float f = b.y * exp(-min(t, gap - t) / b.z);
      p -= f * m;
      J = (mat2(1.0) + (f * sgn / b.z) * outerProduct(m, nrm)) * J;
    } else if (type == 2) {
      // 波浪：沿法向的正弦剪切。
      vec2 m = a.yz;
      vec2 nrm = vec2(-m.y, m.x);
      float u = dot(p, m) * b.x + b.y;
      p -= a.w * sin(u) * nrm;
      J = (mat2(1.0) - (a.w * b.x * cos(u)) * outerProduct(nrm, m)) * J;
    } else if (type == 3) {
      // 漩涡：绕中心旋转，转角随距离指数衰减。
      vec2 c = a.yz;
      vec2 d = p - c;
      float rho = length(d);
      float th = a.w * exp(-rho * b.x);
      float cs = cos(th);
      float sn = sin(th);
      mat2 rot = mat2(cs, -sn, sn, cs);
      J = rot * (mat2(1.0) + (th * b.x / max(rho, 1e-6)) * outerProduct(vec2(-d.y, d.x), d)) * J;
      p = c + rot * d;
    } else {
      // 拖动的笔触：带窗口的单根齿线，沿方向的位置用牛顿迭代求逆。
      vec2 m = vec2(a.w, b.x);
      vec2 nrm = vec2(-m.y, m.x);
      float len = b.y;
      float w = b.w;
      vec2 d = p - a.yz;
      float along = dot(d, m);
      float across = dot(d, nrm);
      float f = len * exp(-abs(across) / b.z);
      if (f < 1e-6 || along <= -w || along >= len + w) continue;
      float x = along - f * strokeWindow(along, len, w);
      for (int k = 0; k < 3; k++) x -= (x + f * strokeWindow(x, len, w) - along) / (1.0 + f * strokeSlope(x, len, w));
      float g = strokeWindow(x, len, w);
      float gs = strokeSlope(x, len, w);
      p -= (along - x) * m;
      vec2 grad = g * f * (-sign(across) / b.z) * nrm + f * gs * m;
      J = (mat2(1.0) - outerProduct(m, grad) / (1.0 + f * gs)) * J;
    }
  }

  if (!found) color = groundOf(p);
  if (partial) color = mix(color, front, alpha);
  return vec4(color, fine ? 1.0 : 0.0);
}

void main() {
  vec4 center = shade(gl_FragCoord.xy);
  vec3 color = center.rgb;
  if (center.a > 0.5) {
    // 细丝区域：再取 4 个旋转网格上的点平均，免得细丝在画面里闪成噪点。
    color = 0.2 * color;
    color += 0.2 * shade(gl_FragCoord.xy + vec2(0.125, 0.375)).rgb;
    color += 0.2 * shade(gl_FragCoord.xy + vec2(-0.375, 0.125)).rgb;
    color += 0.2 * shade(gl_FragCoord.xy + vec2(-0.125, -0.375)).rgb;
    color += 0.2 * shade(gl_FragCoord.xy + vec2(0.375, -0.125)).rgb;
  }
  if (u_grain > 0.0) {
    // 纸的纤维：屏幕空间、静止不动，墨和纸都带着。
    vec2 f = gl_FragCoord.xy / u_grain;
    float fiber = noise(f * vec2(0.9, 0.22)) * 0.6 + noise(f * 0.55) * 0.4;
    color *= 0.975 + 0.04 * fiber;
  }
  fragColor = vec4(color, 1.0);
}
`
