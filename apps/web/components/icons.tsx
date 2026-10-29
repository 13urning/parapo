import type { SVGProps } from 'react';
import type { VehicleType } from '@/lib/api/types';

/** One icon family: 1.75 stroke, round caps and joins, currentColor. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, viewBox = '0 0 24 24', children, ...rest }: IconProps & { viewBox?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const RouteIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="19" r="2.25" />
    <circle cx="18" cy="5" r="2.25" />
    <path d="M8.25 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.75" />
  </Svg>
);

export const HistoryIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5" />
    <path d="M3.5 3.5v5h5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const PesoIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7.5 20V4.5h5.25a4.25 4.25 0 0 1 0 8.5H7.5" />
    <path d="M4.5 8.5h12M4.5 11.5h12" />
  </Svg>
);

export const BellIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5" />
    <path d="M13.7 20.5a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const ShieldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5 19 6v5.5c0 4.4-2.9 7.7-7 9.5-4.1-1.8-7-5.1-7-9.5V6z" />
    <path d="m9 12 2.2 2.2L15.2 10" />
  </Svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Svg>
);

export const TrashIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7" />
    <path d="M6.5 7l.8 12.2a1.5 1.5 0 0 0 1.5 1.3h6.4a1.5 1.5 0 0 0 1.5-1.3L17.5 7" />
    <path d="M10 11v5.5M14 11v5.5" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const UserIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.75" />
    <path d="M4.5 20c.9-3.6 3.8-5.5 7.5-5.5s6.6 1.9 7.5 5.5" />
  </Svg>
);

export const ListIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 6.5h11M8 12h11M8 17.5h11" />
    <path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />
  </Svg>
);

/* ---------- Vehicles: side-on line drawings, 32px grid, nose to the right ---------- */

/** Traditional jeepney: long open-sided body, a hood up front, a rack on the roof. */
export const TraditionalJeepneyIcon = ({ size = 30, ...p }: IconProps) => (
  <Svg size={size} viewBox="0 0 32 32" {...p}>
    <path d="M3 22V11h15v5h6.2l4.3 3.4V22H3Z" />
    <path d="M7.5 11v5M12.5 11v5M3 16h15" />
    <path d="M5 8h11" />
    <circle cx="9" cy="22.5" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="23" cy="22.5" r="2.4" fill="currentColor" stroke="none" />
  </Svg>
);

/** Modern jeepney (e-jeep): rounded one-box body, a big windshield, a door seam. */
export const ModernJeepneyIcon = ({ size = 30, ...p }: IconProps) => (
  <Svg size={size} viewBox="0 0 32 32" {...p}>
    <path d="M3 22V12.5A3.5 3.5 0 0 1 6.5 9h12.6a3.5 3.5 0 0 1 2.8 1.4L27.2 17c.5.6.8 1.4.8 2.2V22H3Z" />
    <path d="M7 12.5h7.5V17H7zM20.5 11.5 24.3 17H18v-5.5" />
    <path d="M16.5 9v13" />
    <circle cx="9" cy="22.5" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="23" cy="22.5" r="2.4" fill="currentColor" stroke="none" />
  </Svg>
);

/** UV Express van: taller box, short sloped nose, a row of windows. */
export const VanIcon = ({ size = 30, ...p }: IconProps) => (
  <Svg size={size} viewBox="0 0 32 32" {...p}>
    <path d="M3 22V10.5A2.5 2.5 0 0 1 5.5 8h13.2a3 3 0 0 1 2.4 1.2L25 14.5l2.4 1.6c.4.3.6.8.6 1.3V22H3Z" />
    <path d="M7 11.5h4.5V15H7zM13.5 11.5H18V15h-4.5zM20.2 11.5l2.6 3.5h-3.1" />
    <circle cx="9" cy="22.5" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="23" cy="22.5" r="2.4" fill="currentColor" stroke="none" />
  </Svg>
);

const VEHICLE_ICONS: Record<VehicleType, (p: IconProps) => React.JSX.Element> = {
  TRADITIONAL_JEEPNEY: TraditionalJeepneyIcon,
  MODERN_JEEPNEY: ModernJeepneyIcon,
  UV_EXPRESS: VanIcon,
};

export function VehicleIcon({ type, ...p }: IconProps & { type: VehicleType }) {
  const Icon = VEHICLE_ICONS[type];
  return <Icon {...p} />;
}
