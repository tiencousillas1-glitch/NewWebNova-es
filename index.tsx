import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Phone, ArrowRight, Play, ShieldCheck, Smile, Calendar, MessageSquare, Clock, Database, Globe } from 'lucide-react';

// --- Supabase Client ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rmvlncyhsfurhmmekguh.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_bl4MaDWBBafanj59v85gPA_QavvSdch";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Components ---

// --- Supabase Client (Initialized at top) ---
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Already declared above
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Components ---
// Removed Auth and Dashboard components per user request

// --- Assessment Components ---

interface AssessmentData {
  clinicName: string;
  avgCallsPerDay: number;
  receptionConfig: 'Dedicated' | 'Multitasking';
  leadFollowUpTime: '< 5 min' | '< 1 hour' | 'Same Day' | 'Next Day';
  runsAds: boolean;
  missedCallsStrategy: 'Voicemail' | 'Answering Service' | 'Nothing';
  avgCaseValue: number;
}

interface AssessmentResults {
  riskScore: number;
  missedCallsPerMonth: number;
  potentialRevenueRecovered: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}

const calculateMissedCallRisk = (data: AssessmentData): AssessmentResults => {
  let riskScore = 0;
  let missedCallsPerMonth = 0;
  const recommendations: string[] = [];

  const dailyCalls = data.avgCallsPerDay;
  const monthlyCalls = dailyCalls * 22; // Assuming ~22 working days

  // 1. Staffing & Config Risk
  // Industry standard: 1 receptionist can handle ~40-50 calls/day effectively while doing other tasks
  // But MULTITASKING is the killer.

  // Base missed call rate
  let missedCallRate = 0.15; // Even with perfect staffing, 15% are missed

  if (data.receptionConfig === 'Multitasking') {
    missedCallRate += 0.15;
    riskScore += 25;
    recommendations.push('El personal que balancea pacientes y teléfonos hace que las llamadas queden sin respuesta en momentos de alta demanda.');
  }

  // 2. Speed to Lead Risk
  switch (data.leadFollowUpTime) {
    case 'Next Day':
      missedCallRate += 0.15;
      riskScore += 25;
      recommendations.push('Responder al día siguiente reduce la conversión un 90% en comparación con responder en 5 minutos.');
      break;
    case 'Same Day':
    case '< 1 hour':
      missedCallRate += 0.05;
      riskScore += 10;
      break;
    case '< 5 min':
      // Best practice
      break;
  }

  // 3. Strategy Risk
  if (data.missedCallsStrategy === 'Nothing') {
    missedCallRate += 0.15;
    riskScore += 30;
    recommendations.push('Llamadas que no llevan a ningún lado significan el 100% de pérdida de ese prospecto.');
  } else if (data.missedCallsStrategy === 'Voicemail') {
    missedCallRate += 0.10; // Most people don't leave voicemails or wait for call backs
    riskScore += 15;
    recommendations.push('El 70% de las personas que llaman cuelgan en el buzón de voz y llaman a un competidor.');
  }

  // Ad Spend Risk Multiplier
  if (data.runsAds) {
    riskScore += 10;
    recommendations.push('El tráfico pago combinado con llamadas perdidas consume el presupuesto el doble de rápido.');
  }

  // Calculate actual missed calls
  missedCallsPerMonth = Math.round(monthlyCalls * missedCallRate);

  // 3. Value Risk (Ortho Specific)
  // Conversion assumption: 20% of callers booking -> 50% showcase -> 60% close
  // Conservative: 5% of raw inbound calls turn into starts
  const conversionRate = 0.05;
  const lostPatients = Math.round(missedCallsPerMonth * conversionRate);
  const potentialRevenueRecovered = lostPatients * data.avgCaseValue;

  if (potentialRevenueRecovered > 20000) {
    riskScore += 20;
    recommendations.push(`Un valor de caso alto ($${data.avgCaseValue}) significa que cada llamada perdida es costosa.`);
  }

  const riskLevel = riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW';

  if (recommendations.length === 0) {
    recommendations.push('Tiene una cobertura decente, pero la IA asegura un 0% de pérdidas las 24 horas del día.');
  }

  return {
    riskScore: Math.min(riskScore, 100),
    missedCallsPerMonth,
    potentialRevenueRecovered,
    riskLevel,
    recommendations
  };
};

