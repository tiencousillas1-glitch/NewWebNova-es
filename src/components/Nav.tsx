import React from 'react';
import { COPY } from '../data/copy';
import { Lockup, ArrowRight } from './icons';

interface NavProps {
  onOpenRoi: () => void;
  onBookDemo: () => void;
}

// Ancla por cada item del nav (la "Calculadora ROI" es un botón, no ancla).
const NAV_HREFS = ['#demo', '#features', '#pricing'];

export default function Nav({ onOpenRoi, onBookDemo }: NavProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'linear-gradient(180deg, rgba(7,8,11,.85), rgba(7,8,11,.55))',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <a href="#top" style={{ display: 'inline-flex' }} aria-label="Nova AI Voice">
          <Lockup height={46} />
        </a>

        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          {COPY.nav.slice(0, 3).map((n, i) => (
            <a key={i} href={NAV_HREFS[i]} style={{ color: 'var(--fg-dim)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {n}
            </a>
          ))}
          <button
            onClick={onOpenRoi}
            style={{ color: 'var(--fg-dim)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
          >
            {COPY.nav[3]}
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'color-mix(in oklab, var(--accent) 18%, transparent)', color: 'var(--accent-2)', letterSpacing: '.12em' }}>NEW</span>
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-ghost" onClick={onBookDemo} style={{ height: 40, padding: '0 18px', fontSize: 14 }}>
            {COPY.cta_book} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
