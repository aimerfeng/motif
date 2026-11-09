/**
 * 沙丘的着色器分两步：
 * 1. 地形缓存（GEOMETRY_FRAGMENT）：光线步进高度场，求出命中距离、沙丘法线、软阴影和沙丘相位，
 *    打包进两张 RGBA8 纹理。沙丘本身不动，只在尺寸、太阳或沙丘高度变化时重算。
 * 2. 合成（COMPOSITE_FRAGMENT）：每帧读缓存，叠加随风迁移的沙纹，算光照、天空、雾和颗粒。
 * 这样每帧只做很便宜的着色，昂贵的光线步进只在参数变化时跑一次。
 */

export const VERTEX_SHADER = /* glsl */ `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const COMMON = /* glsl */ `
precision highp float;

uniform vec2 u_res;
uniform vec3 u_sun;
uniform float u_camH;
uniform float u_dune;

// 镜头略微俯视；FOCAL 决定竖直视角（约 41°）。
const float PITCH = 0.19;
const float FOCAL = 0.75;
// 风从左后方吹向右前方；沙脊与风向垂直，在画面里斜着伸向远处。
const vec2 WIND = vec2(0.8, 0.6);
const vec2 CREST = vec2(-0.6, 0.8);
const float TMAX = 30.0;
// 高度场的上界（以沙丘振幅为单位），光线从这个平面开始步进。
const float TOP = 1.75;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec3 viewRay(vec2 frag) {
  vec2 uv = (frag - 0.5 * u_res) / u_res.y;
  vec3 d = normalize(vec3(uv * FOCAL, 1.0));
  float c = cos(PITCH);
  float s = sin(PITCH);
  return vec3(d.x, d.y * c - d.z * s, d.y * s + d.z * c);
}
`

export const GEOMETRY_FRAGMENT = /* glsl */ `
${COMMON}
uniform float u_pass;

// 沙脊所在的相位。
const float CREST_PHASE = 0.7;

// 横向沙丘的剖面：s 从 0（丘间低地）到 c（沙脊）是平缓的迎风坡，c 到 1 是陡峭的落沙坡。
// 两端斜率为 0，沙脊处是尖的。side 为负时按 s 自然分段；为 0 或 1 时强制用迎风坡或落沙坡的公式
// （两段公式越过脊线后都还光滑），用来在脊尖附近分别求两面坡的法线。
float profile(float s, float c, float side) {
  if (side < -0.5 ? s < c : side < 0.5) {
    float a = s / c;
    return a * a * (2.0 - a);
  }
  float b = (s - c) / (1.0 - c);
  return (1.0 - b) * (1.0 - b);
}

// 高度（以沙丘振幅为单位）；phase 返回主沙丘的相位，合成时用它区分迎风坡和落沙坡。
float field(vec2 p, float side, out float phase) {
  vec2 q = vec2(dot(p, WIND), dot(p, CREST));
  // 低频噪声把相位推前推后，脊线弯成新月和 S 形。
  float bend = 1.1 * vnoise(q * vec2(0.16, 0.26)) + 0.35 * sin(q.y * 0.42 + 1.3 * vnoise(q * 0.1));
  float ph = q.x * 0.8 + bend;
  float s = fract(ph);
  float id = floor(ph);
  // 每道沙脊沿走向高低起伏；丘间低地高度为 0，所以按道取不同的振幅也是连续的。
  float amp = 0.4 + 0.6 * vnoise(vec2(q.y * 0.28 + id * 7.31, id * 1.73));
  phase = s;
  float ridge = amp * profile(s, CREST_PHASE, side);

  // 次级沙丘：与主沙丘斜交约 50°，更矮更密、弯得更厉害，成片地叠在大沙丘上。
  vec2 q2 = vec2(dot(p, vec2(0.974, -0.225)), dot(p, vec2(0.225, 0.974)));
  float ph2 = q2.x * 1.7 + 1.3 * vnoise(q2 * vec2(0.4, 0.7)) + 0.4 * sin(q2.y * 1.1);
  // 圆脊：小沙丘只是起伏，不要和大沙丘抢尖锐的脊线。
  float hump = 1.0 - abs(2.0 * fract(ph2) - 1.0);
  float minor = hump * hump * (3.0 - 2.0 * hump) * smoothstep(0.35, 0.8, vnoise(q2 * 0.35 + 3.0));

  return ridge + 0.16 * minor + 0.5 * vnoise(p * 0.08 + 11.0);
}

