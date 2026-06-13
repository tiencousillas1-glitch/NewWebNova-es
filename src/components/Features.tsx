import React from 'react';
import { COPY } from '../data/copy';
import { FeatureIcon, FEATURE_ICONS } from './icons';

export default function Features() {
  const ft = COPY.features_title;
  return (
    <section className="section" id="features">
      <div className="ember" style={{ width: 520, height: 520, right: '-200px', top: '10%', opacity: 0.25 }} />
      <div className="container">
        <div style={{ maxWidth: 820, marginBottom: 64 }}>
          <div className="kicker">{COPY.features_kicker}</div>
          <h2 className="display" style={{ fontSize: 'clamp(40px, 4.6vw, 64px)', marginTop: 18, marginBottom: 0 }}>
            {ft.pre} <em>{ft.em}</em> {ft.post}
          </h2>
        </div>

        <div className="grid-3" style={{ gap: 1, border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden', background: 'var(--line)' }}>
          {COPY.features.map((f, i) => (
            <div key={i} className="lg" style={{ padding: 32, borderRadius: 0, background: 'var(--bg-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div className="seal"><FeatureIcon name={FEATURE_ICONS[i]} /></div>
                <span className="cap">{f.tag}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1.15 }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: 'var(--fg-dim)' }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
