type IconProps = { className?: string };

const BASE = 'size-5 shrink-0';

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className ?? BASE}
    >
      {children}
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.2 2.4 2.4 4.6-4.9" />
    </Svg>
  );
}

export function CrossCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9.5 9.5 5 5m0-5-5 5" />
    </Svg>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 13h4l1.5 3h5L16 13h4" />
      <path d="M5.5 5h13l1.5 8v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" />
    </Svg>
  );
}

export function SignOutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
      <path d="M17 15l3-3-3-3M20 12H10" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m7 7 10 10M17 7 7 17" />
    </Svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 8.5v4" />
      <path d="M12 16h.01" />
      <circle cx="12" cy="12" r="9" />
    </Svg>
  );
}
