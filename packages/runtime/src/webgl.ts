/** 编译并链接一个着色器程序；失败时抛出带 info log 的错误，方便在预览里看到原因。 */
export function createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) throw new Error('unable to create shader')
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader) ?? 'unknown error'
      gl.deleteShader(shader)
      throw new Error(`${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader: ${log}`)
    }
    return shader
  }
  const vertex = compile(gl.VERTEX_SHADER, vertexSource)
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!program) throw new Error('unable to create program')
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  // 链接后着色器对象可以删除，程序仍然有效。
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'unknown error'
    gl.deleteProgram(program)
    throw new Error(`program link: ${log}`)
  }
  return program
}

/**
 * 给全屏着色器绑定一个覆盖整个视口的四边形（TRIANGLE_STRIP，4 个顶点）。
 * 返回释放函数。绘制时调用 `gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)`。
 */
export function bindFullscreenQuad(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram, attribute = 'a_pos'): () => void {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const location = gl.getAttribLocation(program, attribute)
  gl.enableVertexAttribArray(location)
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0)
  return () => gl.deleteBuffer(buffer)
}

/** 卸载时主动释放 WebGL 上下文：浏览器同时只允许约 16 个，画廊里很快就会用完。 */
export function releaseContext(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
  gl.getExtension('WEBGL_lose_context')?.loseContext()
}
