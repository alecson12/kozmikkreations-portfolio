// Draws one frame of space onto a <canvas> with WebGL2:
//   nebula (small texture, stretched) → stars → planets.
// It knows nothing about pages or projects; the director tells it what to draw.

import { BACKDROP_FS, BODY_FS, BODY_VS, NEBULA_FS, QUAD_VS, STAR_FS, STAR_VS } from './shaders.js'

const STAR_COUNT = 3400
const TYPES = { chrome: 0, gas: 1, rock: 2, terra: 3, lava: 4, ice: 5 }

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error('Shader compile failed: ' + log)
  }
  return sh
}

function program(gl, vs, fs) {
  const p = gl.createProgram()
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs))
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Program link failed: ' + gl.getProgramInfoLog(p))
  const uniforms = {}
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i)
    uniforms[info.name] = gl.getUniformLocation(p, info.name)
  }
  return { p, u: uniforms }
}

// Small deterministic random generator so the sky is the same on every visit.
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createEngine(canvas) {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  })
  if (!gl) return null

  let nebula, backdrop, stars, body
  try {
    nebula = program(gl, QUAD_VS, NEBULA_FS)
    backdrop = program(gl, QUAD_VS, BACKDROP_FS)
    stars = program(gl, STAR_VS, STAR_FS)
    body = program(gl, BODY_VS, BODY_FS)
  } catch (err) {
    console.warn('[cosmos]', err)
    return null
  }

  // One square, reused for the full-screen passes, each star and each planet.
  const quadBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

  const quadVao = gl.createVertexArray()
  gl.bindVertexArray(quadVao)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const rnd = mulberry32(121200)
  const starData = new Float32Array(STAR_COUNT * 7)
  for (let i = 0; i < STAR_COUNT; i++) {
    starData.set([rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd()], i * 7)
  }
  const starVao = gl.createVertexArray()
  gl.bindVertexArray(starVao)
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  const starBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, starBuf)
  gl.bufferData(gl.ARRAY_BUFFER, starData, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(1)
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 0)
  gl.vertexAttribDivisor(1, 1)
  gl.enableVertexAttribArray(2)
  gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 28, 12)
  gl.vertexAttribDivisor(2, 1)
  gl.bindVertexArray(null)

  // Nebula render target (a fraction of the screen; clouds are soft so it upscales cleanly).
  const nebTex = gl.createTexture()
  const nebFbo = gl.createFramebuffer()
  let nebW = 0
  let nebH = 0

  let width = 0
  let height = 0
  let scale = 1 // drawing-buffer pixels per CSS pixel
  let quality = 1 // lowered automatically on slow devices

  function resize(cssW, cssH, dpr) {
    scale = Math.min(dpr, 2) * quality
    const w = Math.max(2, Math.round(cssW * scale))
    const h = Math.max(2, Math.round(cssH * scale))
    if (w !== width || h !== height) {
      width = w
      height = h
      canvas.width = w
      canvas.height = h
    }
    const nw = Math.max(2, Math.round(Math.min(cssW, 1600) * 0.34))
    const nh = Math.max(2, Math.round(nw * (cssH / cssW)))
    if (nw !== nebW || nh !== nebH) {
      nebW = nw
      nebH = nh
      gl.bindTexture(gl.TEXTURE_2D, nebTex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, nw, nh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.bindFramebuffer(gl.FRAMEBUFFER, nebFbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nebTex, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }
  }

  function setQuality(q) {
    quality = q
  }

  function drawBody(b, time, cssH) {
    const u = body.u
    const r = b.r * scale
    if (r < 0.75 || b.alpha <= 0.003) return
    const haze = b.haze ?? 1
    const extent = r * (b.ring ? b.ring.outer + 0.08 : 1 + 0.75 / haze)
    const cx = b.x * scale
    const cy = (cssH - b.y) * scale
    // skip anything fully off screen
    if (cx + extent < 0 || cx - extent > width || cy + extent < 0 || cy - extent > height) return
    gl.uniform2f(u.uCenter, cx, cy)
    gl.uniform1f(u.uExtent, extent)
    gl.uniform1f(u.uRadius, r)
    gl.uniform1i(u.uType, TYPES[b.type] ?? 2)
    gl.uniform3fv(u.uC0, b.colors[0])
    gl.uniform3fv(u.uC1, b.colors[1])
    gl.uniform3fv(u.uC2, b.colors[2])
    gl.uniform3fv(u.uAtmo, b.atmosphere)
    gl.uniform1f(u.uSeed, b.seed)
    gl.uniform1f(u.uSpin, b.spin)
    gl.uniform1f(u.uTilt, b.tilt ?? 0)
    gl.uniform3fv(u.uLight, b.light)
    gl.uniform1f(u.uAlpha, b.alpha)
    gl.uniform1f(u.uDetail, b.detail ?? 1)
    gl.uniform1f(u.uGlow, b.glow ?? 1)
    gl.uniform1f(u.uHaze, haze)
    gl.uniform1f(u.uCloud, b.cloud ?? 0.5)
    gl.uniform1f(u.uTime, time)
    if (b.ring) {
      gl.uniform1f(u.uRingOn, 1)
      gl.uniform4f(u.uRing, b.ring.inner, b.ring.outer, b.ring.tilt, b.ring.roll ?? 0)
      gl.uniform3fv(u.uRingCol, b.ring.color)
    } else {
      gl.uniform1f(u.uRingOn, 0)
      gl.uniform4f(u.uRing, 2, 3, 0.3, 0)
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  // frame = { time, cssW, cssH, cam:[x,y,z], streak:[x,y,z], nebula:[x,y,z], nebulaAmount, starAmount, dim, bodies:[…] }
  function render(frame) {
    const { time, cssW, cssH } = frame
    gl.disable(gl.DEPTH_TEST)
    gl.bindVertexArray(quadVao)

    // 1 · nebula into its small texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, nebFbo)
    gl.viewport(0, 0, nebW, nebH)
    gl.disable(gl.BLEND)
    gl.useProgram(nebula.p)
    gl.uniform2f(nebula.u.uRes, nebW, nebH)
    gl.uniform3fv(nebula.u.uCam, frame.nebula)
    gl.uniform1f(nebula.u.uTime, time)
    gl.uniform1f(nebula.u.uGalaxy, frame.galaxy ?? 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // 2 · backdrop
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, width, height)
    gl.useProgram(backdrop.p)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, nebTex)
    gl.uniform1i(backdrop.u.uNebula, 0)
    gl.uniform2f(backdrop.u.uRes, width, height)
    gl.uniform1f(backdrop.u.uNebulaAmount, frame.nebulaAmount)
    gl.uniform1f(backdrop.u.uDim, frame.dim)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // 3 · stars (their light adds on top)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.useProgram(stars.p)
    gl.bindVertexArray(starVao)
    const box = Math.max(cssW, cssH) * 1.25 * scale
    gl.uniform2f(stars.u.uRes, width, height)
    gl.uniform2f(stars.u.uBox, box, box)
    gl.uniform3f(stars.u.uCam, frame.cam[0] * scale, -frame.cam[1] * scale, frame.cam[2])
    gl.uniform3f(stars.u.uStreak, frame.streak[0] * scale, -frame.streak[1] * scale, frame.streak[2])
    gl.uniform1f(stars.u.uScale, scale)
    gl.uniform1f(stars.u.uTime, time)
    gl.uniform1f(stars.u.uAmount, frame.starAmount * (1 - frame.dim * 0.6))
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, STAR_COUNT)

    // 4 · planets, far to near
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.useProgram(body.p)
    gl.bindVertexArray(quadVao)
    gl.uniform2f(body.u.uRes, width, height)
    for (const b of frame.bodies) drawBody(b, time, cssH)

    gl.bindVertexArray(null)
  }

  function dispose() {
    const ext = gl.getExtension('WEBGL_lose_context')
    if (ext) ext.loseContext()
  }

  return { gl, resize, render, setQuality, dispose, get quality() { return quality } }
}
