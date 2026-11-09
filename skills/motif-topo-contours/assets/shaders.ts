// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/neuform-isolated/sources/topo-field.html
// Modified by Motif; see the item's provenance.

export const TOPO_VERTEX_SHADER = /* glsl */ `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`

export const TOPO_FRAGMENT_SHADER = /* glsl */ `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dpr;
uniform float u_bands;
uniform float u_line_width;
uniform float u_noise_scale;
uniform float u_grid_size;
uniform float u_grid_opacity;
uniform float u_index_every;
uniform vec3 u_line_color;
uniform vec3 u_background;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // 1px physical grid rendering
    float gridSize = u_grid_size * u_dpr;
    vec2 gridSt = gl_FragCoord.xy / gridSize;
    vec2 gridFract = fract(gridSt);
    float lineThickness = 1.0 / gridSize;
    float gridLines = step(1.0 - lineThickness, gridFract.x) + step(1.0 - lineThickness, gridFract.y);
    gridLines = clamp(gridLines, 0.0, 1.0) * u_grid_opacity;

    // Ultra-thin Topographic Lines
    float noiseScale = u_noise_scale;
    vec2 noisePos = st * noiseScale + vec2(u_time * 0.015, u_time * 0.025);
    float n = snoise(noisePos) * 0.5 + 0.5;
    float numBands = u_bands;
    float bandVal = n * numBands;
    float triangleWave = abs(fract(bandVal) - 0.5) * 2.0;

    // Motif: every Nth isoline is a heavier index contour.
    float level = floor(bandVal + 0.5);
    float isIndex = u_index_every > 0.5 ? step(mod(level + 0.5, u_index_every), 1.0) : 0.0;
    float width = u_line_width * mix(1.0, 2.0, isIndex);

    // Thinner smoothstep constraint for fine industrial aesthetic
    float topoLines = smoothstep(width, 0.00, triangleWave) * mix(0.45, 0.85, isIndex);

    float lines = clamp(gridLines + topoLines, 0.0, 1.0);
    vec3 color = mix(u_background, u_line_color, lines);

    gl_FragColor = vec4(color, 1.0);
}
`
