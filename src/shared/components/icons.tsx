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

export function QuestionIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.4" />
      <path d="M12 17h.01" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
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

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10-1.4 1.4" />
    </Svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </Svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
      <path d="M13.7 19a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m7 10 5 5 5-5" />
    </Svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </Svg>
  );
}

export function BadgeCheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 2.2 1.6 2.7-.2.8 2.6 2.2 1.6-1 2.5 1 2.5-2.2 1.6-.8 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.8-2.6L4.1 15.4l1-2.5-1-2.5 2.2-1.6.8-2.6 2.7.2z" />
      <path d="m9.5 12 1.8 1.8 3.2-3.4" />
    </Svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 5.5 6v5.5c0 4 2.7 7.2 6.5 8.5 3.8-1.3 6.5-4.5 6.5-8.5V6z" />
      <path d="m9.5 12 1.8 1.8 3.4-3.6" />
    </Svg>
  );
}

export function IdCardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="1.8" />
      <path d="M6.2 16a3 3 0 0 1 5.6 0M14 10h4M14 13.5h4" />
    </Svg>
  );
}

function FilledSvg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className ?? BASE}>
      {children}
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <FilledSvg {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.1v2.3H7.6V13h2.7v8z" />
    </FilledSvg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <FilledSvg {...props}>
      <path d="M6.94 8.5H4.2V20h2.74zM5.57 3.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2M20 13.6c0-3-1.6-4.4-3.74-4.4-1.72 0-2.49.95-2.92 1.61V8.5H10.6c.04.78 0 11.5 0 11.5h2.74v-6.42c0-.25.02-.49.09-.67.2-.49.65-1 1.4-1 1 0 1.4.75 1.4 1.85V20H19z" />
    </FilledSvg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <FilledSvg {...props}>
      <path d="M12 3a9 9 0 0 0-7.7 13.65L3 21l4.5-1.25A9 9 0 1 0 12 3m0 1.7a7.3 7.3 0 1 1-3.75 13.56l-.27-.16-2.3.63.64-2.24-.18-.29A7.3 7.3 0 0 1 12 4.7m-3.3 3.5c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.54 2.02.78 2.43.63 2.87.59.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28s-1.42-.7-1.64-.78c-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41z" />
    </FilledSvg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.2 9h17.6M3.2 15h17.6" />
      <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.4-3.3-9s1.1-6.6 3.3-9" />
    </Svg>
  );
}
