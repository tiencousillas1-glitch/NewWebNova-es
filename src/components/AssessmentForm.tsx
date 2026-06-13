import React, { useState } from 'react';
import { AssessmentData } from '../lib/assessment';

interface Props {
  onComplete: (data: AssessmentData) => void;
  onBack: () => void;
}

const optionBtn = (active: boolean): React.CSSProperties => ({
  width: '100%',
  padding: 24,
  borderRadius: 16,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all .2s ease',
  fontSize: 16,
  fontWeight: 600,
  color: active ? 'var(--on-accent)' : 'var(--fg-dim)',
  background: active ? 'linear-gradient(180deg, var(--accent-soft), var(--accent) 55%, var(--accent-deep))' : 'rgba(255,255,255,0.03)',
  border: active ? '1px solid transparent' : '1px solid var(--line-2)',
});

export default function AssessmentForm({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AssessmentData>({
    clinicName: '',
    avgCallsPerDay: 40,
    receptionConfig: 'Multitarea',
    leadFollowUpTime: '< 1 hora',
    runsAds: false,
    missedCallsStrategy: 'Buzón de voz',
    avgCaseValue: 4500,
  });

  const totalSteps = 7;

  const handleSiguiente = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete(formData);
  };
  const handleAtras = () => {
    if (step > 1) setStep(step - 1);
  };
  const updateField = (field: keyof AssessmentData, value: any) => setFormData({ ...formData, [field]: value });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Back link + progress */}
        <button onClick={onBack} style={{ background: 'none', border: 0, color: 'var(--fg-faint)', fontSize: 13, cursor: 'pointer', marginBottom: 20, fontFamily: 'var(--mono)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
          ← Volver al inicio
        </button>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontFamily: 'var(--mono)', letterSpacing: '.1em', color: 'var(--fg-dim)' }}>PASO {step} DE {totalSteps}</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--accent-2)' }}>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--accent-2), var(--accent))', width: `${(step / totalSteps) * 100}%`, transition: 'width .3s ease' }} />
          </div>
        </div>

        {/* Question card */}
        <div className="lg" style={{ borderRadius: 24, padding: 'clamp(24px, 5vw, 48px)', background: 'rgba(255,255,255,0.02)' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,40px)', margin: 0 }}>¿Cómo se llama tu clínica?</h2>
              <input className="input" style={{ height: 56, fontSize: 18 }} placeholder="Ej. Clínica de Ortodoncia" value={formData.clinicName} onChange={(e) => updateField('clinicName', e.target.value)} autoFocus />
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,40px)', margin: 0 }}>¿Cuántas llamadas entrantes recibes al día?</h2>
              <p style={{ color: 'var(--fg-dim)', margin: 0 }}>Un estimado está bien.</p>
              <input type="number" min={0} className="input" style={{ height: 64, fontSize: 28, fontWeight: 700, textAlign: 'center' }} value={formData.avgCallsPerDay} onChange={(e) => updateField('avgCallsPerDay', parseInt(e.target.value) || 0)} />
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,40px)', margin: 0 }}>¿Cómo funciona tu recepción?</h2>
              <div style={{ display: 'grid', gap: 14 }}>
                <button onClick={() => updateField('receptionConfig', 'Multitarea')} style={optionBtn(formData.receptionConfig === 'Multitarea')}>
                  <div style={{ fontSize: 19, marginBottom: 4 }}>Multitarea</div>
                  <div style={{ fontSize: 13.5, opacity: 0.8, fontWeight: 400 }}>Gestiona check-ins, pagos y llamadas</div>
                </button>
                <button onClick={() => updateField('receptionConfig', 'Dedicated')} style={optionBtn(formData.receptionConfig === 'Dedicated')}>
                  <div style={{ fontSize: 19, marginBottom: 4 }}>Equipo dedicado a llamadas</div>
                  <div style={{ fontSize: 13.5, opacity: 0.8, fontWeight: 400 }}>Alguien responde llamadas todo el tiempo sin tareas de oficina</div>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,40px)', margin: 0 }}>¿Qué tan rápido devuelves llamadas perdidas?</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {(['< 5 min', '< 1 hora', 'Mismo día', 'Día siguiente'] as const).map((option) => (
                  <button key={option} onClick={() => updateField('leadFollowUpTime', option)} style={optionBtn(formData.leadFollowUpTime === option)}>{option}</button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,40px)', margin: 0 }}>¿Inviertes en anuncios de pago?</h2>
              <p style={{ color: 'var(--fg-dim)', margin: 0 }}>Google Ads, Facebook/IG, TikTok, etc.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <button onClick={() => updateField('runsAds', true)} style={{ ...optionBtn(formData.runsAds), textAlign: 'center', fontSize: 20, padding: 32 }}>Sí</button>
                <button onClick={() => updateField('runsAds', false)} style={{ ...optionBtn(!formData.runsAds), textAlign: 'center', fontSize: 20, padding: 32 }}>No</button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,40px)', margin: 0 }}>¿Qué pasa con las llamadas perdidas?</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {(['Buzón de voz', 'Servicio de contestación', 'Nada'] as const).map((option) => (
                  <button key={option} onClick={() => updateField('missedCallsStrategy', option)} style={optionBtn(formData.missedCallsStrategy === option)}>{option}</button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,40px)', margin: 0 }}>¿Valor promedio por caso?</h2>
              <p style={{ color: 'var(--fg-dim)', margin: 0 }}>Ingreso estimado por nuevo paciente, por ejemplo un caso de Invisalign u ortodoncia.</p>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-faint)', fontSize: 24, fontWeight: 700 }}>$</span>
                <input type="number" min={0} step={500} className="input" style={{ height: 64, fontSize: 28, fontWeight: 700, paddingLeft: 40 }} value={formData.avgCaseValue} onChange={(e) => updateField('avgCaseValue', parseInt(e.target.value) || 0)} />
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
            {step > 1 && (
              <button onClick={handleAtras} className="btn btn-ghost" style={{ padding: '0 24px' }}>Atrás</button>
            )}
            <button onClick={handleSiguiente} disabled={step === 1 && !formData.clinicName} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: step === 1 && !formData.clinicName ? 0.5 : 1, cursor: step === 1 && !formData.clinicName ? 'not-allowed' : 'pointer' }}>
              {step === totalSteps ? 'Calcular ingresos perdidos' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
