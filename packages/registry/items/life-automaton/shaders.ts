/** 三个程序共用的全屏四边形；固定 location 0，一次 bindFullscreenQuad 所有程序都能用。 */
export const VERTEX_SHADER = /* glsl */ `#version 300 es
layout(location = 0) in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

/**
 * 一个模拟纹素里放四样东西：R 是否存活，G 余辉（熄灭时为 1，trailDecay 秒内线性降到 0），
 * B 活跃度（诞生时为 1，之后慢慢降到 0），A 是否处在「垂死」态（布赖恩之脑的第三态）。
 */
export const STEP_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D u_state;
uniform ivec2 u_grid;
/** 第 n 位为 1：有 n 个活邻居时诞生 / 存活。 */
uniform int u_birth;
uniform int u_survive;
/** 2 是普通的生死两态；3 时死亡前先经过一代「垂死」，垂死的格子不算邻居、也不能诞生。 */
uniform int u_states;
/** 1：这一遍推进一代；0：只让余辉和活跃度随时间衰减。 */
uniform int u_advance;
/** 这一遍余辉、活跃度各减去多少（单位 1/255，可以带小数）。 */
uniform float u_trailDrain;
uniform float u_flashDrain;
/** 指针和火花撒下的随机细胞团：xy 是格子坐标，z 半径（格），w 密度。 */
uniform vec4 u_stamps[24];
uniform int u_stampCount;
/** 第 i 位为 1：第 i 团是覆盖式的，没被选中的格子清空（昼夜规则用它挖出湖泊）。 */
uniform int u_overwrite;
uniform uint u_seed;

out vec4 outState;

uint hash(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  return v.x;
}

float random(ivec2 cell, uint salt) {
  return float(hash(uvec3(uvec2(cell), u_seed + salt)) >> 8u) / 16777216.0;
}

/**
 * 8 位纹理里按 1/255 的整数步往下减：小数部分按随机数进位，平均下来正好减掉 amount。
 * 每帧减得再少也不会因为舍入停住，余辉的时长因此和帧率无关。
 * 写回时加 0.25 级：不管驱动是四舍五入还是截断，存进去的都是这一级。
 */
float drain(float value, float amount, float r) {
  float level = floor(value * 255.0 + 0.5) - floor(amount + r);
  return level <= 0.0 ? 0.0 : (level + 0.25) / 255.0;
}

float alive(ivec2 cell) {
  return texelFetch(u_state, (cell + u_grid) % u_grid, 0).r;
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  vec4 state = texelFetch(u_state, cell, 0);
  bool live = state.r > 0.5;
  bool dying = state.a > 0.5;
  float flash = state.b;
  bool nextLive = live;
  bool nextDying = dying;

  if (u_advance == 1) {
    int n = 0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        if (x == 0 && y == 0) continue;
        n += int(alive(cell + ivec2(x, y)) > 0.5);
      }
    }
    if (live) {
      nextLive = ((u_survive >> n) & 1) == 1;
      nextDying = !nextLive && u_states > 2;
    } else if (dying) {
      nextDying = false;
    } else {
      nextLive = ((u_birth >> n) & 1) == 1;
      if (nextLive) flash = 1.0;
    }
  }

  vec2 grid = vec2(u_grid);
  vec2 center = vec2(cell) + 0.5;
  for (int i = 0; i < 24; i++) {
    if (i >= u_stampCount) break;
    vec4 stamp = u_stamps[i];
    // 环面上的最短距离：画面边缘的细胞团从另一边接上。
    vec2 d = mod(center - stamp.xy + grid * 0.5, grid) - grid * 0.5;
    if (dot(d, d) > stamp.z * stamp.z) continue;
    bool hit = random(cell, uint(i) * 7919u) < stamp.w;
    if (hit && !nextLive) {
      nextLive = true;
      nextDying = false;
      flash = 1.0;
    } else if (!hit && ((u_overwrite >> i) & 1) == 1) {
      nextLive = false;
      nextDying = false;
    }
  }

  // 活细胞的余辉一直是满格，熄灭（或被覆盖式的细胞团清空）后从满格开始褪。
  float trail = nextLive ? 1.0 : drain(state.g, u_trailDrain, random(cell, 104729u));
  flash = drain(flash, u_flashDrain, random(cell, 15485863u));
  outState = vec4(nextLive ? 1.0 : 0.0, trail, flash, nextDying ? 1.0 : 0.0);
}
`

/** 普查用的边长：把网格分成 CENSUS × CENSUS 块，每块抽样数活细胞，读回 CPU 后求平均。 */
export const CENSUS = 8

