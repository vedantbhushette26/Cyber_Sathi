'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Scan,
  Radar,
  AlertTriangle,
  Fingerprint,
  Eye,
  Terminal,
  Shield,
} from 'lucide-react';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const floatAnim = {
  y: [0, -6, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
};

const pulseAnim = {
  scale: [1, 1.1, 1],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
};

export function HeroStickers() {
  return (
    <motion.div
      className="absolute top-6 right-6 hidden lg:flex flex-col gap-3"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {[
        { icon: ShieldCheck, label: 'SECURED', delay: 0 },
        { icon: Lock, label: 'ENCRYPTED', delay: 0.2 },
        { icon: Radar, label: 'ACTIVE', delay: 0.4 },
      ].map(({ icon: Icon, label, delay }) => (
        <motion.div
          key={label}
          variants={fadeUp}
          className="flex items-center gap-2 border border-hairline bg-canvas-soft/80 backdrop-blur-sm px-3 py-1.5"
        >
          <motion.div animate={floatAnim} transition={{ delay }}>
            <Icon size={14} className="text-link" strokeWidth={1.5} />
          </motion.div>
          <span className="text-[9px] font-sans font-bold tracking-widest text-body uppercase">
            {label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function FeatureStickers() {
  const stickers = [
    { icon: Eye, label: 'IDENTIFY', variant: 'warning' as const },
    { icon: Scan, label: 'INSPECT', variant: 'scan' as const },
    { icon: Shield, label: 'RECTIFY', variant: 'shield' as const },
  ];

  return (
    <motion.div
      className="flex justify-center gap-8 md:gap-16 mb-8"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
    >
      {stickers.map(({ icon: Icon, label }) => (
        <motion.div
          key={label}
          variants={fadeUp}
          className="flex flex-col items-center gap-2"
        >
          <motion.div
            className="w-12 h-12 border border-ink bg-canvas-soft flex items-center justify-center relative"
            whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(5, 125, 188, 0.2)' }}
            animate={pulseAnim}
          >
            <Icon size={22} className="text-ink" strokeWidth={1.5} />
            <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-ink" />
            <div className="absolute -top-px -right-px w-2 h-2 border-t border-r border-ink" />
            <div className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-ink" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-ink" />
          </motion.div>
          <span className="text-[9px] font-sans font-bold tracking-widest text-body uppercase">
            {label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function ThreatBanner() {
  return (
    <motion.div
      className="border-y border-hairline bg-canvas-soft py-3 px-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-[10px] font-sans font-bold tracking-widest uppercase text-body">
        <motion.span
          className="flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertTriangle size={12} className="text-link" />
          THREAT LEVEL: ELEVATED
        </motion.span>
        <span className="text-hairline">|</span>
        <span className="flex items-center gap-2">
          <Fingerprint size={12} className="text-link" />
          256-BIT ENCRYPTION
        </span>
        <span className="text-hairline hidden sm:inline">|</span>
        <span className="hidden sm:flex items-center gap-2">
          <Terminal size={12} className="text-link" />
          REAL-TIME SCANNING
        </span>
      </div>
    </motion.div>
  );
}

export function SecurityFooter() {
  const items = [
    { icon: ShieldCheck, text: 'Zero Trust Architecture' },
    { icon: Lock, text: 'End-to-End Encryption' },
    { icon: Eye, text: 'Continuous Monitoring' },
    { icon: Radar, text: '24/7 Threat Detection' },
  ];

  return (
    <motion.div
      className="border-t border-hairline py-8 px-6"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, text }) => (
          <motion.div
            key={text}
            variants={fadeUp}
            className="flex items-center gap-3 text-body"
          >
            <div className="w-8 h-8 border border-hairline bg-canvas-soft flex items-center justify-center shrink-0">
              <Icon size={14} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
              {text}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
