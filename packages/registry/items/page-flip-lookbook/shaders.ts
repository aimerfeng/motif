// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/transitions/BookFlip.glsl
// Modified by Motif; see the item's provenance.

/**
 * BookFlip by hong (MIT). The only change: the constant 0.7 in addShade() became the
 * uniform `pageShade` (as 1.0 - pageShade), so the mid-turn shading depth is a parameter.
 */
export const BOOK_FLIP = String.raw`// Author: hong
// License: MIT

uniform float pageShade; // = 0.3

vec2 skewRight(vec2 p) {
  float skewX = (p.x - progress)/(0.5 - progress) * 0.5;
  float skewY =  (p.y - 0.5)/(0.5 + progress * (p.x - 0.5) / 0.5)* 0.5  + 0.5;
  return vec2(skewX, skewY);
}

vec2 skewLeft(vec2 p) {
  float skewX = (p.x - 0.5)/(progress - 0.5) * 0.5 + 0.5;
  float skewY = (p.y - 0.5) / (0.5 + (1.0 - progress ) * (0.5 - p.x) / 0.5) * 0.5  + 0.5;
  return vec2(skewX, skewY);
}

vec4 addShade() {
  float shadeVal  =  max(1.0 - pageShade, abs(progress - 0.5) * 2.0);
  return vec4(vec3(shadeVal ), 1.0);
}

vec4 transition (vec2 p) {
  float pr = step(1.0 - progress, p.x);

  if (p.x < 0.5) {
    return mix(getFromColor(p), getToColor(skewLeft(p)) * addShade(), pr);
  } else {
    return mix(getFromColor(skewRight(p)) * addShade(), getToColor(p),   pr);
  }
}
`
