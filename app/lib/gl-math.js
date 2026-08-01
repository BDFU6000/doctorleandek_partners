// Minimal column-major 4x4 matrix maths, written out rather than pulled from a
// library. The hero scene needs perspective, a look-at camera and per-object
// TRS — that is the whole list, and it is a few hundred bytes of code against
// three.js's hundred-odd kilobytes. This site is read in Libya, often on a
// phone over a slow link, so the dependency was not worth it.
//
// Column-major, same layout WebGL's uniformMatrix4fv expects, so nothing has
// to be transposed on the way to the GPU.

export function mat4() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function perspective(out, fovY, aspect, near, far) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
  out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
  return out;
}

export function multiply(out, a, b) {
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
    out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

/** Builds translate · rotateY · rotateX · rotateZ · scale straight into `out`. */
export function compose(out, tx, ty, tz, rx, ry, rz, s) {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);

  // R = Ry · Rx · Rz
  const m00 = cy * cz + sy * sx * sz;
  const m01 = cx * sz;
  const m02 = -sy * cz + cy * sx * sz;
  const m10 = -cy * sz + sy * sx * cz;
  const m11 = cx * cz;
  const m12 = sy * sz + cy * sx * cz;
  const m20 = sy * cx;
  const m21 = -sx;
  const m22 = cy * cx;

  out[0] = m00 * s; out[1] = m01 * s; out[2] = m02 * s; out[3] = 0;
  out[4] = m10 * s; out[5] = m11 * s; out[6] = m12 * s; out[7] = 0;
  out[8] = m20 * s; out[9] = m21 * s; out[10] = m22 * s; out[11] = 0;
  out[12] = tx; out[13] = ty; out[14] = tz; out[15] = 1;
  return out;
}

/**
 * Normal matrix, the upper-left 3x3 of a modelview with each column
 * normalised. That is only the true inverse-transpose for rotation plus
 * *uniform* scale — which is all `compose` can produce, so it holds here.
 */
export function normalMat3(out, m) {
  for (let c = 0; c < 3; c++) {
    const x = m[c * 4], y = m[c * 4 + 1], z = m[c * 4 + 2];
    const len = Math.hypot(x, y, z) || 1;
    out[c * 3] = x / len; out[c * 3 + 1] = y / len; out[c * 3 + 2] = z / len;
  }
  return out;
}

/** #RRGGBB to linear-ish [r,g,b] floats. */
export function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
