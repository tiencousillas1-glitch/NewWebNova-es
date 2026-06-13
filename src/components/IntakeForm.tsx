import React, { useState } from 'react';
import { COPY } from '../data/copy';
import { ShieldCheck, ArrowRight } from './icons';

export interface IntakeData {
  name: string;
  email: string;
  practice_name: string;
  pms: string;
  annual_starts: string;
}

interface IntakeFormProps {
  // Devuelve true si el insert en Supabase fue correcto.
  onSubmit: (data: IntakeData) => Promise<boolean>;
}

const EMPTY: IntakeData = { name: '', email: '', practice_name: '', pms: '', annual_starts: '' };

export default function IntakeForm({ onSubmit }: IntakeFormProps) {
  const [data, setData] = useState<IntakeData>(EMPTY);
  const [state, setState] = useState<'idle' | 'processing' | 'success'>('idle');

  const set = (field: keyof IntakeData, value: string) => setData((d) => ({ ...d, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('processing');
    const ok = await onSubmit(data);
    if (ok) {
      setState('success');
    } else {
      setState('idle');
      alert('Algo salió mal. Intenta nuevamente.');
    }
  };

  return (
    <form className="lg" style={{ borderRadius: 24, padding: 32, background: 'rgba(255,255,255,0.02)' }} onSubmit={handleSubmit}>
      <div style={{ marginBottom: 6 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 24, margin: 0, letterSpacing: '-0.02em' }}>{COPY.form_title}</h3>
      </div>
      <p style={{ margin: '0 0 22px', fontSize: 13.5, color: 'var(--fg-dim)', lineHeight: 1.5 }}>{COPY.form_sub}</p>

      {state === 'success' ? (
        <div style={{ padding: '40px 8px', textAlign: 'center' }}>
          <div style={{ width: 54, height: 54, borderRadius: 99, margin: '0 auto 18px', background: 'color-mix(in oklab, var(--accent) 22%, transparent)', display: 'grid', placeItems: 'center', color: 'var(--accent-2)' }}>
            <ShieldCheck size={26} />
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 8 }}>¡Recibido!</div>
          <div style={{ color: 'var(--fg-dim)', fontSize: 14 }}>Te llamamos en menos de 24h para empezar el build de 48 horas.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">{COPY.form_fields.name[0]}</label>
              <input className="input" placeholder={COPY.form_fields.name[1]} required value={data.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">{COPY.form_fields.email[0]}</label>
              <input className="input" type="email" placeholder={COPY.form_fields.email[1]} required value={data.email} onChange={(e) => set('email', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label className="label">{COPY.form_fields.practice[0]}</label>
            <input className="input" placeholder={COPY.form_fields.practice[1]} required value={data.practice_name} onChange={(e) => set('practice_name', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <div>
              <label className="label">{COPY.form_fields.pms[0]}</label>
              <select className="select" required value={data.pms} onChange={(e) => set('pms', e.target.value)}>
                <option value="" disabled>{COPY.form_fields.pms[1]}</option>
                {COPY.pms_options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{COPY.form_fields.starts[0]}</label>
              <select className="select" required value={data.annual_starts} onChange={(e) => set('annual_starts', e.target.value)}>
                <option value="" disabled>{COPY.form_fields.starts[1]}</option>
                {COPY.starts_options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={state === 'processing'} style={{ width: '100%', justifyContent: 'center', marginTop: 22, height: 54, opacity: state === 'processing' ? 0.7 : 1 }}>
            {state === 'processing' ? 'Enviando…' : COPY.form_cta} <ArrowRight size={16} />
          </button>
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--fg-faint)', lineHeight: 1.5 }}>{COPY.form_disclaimer}</div>
        </>
      )}
    </form>
  );
}
