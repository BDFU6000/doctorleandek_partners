"use client";

import { useEffect, useRef } from "react";
import { mat4, perspective, multiply, compose, normalMat3, hex } from "../lib/gl-math";
import { icosahedron, capsule, torus, crescentPrism } from "../lib/gl-geometry";
import s from "./OrbitScene.module.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Five solids orbiting the hero emblem, drawn straight against WebGL.

   The previous version scattered a dozen shapes across the whole hero, which
   put geometry behind the headline and meant nothing. This one is placed and
   it counts: the canvas is the size of the emblem render and nothing else, the
   orbit is centred on the emblem and tilted to match the chrome ring already in
   the render, and there are exactly five satellites because there are exactly
   five partner account types. They converge on the mark in the middle. That is
   the page's whole argument, running as an animation.

   Objects on the far half of the orbit fade out, so they read as passing behind
   the emblem — the render is a flat raster and cannot occlude anything, so the
   occlusion has to be faked, and fading on depth is the cheap convincing way.

   Rules it keeps: colours come from the live stylesheet, the loop stops when
   off-screen or the tab is hidden, no WebGL means no canvas and the render
   stands alone, and reduced motion gets one still frame rather than a blank.
   ───────────────────────────────────────────────────────────────────────────── */

const VERT = `
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

const FRAG = `
precision mediump float;
varying vec3 vN;
varying vec3 vViewPos;
uniform vec3 uLit;
uniform vec3 uShade;
uniform vec3 uRim;
uniform float uFade;   // 1 = fully dissolved (used for the far half of the orbit)

void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(-vViewPos);
  // Key from the upper left to match the lighting baked into the render, so
  // the satellites and the emblem look lit by the same lamp.
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

const DUST_VERT = `
attribute vec3 aPos;
attribute float aSeed;
uniform mat4 uProj, uView, uModel;
uniform float uTime;
varying float vDepth;
void main(){
  vec3 p = aPos;
  p.y += sin(uTime * 0.3 + aSeed * 6.28) * 0.3;
  vec4 viewPos = uView * uModel * vec4(p, 1.0);
  vDepth = -viewPos.z;
  gl_PointSize = clamp(34.0 / vDepth, 1.0, 3.4);
  gl_Position = uProj * viewPos;
}`;

const DUST_FRAG = `
precision mediump float;
varying float vDepth;
uniform vec3 uColor;
void main(){
  float d = length(gl_PointCoord - vec2(0.5));
  float a = smoothstep(0.5, 0.05, d) * smoothstep(17.0, 6.0, vDepth);
  gl_FragColor = vec4(uColor, a * 0.42);
}`;

