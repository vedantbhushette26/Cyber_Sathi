'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Target, Award } from 'lucide-react';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface StatsCardsProps {
  accuracy: number;
  sessions: number;
  scenarios: number;
}

export function StatsCards({ accuracy, sessions, scenarios }: StatsCardsProps) {
  const stats = [
    {
      label: 'Phishing Detection Index',
      value: `${accuracy}%`,
      icon: Target,
      description: 'Your overall detection accuracy across all evaluated communication elements.',
      color: accuracy >= 70 ? 'text-green-600' : accuracy >= 40 ? 'text-yellow-600' : 'text-red-600',
    },
    {
      label: 'Completed Trials',
      value: sessions,
      icon: TrendingUp,
      description: 'Total simulation runs completed (3-4 phishing/legitimate scenarios per run).',
      color: 'text-link',
    },
    {
      label: 'Threats Evaluated',
      value: scenarios,
      icon: ShieldCheck,
      description: 'Total number of communication headers, links, and forms checked.',
      color: 'text-ink',
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {stats.map(({ label, value, icon: Icon, description, color }) => (
        <motion.div
          key={label}
          variants={fadeUp}
          className="border border-hairline p-8 flex flex-col justify-between cyber-sticker-hover"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-body font-sans">
              {label}
            </span>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon size={16} className={color} strokeWidth={1.5} />
            </motion.div>
          </div>
          <div className="my-4">
            <motion.span
              className="font-display text-5xl md:text-6xl font-light"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {value}
            </motion.span>
          </div>
          <p className="text-xs text-body font-sans leading-relaxed">
            {description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function DashboardHeader() {
  return (
    <motion.div
      className="border-b-2 border-ink pb-6 mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-link font-sans block mb-1">
          Defender Command // Overview
        </span>
        <h1 className="font-display text-4xl font-light uppercase tracking-tight text-ink">
          Training Dashboard
        </h1>
      </div>
      <motion.div
        className="flex items-center gap-3"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2 border border-hairline bg-canvas-soft px-3 py-1.5">
          <ShieldCheck size={12} className="text-link" />
          <span className="text-[9px] font-sans font-bold tracking-widest text-body uppercase">
            STATUS: ACTIVE
          </span>
        </div>
        <a
          href="/training"
          className="bg-ink text-canvas hover:bg-canvas hover:text-ink border border-ink px-8 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-200 text-center inline-block"
        >
          Start New Training Session
        </a>
      </motion.div>
    </motion.div>
  );
}

export function CertificateBadge({ level, code }: { level: string; code: string }) {
  return (
    <motion.div
      className="flex items-center gap-2 border border-ink bg-canvas-soft px-3 py-2"
      whileHover={{ scale: 1.02, boxShadow: '0 0 10px rgba(5, 125, 188, 0.15)' }}
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Award size={16} className="text-link" strokeWidth={1.5} />
      </motion.div>
      <div className="flex flex-col">
        <span className="text-[9px] font-sans font-bold tracking-widest text-body uppercase">
          {level}
        </span>
        <span className="text-[8px] font-mono text-body">
          ID: {code}
        </span>
      </div>
    </motion.div>
  );
}