float height(vec2 p) {
  float phase;
  return u_dune * field(p, -1.0, phase);
}

// 中心差分求法线，步长 e 约一个像素；side 同 profile。
vec3 surfaceNormal(vec2 p, float e, float side) {
  float phase;
  float dx = field(p + vec2(e, 0.0), side, phase) - field(p - vec2(e, 0.0), side, phase);
  float dz = field(p + vec2(0.0, e), side, phase) - field(p - vec2(0.0, e), side, phase);
  return normalize(vec3(-dx * u_dune, 2.0 * e, -dz * u_dune));
}

float softShadow(vec3 p, vec3 l) {
  float top = u_dune * TOP;
  float res = 1.0;
  float t = 0.006;
  for (int i = 0; i < 48; i++) {
    vec3 q = p + l * t;
    if (q.y > top) break;
    float d = q.y - height(q.xz);
    res = min(res, 9.0 * d / t);
    if (res < 0.0) break;
    t += clamp(d * 0.6, 0.008, 0.22);
  }
  res = clamp(res, 0.0, 1.0);
  return res * res * (3.0 - 2.0 * res);
}

vec2 pack16(float v) {
  float x = floor(clamp(v, 0.0, 1.0) * 65535.0 + 0.5);
  float hi = floor(x / 256.0);
  return vec2(hi, x - hi * 256.0) / 255.0;
}

void main() {
  vec3 ro = vec3(0.0, u_camH, 0.0);
  vec3 rd = viewRay(gl_FragCoord.xy);
  vec4 sky = u_pass < 0.5 ? vec4(1.0, 1.0, 1.0, 0.0) : vec4(0.5, 0.0, 0.5, 0.0);
  if (rd.y > -0.0005) {
    gl_FragColor = sky;
    return;
  }
  float top = u_dune * TOP;
  float t = (ro.y - top) / -rd.y;
  // 高度场不低于 0：光线最晚在 y = 0 平面上命中。
  float tEnd = min(ro.y / -rd.y, TMAX);
  float prevT = t;
  bool hit = false;
  for (int i = 0; i < 160; i++) {
    vec3 p = ro + rd * t;
    float d = p.y - height(p.xz);
    if (d <= 0.0) {
      hit = true;
      break;
    }
    if (t >= tEnd) break;
    prevT = t;
    t = min(t + max(d * 0.55, 0.0006 + 0.0025 * t), tEnd);
  }
  // 步数用完时光线贴着沙脊掠过，离表面已经很近，当作命中。
  if (!hit && t < tEnd - 0.01) hit = true;
  if (!hit) {
    gl_FragColor = sky;
    return;
  }
  // 二分细化：擦过沙脊的光线要落在真正的表面上，否则法线会取到脊背后的落沙坡。
  float lo = prevT;
  for (int i = 0; i < 6; i++) {
    float mid = 0.5 * (lo + t);
    vec3 m = ro + rd * mid;
    if (m.y - height(m.xz) > 0.0) lo = mid;
    else t = mid;
  }

  vec3 p = ro + rd * t;
  float phase;
  float h0 = u_dune * field(p.xz, -1.0, phase);
  // 沙脊尖是个折角。命中点离脊线不到一两个像素时，差分会跨过折角，把迎风坡和落沙坡混成一个斜向太阳的假法线，
  // 远处的脊线就断成一串亮点或暗点。这时分别求两面坡各自的法线，取更朝向镜头的那一面：
  // 一个像素里看得见的只有它。离脊线远的地方正常求法线。
  float e = max(0.0006, t * FOCAL / u_res.y);
  vec3 n;
  if (abs(phase - CREST_PHASE) < 1.5 * e) {
    vec3 windward = surfaceNormal(p.xz, e, 0.0);
    vec3 lee = surfaceNormal(p.xz, e, 1.0);
    n = dot(windward, rd) <= dot(lee, rd) ? windward : lee;
  } else {
    n = surfaceNormal(p.xz, e, -1.0);
  }

  if (u_pass < 0.5) {
    float shadow = softShadow(vec3(p.x, h0, p.z) + n * (0.002 + 0.002 * t), u_sun);
    // 距离开平方后打包：近处精度更高，沙纹的位置不会抖。
    gl_FragColor = vec4(pack16(min(sqrt(t / TMAX), 0.9998)), shadow, phase);
  } else {
    gl_FragColor = vec4(pack16(n.x * 0.5 + 0.5), pack16(n.z * 0.5 + 0.5));
  }
}
`

export const COMPOSITE_FRAGMENT = /* glsl */ `
${COMMON}
uniform sampler2D u_geoA;
uniform sampler2D u_geoB;
uniform float u_time;
uniform float u_wind;
uniform float u_rippleSize;
uniform vec3 u_sand;
uniform vec3 u_shade;
uniform float u_grain;
uniform float u_grainScale;

