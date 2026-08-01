// Geometry builders for the hero scene.
//
// Every builder returns non-indexed triangle soup — { position, normal, count }
// — because each mesh here is a few hundred triangles and uploaded once at
// startup. Indexing would save memory the page never runs short of, and
// non-indexed lets a builder pick flat or smooth normals per shape, which is
// the whole visual difference between "faceted crystal" and "soft capsule".
//
// The shapes are not arbitrary. The cross is the brand mark, the capsule reads
// as pharmacy, the ring as the delivery loop, the crystal is the neutral filler
// that keeps the cluster from looking like a literal icon soup.

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

/* ── Extruded medical cross ────────────────────────────────────────────────
   The brand mark given depth. The caps are triangulated as five disjoint
   quads (centre plus four arms) rather than two overlapping bars, because two
   coplanar overlapping quads z-fight in the middle of the shape — exactly
   where the eye is. */
export function crossPrism(arm = 0.85, w = 0.3, depth = 0.26) {
  const L = arm, d = depth;
  const outline = [
    [L, -w], [L, w], [w, w], [w, L], [-w, L], [-w, w],
    [-L, w], [-L, -w], [-w, -w], [-w, -L], [w, -L], [w, -w],
  ];
  const quads = [
    [[-w, -w], [w, -w], [w, w], [-w, w]],   // centre
    [[w, -w], [L, -w], [L, w], [w, w]],     // +x arm
    [[-L, -w], [-w, -w], [-w, w], [-L, w]], // -x arm
    [[-w, w], [w, w], [w, L], [-w, L]],     // +y arm
    [[-w, -L], [w, -L], [w, -w], [-w, -w]], // -y arm
  ];

  const pos = [];
  const tri = (a, b, c) => pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);

  for (const q of quads) {
    const f = q.map(([x, y]) => [x, y, d]);
    tri(f[0], f[1], f[2]); tri(f[0], f[2], f[3]);
    const b = q.map(([x, y]) => [x, y, -d]).reverse(); // reversed to face -z
    tri(b[0], b[1], b[2]); tri(b[0], b[2], b[3]);
  }
  for (let i = 0; i < outline.length; i++) {
    const [x1, y1] = outline[i];
    const [x2, y2] = outline[(i + 1) % outline.length];
    const a = [x1, y1, d], b = [x2, y2, d], c = [x2, y2, -d], e = [x1, y1, -d];
    tri(a, e, c); tri(a, c, b);
  }
  return mesh(pos); // flat normals — a prism has no smooth surfaces
}
