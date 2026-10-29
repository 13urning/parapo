export interface RouteSketch {
  /** SVG path data, "M x y L x y ...". */
  d: string;
  start: [number, number];
  end: [number, number];
}

/**
 * Fits the real route geometry ([lat, lng] pairs) into a `width` x `height` box so the route strip
 * shows the actual shape of the trip, not a stock squiggle. Longitude is scaled by cos(latitude)
 * so the shape is not stretched. Returns null when there is nothing to draw.
 */
export function sketchRoute(
  geometry: [number, number][] | null | undefined,
  width: number,
  height: number,
  pad = 10,
  maxPoints = 48,
): RouteSketch | null {
  if (!geometry || geometry.length < 2) return null;

  const meanLat = geometry.reduce((s, p) => s + p[0], 0) / geometry.length;
  const k = Math.cos((meanLat * Math.PI) / 180);
  const pts = geometry.map(([lat, lng]) => [lng * k, -lat] as [number, number]);

  // Even sampling that always keeps the first and last point.
  const step = Math.max(1, Math.ceil((pts.length - 1) / (maxPoints - 1)));
  const sampled = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);

  const xs = sampled.map((p) => p[0]);
  const ys = sampled.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const dx = Math.max(...xs) - minX;
  const dy = Math.max(...ys) - minY;
  const innerW = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);
  const scale = Math.min(dx > 0 ? innerW / dx : Infinity, dy > 0 ? innerH / dy : Infinity);
  const s = Number.isFinite(scale) ? scale : 1;
  const offX = pad + (innerW - dx * s) / 2;
  const offY = pad + (innerH - dy * s) / 2;

  const r = (n: number) => Math.round(n * 10) / 10;
  const mapped = sampled.map(([x, y]) => [r(offX + (x - minX) * s), r(offY + (y - minY) * s)] as [number, number]);

  return {
    d: mapped.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' '),
    start: mapped[0],
    end: mapped[mapped.length - 1],
  };
}
