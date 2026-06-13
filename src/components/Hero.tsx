import React from 'react';
import { COPY } from '../data/copy';
import { ToothIcon, PhoneIcon, ArrowRight, ShieldCheck, ComplianceRow } from './icons';
import CallPanel from './CallPanel';

interface HeroProps {
  onStartVoiceDemo: () => void;
  onOpenRoi: () => void;
}

export default function Hero({ onStartVoiceDemo, onOpenRoi }: HeroProps) {
  const h = COPY.headline;
  return (
    <section className="section" style={{ paddingTop: 60, paddingBottom: 0, overflow: 'hidden' }}>
      <div className="grid-bg" />
      <div className="ember" style={{ width: 680, height: 680, left: '-120px', top: '-180px', opacity: 0.55 }} />
      <div className="ember" style={{ width: 520, height: 520, right: '-160px', top: '200px', opacity: 0.35 }} />

      <div className="container grid-hero">
        {/* Left — copy */}
        <div className="rise">
          <div className="eyebrow" style={{ marginBottom: 22 }}>
            <span className="dot" /> <ToothIcon size={12} /> <span>{COPY.eyebrow}</span>
          </div>

          <h1 className="display" style={{ fontSize: 'clamp(48px, 6vw, 84px)', margin: 0 }}>
            {h.pre}<br /><em>{h.em}</em><br />{h.post}
          </h1>

          <p style={{ maxWidth: 540, marginTop: 28, fontSize: 17, lineHeight: 1.6, color: 'var(--fg-dim)' }}>{COPY.sub}</p>

          <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onStartVoiceDemo}>
              <PhoneIcon size={16} /> {COPY.primary_cta}
            </button>
            <button className="btn btn-ghost" onClick={onOpenRoi}>
              {COPY.secondary_cta} <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 36, alignItems: 'center', color: 'var(--fg-dim)', fontSize: 13.5, lineHeight: 1.5 }}>
            <span style={{ color: 'var(--accent-2)', flexShrink: 0 }}><ShieldCheck size={16} /></span>
            <span>Recepcionista IA bilingüe para clínicas dentales y de ortodoncia. Lista en 48 horas, sin tarjeta.</span>
          </div>
        </div>

        {/* Right — live call panel */}
        <CallPanel />
      </div>

      {/* Compliance bar */}
      <div className="container" style={{ marginTop: 80, paddingBottom: 40 }}>
        <ComplianceRow items={COPY.footer_compliance} />
      </div>
    </section>
  );
}
