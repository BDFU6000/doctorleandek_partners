// The shared WebGL bits: the solid shader pair, plus the two boilerplate
// helpers every scene needs.
//
// This exists so the hero orbit and the counter models are lit by the SAME
// lamp. They sit on one page, a few hundred pixels apart, and the moment their
// key light disagrees they stop looking like objects in one room and start
// looking like two widgets. Keeping the shader in one file is what enforces
// that, the same way globals.css is the one home for the colour ramp.

export const SOLID_VERT = `
attribute vec3 aPos;
attribute vec3 aNormal;
uniform mat4 uProj, uView, uModel;
uniform mat3 uNormalMat;
varying vec3 vN;
varying vec3 vViewPos;
void main(){
  vec4 viewPos = uView * uModel * vec4(aPos, 1.0);
  vN = uNormalMat * aNormal;
  vViewPos = viewPos.xyz;
  gl_Position = uProj * viewPos;
}`;

// Key from the upper left to match the lighting baked into the hero renders, so
// anything drawn with this shader looks lit by the same lamp as the artwork.
// uFade dissolves a solid (the orbit uses it for the far half of its sweep);
// pass 0.0 when nothing should fade.
export const SOLID_FRAG = `
precision mediump float;
varying vec3 vN;
varying vec3 vViewPos;
uniform vec3 uLit;
uniform vec3 uShade;
uniform vec3 uRim;
uniform float uFade;

void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(-vViewPos);
  vec3 key  = normalize(vec3(-0.55,  0.72,  0.55));
  vec3 fill = normalize(vec3( 0.62, -0.20,  0.42));

  float kd = max(dot(N, key), 0.0);
  float fd = max(dot(N, fill), 0.0);
  float spec = pow(max(dot(N, normalize(key + V)), 0.0), 46.0);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.3);

  vec3 col = mix(uShade, uLit, kd * kd);
  col += uLit * fd * 0.2;
  col += uRim * fres * 0.85;
  col += vec3(1.0) * spec * 0.45;

  float haze = smoothstep(-5.0, -18.0, vViewPos.z);
  gl_FragColor = vec4(col, (1.0 - haze * 0.55) * (1.0 - uFade));
}`;

/** Compile + link a program. Returns null on any failure, so a caller can bail
    to its non-WebGL design instead of throwing on a page that must still render. */
export function compile(gl, vsSrc, fsSrc) {
  const make = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };
  const vs = make(gl.VERTEX_SHADER, vsSrc);
  const fs = make(gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null;
}

/** Upload a Float32Array once, static draw. */
export function buffer(gl, data) {
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return b;
}
