'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Fingerprint, Award, Sparkles } from 'lucide-react';

export default function CertificateAnimations() {
  return (
    <div className="flex justify-center gap-6 mb-8">
      {[
        { icon: ShieldCheck, label: 'VERIFIED' },
        { icon: Lock, label: 'SECURED' },
        { icon: Fingerprint, label: 'AUTHENTIC' },
      ].map(({ icon: Icon, label }, idx) => (
        <motion.div
          key={label}
          className="flex items-center gap-2 border border-hairline bg-canvas px-3 py-1.5"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.15 }}
          whileHover={{ scale: 1.05, borderColor: 'var(--color-link)' }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
          >
            <Icon size={12} className="text-link" strokeWidth={1.5} />
          </motion.div>
          <span className="text-[9px] font-sans font-bold tracking-widest text-body uppercase">
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function AnimatedSeal() {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <div className="w-20 h-20 border-2 border-ink flex items-center justify-center relative">
        <motion.div
          className="absolute inset-0 border border-dashed border-link/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div className="border border-ink border-dashed w-full h-full flex flex-col items-center justify-center p-1 bg-canvas relative z-10">
          <Award size={16} className="text-ink mb-1" />
          <span className="text-[7px] tracking-tighter font-bold">SECURED</span>
        </div>
      </div>
    </motion.div>
  );
}

export function SuccessBadge() {
  return (
    <motion.div
      className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Sparkles size={14} className="text-green-600" />
      </motion.div>
      <span className="text-xs font-sans font-bold text-green-700 uppercase tracking-wider">
        Certificate Verified
      </span>
    </motion.div>
  );
}