function compile(gl, vsSrc, fsSrc) {
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

function buffer(gl, data) {
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return b;
}

/* One satellite per partner account type, in the order the page introduces
   them. The shape is the role: crystal for medical staff is a stretch, but the
   capsule is the pharmacy, the ring is the delivery loop, and the crescent is
   care itself. Phases are evenly spaced so the five never bunch up. */
const SATELLITES = [
  { g: "crescent", phase: 0.0, size: 0.36, spin: [0.34, 0.21], lit: "--t-100", shade: "--t-600" },
  { g: "capsule", phase: 1.26, size: 0.30, spin: [0.28, 0.30], lit: "--t-50",  shade: "--t-500" },
  { g: "crystal", phase: 2.51, size: 0.32, spin: [0.22, 0.26], lit: "--t-200", shade: "--t-600" },
  { g: "sphere",  phase: 3.77, size: 0.27, spin: [0.18, 0.18], lit: "--t-100", shade: "--t-500" },
  { g: "ring",    phase: 5.03, size: 0.35, spin: [0.30, 0.24], lit: "--t-200", shade: "--t-600" },
];

// Orbit geometry. `TILT` matches the chrome ring in the render, which runs
// low-left to high-right; getting this wrong is what would make the satellites
// look like they belong to a different picture.
//
// The radius is set so the satellites sweep OUTSIDE the emblem's silhouette
// and only clip its edges. At a tighter radius they crossed the middle of the
// mark, which read as clutter sitting on the logo rather than as an orbit.
const RADIUS = 2.85;
// Squashed horizontally. A circular orbit at this radius swings the satellites
// out past the artwork column and into the gap beside the headline, where one
// of them parks next to the words and reads as a stray icon rather than as part
// of the object. Narrowing x keeps the sweep over the emblem; z is left alone
// so the depth travel — the thing that makes it an orbit — is unchanged.
const RADIUS_X = 0.78;
const TILT = 0.34;
const SPEED = 0.16;

// The emblem is frosted glass. Flat opaque satellites beside it look like a
// different render, so everything here carries a little transparency.
const SATELLITE_ALPHA = 0.88;

export default function OrbitScene() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = s.canvas;

    const opts = { alpha: true, antialias: true, depth: true, powerPreference: "low-power" };
    const gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
    if (!gl) return; // no WebGL: the render alone is already the design

    const prog = compile(gl, VERT, FRAG);
    const dustProg = compile(gl, DUST_VERT, DUST_FRAG);
    if (!prog || !dustProg) return;

    host.appendChild(canvas);

    // Colours are read off the live stylesheet, so the ramp has exactly one
    // home (globals.css) and this file cannot drift from it.
    const css = getComputedStyle(document.documentElement);
    const token = (name) => hex((css.getPropertyValue(name) || "#54ACBF").trim());
    const rim = token("--t-100");
    const dustColor = token("--t-400");

    const geos = {
      crescent: crescentPrism(0.95, 0.82, 0.44, 0.22, 40),
      capsule: capsule(0.44, 1.0, 24, 8),
      crystal: icosahedron(0, false),
      sphere: icosahedron(2, true),
      ring: torus(0.62, 0.2, 36, 14),
    };
    const gpu = {};
    for (const [k, m] of Object.entries(geos)) {
      gpu[k] = { pos: buffer(gl, m.position), nor: buffer(gl, m.normal), count: m.count };
    }
    const cast = SATELLITES.map((c) => ({ ...c, lit: token(c.lit), shade: token(c.shade) }));

    // Deterministic scatter — a tiny LCG rather than Math.random, so the field
    // is identical on every load and can actually be judged.
    const DUST = 120;
    const dustPos = new Float32Array(DUST * 3);
    const dustSeed = new Float32Array(DUST);
    let seed = 20260801;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3] = (rnd() - 0.5) * 8.5;
      dustPos[i * 3 + 1] = (rnd() - 0.5) * 7;
      dustPos[i * 3 + 2] = (rnd() - 0.5) * 7;
      dustSeed[i] = rnd();
    }
    const dustBuf = buffer(gl, dustPos);
    const dustSeedBuf = buffer(gl, dustSeed);

    const loc = {
      aPos: gl.getAttribLocation(prog, "aPos"),
      aNormal: gl.getAttribLocation(prog, "aNormal"),
      uProj: gl.getUniformLocation(prog, "uProj"),
      uView: gl.getUniformLocation(prog, "uView"),
      uModel: gl.getUniformLocation(prog, "uModel"),
      uNormalMat: gl.getUniformLocation(prog, "uNormalMat"),
      uLit: gl.getUniformLocation(prog, "uLit"),
      uShade: gl.getUniformLocation(prog, "uShade"),
      uRim: gl.getUniformLocation(prog, "uRim"),
      uFade: gl.getUniformLocation(prog, "uFade"),
    };
    const dloc = {
      aPos: gl.getAttribLocation(dustProg, "aPos"),
      aSeed: gl.getAttribLocation(dustProg, "aSeed"),
      uProj: gl.getUniformLocation(dustProg, "uProj"),
      uView: gl.getUniformLocation(dustProg, "uView"),
      uModel: gl.getUniformLocation(dustProg, "uModel"),
      uTime: gl.getUniformLocation(dustProg, "uTime"),
      uColor: gl.getUniformLocation(dustProg, "uColor"),
    };

    const proj = mat4();
    const view = mat4();
    const model = mat4();
    const modelView = mat4();
    const nmat = new Float32Array(9);
    const field = mat4();

    const CAM_Z = 9;
    view[14] = -CAM_Z;

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width));
      const h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      // The orbit has to stay the same size relative to the emblem at every
      // width, and the emblem is sized by the container's WIDTH. So the field
      // of view is derived from width, not the usual vertical FOV.
      const vFov = 2 * Math.atan(Math.tan(0.34) / (w / h));
      perspective(proj, vFov, w / h, 0.1, 40);
    };

    let aimX = 0, aimY = 0, curX = 0, curY = 0;
    const onPointer = (e) => {
      const r = host.getBoundingClientRect();
      aimX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      aimY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => { aimX = 0; aimY = 0; };

    const order = cast.map((_, i) => i);

    const draw = (t) => {
      curX += (aimX - curX) * 0.05;
      curY += (aimY - curY) * 0.05;
      const yaw = curX * 0.22;
      const pitch = -curY * 0.14;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const placed = cast.map((c, i) => {
        const a = t * SPEED + c.phase;
        // The orbit ellipse, then the plane tilt, then the pointer aim.
        let x = Math.cos(a) * RADIUS * RADIUS_X;
        let z = Math.sin(a) * RADIUS;
        let y = x * Math.sin(TILT) + Math.sin(t * 0.5 + c.phase) * 0.1;

        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y1 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp;

        // Far half dissolves, so the satellite reads as passing behind the
        // emblem instead of sliding across it.
        const behind = (RADIUS - z2) / (2 * RADIUS);       // 0 near … 1 far
        const depth = Math.min(0.86, Math.max(0, (behind - 0.42) / 0.5)) * 0.95;
        // Combined with the constant glassiness, so even a satellite at the
        // very front of the orbit is never a solid opaque lump.
        const fade = 1 - (1 - depth) * SATELLITE_ALPHA;
        return { i, x: x1, y: y1, z: z2, fade, c };
      });
      order.sort((a, b) => placed[a].z - placed[b].z);

      gl.useProgram(prog);
      gl.uniformMatrix4fv(loc.uProj, false, proj);
      gl.uniformMatrix4fv(loc.uView, false, view);
      gl.uniform3fv(loc.uRim, rim);
      gl.enableVertexAttribArray(loc.aPos);
      gl.enableVertexAttribArray(loc.aNormal);

      for (const idx of order) {
        const p = placed[idx];
        const c = p.c;
        const g = gpu[c.g];
        compose(
          model, p.x, p.y, p.z,
          t * c.spin[0] + c.phase + pitch,
          t * c.spin[1] + c.phase + yaw,
          Math.sin(t * 0.2 + c.phase) * 0.3,
          c.size,
        );
        multiply(modelView, view, model);
        normalMat3(nmat, modelView);
        gl.uniformMatrix4fv(loc.uModel, false, model);
        gl.uniformMatrix3fv(loc.uNormalMat, false, nmat);
        gl.uniform3fv(loc.uLit, c.lit);
        gl.uniform3fv(loc.uShade, c.shade);
        gl.uniform1f(loc.uFade, p.fade);

        gl.bindBuffer(gl.ARRAY_BUFFER, g.pos);
        gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, g.nor);
        gl.vertexAttribPointer(loc.aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, g.count);
      }
      gl.disableVertexAttribArray(loc.aNormal);

      // Dust last, additive, depth-tested but not depth-writing.
      compose(field, 0, 0, 0, pitch, yaw + t * 0.03, 0, 1);
      gl.useProgram(dustProg);
      gl.depthMask(false);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.uniformMatrix4fv(dloc.uProj, false, proj);
      gl.uniformMatrix4fv(dloc.uView, false, view);
      gl.uniformMatrix4fv(dloc.uModel, false, field);
      gl.uniform1f(dloc.uTime, t);
      gl.uniform3fv(dloc.uColor, dustColor);
      gl.enableVertexAttribArray(dloc.aPos);
      gl.enableVertexAttribArray(dloc.aSeed);
      gl.bindBuffer(gl.ARRAY_BUFFER, dustBuf);
      gl.vertexAttribPointer(dloc.aPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, dustSeedBuf);
      gl.vertexAttribPointer(dloc.aSeed, 1, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, DUST);
      gl.disableVertexAttribArray(dloc.aSeed);
      gl.depthMask(true);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    };

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let raf = 0;
    let running = false;
    let start = 0;
    const tick = (now) => {
      if (!start) start = now;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    const play = () => {
      if (running || reduced.matches) return;
      running = true;
      start = 0;
      raf = requestAnimationFrame(tick);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    // One frame immediately, so there is never a blank canvas — and under
    // reduced motion this single frame is the entire effect.
    draw(reduced.matches ? 1.9 : 0);
    requestAnimationFrame(() => canvas.classList.add(s.ready));

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? play() : pause()),
      { rootMargin: "140px" },
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(reduced.matches ? 1.9 : 0);
    });
    ro.observe(host);

    const onVisibility = () => (document.hidden ? pause() : play());
    const onMotionChange = () => (reduced.matches ? (pause(), draw(1.9)) : play());
    const onLost = (e) => { e.preventDefault(); pause(); };

    document.addEventListener("visibilitychange", onVisibility);
    host.addEventListener("pointermove", onPointer, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });
    canvas.addEventListener("webglcontextlost", onLost);
    reduced.addEventListener("change", onMotionChange);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      reduced.removeEventListener("change", onMotionChange);
      canvas.remove();
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
  }, []);

  return <div ref={hostRef} className={s.host} aria-hidden="true" />;
}
