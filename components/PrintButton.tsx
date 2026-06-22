'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-ink text-canvas hover:bg-canvas hover:text-ink border border-ink px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center gap-2"
    >
      <Printer className="w-4 h-4" /> Print Certificate
    </button>
  );
}
