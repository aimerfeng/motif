/**
 * 摩尔纹的着色器只做一件事：把两三层精细的光栅（直线、同心圆或六角点阵）叠在一起，
 * 每层算出这个像素被墨盖住的比例，再像叠透明胶片那样相乘出透光率。
 * 条纹不是画出来的，是光栅彼此错开一点点角度、位置或尺度时自己“长”出来的。
 *
 * 每层的旋转、尺度、平移和圆心都在 JS 里按时间算好再传进来，着色器里没有动画逻辑。
 */

export const VERTEX_SHADER = /* glsl */ `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

export const FRAGMENT_SHADER = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_dpr;
/** 0 直线，1 同心圆，2 点阵。 */
uniform float u_pattern;
uniform float u_layers;
/** 每 CSS 像素的周期数。 */
uniform float u_freq;
/** 每个周期里墨占的比例（点阵是面积比例）。 */
uniform float u_width;
/** 每层的旋转 × 尺度（列主序 2×2）。 */
uniform vec4 u_xf[3];
/** 直线、点阵：每层的相位平移（周期为单位）；同心圆：每层的圆心（CSS 像素）。 */
uniform vec2 u_off[3];
/** 每层的“透镜”鼓起量：越往外周期越密，直的条纹因此弯成弧。 */
uniform float u_bulge[3];
/** 最上面一层跟着指针的位移（CSS 像素）。 */
uniform vec2 u_shift;
/** 直线模式顶层的低频扭曲：x 是幅度（周期），y、z 是两道波的相位。条纹因此像水波绸一样起伏。 */
uniform vec3 u_warp;
uniform vec3 u_ink;
uniform vec3 u_paper;

// 方波（每周期前 w 段是墨）的积分；两点相减再除以宽度就是盒式滤波后的覆盖率，
// 线再细也不会和屏幕像素打出额外的锯齿摩尔纹。
float band(float t, float w) {
  return floor(t) * w + min(fract(t), w);
}

float stripe(float t, float w, float a) {
  return (band(t + 0.5 * a, w) - band(t - 0.5 * a, w)) / a;
}

// 到最近的六角点阵格点的距离（格距为 1）。
float hexDistance(vec2 p) {
  vec2 s = vec2(1.0, 1.7320508);
  vec2 a = mod(p, s) - 0.5 * s;
  vec2 b = mod(p + 0.5 * s, s) - 0.5 * s;
  return min(length(a), length(b));
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_dpr;
  float halfDiagonal = 0.5 * length(u_res) / u_dpr;
  // 一个设备像素跨过多少个周期：滤波宽度。
  float pixel = u_freq / u_dpr;
  float dotRadius = sqrt(u_width * 0.2756644);
  float clear = 1.0;

  for (int i = 0; i < 3; i++) {
    if (float(i) >= u_layers) break;
    float top = float(i) == u_layers - 1.0 ? 1.0 : 0.0;
    vec2 local = p - top * u_shift;
    vec4 m = u_xf[i];
    float scale = length(m.xy);
    float r = length(local) / halfDiagonal;
    float bulge = 1.0 + u_bulge[i] * r * r;
    float cover;
    // 线至少有一个设备像素宽：更细的线被盒式滤波摊成一片浅灰，条纹就看不出来了。
    if (u_pattern < 0.5) {
      vec2 q = mat2(m.xy, m.zw) * local * (u_freq * bulge);
      float warp = top * u_warp.x * (sin(dot(local, vec2(0.0043, 0.0051)) + u_warp.y) + 0.7 * sin(dot(local, vec2(-0.0074, 0.0033)) + u_warp.z));
      float a = max(pixel * scale * bulge, 1e-4);
      cover = stripe(q.x + u_off[i].x + warp, max(u_width, min(a, 0.4)), a);
    } else if (u_pattern < 1.5) {
      float t = length(local - u_off[i]) * u_freq * scale;
      float a = max(pixel * scale, 1e-4);
      cover = stripe(t, max(u_width, min(a, 0.4)), a);
    } else {
      vec2 q = mat2(m.xy, m.zw) * local * (u_freq * bulge) + u_off[i];
      float edge = 0.75 * pixel * scale * bulge;
      float radius = max(dotRadius, min(edge, 0.3));
      cover = 1.0 - smoothstep(radius - edge, radius + edge, hexDistance(q));
    }
    clear *= 1.0 - cover;
  }

  gl_FragColor = vec4(mix(u_ink, u_paper, clear), 1.0);
}
`
