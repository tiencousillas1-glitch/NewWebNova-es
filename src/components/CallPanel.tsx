import React, { useState, useEffect } from 'react';
import { PhoneIcon, ShieldCheck, Waveform } from './icons';

// Panel "llamada en vivo" del lado derecho del hero.
export default function CallPanel() {
  const [seconds, setSeconds] = useState(34);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="lg rise" style={{ borderRadius: 24, padding: 24, background: 'rgba(255,255,255,0.02)' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 38, height: 38, borderRadius: 999, background: 'linear-gradient(135deg,var(--accent-soft),var(--accent))', display: 'grid', placeItems: 'center', color: 'var(--on-accent)', animation: 'pulse 1.8s infinite' }}>
            <PhoneIcon size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--fg)' }}>
              Entrante · <span style={{ color: 'var(--accent-2)' }}>Martes 20:47</span>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-faint)', letterSpacing: '.14em' }}>+1 (602) ••• 4471</div>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-dim)' }}>{mm}:{ss}</div>
      </div>

      <hr className="hr-faint" style={{ margin: '18px 0' }} />

      {/* mini transcript */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
        <div className="bubble caller">
          <div className="cap" style={{ color: '#9ec3ff', marginBottom: 4 }}>Paciente</div>
          ¿Cuánto cuesta Invisalign para adultos?
        </div>
        <div className="bubble nova">
          <div className="cap" style={{ marginBottom: 4 }}>Valentina</div>
          El precio depende de tu caso. La doctora te da el presupuesto exacto en una primera visita gratuita. ¿Te agendo el sábado a las 10:00?
        </div>
      </div>

      {/* waveform footer */}
      <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 14, background: 'rgba(59,130,246,0.08)', border: '1px solid color-mix(in oklab, var(--accent) 24%, var(--line))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent-2)' }}>Valentina hablando</span>
        </div>
        <Waveform bars={20} height={26} />
      </div>

      {/* booking confirm strip */}
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center', padding: '12px 14px', borderRadius: 12, background: 'rgba(127,184,255,0.06)', border: '1px solid rgba(127,184,255,0.18)', color: '#9ec3ff' }}>
        <ShieldCheck size={18} />
        <div style={{ fontSize: 13, color: '#dfeaff' }}>Cita agendada · Sáb 10:00 · primera visita</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#9ec3ff', letterSpacing: '.14em' }}>+ SMS ENVIADO</div>
      </div>
    </div>
  );
}
