'use client';

import { motion, type TargetAndTransition } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Fingerprint,
  Eye,
  Terminal,
  ShieldAlert,
  Bug,
  KeyRound,
  Scan,
  Radar,
  type LucideIcon,
} from 'lucide-react';

export type StickerVariant =
  | 'shield'
  | 'shield-check'
  | 'shield-alert'
  | 'lock'
  | 'warning'
  | 'fingerprint'
  | 'eye'
  | 'terminal'
  | 'bug'
  | 'key'
  | 'scan'
  | 'radar';

export type StickerSize = 'sm' | 'md' | 'lg' | 'xl';

export type StickerAnimation =
  | 'float'
  | 'pulse'
  | 'spin-slow'
  | 'bounce-subtle'
  | 'glow'
  | 'none';

interface CyberStickerProps {
  variant: StickerVariant;
  size?: StickerSize;
  animation?: StickerAnimation;
  className?: string;
  label?: string;
  showLabel?: boolean;
}

const iconMap: Record<StickerVariant, LucideIcon> = {
  shield: Shield,
  'shield-check': ShieldCheck,
  'shield-alert': ShieldAlert,
  lock: Lock,
  warning: AlertTriangle,
  fingerprint: Fingerprint,
  eye: Eye,
  terminal: Terminal,
  bug: Bug,
  key: KeyRound,
  scan: Scan,
  radar: Radar,
};

const sizeMap: Record<StickerSize, { icon: number; container: string; text: string }> = {
  sm: { icon: 16, container: 'w-8 h-8', text: 'text-[9px]' },
  md: { icon: 20, container: 'w-10 h-10', text: 'text-[10px]' },
  lg: { icon: 24, container: 'w-12 h-12', text: 'text-xs' },
  xl: { icon: 32, container: 'w-16 h-16', text: 'text-sm' },
};

const animationVariants: Record<StickerAnimation, TargetAndTransition> = {
  float: {
    y: [0, -6, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
  },
  pulse: {
    scale: [1, 1.08, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
  'spin-slow': {
    rotate: [0, 360],
    transition: { duration: 8, repeat: Infinity, ease: 'linear' as const },
  },
  'bounce-subtle': {
    y: [0, -3, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
  glow: {
    boxShadow: [
      '0 0 0px rgba(5, 125, 188, 0)',
      '0 0 20px rgba(5, 125, 188, 0.3)',
      '0 0 0px rgba(5, 125, 188, 0)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
  none: {},
};

export default function CyberSticker({
  variant,
  size = 'md',
  animation = 'none',
  className = '',
  label,
  showLabel = false,
}: CyberStickerProps) {
  const Icon = iconMap[variant];
  const { icon: iconSize, container, text } = sizeMap[size];

  return (
    <motion.div
      className={`inline-flex flex-col items-center gap-1 ${className}`}
      animate={animationVariants[animation]}
    >
      <div
        className={`${container} border border-ink bg-canvas-soft flex items-center justify-center relative`}
      >
        <Icon className="text-ink" size={iconSize} strokeWidth={1.5} />
        <div className="absolute -top-px -left-px w-1.5 h-1.5 border-t border-l border-ink" />
        <div className="absolute -top-px -right-px w-1.5 h-1.5 border-t border-r border-ink" />
        <div className="absolute -bottom-px -left-px w-1.5 h-1.5 border-b border-l border-ink" />
        <div className="absolute -bottom-px -right-px w-1.5 h-1.5 border-b border-r border-ink" />
      </div>
      {showLabel && label && (
        <span className={`${text} font-sans font-bold uppercase tracking-widest text-body`}>
          {label}
        </span>
      )}
    </motion.div>
  );
}

export function CyberBadge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-ink bg-canvas-soft px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-widest text-ink ${className}`}
    >
      {children}
    </span>
  );
}

export function CyberStickerRow({ className = '' }: { className?: string }) {
  const stickers: { variant: StickerVariant; label: string }[] = [
    { variant: 'shield-check', label: 'Protected' },
    { variant: 'lock', label: 'Encrypted' },
    { variant: 'scan', label: 'Monitored' },
    { variant: 'radar', label: 'Active' },
  ];

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {stickers.map((s) => (
        <CyberSticker
          key={s.variant}
          variant={s.variant}
          size="sm"
          animation="float"
          label={s.label}
          showLabel
        />
      ))}
    </div>
  );
}
