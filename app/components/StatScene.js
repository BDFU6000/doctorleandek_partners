"use client";

import { useEffect, useRef } from "react";
import { mat4, perspective, multiply, compose, normalMat3, hex } from "../lib/gl-math";
import { icosahedron, capsule, crescentPrism, torus } from "../lib/gl-geometry";
import { SOLID_VERT, SOLID_FRAG, compile, buffer } from "../lib/gl-core";
import s from "./StatScene.module.css";

/* ─────────────────────────────────────────────────────────────────────────────
   One turning solid per counter, drawn against WebGL with the hero's shader.

   The number is the point of the section, so the object beside it has to be
   read in a glance and then get out of the way: one shape per card, one slow
   rotation, no orbit, no dust. What it is matters, though — the shapes are the
   same vocabulary the hero orbit already taught the visitor a screen earlier:

     · capsule  → the pharmacy               (it is the pill)
     · crescent → the medical staff          (the Red Crescent, the page's mark)
     · cluster  → the patients               (a group, not a person: the ring of
                  spheres around a centre is the one shape here that is plural)

   Everything else is the rules the orbit already keeps: colours are read off
   the live stylesheet so globals.css stays the only home for the ramp, the loop
   is paused off-screen and on a hidden tab, reduced motion gets one still frame
   instead of a blank box, and no WebGL means no canvas at all — the card's own
   glow is designed to stand alone.
   ───────────────────────────────────────────────────────────────────────────── */

// Each model is a list of parts, so "a group of people" is expressible in the
// same structure as "one pill". [x, y, z] is the resting offset; `orbit` turns
// the part around the model's own Y axis, which is what makes the cluster read
// as gathering rather than as three shapes glued in place.
// `fit` is what keeps the three cards agreeing on how big "the object" is: the
// cluster spans more model space than a single pill, so it is scaled down to
// the same visual footprint rather than being left to dominate its neighbours.
const MODELS = {
  pharmacy: {
    lit: "--t-100",
    shade: "--t-600",
    fit: 1.0,
    parts: [
      { geo: "capsule", at: [0, 0, 0], size: 1.0, tilt: [0.55, 0, 0.62] },
    ],
  },
  medical: {
    lit: "--t-50",
    shade: "--t-500",
    fit: 1.05,
    parts: [
      { geo: "crescent", at: [0, 0, 0], size: 0.92, tilt: [0.18, 0, -0.22] },
    ],
  },
  patients: {
    lit: "--t-200",
    shade: "--t-600",
    fit: 0.72,
    parts: [
      { geo: "sphere", at: [0, 0, 0], size: 0.42, tilt: [0, 0, 0] },
      { geo: "sphere", at: [0.95, 0.2, 0], size: 0.3, tilt: [0, 0, 0], spin: 0.26, orbit: 0.0 },
      { geo: "sphere", at: [0.95, -0.12, 0], size: 0.26, tilt: [0, 0, 0], spin: 0.24, orbit: 2.09 },
      { geo: "sphere", at: [0.95, 0.02, 0], size: 0.34, tilt: [0, 0, 0], spin: 0.22, orbit: 4.19 },
      // Nearly flat and wider than the orbit: the group has a floor, which is
      // what stops four spheres from reading as loose bubbles.
      { geo: "ring", at: [0, 0, 0], size: 1.3, tilt: [1.34, 0, 0] },
    ],
  },
};

// Far enough back that a capsule standing on end and a crescent lying flat both
// fit the same box, so the three cards agree on how big "the object" is.
const CAM_Z = 5.2;

// Half-angle of the view on whichever side is the tighter one. Fitting the
// SHORTER side is the difference between an object that keeps its size from a
// wide desktop card to a narrow phone card, and one that gets cropped by one.
const HALF_FOV = 0.34;

