import React from 'react';
import { COPY } from '../data/copy';
import IntakeForm, { IntakeData } from './IntakeForm';

interface FinalCTAProps {
  onSubmit: (data: IntakeData) => Promise<boolean>;
}

export default function FinalCTA({ onSubmit }: FinalCTAProps) {
  const ft = COPY.final_title;
  return (
    <section className="section" id="apply" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="ember" style={{ width: 680, height: 520, left: '-160px', bottom: '-160px', opacity: 0.45 }} />
      <div className="container grid-hero">
        <div>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            <span className="dot" /> <span>{COPY.final_kicker}</span>
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(40px,4.6vw,64px)', margin: '0 0 22px' }}>
            {ft.pre} <em>{ft.em}</em> {ft.post}
          </h2>
          <p style={{ color: 'var(--fg-dim)', fontSize: 17, lineHeight: 1.6, maxWidth: 520 }}>{COPY.final_sub}</p>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
            {COPY.final_steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line-2)' }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 99,
                    background: 'color-mix(in oklab, var(--accent) 22%, transparent)',
                    border: '1px solid color-mix(in oklab, var(--accent) 50%, transparent)',
                    color: 'var(--accent-2)',
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: 14.5, color: 'var(--fg)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <IntakeForm onSubmit={onSubmit} />
      </div>
    </section>
  );
}