const AssessmentForm = ({ onComplete }: { onComplete: (data: AssessmentData) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AssessmentData>({
    clinicName: '',
    avgCallsPerDay: 40,
    receptionConfig: 'Multitasking',
    leadFollowUpTime: '< 1 hour',
    runsAds: false,
    missedCallsStrategy: 'Voicemail',
    avgCaseValue: 4500 // Typical Ortho case value
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (field: keyof AssessmentData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-text-muted">Paso {step} de {totalSteps}</span>
            <span className="text-sm font-bold text-brand">{Math.round((step / totalSteps) * 100)}% Completado</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Cuál es el nombre de su clínica?</h2>
              <input
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/50 transition-all"
                placeholder="ej., Clínica Ortodental"
                value={formData.clinicName}
                onChange={(e) => updateField('clinicName', e.target.value)}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Cuántas llamadas entrantes recibe al día?</h2>
              <p className="text-text-muted">Un estimado es suficiente.</p>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-3xl font-bold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/50 transition-all text-center"
                  value={formData.avgCallsPerDay}
                  onChange={(e) => updateField('avgCallsPerDay', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Cómo funciona su recepción?</h2>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => updateField('receptionConfig', 'Multitasking')}
                  className={`p-6 rounded-2xl border text-left transition-all ${formData.receptionConfig === 'Multitasking' ? 'bg-brand border-brand text-white' : 'bg-white/10 border-white/10 hover:bg-white/20 text-text-muted'}`}
                >
                  <div className="text-xl font-bold mb-1">Multitarea</div>
                  <div className="text-sm opacity-80">Maneja registros, pagos Y teléfonos</div>
                </button>
                <button
                  onClick={() => updateField('receptionConfig', 'Dedicated')}
                  className={`p-6 rounded-2xl border text-left transition-all ${formData.receptionConfig === 'Dedicated' ? 'bg-brand border-brand text-white' : 'bg-white/10 border-white/10 hover:bg-white/20 text-text-muted'}`}
                >
                  <div className="text-xl font-bold mb-1">Personal Dedicado al Teléfono</div>
                  <div className="text-sm opacity-80">Alguien responde teléfonos el 100% del tiempo (sin tareas presenciales)</div>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Qué tan rápido devuelve las llamadas a prospectos perdidos?</h2>
              <div className="space-y-3">
                {['< 5 min', '< 1 hour', 'Same Day', 'Next Day'].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateField('leadFollowUpTime', option)}
                    className={`w-full p-6 rounded-2xl font-bold text-lg text-left transition-all ${formData.leadFollowUpTime === option
                      ? 'bg-brand text-white shadow-[0_0_30px_rgba(255,106,0,0.4)]'
                      : 'bg-white/10 text-text-muted hover:bg-white/20'
                      }`}
                  >
                    {option === '< 5 min' ? '< 5 min' : option === '< 1 hour' ? '< 1 hora' : option === 'Same Day' ? 'Mismo Día' : 'Día Siguiente'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Invierte en anuncios de pago?</h2>
              <p className="text-text-muted">Google Ads, Facebook/IG, TikTok, etc.</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateField('runsAds', true)}
                  className={`p-8 rounded-2xl font-bold text-xl transition-all ${formData.runsAds
                    ? 'bg-brand text-white shadow-[0_0_30px_rgba(255,106,0,0.4)] scale-105'
                    : 'bg-white/10 text-text-muted hover:bg-white/20'
                    }`}
                >
                  Sí
                </button>
                <button
                  onClick={() => updateField('runsAds', false)}
                  className={`p-8 rounded-2xl font-bold text-xl transition-all ${!formData.runsAds
                    ? 'bg-brand text-white shadow-[0_0_30px_rgba(255,106,0,0.4)] scale-105'
                    : 'bg-white/10 text-text-muted hover:bg-white/20'
                    }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Qué pasa con las llamadas perdidas?</h2>
              <div className="space-y-3">
                {['Voicemail', 'Answering Service', 'Nothing'].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateField('missedCallsStrategy', option)}
                    className={`w-full p-6 rounded-2xl font-bold text-lg text-left transition-all ${formData.missedCallsStrategy === option
                      ? 'bg-brand text-white shadow-[0_0_30px_rgba(255,106,0,0.4)]'
                      : 'bg-white/10 text-text-muted hover:bg-white/20'
                      }`}
                  >
                    {option === 'Voicemail' ? 'Buzón de Voz' : option === 'Answering Service' ? 'Servicio de Contestadora' : 'Nada'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Valor Promedio por Caso?</h2>
              <p className="text-text-muted">Ingreso por paciente nuevo (ej., caso de Brackets/Alineadores).</p>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 text-2xl font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-3xl font-bold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/50 transition-all"
                  value={formData.avgCaseValue}
                  onChange={(e) => updateField('avgCaseValue', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-12">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-all"
              >
                Atrás
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={step === 1 && !formData.clinicName}
              className="flex-1 px-8 py-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-[0_0_30px_rgba(255,106,0,0.3)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === totalSteps ? 'Calcular Pérdida de Ingresos' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssessmentResults = ({ data, results, onBookDemo }: {
  data: AssessmentData;
  results: AssessmentResults;
  onBookDemo: () => void;
}) => {
  // Initialize state with the calculated missed call rate from the logic (approximate reverse engineering)
  // We'll stick to a default range but center it around the calculated risk for the initial view
  const [missedCallRate, setMissedCallRate] = useState(
    Math.round((results.missedCallsPerMonth / (data.avgCallsPerDay * 22)) * 100) || 15
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-[#FF5F57]';
      case 'MEDIUM': return 'text-[#FEBC2E]';
      case 'LOW': return 'text-[#28C840]';
      default: return 'text-text-muted';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-[#FF5F57]/10 border-[#FF5F57]/30';
      case 'MEDIUM': return 'bg-[#FEBC2E]/10 border-[#FEBC2E]/30';
      case 'LOW': return 'bg-[#28C840]/10 border-[#28C840]/30';
      default: return 'bg-white/10 border-white/10';
    }
  };

  // Recalculate based on slider
  const monthlyCalls = data.avgCallsPerDay * 22;
  const slidingMissedCalls = Math.round(monthlyCalls * (missedCallRate / 100));
  const slidingRevenue = Math.round(slidingMissedCalls * 0.05 * data.avgCaseValue); // 5% conversion rate assumption

  return (
    <div className="min-h-screen bg-bg-main py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white">Resultados de Evaluación de Ortodoncia</h1>
          <p className="text-xl text-text-muted">{data.clinicName}</p>
        </div>

        {/* REVENUE HERO */}
        <div className={`glass-panel rounded-3xl p-12 border ${getRiskBgColor(results.riskLevel)} text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-brand/5 animate-pulse duration-[3000ms]"></div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-lg text-text-muted font-bold uppercase tracking-widest">Ingresos Mensuales Potenciales Recuperados</h3>
            <div className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(255,106,0,0.5)]">
              ${slidingRevenue.toLocaleString()}
            </div>

            {/* Interactive Slider Section */}
            <div className="max-w-md mx-auto mt-8 pt-8 border-t border-white/10">
              <div className="flex justify-between text-sm font-bold text-text-muted mb-4">
                <span>Conservador (5%)</span>
                <span>Su Estimación: <span className="text-brand text-lg">{missedCallRate}%</span></span>
                <span>Agresivo (50%)</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={missedCallRate}
                onChange={(e) => setMissedCallRate(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,106,0,0.5)]"
              />
              <p className="text-xs text-text-muted mt-4">
                *Cálculo: {slidingMissedCalls} llamadas perdidas x 5% de conversión x ${data.avgCaseValue.toLocaleString()} de valor por caso
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-8 border border-white/10">
            <div className="text-text-muted text-sm font-black uppercase tracking-widest mb-4">Llamadas Perdidas</div>
            <div className="text-5xl font-black text-white">{slidingMissedCalls}</div>
            <div className="text-text-muted mt-2">llamadas/mes que se escapan</div>
          </div>
          <div className="glass-panel rounded-2xl p-8 border border-white/10">
            <div className="text-text-muted text-sm font-black uppercase tracking-widest mb-4">Nuevos Casos Perdidos</div>
            {/* Estimate lost starts based on revenue divided by case value */}
            <div className="text-5xl font-black text-brand">{(slidingRevenue / data.avgCaseValue).toFixed(1)}</div>
            <div className="text-text-muted mt-2">casos/mes perdidos</div>
          </div>
        </div>

        {/* Analysis */}
        <div className="glass-panel rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6">Por qué está perdiendo pacientes</h3>
          <div className="space-y-4">
            {results.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-red-500 font-bold">!</span>
                </div>
                <p className="text-gray-200 font-medium flex-1">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-3xl md:text-4xl font-black text-white">Capture esos ${slidingRevenue.toLocaleString()}</h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Nova AI Voice responde al instante, califica al paciente y agenda la consulta.
          </p>
          <button
            onClick={onBookDemo}
            className="px-12 py-5 bg-brand hover:bg-brand-hover text-white text-xl font-black rounded-2xl shadow-[0_0_40px_rgba(255,106,0,0.4)] transition-all transform hover:scale-105"
          >
            Reclame Su Demo Gratuita
          </button>
        </div>
      </div>
    </div>
  );
};




const App = () => {
  // Widget relocation logic removed to restore stability.





  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard' | 'assessment' | 'results'>('landing');
  const [activeFeature, setActiveFeature] = useState(0);
  const [isYearly, setIsYearly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);

  const handleAssessmentComplete = async (data: AssessmentData) => {
    const results = calculateMissedCallRisk(data);
    setAssessmentData(data);
    setAssessmentResults(results);
    setView('results');

    // Save Assessment to Supabase (Background)
    try {
      await supabase.from('assessments').insert({
        clinic_name: data.clinicName,
        daily_calls: data.avgCallsPerDay,
        reception_config: data.receptionConfig,
        missed_call_strategy: data.missedCallsStrategy,
        lead_follow_up_time: data.leadFollowUpTime,
        run_ads: data.runsAds,
        avg_case_value: data.avgCaseValue,
        risk_score: results.riskScore,
        potential_revenue: results.potentialRevenueRecovered,
        risk_level: results.riskLevel
      });
    } catch (err) {
      console.error('Failed to save assessment', err);
    }
  };

  const handleBookDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('processing');

    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const calendar = (form.elements.namedItem('calendar') as HTMLSelectElement).value;
    const volume = (form.elements.namedItem('volume') as HTMLSelectElement).value;

    try {
      const { error } = await supabase.from('strategy_calls').insert({
        name,
        email,
        calendar_system: calendar,
        patient_volume: volume,
        status: 'pending'
      });

      if (error) throw error;
      setFormState('success');
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setFormState('idle');
    }
  };



  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      id: 'inbound',
      step: '01',
      title: 'Instant Answer',
      description: 'Nova picks up immediately, 24/7. No voicemail, no hold times.',
      outcome: 'No missed calls'
    },
    {
      id: 'qualification',
      step: '02',
      title: 'Smart Triage',
      description: 'AI filters emergencies and collects insurance details instantly.',
      outcome: 'Qualified leads only'
    },
    {
      id: 'booking',
      step: '03',
      title: 'Real-time Booking',
      description: 'Direct sync with your calendar to fill open slots automatically.',
      outcome: 'Full schedule'
    }
  ];

  useEffect(() => {
    const interval = 50; // Update progress every 50ms
    const stepDuration = 5000; // 5 seconds per step
    const increment = (interval / stepDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveFeature((current) => (current + 1) % features.length);
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeFeature, features.length]);

  const handleStepClick = (index: number) => {
    setActiveFeature(index);
    setProgress(0);
  };

  const handleBookDemoFromResults = () => {
    setView('landing');
    setTimeout(() => {
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- RENDER ---
  if (view === 'assessment') {
    return <AssessmentForm onComplete={handleAssessmentComplete} />;
  }

  if (view === 'results' && assessmentData && assessmentResults) {
    return (
      <AssessmentResults
        data={assessmentData}
        results={assessmentResults}
        onBookDemo={handleBookDemoFromResults}
      />
    );
  }

  return (
    <div className="overflow-x-hidden bg-[#07080B] text-white font-sans selection:bg-brand-500/30">
      {/* (Rest of the original landing page content remains here, slightly adjusted for navigation) */}
      {/* 1) HEADER + STICKY NAV */}
      <header className="fixed w-full top-0 z-50 bg-[#07080B]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer group py-2"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img
                src="/logo_final.png?v=2"
                alt="Nova AI Voice"
                className="h-14 w-auto object-contain transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(255,106,0,0.5)]"
              />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              <a href="#live-demo" className="text-sm font-medium text-text-muted hover:text-white hover:text-glow transition-all">Demo en Vivo</a>
              <a href="#features" className="text-sm font-medium text-text-muted hover:text-white hover:text-glow transition-all">Características</a>
              <a href="#pricing" className="text-sm font-medium text-text-muted hover:text-white hover:text-glow transition-all">Precios</a>
              <button
                onClick={() => setView('assessment')}
                className="text-sm font-medium text-text-muted hover:text-white hover:text-glow transition-all flex items-center gap-2"
              >
                <span>Calculadora de Retorno</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] uppercase tracking-wider font-bold">Nuevo</span>
              </button>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <a href="#demo" className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold rounded-full text-white backdrop-blur-md transition-all hover:scale-105 hover:border-brand/30">
                Agendar una Demo
              </a>
              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-gray-300 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-bg-card border-b border-white/10">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a href="#live-demo" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white hover:bg-white/5 rounded-md">Demo en Vivo</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white hover:bg-white/5 rounded-md">Características</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white hover:bg-white/5 rounded-md">Precios</a>
              <button
                onClick={() => { setView('assessment'); setMobileMenuOpen(false); }}
                className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white hover:bg-white/5 rounded-md w-full text-left"
              >
                Calculadora de Retorno
              </button>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center mt-4 px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-brand hover:bg-brand-hover">Agendar una Demo</a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* 2) HERO SECTION */}
        <section className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-16 overflow-hidden">

          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

          {/* THE SENTINEL: AI CORE ANIMATION */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 flex flex-col items-center">

            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/5 border border-brand/20 text-brand-light text-xs font-bold uppercase tracking-widest mb-8 animate-[fadeIn_0.6s_ease-out] hover:bg-brand/10 transition-colors cursor-default backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              Para Ortodoncistas Enfocados en el Crecimiento
            </div>

            {/* H1 */}
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8 leading-[1.0] drop-shadow-xl relative z-20">
              Deje de Perder Pacientes <br className="hidden md:block" />
              por <span className="gradient-text relative inline-block">
                Llamadas Perdidas
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-4 max-w-3xl mx-auto text-xl md:text-2xl text-text-muted leading-relaxed font-light">
              Su recepción está saturada. <strong className="text-white font-semibold">Nova responde al instante</strong>, califica a los pacientes y agenda consultas <span className="text-brand font-bold">24/7</span>.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-6 w-full max-w-md mx-auto sm:max-w-none justify-center">
              <button
                onClick={() => {
                  document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' });
                  setTimeout(() => document.getElementById('start-demo-btn')?.focus(), 800);
                }}
                className="group relative flex items-center justify-center gap-3 px-8 py-5 bg-brand hover:bg-brand-hover text-white text-lg font-bold rounded-2xl shadow-[0_0_40px_rgba(255,106,0,0.3)] hover:shadow-[0_0_60px_rgba(255,106,0,0.5)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer"></div>
                <span>Hable con Nova Ahora</span>
                <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                onClick={() => setView('assessment')}
                className="flex items-center justify-center gap-3 px-8 py-5 bg-white/5 hover:bg-white/10 text-white text-lg font-semibold rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-md transition-all">
                <span>Realizar Evaluación</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-sm font-bold tracking-widest"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.21a12.002 12.002 0 00-16.45 0A12.002 12.002 0 003 12c0 2.757 1.12 5.257 2.988 7.071L12 22l6.012-2.929A12.002 12.002 0 0021 12c0-2.757-1.12-5.257-2.988-7.071z"></path></svg> CUMPLE CON HIPAA</div>
              <div className="flex items-center gap-2 text-sm font-bold tracking-widest"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> SINCRONIZACIÓN CON SOFTWARE MÉDICO</div>
              <div className="flex items-center gap-2 text-sm font-bold tracking-widest"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> LISTO PARA INVISALIGN</div>
            </div>

          </div>
        </section>

        {/* 3) LIVE DEMO SECTION */}
        <section id="live-demo" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <div className="inline-block px-4 py-1 rounded-full border border-brand/20 bg-brand/5 backdrop-blur-sm mb-6">
              <span className="text-brand font-bold tracking-widest uppercase text-xs animate-pulse">Demo Interactiva</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Experimente Nova en Vivo</h2>

            <p className="text-text-muted text-lg max-w-2xl mx-auto mb-12">
              Chloe es una recepcionista virtual dental construida con Nova AI Voice. Pruebe una conversación real y vea cómo se manejan las llamadas entrantes a la clínica.
            </p>

            {/* Clarification Text */}
            <p className="text-sm text-text-muted/60 mb-8 font-medium">
              Esta es una demo de voz en vivo. La programación de citas está desactivada en esta experiencia. Úsela para evaluar la calidad, la velocidad de la llamada y cómo Nova maneja conversaciones reales con pacientes.
            </p>


            {/* WIDGET CONTAINER - Refactored for Stacking Context Safety */}
            <div className="relative mx-auto max-w-3xl h-80">

              {/* 1. Visual Layer (Background, Blur, Borders) - ABSOLUTE so it doesn't affect widget interactivity */}
              <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl z-0 pointer-events-none"></div>

              {/* 2. Glow Effects */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand via-purple-500 to-brand rounded-[2.5rem] blur opacity-20 animate-bg-pan z-[-1]"></div>

              {/* 3. Logic Layer (The Widget Mount) - NO FILTERS, NO TRANSFORMS */}
              <div id="demo-widget-mount" className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">

                {/* Interactive Trigger Button (Placeholder) */}
                {/* Interactive Trigger Button */}
                <button
                  id="start-demo-btn"
                  onClick={() => {
                    const findAndClickWidget = (attempts = 0) => {
                      // 1. Try accessing via Shadow DOM (Correct Path found in testing)
                      const container = document.querySelector('#nedzo-widget-container');
                      let widgetBtn: HTMLElement | null = null;

                      if (container && container.shadowRoot) {
                        widgetBtn = container.shadowRoot.querySelector('button[aria-label="Talk to Chloe"]');
                      }

                      // 2. Fallback: Try standard selectors if Shadow DOM method fails
                      if (!widgetBtn) {
                        const selectors = ['iframe[src*="nedzo"]', 'div[id*="nedzo"] button'];
                        for (const s of selectors) {
                          const found = document.querySelector(s);
                          if (found instanceof HTMLElement) widgetBtn = found;
                          if (widgetBtn) break;
                        }
                      }

                      if (widgetBtn) {
                        widgetBtn.click();
                        console.log("Nedzo widget clicked successfully");
                      } else if (attempts < 10) {
                        // Retry every 500ms if not found (widget might be loading)
                        console.log(`Widget not found, retrying... (${attempts + 1}/10)`);
                        setTimeout(() => findAndClickWidget(attempts + 1), 500);
                      } else {
                        console.warn("Nedzo widget not found after retries. Opening fallback.");
                        // Final Fallback: Dispatch event
                        window.dispatchEvent(new CustomEvent('nedzo-open'));
                        alert("The AI agent is loading. Please try again in a moment.");
                      }
                    };

                    findAndClickWidget();
                  }}
                  className="group relative flex items-center justify-center gap-3 px-10 py-6 bg-brand hover:bg-brand-hover text-white text-xl font-black rounded-full shadow-[0_0_50px_rgba(255,106,0,0.4)] hover:shadow-[0_0_70px_rgba(255,106,0,0.6)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden focus:outline-none focus:ring-4 focus:ring-brand/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer"></div>
                  <Phone className="w-6 h-6 animate-pulse" />
                  <span>Iniciar Llamada de Prueba</span>
                </button>

              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-24 relative bg-bg-card/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Construido para Ortodoncistas Enfocados en el Crecimiento</h2>
              <p className="text-text-muted max-w-2xl mx-auto">
                No deje que su "Coordinador de Tratamiento" pierda tiempo con curiosos. Deje que la IA maneje la recepción inicial.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Cero Llamadas Perdidas</h3>
                <p className="text-text-muted">Nova responde al instante en el primer timbre, asegurando que nunca pierda un paciente nuevo potencial en el buzón de voz de la competencia.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Programación Inteligente</h3>
                <p className="text-text-muted">Reserva directamente Exámenes de Pacientes Nuevos en su calendario, priorizando consultas de alto valor para Invisalign y Brackets.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Compromiso del Paciente</h3>
                <p className="text-text-muted">Automatiza todo el proceso de recepción inicial respondiendo preguntas y verificando seguros al momento. Los pacientes llegan a su clínica listos para comenzar el tratamiento.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Cobertura 24/7</h3>
                <p className="text-text-muted">Capture prospectos de sus anuncios nocturnos en Instagram. Nova trabaja noches, fines de semana y días festivos sin pago de horas extras.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Campañas de Reactivación</h3>
                <p className="text-text-muted">Llama automáticamente a antiguos prospectos para volver a involucrarlos. "¿Todavía está interesado en mejorar su sonrisa?"</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Soporte Multilingüe</h3>
                <p className="text-text-muted">Sirve a toda su comunidad cambiando de manera fluida entre inglés, español y otros idiomas clave.</p>
              </div>
            </div>
          </div>
        </section >




        {/* BRIDGE: 48-HOUR DEMO CHALLENGE */}
        < section className="py-24 relative overflow-hidden" >
          {/* Background Gradient to smooth transition from Hero Black to Pricing Black */}
          < div className="absolute inset-0 bg-gradient-to-b from-[#07080B] via-[#0A0B10] to-[#07080B] pointer-events-none" ></div >

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-gradient-to-br from-white/5 to-white/0 border border-brand/20 p-8 md:p-14 rounded-3xl relative overflow-hidden text-center group hover:border-brand/40 transition-all duration-500 shadow-2xl">

              {/* Glow Effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50 blur-sm"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-brand/20 to-purple-600/20 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>

              <span className="inline-block py-1 px-4 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-wide">
                Alta Demanda • Disponibilidad Limitada
              </span>

              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Construiremos Su Demo Personalizada en <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">48 Horas</span>
              </h2>

              <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                No confíe solo en nuestra palabra. Configuraremos una <strong>recepcionista virtual 100% funcional</strong> entrenada con los datos de su clínica. Gratis. Sin riesgo.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <a
                  href="#demo"
                  className="px-10 py-5 bg-brand hover:bg-brand-hover text-white text-xl font-black rounded-2xl shadow-[0_0_40px_rgba(255,106,0,0.3)] hover:shadow-[0_0_60px_rgba(255,106,0,0.5)] transition-all hover:-translate-y-1 transform flex items-center gap-3 group"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Reclamar Demo Gratis de 48h
                </a>
                <div className="flex items-center gap-2 text-sm text-text-muted opacity-80">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Solo 2 lugares disponibles esta semana</span>
                </div>
              </div>

            </div>
          </div>
        </section >

        {/* 7) PRICING */}
        < section id="pricing" className="py-24 bg-bg-main relative" >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Precios Simples y Transparentes</h2>
              <p className="text-text-muted mb-8">Sin tarifas ocultas. Solo pacientes agendados.</p>

              {/* Setup Banner */}
              <div className="inline-block bg-brand/10 border border-brand/30 rounded-lg px-6 py-2 mb-8">
                <span className="text-brand font-semibold text-sm md:text-base">$297 Configuración Única • Incluye Prueba en Vivo de 14 Días</span>
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`font-medium transition-colors ${!isYearly ? 'text-white' : 'text-text-muted'}`}>Mensual</span>
                <div className="relative inline-block w-14 h-8 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="price-toggle"
                    checked={isYearly}
                    onChange={(e) => setIsYearly(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1 transition-all duration-300"
                  />
                  <label htmlFor="price-toggle" className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-700 cursor-pointer transition-colors duration-300"></label>
                </div>
                <span className={`font-medium transition-colors ${isYearly ? 'text-white' : 'text-text-muted'}`}>Anual</span>
                <span className="ml-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded-full">Ahorra 20%</span>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 items-start">

              {/* Starter */}
              <div className="bg-bg-card border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">Starter</h3>
                  <p className="text-sm text-text-muted mt-2 h-10">Perfecto para clínicas pequeñas empezando a automatizar.</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${isYearly ? 237 : 297}</span>
                  <span className="text-text-muted">/mes</span>
                  <div className="text-xs text-text-muted mt-1">{isYearly ? 'Facturado Anualmente' : 'Facturado Mensualmente'}</div>
                </div>
                <a href="#demo" className="block w-full text-center py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors">Seleccionar Plan</a>
                <ul className="mt-8 space-y-4 text-sm text-text-muted flex-grow">
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 1 Agente de Voz IA</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 250 Minutos / Mes</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Manejo de Llamadas Entrantes 24/7</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Calificación y Programación Básica</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Notificaciones por Correo</li>
                </ul>
                <div className="mt-6 pt-6 border-t border-white/5 text-xs text-text-muted text-center">
                  Los minutos se reinician mensualmente
                </div>
              </div>

              {/* Growth */}
              <div className="bg-bg-card border border-brand/50 rounded-2xl p-8 relative shadow-[0_0_40px_rgba(255,106,0,0.15)] transform md:-translate-y-4 flex flex-col h-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Más Popular</div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">Growth</h3>
                  <p className="text-sm text-text-muted mt-2 h-10">Nuestro plan estándar para prácticas en crecimiento.</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${isYearly ? 397 : 497}</span>
                  <span className="text-text-muted">/mes</span>
                  <div className="text-xs text-text-muted mt-1">{isYearly ? 'Facturado Anualmente' : 'Facturado Mensualmente'}</div>
                </div>
                <a href="#demo" className="block w-full text-center py-3 bg-brand rounded-lg text-white font-bold hover:bg-brand-hover transition-colors shadow-lg">Iniciar Prueba de 14 Días</a>
                <ul className="mt-8 space-y-4 text-sm text-text-muted flex-grow">
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 1 Agente de Voz IA</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 400 Minutos / Mes</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Manejo de Llamadas Entrantes 24/7</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> <span className="text-white font-medium">Sincronización Perfecta de Calendario</span></li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Calificación Avanzada de Pacientes</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Lógica de Programación Inteligente</li>
                </ul>
                <div className="mt-6 pt-6 border-t border-white/5 text-xs text-text-muted text-center">
                  Complementos disponibles para minutos extra
                </div>
              </div>

              {/* Pro */}
              <div className="bg-bg-card border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">Pro</h3>
                  <p className="text-sm text-text-muted mt-2 h-10">Máxima potencia para clínicas de alto volumen.</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${isYearly ? 557 : 697}</span>
                  <span className="text-text-muted">/mes</span>
                  <div className="text-xs text-text-muted mt-1">{isYearly ? 'Facturado Anualmente' : 'Facturado Mensualmente'}</div>
                </div>
                <a href="#demo" className="block w-full text-center py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors">Seleccionar Plan</a>
                <ul className="mt-8 space-y-4 text-sm text-text-muted flex-grow">
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Hasta 2 Agentes de Voz IA</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 600 Minutos / Mes</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Manejo de Llamadas Entrantes 24/7</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Soporte Prioritario</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Manejo de Desbordamiento de Llamadas</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Guiones Personalizados</li>
                </ul>
                <div className="mt-6 pt-6 border-t border-white/5 text-xs text-text-muted text-center">
                  Ideal para clínicas con alto volumen
                </div>
              </div>

            </div>
          </div>
        </section >

        {/* 8) FOOTER WITH FORM */}
        < footer className="bg-[#050608] pt-20 pb-12 border-t border-white/5 relative overflow-hidden" id="demo" >
          {/* Ambient Background Glow for Footer */}
          < div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" ></div >

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">

              {/* Left Column: Value Prop & Trust */}
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-wider mb-6">
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                    Acceso Prioritario
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                    Reclame Para Su Clínica Una <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Recepcionista de IA 24/7</span>
                  </h2>
                  <p className="text-xl text-text-muted leading-relaxed">
                    Únase a las mejores clínicas dentales que están automatizando su recepción.
                    Califique a cada prospecto, llene su calendario y configúrelo en menos de 24 horas.
                  </p>
                </div>

                {/* Trust Elements */}
                <div className="pt-8 border-t border-white/5">
                  <p className="text-sm text-text-muted font-medium mb-4 uppercase tracking-widest">Compatible Con</p>
                  <div className="flex flex-wrap gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Text-based mock logos for now, or ensure image assets exist. Using sleek text badges for safety if images missing */}
                    <span className="px-4 py-2 border border-white/10 rounded-lg text-white/60 font-semibold">Google Calendar</span>
                    <span className="px-4 py-2 border border-white/10 rounded-lg text-white/60 font-semibold">Outlook</span>
                    <span className="px-4 py-2 border border-white/10 rounded-lg text-white/60 font-semibold">iCloud</span>
                    <span className="px-4 py-2 border border-white/10 rounded-lg text-white/60 font-semibold">Jane / Cliniko</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  <span>Manejo de Datos Seguro y Privado</span>
                </div>
              </div>

              {/* Right Column: High Ticket Intake Terminal */}
              <div className="bg-bg-card border border-white/10 p-1 rounded-3xl shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none"></div>

                <div className="bg-[#0A0B10] rounded-[22px] p-8 md:p-10 relative overflow-hidden">
                  {/* Glow Effect */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50"></div>

                  {formState === 'success' ? (
                    <div className="absolute inset-0 bg-[#0A0B10] flex flex-col items-center justify-center text-center p-8 z-20 animate-[fadeIn_0.5s_ease-out]">
                      <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-3">¡Lugar Reservado!</h3>
                      <p className="text-text-muted mb-6">Nuestro equipo de integración lo contactará en breve para confirmar su llamada de estrategia.</p>
                      <div className="w-full bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between text-xs text-text-muted mb-2">
                          <span>Estado</span>
                          <span className="text-green-400">Revisión Pendiente</span>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full w-1/3 animate-[loading_2s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Agendar Llamada de Estrategia</h3>
                        <p className="text-sm text-text-muted">Complete el formulario a continuación. Solo aceptamos 5 clínicas nuevas por semana.</p>
                      </div>

                      <form onSubmit={handleBookDemo} className="space-y-5 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="name" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Propietario de la Clínica</label>
                            <input type="text" id="name" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-white/20" placeholder="Nombre del Dr." />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Correo de Trabajo</label>
                            <input type="email" id="email" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-white/20" placeholder="nombre@clinica.com" />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="calendar" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Sistema de Calendario Actual</label>
                          <select id="calendar" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all appearance-none cursor-pointer">
                            <option value="" disabled selected>Seleccionar Sistema...</option>
                            <option>Google Calendar</option>
                            <option>Outlook / Office 365</option>
                            <option>iCloud</option>
                            <option>Agenda de Papel</option>
                            <option>Otro</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="volume" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Volumen Mensual de Pacientes</label>
                          <select id="volume" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all appearance-none cursor-pointer">
                            <option value="" disabled selected>Seleccionar Volumen...</option>
                            <option>Nuevos (0-200)</option>
                            <option>En Crecimiento (200-1000)</option>
                            <option>Alto Volumen (1000+)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={formState === 'processing'}
                          className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,106,0,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-wait mt-4 flex items-center justify-center gap-2 group"
                        >
                          <span>{formState === 'processing' ? 'Procesando...' : 'Agendar Llamada de Estrategia'}</span>
                          {formState !== 'processing' && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>}
                        </button>

                        <p className="text-center text-[10px] text-text-muted">
                          No se requiere tarjeta de crédito. La solicitud toma menos de 30 segundos.
                        </p>
                      </form>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </footer >
      </main >
    </div >
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

// Forced clean build for Vercel production deployment