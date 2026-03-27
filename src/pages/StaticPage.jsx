import React from 'react';
import { Link } from 'react-router-dom';
import { Moon } from 'lucide-react';

export default function StaticPage({ title, content }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_25%),linear-gradient(180deg,_#052e16_0%,_#02110a_45%,_#000000_100%)] text-white px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
              <Moon className="h-4 w-4" /> TasbeehTap
            </div>
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          <Link to="/" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10">Back Home</Link>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="prose prose-invert max-w-none whitespace-pre-line text-white/85 leading-8">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
