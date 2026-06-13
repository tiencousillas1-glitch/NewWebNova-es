import React, { useState } from 'react';
import { AssessmentData, AssessmentResults as Results } from '../lib/assessment';
import { ShieldCheck } from './icons';

interface Props {
  data: AssessmentData;
  results: Results;
  onBookDemo: () => void;
  onBack: () => void;
}

const riskBg = (level: string) => {
  switch (level) {
    case 'HIGH':
      return { background: 'rgba(255,95,87,0.08)', borderColor: 'rgba(255,95,87,0.3)' };
    case 'MEDIUM':
      return { background: 'rgba(254,188,46,0.08)', borderColor: 'rgba(254,188,46,0.3)' };
    case 'LOW':
      return { background: 'rgba(40,200,64,0.08)', borderColor: 'rgba(40,200,64,0.3)' };
    default:
      return { background: 'rgba(255,255,255,0.03)', borderColor: 'var(--line-2)' };
  }
};

export default function AssessmentResults({ data, results, onBookDemo, onBack }: Props) {
  const computedRate = Math.round((results.missedCallsPerMonth / (data.avgCallsPerDay * 22)) * 100) || 15;
  const [missedCallRate, setMissedCallRate] = useState(Math.min(Math.max(computedRate, 5), 50));

  const monthlyCalls = data.avgCallsPerDay * 22;
  const slidingMissedCalls = Math.round(monthlyCalls * (missedCallRate / 100));
  const slidingRevenue = Math.round(slidingMissedCalls * 0.05 * data.avgCaseValue);
  const risk = riskBg(results.riskLevel);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 0, color: 'var(--fg-faint)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--mono)', letterSpacing: '.12em', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
          ← Volver al inicio
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h1 className="display" style={{ fontSize: 'clamp(34px,5vw,56px)', margin: 0 }}>Evaluación de tu clínica</h1>
          <p style={{ fontSize: 18, color: 'var(--fg-dim)', margin: 0 }}>{data.clinicName}</p>
        </div>

        {/* Revenue hero */}
        <div className="lg" style={{ borderRadius: 24, padding: 'clamp(24px,5vw,48px)', textAlign: 'center', border: `1px solid ${risk.borderColor}`, background: risk.background }}>
          <h3 style={{ fontSize: 14, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '.14em', fontFamily: 'var(--mono)', margin: 0 }}>Ingresos mensuales potenciales recuperables</h3>
          <div className="num" style={{ fontSize: 'clamp(48px,9vw,84px)', background: 'linear-gradient(160deg, #fff 30%, var(--accent-soft))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginTop: 12 }}>
            ${slidingRevenue.toLocaleString('es-ES')}
          </div>

          <div style={{ maxWidth: 460, margin: '32px auto 0', paddingTop: 28, borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--fg-faint)', marginBottom: 14, fontFamily: 'var(--mono)' }}>
              <span>Conservador (5%)</span>
              <span>Tu estimado: <span style={{ color: 'var(--accent-2)', fontSize: 15 }}>{missedCallRate}%</span></span>
              <span>Agresivo (50%)</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={missedCallRate}
              onChange={(e) => setMissedCallRate(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <p style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 16 }}>
              *Cálculo: {slidingMissedCalls} llamadas perdidas × 5% de conversión × ${data.avgCaseValue.toLocaleString('es-ES')} de valor por caso
            </p>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid-2-cards">
          <div className="lg" style={{ borderRadius: 20, padding: 32 }}>
            <div style={{ color: 'var(--fg-faint)', fontSize: 12, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 14 }}>Llamadas perdidas</div>
            <div className="num" style={{ fontSize: 56 }}>{slidingMissedCalls}</div>
            <div style={{ color: 'var(--fg-dim)', marginTop: 8 }}>llamadas/mes que se escapan</div>
          </div>
          <div className="lg" style={{ borderRadius: 20, padding: 32 }}>
            <div style={{ color: 'var(--fg-faint)', fontSize: 12, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 14 }}>Nuevos casos perdidos</div>
            <div className="num" style={{ fontSize: 56, color: 'var(--accent-2)' }}>{(slidingMissedCalls * 0.05).toFixed(1)}</div>
            <div style={{ color: 'var(--fg-dim)', marginTop: 8 }}>casos/mes perdidos</div>
          </div>
        </div>

        {/* Analysis */}
        <div className="lg" style={{ borderRadius: 20, padding: 32 }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 26, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Por qué se pierden pacientes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {results.recommendations.map((rec, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--line)' }}>
                <span style={{ width: 28, height: 28, borderRadius: 99, background: 'rgba(255,95,87,0.18)', color: '#ff8a82', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700 }}>!</span>
                <p style={{ color: 'var(--fg-dim)', margin: 0, flex: 1, lineHeight: 1.55 }}>{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 22, padding: '24px 0 8px', alignItems: 'center' }}>
          <h2 className="display" style={{ fontSize: 'clamp(30px,4.5vw,48px)', margin: 0 }}>Captura esos ${slidingRevenue.toLocaleString('es-ES')}</h2>
          <p style={{ fontSize: 17, color: 'var(--fg-dim)', maxWidth: 560, margin: 0, lineHeight: 1.6 }}>
            Nova AI Voice responde al instante, califica al paciente y agenda la consulta antes de que la oportunidad se enfríe.
          </p>
          <button onClick={onBookDemo} className="btn btn-primary" style={{ height: 54, padding: '0 32px', fontSize: 16 }}>
            <ShieldCheck size={18} /> Solicitar mi demo
          </button>
        </div>
      </div>
    </div>
  );
}
