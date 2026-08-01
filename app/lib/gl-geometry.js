// Geometry builders for the hero scene.
//
// Every builder returns non-indexed triangle soup — { position, normal, count }
// — because each mesh here is a few hundred triangles and uploaded once at
// startup. Indexing would save memory the page never runs short of, and
// non-indexed lets a builder pick flat or smooth normals per shape, which is
// the whole visual difference between "faceted crystal" and "soft capsule".
//
// The shapes are not arbitrary. The crescent is the medical mark, the capsule
// reads as pharmacy, the ring as the delivery loop, the crystal is the neutral
// filler that keeps the set from looking like a literal icon soup.

/** Flat per-face normals from a flat [x,y,z, x,y,z, ...] triangle list. */
function flatNormals(pos) {
  const n = new Float32Array(pos.length);
  for (let i = 0; i < pos.length; i += 9) {
    const ax = pos[i + 3] - pos[i], ay = pos[i + 4] - pos[i + 1], az = pos[i + 5] - pos[i + 2];
    const bx = pos[i + 6] - pos[i], by = pos[i + 7] - pos[i + 1], bz = pos[i + 8] - pos[i + 2];
    let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;
    for (let k = 0; k < 3; k++) {
      n[i + k * 3] = nx; n[i + k * 3 + 1] = ny; n[i + k * 3 + 2] = nz;
    }
  }
  return n;
}

function mesh(pos, nor) {
  const position = pos instanceof Float32Array ? pos : new Float32Array(pos);
  return {
    position,
    normal: nor ? (nor instanceof Float32Array ? nor : new Float32Array(nor)) : flatNormals(position),
    count: position.length / 3,
  };
}

/* ── Faceted crystal ───────────────────────────────────────────────────────
   An icosahedron, optionally subdivided and re-projected onto the sphere.
   `subdiv:0` is the 20-face crystal; `subdiv:2` with smooth normals is a
   perfectly good sphere. Flat normals are the default because the flat facets
   catch the rim light one plane at a time, which is what sells the depth. */
export function icosahedron(subdiv = 0, smooth = false) {
  const t = (1 + Math.sqrt(5)) / 2;
  const v = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(([x, y, z]) => {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  });
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  let tris = faces.map((f) => f.map((i) => v[i]));
  const mid = (a, b) => {
    const m = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const l = Math.hypot(m[0], m[1], m[2]);
    return [m[0] / l, m[1] / l, m[2] / l];
  };
  for (let s = 0; s < subdiv; s++) {
    const next = [];
    for (const [a, b, c] of tris) {
      const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
      next.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]);
    }
    tris = next;
  }

  const pos = [];
  for (const tri of tris) for (const p of tri) pos.push(p[0], p[1], p[2]);
  // On a unit sphere the position *is* the smooth normal.
  return mesh(pos, smooth ? pos.slice() : null);
}

/* ── Capsule ───────────────────────────────────────────────────────────────
   A cylinder capped by two hemispheres, built as one lat/long sweep so the
   seam between barrel and cap never shows. Smooth normals throughout. */
export function capsule(radius = 0.5, height = 1.2, seg = 28, rings = 10) {
  const half = height / 2;
  const pos = [], nor = [];
  // Latitude runs -1..1; the barrel is inserted at the equator by offsetting
  // y by ±half on either side, so one loop covers cap-barrel-cap.
  const point = (i, j) => {
    const phi = (j / (rings * 2)) * Math.PI; // 0..PI top to bottom
    const theta = (i / seg) * Math.PI * 2;
    const ny = Math.cos(phi);
    const r = Math.sin(phi);
    const nx = r * Math.cos(theta), nz = r * Math.sin(theta);
    const y = ny * radius + (ny >= 0 ? half : -half);
    return [[nx * radius, y, nz * radius], [nx, ny, nz]];
  };
  for (let j = 0; j < rings * 2; j++) {
    for (let i = 0; i < seg; i++) {
      const a = point(i, j), b = point(i + 1, j), c = point(i + 1, j + 1), d = point(i, j + 1);
      for (const p of [a, b, c, a, c, d]) {
        pos.push(p[0][0], p[0][1], p[0][2]);
        nor.push(p[1][0], p[1][1], p[1][2]);
      }
    }
  }
  return mesh(pos, nor);
}

/* ── Ring ──────────────────────────────────────────────────────────────────
   A torus. Reads as the delivery loop, and being the one non-convex shape it
   gives the cluster a silhouette that is not just blobs. */
