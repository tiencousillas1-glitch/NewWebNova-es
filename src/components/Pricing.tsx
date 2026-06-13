import React, { useState } from 'react';
import { COPY } from '../data/copy';
import { ShieldCheck } from './icons';

interface PricingProps {
  onBookDemo: () => void;
}

export default function Pricing({ onBookDemo }: PricingProps) {
  const [yearly, setYearly] = useState(false);
  const pt = COPY.pricing_title;

  return (
    <section className="section" id="pricing" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
          <div className="kicker">{COPY.pricing_kicker}</div>
          <h2 className="display" style={{ fontSize: 'clamp(38px,4.4vw,60px)', marginTop: 18, marginBottom: 18 }}>
            {pt.pre} <em>{pt.em}</em> {pt.post}
          </h2>
          <p style={{ color: 'var(--fg-dim)', fontSize: 16, lineHeight: 1.6 }}>{COPY.pricing_sub}</p>

          <div style={{ display: 'inline-flex', marginTop: 28, padding: 4, border: '1px solid var(--line-2)', borderRadius: 999, gap: 2 }}>
            {['monthly', 'yearly'].map((k, i) => (
              <button
                key={k}
                onClick={() => setYearly(i === 1)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  border: 0,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: yearly === (i === 1) ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: yearly === (i === 1) ? 'var(--fg)' : 'var(--fg-faint)',
                  fontFamily: 'var(--mono)',
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                }}
              >
                {k === 'monthly' ? 'Mensual' : 'Anual · −20%'}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 26 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 999, border: '1px solid color-mix(in oklab, var(--accent) 30%, var(--line))', background: 'rgba(59,130,246,0.08)', fontSize: 13.5, color: 'var(--fg-dim)', lineHeight: 1.4 }}>
              <span style={{ color: 'var(--accent-2)', display: 'inline-flex', flexShrink: 0 }}><ShieldCheck size={15} /></span>
              <span><strong style={{ color: 'var(--fg)', fontWeight: 600 }}>$297 de configuración inicial</strong> (pago único) · prueba en vivo de 14 días incluida</span>
            </span>
          </div>
        </div>

        <div className="grid-3" style={{ gap: 24 }}>
          {COPY.plans.map((p, i) => {
            const price = yearly ? Math.round(p.price * 0.8) : p.price;
            return (
              <div
                key={i}
                className={`lg ${p.popular ? 'ring-accent' : ''}`}
                style={{
                  borderRadius: 20,
                  padding: 32,
                  position: 'relative',
                  overflow: p.popular ? 'visible' : undefined,
                  background: p.popular ? 'linear-gradient(180deg, rgba(59,130,246,0.08), rgba(255,255,255,0.02))' : 'rgba(255,255,255,0.02)',
                }}
              >
                {p.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 2,
                      background: 'linear-gradient(180deg, var(--accent-soft), var(--accent))',
                      color: 'var(--on-accent)',
                      padding: '6px 18px',
                      borderRadius: 999,
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '.18em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 8px 24px -8px var(--accent)',
                    }}
                  >
                    ★ Más elegido
                  </div>
                )}
                <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 28, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{p.name}</h3>
                <p style={{ margin: '0 0 22px', fontSize: 13.5, color: 'var(--fg-dim)', lineHeight: 1.5, minHeight: 42 }}>{p.blurb}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 60, fontWeight: 500, letterSpacing: '-0.03em' }}>${price}</span>
                  <span style={{ color: 'var(--fg-faint)', fontSize: 14 }}>/mes</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-faint)', marginBottom: 24, fontFamily: 'var(--mono)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
                  {yearly ? 'facturado anualmente' : 'facturado mensual'}
                </div>
                <button className={`btn ${p.popular ? 'btn-primary' : 'btn-ghost'}`} onClick={onBookDemo} style={{ width: '100%', justifyContent: 'center' }}>
                  {p.popular ? 'Empezar prueba 14 días' : 'Elegir plan'}
                </button>
                <hr className="hr-faint" style={{ margin: '24px 0' }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {p.bullets.map((b, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--fg-dim)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--accent-2)', flexShrink: 0, marginTop: 2 }}><ShieldCheck size={14} /></span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
