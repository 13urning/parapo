/** Geocoder labels run long ("Quiapo, Third District, Manila, ..."). Show the first parts; keep the full label in a title. */
export function shortPlaceLabel(label: string, parts = 2): string {
  const kept = label
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, Math.max(1, parts));
  return kept.length > 0 ? kept.join(', ') : label.trim();
}
