'use client';

import { ChevronRightIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { formatKmShort } from '@/lib/format';
import { sketchRoute } from '@/lib/route-sketch';

const W = 200;
const H = 64;

interface RouteStripProps {
  geometry: [number, number][] | null;
  distanceKm: number | null;
  estimated?: boolean;
  loading?: boolean;
  /** Phone: the strip is a button that opens the map. Laptop: the map is always open, so it is a summary. */
  interactive: boolean;
  expanded: boolean;
  onToggle: () => void;
  controlsId: string;
}

/** A slim strip that sketches the real route and reads "6.8 km · View route". */
export function RouteStrip({ geometry, distanceKm, estimated, loading, interactive, expanded, onToggle, controlsId }: RouteStripProps) {
  const sketch = sketchRoute(geometry, W, H);

  const inner = (
    <>
      {sketch ? (
        <svg className="absolute inset-y-0 left-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden="true" focusable="false">
          <path
            key={sketch.d}
            d={sketch.d}
            className="route-draw"
            pathLength={1}
            stroke="#08744C"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={sketch.start[0]} cy={sketch.start[1]} r={6} fill="#fff" stroke="#08744C" strokeWidth={3} />
          <rect x={sketch.end[0] - 5} y={sketch.end[1] - 5} width={10} height={10} rx={2.5} fill="#15181C" />
        </svg>
      ) : null}
      <span className={cn('relative ml-auto flex items-center gap-0.5 text-[13px] font-bold text-brand-dark', loading && 'animate-soft-pulse')}>
        {loading || distanceKm === null ? (
          'Finding the route…'
        ) : (
          <>
            {formatKmShort(distanceKm)}
            {!interactive && <span className="font-semibold text-ink-soft"> · {estimated ? 'estimated' : 'by road'}</span>}
            {interactive && (
              <>
                <span aria-hidden="true"> · </span>
                {expanded ? 'Hide route' : 'View route'}
                <ChevronRightIcon size={16} className={cn('transition-transform duration-200', expanded && 'rotate-90')} />
              </>
            )}
          </>
        )}
      </span>
    </>
  );

  const shared = 'relative flex h-16 w-full items-center overflow-hidden rounded-[14px] bg-mapbg pr-3.5 text-left';

  if (!interactive || loading) {
    return (
      <div className={shared} role="status" aria-live="polite">
        {inner}
      </div>
    );
  }
  return (
    <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={controlsId} className={cn(shared, 'press')}>
      {inner}
    </button>
  );
}