export default function StatScene({ model = "pharmacy", phase = 0 }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const spec = MODELS[model] || MODELS.pharmacy;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = s.canvas;

    const opts = { alpha: true, antialias: true, depth: true, powerPreference: "low-power" };
    const gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
    if (!gl) return; // no WebGL: the card's glow is already a finished design

    const prog = compile(gl, SOLID_VERT, SOLID_FRAG);
    if (!prog) return;

    host.appendChild(canvas);

    const css = getComputedStyle(document.documentElement);
    const token = (name) => hex((css.getPropertyValue(name) || "#54ACBF").trim());
    const rim = token("--t-100");
    const lit = token(spec.lit);
    const shade = token(spec.shade);

    // Only the geometries this model actually uses are built and uploaded.
    const build = {
      capsule: () => capsule(0.46, 0.95, 26, 9),
      crescent: () => crescentPrism(0.95, 0.82, 0.44, 0.2, 40),
      sphere: () => icosahedron(2, true),
      ring: () => torus(0.86, 0.075, 44, 12),
    };
    const gpu = {};
    for (const part of spec.parts) {
      if (gpu[part.geo]) continue;
      const m = build[part.geo]();
      gpu[part.geo] = { pos: buffer(gl, m.position), nor: buffer(gl, m.normal), count: m.count };
    }

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

    const proj = mat4();
    const view = mat4();
    const model4 = mat4();
    const modelView = mat4();
    const nmat = new Float32Array(9);
    view[14] = -CAM_Z;

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width));
      const h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const aspect = w / h;
      // Wider than tall → the height is the tight side, so the vertical angle
      // is the fixed one. Taller than wide → fix the horizontal angle instead
      // and derive the vertical from it.
      const vFov =
        aspect >= 1 ? 2 * HALF_FOV : 2 * Math.atan(Math.tan(HALF_FOV) / aspect);
      perspective(proj, vFov, aspect, 0.1, 30);
    };

    const draw = (t) => {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniformMatrix4fv(loc.uProj, false, proj);
      gl.uniformMatrix4fv(loc.uView, false, view);
      gl.uniform3fv(loc.uRim, rim);
      gl.uniform3fv(loc.uLit, lit);
      gl.uniform3fv(loc.uShade, shade);
      gl.uniform1f(loc.uFade, 0);
      gl.enableVertexAttribArray(loc.aPos);
      gl.enableVertexAttribArray(loc.aNormal);

      // The whole model turns on one axis; parts add their own spin on top.
      const turn = t * 0.42 + phase;
      const bob = Math.sin(t * 0.7 + phase) * 0.07;

      for (const part of spec.parts) {
        const g = gpu[part.geo];
        const orbiting = part.orbit !== undefined;
        let [x, y, z] = part.at;
        if (orbiting) {
          // Carry the part around the model's Y axis at its resting radius. The
          // cluster's satellites gather and separate as they pass; the centre
          // sphere and the ring have no orbit and stay put.
          const a = turn + part.orbit;
          const radius = Math.hypot(x, z);
          x = Math.cos(a) * radius;
          z = Math.sin(a) * radius;
        }

        compose(
          model4,
          x * spec.fit,
          (y + bob) * spec.fit,
          z * spec.fit,
          part.tilt[0],
          part.tilt[1] + (orbiting ? t * part.spin : turn),
          part.tilt[2],
          part.size * spec.fit,
        );
        multiply(modelView, view, model4);
        normalMat3(nmat, modelView);
        gl.uniformMatrix4fv(loc.uModel, false, model4);
        gl.uniformMatrix3fv(loc.uNormalMat, false, nmat);

        gl.bindBuffer(gl.ARRAY_BUFFER, g.pos);
        gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, g.nor);
        gl.vertexAttribPointer(loc.aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, g.count);
      }
      gl.disableVertexAttribArray(loc.aNormal);
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
    // One frame straight away, so the card is never briefly empty. Under
    // reduced motion this single frame IS the effect, posed at an angle that
    // shows the shape rather than its silhouette.
    draw(reduced.matches ? 1.6 : 0);
    requestAnimationFrame(() => canvas.classList.add(s.ready));

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? play() : pause()),
      { rootMargin: "120px" },
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(reduced.matches ? 1.6 : 0);
    });
    ro.observe(host);

    const onVisibility = () => (document.hidden ? pause() : play());
    const onMotionChange = () => (reduced.matches ? (pause(), draw(1.6)) : play());
    const onLost = (e) => { e.preventDefault(); pause(); };

    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    reduced.addEventListener("change", onMotionChange);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      reduced.removeEventListener("change", onMotionChange);
      canvas.remove();
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
  }, [model, phase]);

  return <div ref={hostRef} className={s.host} aria-hidden="true" />;
}
