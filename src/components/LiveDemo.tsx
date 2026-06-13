import React, { useState, useEffect, useMemo } from 'react';
import { COPY, SCRIPTS, ScenarioId } from '../data/copy';
import { PhoneIcon, Sparkle, Waveform } from './icons';

export default function LiveDemo() {
  const [scenario, setScenario] = useState<ScenarioId>('invisalign');
  const [count, setCount] = useState(2);
  const [playing, setPlaying] = useState(true);
  const lines = SCRIPTS[scenario] || [];
  const dt = COPY.demo_title;

  useEffect(() => {
    setCount(2);
  }, [scenario]);

  useEffect(() => {
    if (!playing) return;
    if (count >= lines.length) return;
    const id = setTimeout(() => setCount((c) => Math.min(c + 1, lines.length)), 1900);
    return () => clearTimeout(id);
  }, [count, playing, scenario, lines.length]);

  const slotsBookedByEnd = count >= lines.length;

  const slots = useMemo(
    () => [
      { time: '09:00', who: 'Marcus G. · Invisalign adulto' },
      { time: '10:00', who: slotsBookedByEnd && scenario === 'invisalign' ? 'Marcus G. · Invisalign adulto' : null },
      { time: '11:30', who: 'Sofía P. · Ajuste de retenedor' },
      { time: '14:15', who: 'Liam R. · Ajuste de brackets' },
      { time: '16:30', who: slotsBookedByEnd && scenario === 'teen' ? 'Diego M. · Consulta adolescente' : null },
      { time: '17:45', who: slotsBookedByEnd && scenario === 'reactivation' ? 'María L. · Retomar Invisalign' : null },
      { time: '18:15', who: null },
    ],
    [scenario, slotsBookedByEnd],
  );

  return (
    <section className="section" id="demo" style={{ borderTop: '1px solid var(--line)', background: 'linear-gradient(180deg, transparent, rgba(59,130,246,0.03), transparent)' }}>
      <div className="ember" style={{ width: 600, height: 400, left: '50%', top: '-120px', transform: 'translateX(-50%)', opacity: 0.4 }} />
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 48px' }}>
          <div className="kicker">{COPY.demo_kicker}</div>
          <h2 className="display" style={{ fontSize: 'clamp(38px, 4.4vw, 60px)', marginTop: 18, marginBottom: 18 }}>
            {dt.pre} <em>{dt.em}</em> {dt.post}
          </h2>
          <p style={{ color: 'var(--fg-dim)', fontSize: 16, lineHeight: 1.6, maxWidth: 620, margin: '0 auto' }}>{COPY.demo_sub}</p>
        </div>

        {/* scenario chips */}
        <div className="chips" style={{ justifyContent: 'center', marginBottom: 32 }}>
          {COPY.scenarios.map((s) => (
            <button key={s.id} onClick={() => setScenario(s.id)} className={`chip ${scenario === s.id ? 'on' : ''}`} style={{ cursor: 'pointer' }}>
              {scenario === s.id && <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />}
              {s.label}
            </button>
          ))}
        </div>

        {/* split: transcript + calendar */}
        <div className="grid-demo">
          {/* Transcript card */}
          <div className="lg" style={{ borderRadius: 20, padding: 28, minHeight: 520, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: 'linear-gradient(135deg, var(--accent-soft), var(--accent))', display: 'grid', placeItems: 'center', color: 'var(--on-accent)' }}>
                  <PhoneIcon size={14} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--fg)' }}>Conversación en vivo · Valentina × Paciente</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-faint)', letterSpacing: '.14em' }}>GRABANDO · CON CONSENTIMIENTO</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setPlaying((p) => !p);
                  if (count >= lines.length) setCount(2);
                }}
                className="btn btn-ghost"
                style={{ height: 34, padding: '0 14px', fontSize: 12 }}
              >
                {playing ? 'Pausar' : 'Reproducir'}
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
              {lines.slice(0, count).map((line, i) => (
                <div key={i} className={`bubble ${line.who}`} style={{ alignSelf: line.who === 'nova' ? 'flex-end' : 'flex-start', animation: 'rise .4s ease-out both' }}>
                  <div className="cap" style={{ color: line.who === 'nova' ? 'var(--accent-2)' : '#9ec3ff', marginBottom: 6 }}>
                    {line.who === 'nova' ? 'Valentina' : 'Paciente'}
                  </div>
                  {line.text}
                </div>
              ))}
              {count < lines.length && (
                <div
                  style={{
                    alignSelf: lines[count].who === 'nova' ? 'flex-end' : 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: lines[count].who === 'nova' ? 'rgba(59,130,246,0.12)' : 'rgba(127,184,255,0.06)',
                    border: '1px solid var(--line-2)',
                  }}
                >
                  <span className="bar" style={{ height: 14, animationDelay: '0s' }} />
                  <span className="bar" style={{ height: 14, animationDelay: '-.2s' }} />
                  <span className="bar" style={{ height: 14, animationDelay: '-.4s' }} />
                </div>
              )}
            </div>

            {/* footer waveform */}
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-faint)', letterSpacing: '.14em' }}>
                {count >= lines.length ? 'LLAMADA FINALIZADA · CITA AGENDADA' : 'EN VIVO'}
              </span>
              <Waveform bars={18} height={22} active={count < lines.length} />
            </div>
          </div>

          {/* Calendar fill panel */}
          <div className="lg" style={{ borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--fg-faint)', fontFamily: 'var(--mono)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Google Calendar</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 4 }}>Agenda de la doctora · Sábado</div>
              </div>
              <span className="cap" style={{ color: 'var(--fg-faint)' }}>↻ sincronizando</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 6 }}>
              {slots.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    background: s.who ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'rgba(255,255,255,0.02)',
                    borderColor: s.who ? 'color-mix(in oklab, var(--accent) 35%, var(--line))' : 'var(--line)',
                    transition: 'all .4s ease',
                  }}
                >
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: s.who ? 'var(--fg)' : 'var(--fg-faint)' }}>{s.time}</span>
                  <span style={{ fontSize: 13.5, color: s.who ? 'var(--fg)' : 'var(--fg-faint)' }}>{s.who || 'Hueco disponible'}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg-faint)', fontSize: 12 }}>
              <Sparkle size={13} />
              <span>Valentina rellena este calendario en tiempo real al cerrar cada llamada.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
