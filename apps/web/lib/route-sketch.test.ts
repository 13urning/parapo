import { sketchRoute } from './route-sketch';

describe('sketchRoute', () => {
  it('returns null when there is no route to draw', () => {
    expect(sketchRoute(null, 200, 64)).toBeNull();
    expect(sketchRoute([[14.6, 121]], 200, 64)).toBeNull();
  });

  it('keeps every point inside the box and starts and ends at the real endpoints', () => {
    const geometry: [number, number][] = [
      [14.6, 121.0],
      [14.61, 121.02],
      [14.63, 121.03],
      [14.65, 121.07],
    ];
    const sketch = sketchRoute(geometry, 200, 64, 10)!;
    const nums = sketch.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    for (let i = 0; i < nums.length; i += 2) {
      expect(nums[i]).toBeGreaterThanOrEqual(10 - 0.1);
      expect(nums[i]).toBeLessThanOrEqual(190 + 0.1);
      expect(nums[i + 1]).toBeGreaterThanOrEqual(10 - 0.1);
      expect(nums[i + 1]).toBeLessThanOrEqual(54 + 0.1);
    }
    // North is up: the destination (higher latitude) sits above the origin.
    expect(sketch.end[1]).toBeLessThan(sketch.start[1]);
    expect(sketch.end[0]).toBeGreaterThan(sketch.start[0]);
    expect(sketch.d.startsWith(`M${sketch.start[0]} ${sketch.start[1]}`)).toBe(true);
  });

  it('thins very long geometries but keeps the last point', () => {
    const geometry = Array.from({ length: 500 }, (_, i) => [14.5 + i * 0.001, 121 + i * 0.0005] as [number, number]);
    const sketch = sketchRoute(geometry, 200, 64, 10, 40)!;
    expect(sketch.d.split('L').length).toBeLessThanOrEqual(41);
    expect(sketch.d.endsWith(`L${sketch.end[0]} ${sketch.end[1]}`)).toBe(true);
  });

  it('does not divide by zero for a perfectly straight or single-spot route', () => {
    const sketch = sketchRoute(
      [
        [14.6, 121],
        [14.6, 121],
      ],
      200,
      64,
    )!;
    expect(sketch.d).not.toMatch(/NaN|Infinity/);
  });
});
