import React from 'react';

// Iconos y micro-componentes reutilizables (portado de parts.jsx a TSX).

interface IconProps {
  size?: number;
}

// Lockup oficial de marca "Nova AI Voice" (mic-wave + wordmark), transparente, sin el rect de fondo.
export const Lockup = ({ height = 44 }: { height?: number }) => (
  <svg viewBox="30 32 280 84" height={height} width={(height * 280) / 84} role="img" aria-label="Nova AI Voice" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="novaWave" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#00D4FF" />
        <stop offset="55%" stopColor="#00D4FF" />
        <stop offset="100%" stopColor="#FF6B35" />
      </linearGradient>
    </defs>
    <g transform="translate(28,22)">
      <path d="M 10 56 C 16 56, 18 18, 28 18 C 38 18, 40 62, 50 62 C 60 62, 62 26, 72 26 C 80 26, 82 50, 86 50" fill="none" stroke="url(#novaWave)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 14 76 Q 48 92, 82 76" fill="none" stroke="#00D4FF" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
    </g>
    <text x="148" y="78" fill="#FFFFFF" fontFamily='"Space Grotesk", "Geist", system-ui, sans-serif' fontWeight="700" fontSize="56" letterSpacing="-1.6">Nova</text>
    <text x="150" y="108" fontFamily='"Space Grotesk", "Geist", system-ui, sans-serif' fontWeight="500" fontSize="14" letterSpacing="3">
      <tspan fill="#FF6B35">AI</tspan><tspan fill="rgba(255,255,255,0.65)" dx="6">VOICE</tspan>
    </text>
  </svg>
);

export const PhoneIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const ArrowRight = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

export const ChevDown = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ToothIcon = ({ size = 16, color = 'currentColor' }: IconProps & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c2 0 3.4 1.1 4.8 1.1 1.7 0 3.2 1.1 3.2 3.6 0 2.2-.7 4-1.1 6.3-.5 2.5-.4 6.1-2.1 6.9-1.9.7-2.4-2.2-3.2-5.5-.4-1.2-.8-1.8-1.6-1.8s-1.2.6-1.6 1.8c-.8 3.3-1.3 6.2-3.2 5.5-1.7-.8-1.6-4.4-2.1-6.9C4.7 11 4 9.3 4 7.7c0-2.5 1.5-3.6 3.2-3.6C8.6 4.1 10 3 12 3z" />
  </svg>
);

export const ShieldCheck = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const Sparkle = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.6 5.3L19 9l-5.4 1.7L12 16l-1.6-5.3L5 9l5.4-1.7L12 2z" opacity=".95" />
  </svg>
);

// Waveform de voz con N barras animadas.
export const Waveform = ({ bars = 28, height = 36, active = true }: { bars?: number; height?: number; active?: boolean }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, height }}>
    {Array.from({ length: bars }).map((_, i) => {
      const delay = (i * 0.06).toFixed(2);
      const baseHeight = 8 + Math.abs(Math.sin(i * 0.7)) * 22;
      return (
        <span
          key={i}
          className="bar"
          style={{
            height: baseHeight,
            animationDelay: `-${delay}s`,
            animationPlayState: active ? 'running' : 'paused',
            opacity: active ? 0.95 : 0.3,
            background: i % 5 === 0 ? 'var(--accent-2)' : 'var(--accent)',
          }}
        />
      );
    })}
  </div>
);

// Fila de cumplimiento (bajo el hero).
export const ComplianceRow = ({ items }: { items: string[] }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px 36px', color: 'var(--fg-faint)' }}>
    {items.map((it, i) => (
      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>
        <ShieldCheck size={13} /> {it}
      </span>
    ))}
  </div>
);

export type FeatureIconName = 'triage' | 'qualify' | 'secure' | 'bilingual' | 'clock' | 'calendar';

export const FEATURE_ICONS: FeatureIconName[] = ['triage', 'qualify', 'secure', 'bilingual', 'clock', 'calendar'];

// Icono de feature (dentro del seal).
export const FeatureIcon = ({ name, size = 22 }: { name: FeatureIconName; size?: number }) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'var(--accent-2)',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'triage':
      return <svg {...props}><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>;
    case 'qualify':
      return <svg {...props}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
    case 'secure':
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>;
    case 'bilingual':
      return <svg {...props}><path d="M5 8h7M9 5v3" /><path d="M5 14l3-6 3 6" /><path d="M14 18l3-7 3 7" /><path d="M14.5 16h5" /></svg>;
    case 'clock':
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="9" /></svg>;
  }
};