export function torus(R = 0.75, r = 0.24, seg = 44, sides = 18) {
  const pos = [], nor = [];
  const point = (i, j) => {
    const u = (i / seg) * Math.PI * 2;
    const w = (j / sides) * Math.PI * 2;
    const cu = Math.cos(u), su = Math.sin(u);
    const cw = Math.cos(w), sw = Math.sin(w);
    return [
      [(R + r * cw) * cu, r * sw, (R + r * cw) * su],
      [cw * cu, sw, cw * su],
    ];
  };
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < sides; j++) {
      const a = point(i, j), b = point(i + 1, j), c = point(i + 1, j + 1), d = point(i, j + 1);
      // a,d,c,a,c,b — the reverse of the capsule's winding, because sweeping
      // the tube angle flips the face orientation relative to sweeping a
      // latitude. Getting this backwards makes back-face culling eat the ring.
      for (const p of [a, d, c, a, c, b]) {
        pos.push(p[0][0], p[0][1], p[0][2]);
        nor.push(p[1][0], p[1][1], p[1][2]);
      }
    }
  }
  return mesh(pos, nor);
}

/* ── Extruded crescent ─────────────────────────────────────────────────────
   The medical mark, given depth. This replaced an extruded cross: the audience
   is Libyan and Muslim, and the crescent — the Red Crescent's own emblem — is
   the right symbol for them. There is no cross anywhere in this file.

   A crescent is a lune: the part of one circle left over after a second,
   offset circle is removed. Rather than boolean two circles, both boundary
   arcs are sampled with the same number of points and stitched into a triangle
   strip, which fills the shape without needing a general polygon triangulator
   and cannot produce the sliver triangles an ear-clipper would leave at the
   horns.

   `bite` is how far the inner circle is pushed toward the upper right, so the
   horns open that way — matching the orientation of the red crescent render. */
export function crescentPrism(R = 0.95, r = 0.82, bite = 0.44, depth = 0.24, seg = 40) {
  const C2 = [bite * 0.82, bite * 0.58];
  const d = Math.hypot(C2[0], C2[1]);

  // Circle intersection. `a` is the distance from C1 along the centre line to
  // the radical line; `h` is the half-chord.
  const a = (d * d - r * r + R * R) / (2 * d);
  const h = Math.sqrt(Math.max(0, R * R - a * a));
  const ux = C2[0] / d, uy = C2[1] / d;
  const px = a * ux, py = a * uy;
  const A = [px + h * uy, py - h * ux];
  const B = [px - h * uy, py + h * ux];

  // For each circle, pick the arc that actually bounds the crescent: on the
  // outer circle that is the arc pointing away from C2, on the inner circle the
  // one that falls inside C1. Choosing by testing the midpoint is shorter than
  // reasoning about angle ranges, and it cannot get the case backwards.
  const arc = (c, rad, from, to, keep) => {
    let a0 = Math.atan2(from[1] - c[1], from[0] - c[0]);
    let a1 = Math.atan2(to[1] - c[1], to[0] - c[0]);
    let delta = a1 - a0;
    while (delta <= -Math.PI) delta += Math.PI * 2;
    while (delta > Math.PI) delta -= Math.PI * 2;
    const mid = (t) => [c[0] + rad * Math.cos(a0 + t), c[1] + rad * Math.sin(a0 + t)];
    if (!keep(mid(delta / 2))) delta += delta > 0 ? -Math.PI * 2 : Math.PI * 2;
    const out = [];
    for (let i = 0; i < seg; i++) out.push(mid((delta * i) / (seg - 1)));
    return out;
  };

  const outer = arc([0, 0], R, A, B, (p) => Math.hypot(p[0] - C2[0], p[1] - C2[1]) > r);
  const inner = arc(C2, r, A, B, (p) => Math.hypot(p[0], p[1]) < R);

  // Signed area of the closed outline decides the winding, so front faces end
  // up pointing at +z whichever way the arcs happened to run.
  const ring = [...outer, ...inner.slice().reverse()];
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i], q = ring[(i + 1) % ring.length];
    area += p[0] * q[1] - q[0] * p[1];
  }
  const flip = area < 0;

  const pos = [];
  const tri = (p, q, s) => {
    if (flip) [q, s] = [s, q];
    pos.push(p[0], p[1], p[2], q[0], q[1], q[2], s[0], s[1], s[2]);
  };
  const at = (p, z) => [p[0], p[1], z];

  for (let i = 0; i < seg - 1; i++) {
    const o0 = outer[i], o1 = outer[i + 1], i0 = inner[i], i1 = inner[i + 1];
    // Front cap (+z), then the back cap with its winding reversed.
    tri(at(o0, depth), at(o1, depth), at(i1, depth));
    tri(at(o0, depth), at(i1, depth), at(i0, depth));
    tri(at(i1, -depth), at(o1, -depth), at(o0, -depth));
    tri(at(i0, -depth), at(i1, -depth), at(o0, -depth));
  }

  for (let i = 0; i < ring.length; i++) {
    const p = ring[i], q = ring[(i + 1) % ring.length];
    tri(at(p, depth), at(p, -depth), at(q, -depth));
    tri(at(p, depth), at(q, -depth), at(q, depth));
  }

  return mesh(pos); // flat normals — a prism has no smooth surfaces
}
