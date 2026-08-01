"use client";

import { useState, useRef, useEffect } from "react";
import s from "./Faq.module.css";

/*
  Network positions for 6 nodes in a web topology.
  Values are percentages of the container (0–100).
  Arranged so no two nodes overlap and edges cross naturally like a network.
*/
const POSITIONS = [
  { x: 50, y:  8 },  // 0 — top centre
  { x: 88, y: 32 },  // 1 — right upper
  { x: 78, y: 72 },  // 2 — right lower
  { x: 50, y: 90 },  // 3 — bottom centre
  { x: 22, y: 72 },  // 4 — left lower
  { x: 12, y: 32 },  // 5 — left upper
];

/* Edges: pairs of node indices that are connected. */
const EDGES = [
  [0, 1], [0, 5],
  [1, 2], [1, 3],
  [2, 3], [2, 4],
  [3, 4], [4, 5],
  [5, 0], [0, 3],
  [1, 4],
];

export default function Faq({ items }) {
  const [active, setActive] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 700, h: 520 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      setSize({ w, h: Math.max(420, w * 0.72) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;

  /* Convert percentage positions to pixel coords. */
  const px = (node) => ({
    x: (node.x / 100) * w,
    y: (node.y / 100) * h,
  });

  return (
    <div className={s.network} ref={containerRef} style={{ height: h }}>
      <svg
        className={s.edges}
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        {EDGES.map(([a, b], i) => {
          const pa = px(POSITIONS[a]);
          const pb = px(POSITIONS[b]);
          const isLit = active === a || active === b;
          return (
            <line
              key={i}
              x1={pa.x} y1={pa.y}
              x2={pb.x} y2={pb.y}
              className={`${s.edge} ${isLit ? s.edgeLit : ""}`}
            />
          );
        })}
      </svg>

      {items.slice(0, 6).map((f, i) => {
        const pos = POSITIONS[i];
        const isActive = active === i;
        return (
          <div
            key={f.q}
            className={`${s.node} ${isActive ? s.nodeActive : ""}`}
            data-reveal=""
            style={{ "--nx": `${pos.x}%`, "--ny": `${pos.y}%`, "--i": i }}
          >
            <button
              type="button"
              className={s.nodeDot}
              aria-expanded={isActive}
              onClick={() => setActive(isActive ? null : i)}
            >
              <span className={s.nodeNum}>{String(i + 1).padStart(2, "0")}</span>
            </button>
            <div className={`${s.nodeCard} ${isActive ? s.nodeCardOpen : ""}`}>
              <p className={s.nodeQ}>{f.q}</p>
              <p className={s.nodeA}>{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