const float FOG_DIST = 12.0;

float unpack16(vec2 c) {
  vec2 b = floor(c * 255.0 + 0.5);
  return (b.x * 256.0 + b.y) / 65535.0;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float med3(float a, float b, float c) {
  return max(min(a, b), min(max(a, b), c));
}

// 五个数的中值：去掉孤立的单个异常值，但一个像素宽的细线（左右两个邻居和它一样）能保留下来。
float med5(float a, float b, float c, float d, float e) {
  return med3(e, max(min(a, b), min(c, d)), min(max(a, b), max(c, d)));
}

float depth(vec4 geoA) {
  float te = unpack16(geoA.xy);
  return te * te * TMAX;
}

// 缓存里一个像素的表面：法线的 x、z（0–1 编码）和阴影。
vec3 surface(vec4 geoA, vec4 geoB) {
  return vec3(unpack16(geoB.xy), unpack16(geoB.zw), geoA.z);
}

// 夜色（0–1）：阴影色接近黑、沙色也偏暗时是月夜。天空收暗到看得见星星，月亮更小更冷，光晕收敛。
float nightness() {
  return 1.0 - smoothstep(0.14, 0.26, luma(u_shade) + 0.25 * luma(u_sand));
}

// 天空和雾都由沙色、阴影色调出：沙色越亮，地平线的雾越白；月夜的地平线只是一层暗蓝的雾，不泛白。
vec3 horizonColor() {
  float k = luma(u_sand);
  vec3 day = mix(mix(u_sand, u_shade, 0.15), vec3(1.0), 0.5 * k * k);
  return mix(day, mix(u_sand, u_shade, 0.55), nightness());
}

vec3 zenithColor() {
  vec3 day = mix(mix(u_shade, u_sand, 0.28), vec3(1.0), 0.08 * luma(u_sand));
  return mix(day, mix(u_shade, u_sand, 0.12), nightness());
}

// 光晕色：白天是暖白，月光是冷的蓝白，也淡一些。
vec3 glowColor() {
  float night = nightness();
  return mix(u_sand, mix(vec3(1.0, 0.97, 0.92), vec3(0.86, 0.91, 1.0), night), 0.65 - 0.2 * night);
}

// 天空够暗时才看得见的星星，贴着地平线淡出。
float stars(vec3 rd) {
  vec2 uv = vec2(atan(rd.x, rd.z), rd.y) * 260.0;
  vec2 cell = floor(uv);
  float h = hash(cell);
  vec2 center = vec2(hash(cell + 1.3), hash(cell + 2.7)) * 0.6 + 0.2;
  float star = smoothstep(0.32, 0.0, length(fract(uv) - center)) * step(0.996, h) * (0.35 + 0.65 * hash(cell + 5.1));
  float dark = 1.0 - smoothstep(0.12, 0.28, luma(zenithColor()));
  return star * dark * smoothstep(0.015, 0.09, rd.y);
}

vec3 skyColor(vec3 rd, bool disk) {
  float y = max(rd.y, 0.0);
  vec3 c = mix(horizonColor(), zenithColor(), pow(smoothstep(0.0, 0.2, y), 0.75));
  float mu = max(dot(rd, u_sun), 0.0);
  float night = nightness();
  // 太阳一侧的地平线更亮：宽的暖光贴着地平线，窄的光晕围着太阳。
  float glow = 0.5 * pow(mu, 3.0) * (1.0 - smoothstep(0.0, 0.25, y)) + 0.45 * pow(mu, 24.0) + 0.3 * pow(mu, 200.0);
  // 暗的场景光晕收一些，月夜收得更多，天空才显得深；月亮只留一圈贴身的小光晕。
  float k = luma(u_sand);
  float amount = glow * clamp(0.3 + 1.4 * k * k, 0.0, 1.0) * (1.0 - 0.75 * night) + night * 0.3 * pow(mu, 600.0);
  c = mix(c, glowColor(), min(amount, 1.0));
  if (disk) {
    c += stars(rd) * (1.0 - min(amount * 3.0, 1.0));
    // 月亮比太阳小一圈、偏冷。
    float edge = mix(0.99975, 0.99993, night);
    vec3 face = mix(vec3(1.0, 0.985, 0.95), vec3(0.9, 0.93, 1.0), night);
    c = mix(c, face, smoothstep(edge, edge + mix(0.00011, 0.00004, night), mu));
  }
  return c;
}

// 风纹：与风向垂直、迎风缓背风陡，带分叉似的弯曲；整片纹理顺风缓慢迁移，弯曲走得慢一些，形状会慢慢变化。
float ripple(vec2 p) {
  vec2 q = vec2(dot(p, WIND), dot(p, CREST)) / u_rippleSize;
  float drift = u_time * u_wind * 0.45;
  vec2 qw = q - vec2(drift * 0.6, 0.0);
  float w = 2.4 * vnoise(qw * vec2(0.05, 0.13)) + 0.7 * vnoise(qw * vec2(0.18, 0.4)) + 0.5 * sin(qw.y * 0.21 + qw.x * 0.04);
  float s = fract(q.x + w - drift);
  float r = s < 0.72 ? s / 0.72 : (1.0 - s) / 0.28;
  r = r * r * (3.0 - 2.0 * r);
  return r * (0.55 + 0.45 * vnoise(qw * vec2(0.025, 0.07) + 7.0));
}

void main() {
  vec2 coord = gl_FragCoord.xy / u_res;
  vec4 geoA = texture2D(u_geoA, coord);
  vec3 rd = viewRay(gl_FragCoord.xy);
  float te = unpack16(geoA.xy);
  vec3 col;
  float ground = 0.0;
  if (te > 0.99995) {
    col = skyColor(rd, true);
  } else {
    float t = te * te * TMAX;
    vec3 p = vec3(0.0, u_camH, 0.0) + rd * t;
    // 缓存没有抗锯齿：光线擦过沙脊的像素，阴影和法线可能和左右邻居对不上，单独亮一下或暗一下。
    // 法线和阴影取自己与上下左右四个邻居的中值，孤立的坏点被去掉，阴影边缘和一个像素宽的亮脊线不受影响。
    // 脊线轮廓上的像素，有两三个邻居其实是脊背后远处的地面；这些邻居先换成最近的那个邻居（同一面坡的内侧），
    // 中值才不会被背后的地面带偏，轮廓上不会留下一串暗点。
    vec2 dx = vec2(1.0 / u_res.x, 0.0);
    vec2 dy = vec2(0.0, 1.0 / u_res.y);
    vec4 aL = texture2D(u_geoA, coord - dx);
    vec4 aR = texture2D(u_geoA, coord + dx);
    vec4 aD = texture2D(u_geoA, coord - dy);
    vec4 aU = texture2D(u_geoA, coord + dy);
    vec3 v0 = surface(geoA, texture2D(u_geoB, coord));
    vec3 vL = surface(aL, texture2D(u_geoB, coord - dx));
    vec3 vR = surface(aR, texture2D(u_geoB, coord + dx));
    vec3 vD = surface(aD, texture2D(u_geoB, coord - dy));
    vec3 vU = surface(aU, texture2D(u_geoB, coord + dy));
    float tL = depth(aL);
    float tR = depth(aR);
    float tD = depth(aD);
    float tU = depth(aU);
    vec3 nearest = vL;
    float tNear = tL;
    if (tR < tNear) { tNear = tR; nearest = vR; }
    if (tD < tNear) { tNear = tD; nearest = vD; }
    if (tU < tNear) { tNear = tU; nearest = vU; }
    float behind = t * 1.04 + 0.01;
    if (tL > behind) vL = nearest;
    if (tR > behind) vR = nearest;
    if (tD > behind) vD = nearest;
    if (tU > behind) vU = nearest;
    vec2 nxz = vec2(med5(vL.x, vR.x, vD.x, vU.x, v0.x), med5(vL.y, vR.y, vD.y, vU.y, v0.y)) * 2.0 - 1.0;
    vec3 n = vec3(nxz.x, sqrt(max(1.0 - dot(nxz, nxz), 0.0)), nxz.y);
    float shadow = med5(vL.z, vR.z, vD.z, vU.z, v0.z);
    float phase = geoA.w;

    // 沙纹只在近处画：一个像素盖住半道沙纹以上时淡出，避免远处闪烁。
    float footprint = t * FOCAL / u_res.y / max(abs(dot(n, rd)), 0.15);
    float visible = smoothstep(2.5, 6.0, u_rippleSize / footprint);
    float slipFace = smoothstep(0.66, 0.72, phase) * (1.0 - smoothstep(0.9, 0.99, phase));
    float amp = 0.026 * visible * (1.0 - slipFace);
    if (amp > 0.001) {
      float e = u_rippleSize * 0.1;
      float r0 = ripple(p.xz);
      vec2 g = vec2(ripple(p.xz + vec2(e, 0.0)) - r0, ripple(p.xz + vec2(0.0, e)) - r0) / e;
      n = normalize(n / n.y - vec3(g.x, 0.0, g.y) * amp * u_rippleSize);
    }

    // 曝光：先算坡面相对平地的受光 r。太阳低时平地亮度按太阳高度归一，阴影越拉越长；
    // 太阳升高后各坡面的受光本来就差不多，把 r 的对比拉开（并且不再继续提亮平地），
    // 迎光坡和背光坡依然分得清，沙丘不会被晒成一片平的米色。
    float sunY = max(u_sun.y, 0.03);
    float relative = max(dot(n, u_sun), 0.0) / sunY;
    float contrast = 1.0 + 1.6 * smoothstep(0.12, 0.34, sunY);
    float x = pow(relative, contrast) * min(sunY / (sunY * 1.5 + 0.1), 0.45) * shadow;
    float lit = x / (x + 0.3) * 1.3;
    float ao = mix(0.78, 1.0, smoothstep(0.0, 0.9, p.y / (u_dune * TOP)));
    // 背光面也不是死平的一块：朝天的坡多接一点天光，朝向太阳一侧的阴影里有沙面反上来的暖光。
    float skyLight = 0.8 + 0.28 * clamp(dot(n, normalize(vec3(-u_sun.x, 2.0, -u_sun.z))), 0.0, 1.0);
    float bounce = 0.12 * clamp(dot(n, normalize(vec3(u_sun.x, 0.4, u_sun.z))), 0.0, 1.0) * (1.0 - shadow * 0.5);
    col = mix(mix(u_shade * ao * skyLight, u_sand, bounce), u_sand, clamp(lit, 0.0, 1.0));
    col = mix(col, glowColor(), clamp(lit - 1.0, 0.0, 0.3) * 1.2);

    float fog = 1.0 - exp(-pow(t / FOG_DIST, 1.6));
    col = mix(col, skyColor(normalize(vec3(rd.x, 0.0, rd.z)), false), fog);
    ground = 1.0 - fog;
  }

  vec2 cell = floor(gl_FragCoord.xy / u_grainScale);
  float g = hash(cell) + hash(cell + 17.31) - 1.0;
  col *= 1.0 + g * u_grain * (0.04 + 0.12 * ground);
  col += (hash(gl_FragCoord.xy + 3.7) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