/** 每块按 12 × 12 的格点抽样，整张网格一共约 96 × 96 个样本，足够估出活细胞占比。 */
export const CENSUS_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D u_state;
uniform ivec2 u_grid;

out vec4 outColor;

void main() {
  ivec2 block = ivec2(gl_FragCoord.xy);
  float lit = 0.0;
  for (int y = 0; y < 12; y++) {
    for (int x = 0; x < 12; x++) {
      vec2 uv = (vec2(block * 12 + ivec2(x, y)) + 0.5) / ${(CENSUS * 12).toFixed(1)};
      lit += step(0.5, texelFetch(u_state, ivec2(uv * vec2(u_grid)), 0).r);
    }
  }
  outColor = vec4(lit / 144.0, 0.0, 0.0, 1.0);
}
`

export const RENDER_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D u_state;
uniform ivec2 u_grid;
uniform vec2 u_res;
/** 第 (0,0) 格左上角的像素位置（网格居中，四边露出的半格一样宽）。 */
uniform vec2 u_origin;
uniform float u_cell;
uniform float u_gap;
uniform vec3 u_background;
uniform vec3 u_alive;
uniform vec3 u_trail;
/** 1：浅色背景。辉光在深色背景上用滤色叠加（像发光），在浅色背景上改成混合（像墨晕）。 */
uniform float u_light;

out vec4 outColor;

vec4 cellAt(ivec2 cell) {
  return texelFetch(u_state, (cell + u_grid) % u_grid, 0);
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 g = (pixel - u_origin) / u_cell;
  ivec2 cell = ivec2(floor(g));
  vec2 f = fract(g);
  vec4 state = cellAt(cell);
  float live = step(0.5, state.r);

  // 圆角方块，留出缝隙；边缘按像素做抗锯齿。
  float halfSize = 0.5 * (u_cell - u_gap);
  float radius = 0.24 * u_cell;
  vec2 q = abs(f - 0.5) * u_cell - vec2(halfSize - radius);
  float sdf = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  float mask = clamp(0.5 - sdf, 0.0, 1.0);

  // 余辉：存的是线性的剩余时间，平方一下，刚熄灭时褪得快、尾巴拖得长，像荧光粉。
  // 刚熄灭时还带一点活细胞的颜色，随后褪成余辉色，再沉进背景。
  float t = state.g * state.g;
  float ember = t * t * (0.55 + 0.45 * t);
  vec3 dormant = mix(u_background, u_trail, 0.075);
  vec3 afterglow = mix(u_trail, u_alive, smoothstep(0.72, 1.0, t) * 0.5);
  vec3 dead = mix(dormant, afterglow, ember);
  // 辉光：九个格子的高斯光晕，活跃的格子亮，静物几乎不发光。顺便数一下活邻居。
  float glow = 0.0;
  float crowd = -live;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec4 n = cellAt(cell + ivec2(x, y));
      vec2 d = f - (vec2(x, y) + 0.5);
      float on = step(0.5, n.r);
      crowd += on;
      glow += on * (0.2 + n.b * n.b) * exp(-dot(d, d) * 2.4);
    }
  }
  glow = clamp(glow * 0.42 * (1.0 - mask * live), 0.0, 0.8);

  // 活细胞：刚诞生时最亮（深色背景上还带一点白热），一直不动的静物慢慢沉成中间色，
  // 成片的静物内部再暗一层（昼夜规则的大块岛屿只留下亮边），活跃的区域更显眼。
  float activity = state.b * state.b;
  vec3 settled = mix(u_trail, u_alive, 0.42);
  settled = mix(settled, mix(u_background, u_trail, 0.72), smoothstep(4.0, 8.0, crowd) * 0.85);
  vec3 lit = mix(settled, u_alive, smoothstep(0.0, 0.55, activity));
  lit = mix(lit, vec3(1.0), smoothstep(0.82, 1.0, activity) * 0.3 * (1.0 - u_light));
  vec3 color = mix(u_background, mix(dead, lit, live), mask);
  vec3 screen = 1.0 - (1.0 - color) * (1.0 - u_alive * glow);
  color = mix(screen, mix(color, u_alive, glow * 0.6), u_light);

  // 四角轻轻沉进背景，叠在上面的内容更好读。
  vec2 uv = gl_FragCoord.xy / u_res - 0.5;
  color = mix(color, u_background, 0.42 * smoothstep(0.32, 0.78, length(uv * vec2(1.0, 0.88))));

  // 抖动一点，避免辉光出现色带。
  float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  outColor = vec4(color + (noise - 0.5) / 255.0, 1.0);
}
`
