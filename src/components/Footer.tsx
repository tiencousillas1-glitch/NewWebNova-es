import React from 'react';
import { COPY } from '../data/copy';
import { Lockup } from './icons';

export default function Footer() {
  return (
    <footer style={{ padding: '48px 32px 56px', borderTop: '1px solid var(--line)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Lockup height={34} />
          <span style={{ color: 'var(--fg-faint)', fontSize: 13 }}>{COPY.footer_tagline}</span>
        </div>
        <div style={{ display: 'flex', gap: 24, color: 'var(--fg-faint)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase' }}>
          <span>© 2026</span>
          <a href="/privacy" style={{ color: 'inherit' }}>Privacidad</a>
          <a href="/terms" style={{ color: 'inherit' }}>Términos</a>
          <span>HIPAA</span>
        </div>
      </div>
    </footer>
  );
}
