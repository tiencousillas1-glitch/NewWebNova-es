import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Phone, ArrowRight, Calendar, MessageSquare } from 'lucide-react';

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
  receptionConfig: 'Dedicated' | 'Multitarea';
  leadFollowUpTime: '< 5 min' | '< 1 hour' | 'Mismo dia' | 'Dia siguiente';
  runsAds: boolean;
  missedCallsStrategy: 'Buzon de voz' | 'Servicio de contestacion' | 'Nada';
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

  if (data.receptionConfig === 'Multitarea') {
    missedCallRate += 0.15;
    riskScore += 25;
    recommendations.push('Cuando el equipo balancea pacientes y telefonos, algunas llamadas quedan sin respuesta en momentos de alta demanda.');
  }

  // 2. Speed to Lead Risk
  switch (data.leadFollowUpTime) {
    case 'Dia siguiente':
      missedCallRate += 0.15;
      riskScore += 25;
      recommendations.push('Responder al dia siguiente reduce la conversion frente a responder en los primeros 5 minutos.');
      break;
    case 'Mismo dia':
    case '< 1 hour':
      missedCallRate += 0.05;
      riskScore += 10;
      break;
    case '< 5 min':
      // Best practice
      break;
  }

  // 3. Strategy Risk
  if (data.missedCallsStrategy === 'Nada') {
    missedCallRate += 0.15;
    riskScore += 30;
    recommendations.push('Cuando una llamada no llega a nadie, ese lead se pierde por completo.');
  } else if (data.missedCallsStrategy === 'Buzon de voz') {
    missedCallRate += 0.10; // Most people don't leave voicemails or wait for call backs
    riskScore += 15;
    recommendations.push('Muchos pacientes cuelgan al escuchar el buzon de voz y llaman a otra clinica.');
  }

  // Ad Spend Risk Multiplier
  if (data.runsAds) {
    riskScore += 10;
    recommendations.push('El trafico pago combinado con llamadas perdidas consume presupuesto mucho mas rapido.');
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
    recommendations.push(`Un valor por caso alto ($${data.avgCaseValue}) hace que cada llamada perdida sea costosa.`);
  }

  const riskLevel = riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW';

  if (recommendations.length === 0) {
      recommendations.push('Su cobertura es buena, pero la IA ayuda a responder cada llamada 24/7.');
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
    receptionConfig: 'Multitarea',
    leadFollowUpTime: '< 1 hour',
    runsAds: false,
    missedCallsStrategy: 'Buzon de voz',
    avgCaseValue: 4500 // Typical Ortho case value
  });

  const totalSteps = 7;

  const handleSiguiente = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleAtras = () => {
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
            <span className="text-sm font-bold text-brand">{Math.round((step / totalSteps) * 100)}% completo</span>
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Como se llama su clinica?</h2>
              <input
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/50 transition-all"
                placeholder="Ej. Clinica Dental Nova"
                value={formData.clinicName}
                onChange={(e) => updateField('clinicName', e.target.value)}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Cuantas llamadas entrantes recibe al dia?</h2>
              <p className="text-text-muted">Un estimado esta bien.</p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Como funciona su recepcion?</h2>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => updateField('receptionConfig', 'Multitarea')}
                  className={`p-6 rounded-2xl border text-left transition-all ${formData.receptionConfig === 'Multitarea' ? 'bg-brand border-brand text-white' : 'bg-white/10 border-white/10 hover:bg-white/20 text-text-muted'}`}
                >
                  <div className="text-xl font-bold mb-1">Multitarea</div>
                  <div className="text-sm opacity-80">Gestiona check-ins, pagos y llamadas</div>
                </button>
                <button
                  onClick={() => updateField('receptionConfig', 'Dedicated')}
                  className={`p-6 rounded-2xl border text-left transition-all ${formData.receptionConfig === 'Dedicated' ? 'bg-brand border-brand text-white' : 'bg-white/10 border-white/10 hover:bg-white/20 text-text-muted'}`}
                >
                  <div className="text-xl font-bold mb-1">Equipo dedicado a llamadas</div>
                  <div className="text-sm opacity-80">Alguien responde llamadas todo el tiempo sin tareas de oficina</div>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Que tan rapido devuelve llamadas perdidas?</h2>
              <div className="space-y-3">
                {['< 5 min', '< 1 hour', 'Mismo dia', 'Dia siguiente'].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateField('leadFollowUpTime', option)}
                    className={`w-full p-6 rounded-2xl font-bold text-lg text-left transition-all ${formData.leadFollowUpTime === option
                      ? 'bg-brand text-white shadow-[0_0_30px_rgba(255,106,0,0.4)]'
                      : 'bg-white/10 text-text-muted hover:bg-white/20'
                      }`}
                  >
                    {option}
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
                  Yes
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Que pasa con las llamadas perdidas?</h2>
              <div className="space-y-3">
                {['Buzon de voz', 'Servicio de contestacion', 'Nada'].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateField('missedCallsStrategy', option)}
                    className={`w-full p-6 rounded-2xl font-bold text-lg text-left transition-all ${formData.missedCallsStrategy === option
                      ? 'bg-brand text-white shadow-[0_0_30px_rgba(255,106,0,0.4)]'
                      : 'bg-white/10 text-text-muted hover:bg-white/20'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">¿Valor promedio por caso?</h2>
              <p className="text-text-muted">Revenue per new patient (e.g., Aligner/Braces case).</p>
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
                onClick={handleAtras}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-all"
              >
                Atras
              </button>
            )}
            <button
              onClick={handleSiguiente}
              disabled={step === 1 && !formData.clinicName}
              className="flex-1 px-8 py-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-[0_0_30px_rgba(255,106,0,0.3)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === totalSteps ? 'Calculate Revenue Loss' : 'Continue'}
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
          <h1 className="text-4xl md:text-5xl font-black text-white">Resultados de evaluacion de la clinica</h1>
          <p className="text-xl text-text-muted">{data.clinicName}</p>
        </div>

        {/* REVENUE HERO */}
        <div className={`glass-panel rounded-3xl p-6 sm:p-12 border ${getRiskBgColor(results.riskLevel)} text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-brand/5 animate-pulse duration-[3000ms]"></div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-base sm:text-lg text-text-muted font-bold uppercase tracking-normal">Ingresos mensuales potenciales recuperables</h3>
            <div className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_0_20px_rgba(255,106,0,0.5)]">
              ${slidingRevenue.toLocaleString()}
            </div>

            {/* Interactive Slider Section */}
            <div className="max-w-md mx-auto mt-8 pt-8 border-t border-white/10">
              <div className="flex justify-between text-sm font-bold text-text-muted mb-4">
                <span>Conservador (5%)</span>
                <span>Su estimado: <span className="text-brand text-lg">{missedCallRate}%</span></span>
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
                *Calculo: {slidingMissedCalls} llamadas perdidas x 5% de conversion x ${data.avgCaseValue.toLocaleString()} de valor por caso
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-8 border border-white/10">
            <div className="text-text-muted text-sm font-black uppercase tracking-normal mb-4">Llamadas perdidas</div>
            <div className="text-4xl sm:text-5xl font-black text-white">{slidingMissedCalls}</div>
            <div className="text-text-muted mt-2">llamadas/mes que se escapan</div>
          </div>
          <div className="glass-panel rounded-2xl p-8 border border-white/10">
            <div className="text-text-muted text-sm font-black uppercase tracking-normal mb-4">Nuevos casos perdidos</div>
            {/* Estimate lost starts based on revenue divided by case value */}
            <div className="text-4xl sm:text-5xl font-black text-brand">{(slidingRevenue / data.avgCaseValue).toFixed(1)}</div>
            <div className="text-text-muted mt-2">casos/mes perdidos</div>
          </div>
        </div>

        {/* Analysis */}
        <div className="glass-panel rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6">Por que se pierden pacientes</h3>
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
            Solicitar mi demo
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
  const [isAnual, setIsAnual] = useState(false);
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
      alert("Algo salio mal. Intente nuevamente.");
      setFormState('idle');
    }
  };

  const handleStartVoiceDemo = () => {
    const findAndClickWidget = (attempts = 0) => {
      const container = document.querySelector('#nedzo-widget-container');
      let widgetBtn: HTMLElement | null = null;

      if (container && container.shadowRoot) {
        widgetBtn = container.shadowRoot.querySelector('button[aria-label="Hablar con Valentina"]') ||
          container.shadowRoot.querySelector('button[aria-label="Talk to Valentina"]') ||
          container.shadowRoot.querySelector('button[aria-label="Talk to Chloe"]');
      }

      if (!widgetBtn) {
        const selectors = ['iframe[src*="nedzo"]', 'div[id*="nedzo"] button'];
        for (const selector of selectors) {
          const found = document.querySelector(selector);
          if (found instanceof HTMLElement) widgetBtn = found;
          if (widgetBtn) break;
        }
      }

      if (widgetBtn) {
        widgetBtn.click();
      } else if (attempts < 10) {
        setTimeout(() => findAndClickWidget(attempts + 1), 500);
      } else {
        window.dispatchEvent(new CustomEvent('nedzo-open'));
        alert("La agente de IA esta cargando. Intente nuevamente en un momento.");
      }
    };

    findAndClickWidget();
  };

  useEffect(() => {
    const localizeNedzoWidget = () => {
      const container = document.querySelector('#nedzo-widget-container');
      const shadowRoot = container?.shadowRoot;
      if (!shadowRoot) return;

      const buttons = shadowRoot.querySelectorAll('button');
      buttons.forEach((button) => {
        const label = button.getAttribute('aria-label');
        if (label?.includes('Chloe')) {
          button.setAttribute('aria-label', 'Hablar con Valentina');
        }
      });

      const walker = document.createTreeWalker(shadowRoot, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        if (node.textContent?.includes('Talk to Chloe')) {
          node.textContent = node.textContent.replaceAll('Talk to Chloe', 'Hablar con Valentina');
        }
        node = walker.nextNode();
      }
    };

    localizeNedzoWidget();
    const timer = window.setInterval(localizeNedzoWidget, 500);
    return () => window.clearInterval(timer);
  }, []);



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
      title: 'Cobertura siempre activa',
      description: 'Nova AI Voice responde llamadas perdidas, fuera de horario y de alto volumen antes de que lleguen al buzon de voz.',
      outcome: 'Menos oportunidades perdidas'
    },
    {
      id: 'qualification',
      step: '02',
      title: 'Recepcion estructurada',
      description: 'Valentina recopila los datos que su equipo necesita para que cada paciente llegue calificado y documentado.',
      outcome: 'Mejor traspaso al equipo'
    },
    {
      id: 'booking',
      step: '03',
      title: 'Agenda controlada',
      description: 'Las citas se agendan solo cuando horario, disponibilidad e informacion requerida estan alineados.',
      outcome: 'Agendas mas limpias'
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
    <div className="overflow-x-hidden bg-bg-main text-white font-sans selection:bg-brand/20">
      {/* (Rest of the original landing page content remains here, slightly adjusted for navigation) */}
      {/* 1) HEADER + STICKY NAV */}
      <header className="fixed w-full top-0 z-50 bg-bg-main/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[5.5rem] sm:h-24">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer group py-2"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img
                src="/lockup-dark.svg"
                alt="Nova AI Voice"
                width="168"
                height="56"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(0,212,255,0.35)]"
              />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              <a href="#live-demo" className="text-sm font-medium uppercase tracking-normal text-text-muted hover:text-white hover:text-glow transition-all">Demo en vivo</a>
              <a href="#features" className="text-sm font-medium uppercase tracking-normal text-text-muted hover:text-white hover:text-glow transition-all">Beneficios</a>
              <a href="#pricing" className="text-sm font-medium uppercase tracking-normal text-text-muted hover:text-white hover:text-glow transition-all">Precios</a>
              <button
                onClick={() => setView('assessment')}
                className="text-sm font-medium uppercase tracking-normal text-text-muted hover:text-white hover:text-glow transition-all flex items-center gap-2"
              >
                <span>Calculadora ROI</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] uppercase tracking-wider font-bold">Nuevo</span>
              </button>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <a href="#demo" className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold rounded-full text-white backdrop-blur-md transition-all hover:scale-105 hover:border-brand/30">
                Solicitar llamada inicial
              </a>
              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-gray-300 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Cerrar menu movil" : "Abrir menu movil"}
                aria-expanded={mobileMenuOpen}
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
              <a href="#live-demo" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white hover:bg-white/5 rounded-md">Demo en vivo</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white hover:bg-white/5 rounded-md">Beneficios</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white hover:bg-white/5 rounded-md">Precios</a>
              <button
                onClick={() => { setView('assessment'); setMobileMenuOpen(false); }}
                className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white hover:bg-white/5 rounded-md w-full text-left"
              >
                Calculadora ROI
              </button>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center mt-4 px-6 py-3 border border-transparent text-base font-bold rounded-lg text-bg-main bg-brand hover:bg-brand-hover">Solicitar llamada inicial</a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* 2) HERO SECTION */}
        <section className="relative min-h-[92svh] flex flex-col justify-center items-center pt-36 pb-20 overflow-hidden">

          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-70"></div>

          {/* THE SENTINEL: AI CORE ANIMATION */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-accent/10 rounded-full blur-[140px] pointer-events-none"></div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 flex flex-col items-center">

            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-light text-xs font-bold uppercase tracking-normal mb-8 animate-[fadeIn_0.6s_ease-out] hover:bg-white/10 transition-colors cursor-default backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              Para clinicas dentales y ortodonticas
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-normal mb-8 leading-tight drop-shadow-xl relative z-20">
              Deje de perder pacientes valiosos <br className="hidden md:block" />
              por <span className="gradient-text relative inline-block">
                Llamadas perdidas
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-4 max-w-3xl mx-auto text-xl md:text-2xl text-text-muted leading-relaxed font-medium">
              Nova AI Voice ayuda a clinicas dentales y ortodonticas a responder cada llamada, calificar al paciente correcto y agendar consultas <span className="text-brand font-bold">24/7</span> sin reemplazar a su recepcion.
            </p>
            <p className="mt-5 max-w-2xl mx-auto text-sm md:text-base uppercase tracking-normal text-text-soft">
              Valentina atiende desbordes, llamadas fuera de horario y momentos ocupados para que su equipo se mantenga enfocado en la clinica.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-lg mx-auto sm:max-w-none justify-center">
              <button
                onClick={() => {
                  document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' });
                  setTimeout(() => document.getElementById('start-demo-btn')?.focus(), 800);
                }}
                className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-brand hover:bg-brand-hover text-bg-main text-base sm:text-lg font-bold rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.22)] hover:shadow-[0_0_60px_rgba(0,212,255,0.32)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer"></div>
                <span>Hablar con Valentina</span>
                <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                onClick={() => setView('assessment')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-white/5 hover:bg-white/10 text-white text-base sm:text-lg font-semibold rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-md transition-all">
                <span>Estimar ingresos perdidos</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-14 sm:mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-70 transition-all duration-500">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-normal text-text-muted"><svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.21a12.002 12.002 0 00-16.45 0A12.002 12.002 0 003 12c0 2.757 1.12 5.257 2.988 7.071L12 22l6.012-2.929A12.002 12.002 0 0021 12c0-2.757-1.12-5.257-2.988-7.071z"></path></svg> CREADO PARA GENERAR CONFIANZA</div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-normal text-text-muted"><svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> AGENDA CONTROLADA</div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-normal text-text-muted"><svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> APOYA A SU EQUIPO</div>
            </div>

          </div>
        </section>

        {/* 3) LIVE DEMO SECTION */}
        <section id="live-demo" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-main via-[#091425] to-bg-card"></div>

          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <div className="inline-block px-4 py-1 rounded-full border border-brand/20 bg-white/5 backdrop-blur-sm mb-6">
              <span className="text-brand font-bold tracking-normal uppercase text-xs animate-pulse">Demo interactiva</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-normal text-white mb-6">Experimente a Valentina en vivo</h2>

            <p className="text-text-muted text-lg max-w-2xl mx-auto mb-12">
              Valentina es la recepcionista de Nova AI Voice para clinicas dentales y ortodonticas. Pruebe como se siente capturar llamadas perdidas, calificar pacientes y agendar consultas en una conversacion real.
            </p>

            <div className="relative mx-auto max-w-4xl">
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-brand/50 via-brand-light/40 to-accent/45 blur opacity-20"></div>

              <div id="demo-widget-mount" className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_26%_18%,rgba(0,212,255,0.16),transparent_28%),linear-gradient(145deg,rgba(14,30,54,0.95),rgba(8,17,31,0.98))] p-5 shadow-2xl sm:p-8">
                <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-20 pointer-events-none"></div>

                <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="flex justify-center lg:justify-end">
                    <div className="demo-phone-tilt relative w-[13.5rem] sm:w-[15rem]">
                      <div className="absolute -inset-5 rounded-full bg-brand/20 blur-[55px]"></div>
                      <div className="relative rounded-[2.2rem] border border-white/15 bg-gradient-to-br from-white/[0.16] to-white/[0.04] p-1.5 shadow-[0_28px_80px_rgba(0,0,0,0.36)]">
                        <div className="overflow-hidden rounded-[1.85rem] border border-white/10 bg-[#071425] p-3">
                          <div className="mx-auto mb-3 h-4 w-20 rounded-b-2xl bg-black/70"></div>
                          <div className="relative min-h-[20rem] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.20),transparent_36%),linear-gradient(180deg,#0D2440,#07101F)] p-4 text-left">
                            <div className="mb-5 flex items-center justify-between">
                              <div>
                                <div className="text-[9px] font-bold uppercase tracking-normal text-brand-light">Nova AI Voice</div>
                                <div className="text-lg font-black text-white">Valentina</div>
                              </div>
                              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand text-bg-main">
                                <span className="demo-ring absolute inset-0 rounded-full border border-brand"></span>
                                <Phone className="relative h-5 w-5" />
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-normal text-brand-light">Llamada en vivo</span>
                                <span className="text-xs font-bold text-text-soft">00:18</span>
                              </div>
                              <div className="text-sm font-black text-white">Consulta de nuevo paciente</div>
                              <div className="mt-1 text-xs text-text-muted">Prefiere consulta por la manana</div>
                            </div>

                            <div className="mt-4 flex h-12 items-center justify-between rounded-2xl bg-bg-main/60 px-4 text-brand">
                              <span className="voice-bar h-4 w-1.5 rounded-full bg-current"></span>
                              <span className="voice-bar h-8 w-1.5 rounded-full bg-current"></span>
                              <span className="voice-bar h-5 w-1.5 rounded-full bg-current"></span>
                              <span className="voice-bar h-10 w-1.5 rounded-full bg-current"></span>
                              <span className="voice-bar h-6 w-1.5 rounded-full bg-current"></span>
                              <span className="voice-bar h-9 w-1.5 rounded-full bg-current"></span>
                            </div>

                            <div className="mt-4 rounded-2xl border border-brand/20 bg-brand/10 p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-bg-main">
                                  <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-normal text-brand-light">Consulta agendada</div>
                                  <div className="text-sm font-black text-white">Martes, 10:30 a.m.</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="demo-flow-card rounded-2xl border border-white/10 bg-bg-main/70 p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-normal text-text-soft">1. El paciente llama</div>
                          <div className="text-base font-black text-white">Entra una nueva consulta</div>
                        </div>
                      </div>
                    </div>

                    <div className="demo-flow-card answer rounded-2xl border border-white/10 bg-bg-main/70 p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-normal text-text-soft">2. Valentina contesta</div>
                          <div className="text-base font-black text-white">Califica al paciente con calma</div>
                        </div>
                      </div>
                    </div>

                    <div className="demo-flow-card book rounded-2xl border border-white/10 bg-bg-main/70 p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-normal text-text-soft">3. Cita agendada</div>
                          <div className="text-base font-black text-white">Su equipo recibe el resumen</div>
                        </div>
                      </div>
                    </div>

                    <button
                      id="start-demo-btn"
                      onClick={handleStartVoiceDemo}
                      className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-brand px-5 py-4 text-base font-black text-bg-main shadow-[0_0_45px_rgba(0,212,255,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-brand-hover hover:shadow-[0_0_60px_rgba(0,212,255,0.34)] focus:outline-none focus:ring-4 focus:ring-brand/50 sm:text-lg"
                    >
                      <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:animate-shimmer"></div>
                      <Phone className="h-5 w-5 transition-transform group-hover:rotate-12" />
                      <span>Iniciar demo con Valentina</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-24 relative bg-[linear-gradient(180deg,rgba(14,30,54,0.72),rgba(10,22,40,0.98))]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-normal mb-4">Construido para apoyar una recepcion fuerte</h2>
              <p className="text-text-muted max-w-2xl mx-auto">
                Mantenga a su equipo enfocado en los pacientes de la clinica mientras Nova AI Voice atiende desbordes, llamadas fuera de horario y la recepcion inicial de forma consistente.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
              <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Sin primeras impresiones perdidas</h3>
                <p className="text-text-muted">Nova AI Voice responde rapido cuando su equipo esta ocupado, en almuerzo o en otra llamada, para que los pacientes valiosos no caigan al buzon de voz.</p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Agenda con reglas claras</h3>
                <p className="text-text-muted">Las consultas se agendan solo cuando se captura la informacion correcta y la cita encaja con las reglas y disponibilidad de su clinica.</p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Calificacion consistente</h3>
                <p className="text-text-muted">Cada llamada sigue un intake estructurado para que su equipo reciba mejores traspasos y consultas mas calificadas.</p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Cobertura 24/7</h3>
                <p className="text-text-muted">Las llamadas fuera de horario, de fines de semana y de anuncios reciben respuesta con una experiencia calmada y profesional para el paciente.</p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Desborde sin sobrecargar al equipo</h3>
                <p className="text-text-muted">Nova le da margen a su equipo en horas pico mientras mantiene una calidad constante en cada llamada entrante.</p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Experiencia clara para el paciente</h3>
                <p className="text-text-muted">Los pacientes reciben una interaccion rapida y profesional que se siente moderna y util, no como un call center generico ni una automatizacion rigida.</p>
              </div>
            </div>
          </div>
        </section >




        {/* BRIDGE: 48-HOUR DEMO CHALLENGE */}
        < section className="py-24 relative overflow-hidden" >
          {/* Background Gradient to smooth transition from Hero Black to Precios Black */}
          < div className="absolute inset-0 bg-gradient-to-b from-bg-main via-[#0B1930] to-bg-main pointer-events-none" ></div >

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-gradient-to-br from-white/5 to-white/0 border border-brand/20 p-6 sm:p-8 md:p-14 rounded-3xl relative overflow-hidden text-center group hover:border-brand/40 transition-all duration-500 shadow-2xl">

              {/* Glow Effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50 blur-sm"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-brand/20 to-accent/20 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>

              <span className="inline-block py-1 px-4 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-normal">
                Demo personalizada
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-6 tracking-normal leading-tight">
                Construimos su demo de Nova AI Voice <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">en 48 horas</span>
              </h2>

              <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                En lugar de pedirle que imagine el flujo, configuramos una demo segun los horarios, intake y reglas de agenda de su clinica para que escuche la diferencia antes de comprometerse.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <a
                  href="#demo"
                  className="w-full sm:w-auto justify-center px-6 sm:px-10 py-4 sm:py-5 bg-brand hover:bg-brand-hover text-bg-main text-base sm:text-xl font-black rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.22)] hover:shadow-[0_0_60px_rgba(0,212,255,0.32)] transition-all hover:-translate-y-1 transform flex items-center gap-3 group"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Solicitar demo de 48h
                </a>
                <div className="flex items-center gap-2 text-sm text-text-muted opacity-80">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                  <span>La configuracion empieza cuando usted este listo para salir en vivo</span>
                </div>
              </div>

            </div>
          </div>
        </section >

        {/* 7) PRICING */}
        < section id="pricing" className="py-24 bg-bg-main relative" >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-normal">Precios simples para consultas agendadas</h2>
              <p className="text-text-muted mb-8">Configuracion clara, precio mensual claro y una prueba en vivo antes del despliegue.</p>

              {/* Setup Banner */}
              <div className="inline-block bg-brand/10 border border-brand/30 rounded-lg px-6 py-2 mb-8">
                <span className="text-brand font-semibold text-sm md:text-base">$300 de configuracion + prueba en vivo de 14 dias incluida</span>
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`font-medium transition-colors ${!isAnual ? 'text-white' : 'text-text-muted'}`}>Mensual</span>
                <div className="relative inline-block w-14 h-8 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="price-toggle"
                    checked={isAnual}
                    onChange={(e) => setIsAnual(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1 transition-all duration-300"
                  />
                  <label htmlFor="price-toggle" className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-700 cursor-pointer transition-colors duration-300"></label>
                </div>
                <span className={`font-medium transition-colors ${isAnual ? 'text-white' : 'text-text-muted'}`}>Anual</span>
                <span className="ml-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded-full">Ahorre 20%</span>
              </div>
            </div>

            {/* Precios Cards */}
            <div className="grid md:grid-cols-3 gap-8 items-start">

              {/* Starter */}
              <div className="bg-bg-card border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">Starter</h3>
                  <p className="text-sm text-text-muted mt-2 min-h-10">Perfecto para clinicas pequenas que empiezan con automatizacion.</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${isAnual ? 237 : 297}</span>
                  <span className="text-text-muted">/mes</span>
                  <div className="text-xs text-text-muted mt-1">{isAnual ? 'Facturado anualmente' : 'Facturado mensualmente'}</div>
                </div>
                <a href="#demo" className="block w-full text-center py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors">Hablar sobre Starter</a>
                <ul className="mt-8 space-y-4 text-sm text-text-muted flex-grow">
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 1 agente de voz IA</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 250 minutos / mes</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Atencion de llamadas entrantes 24/7</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Calificacion y agenda basica</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Notificaciones por email</li>
                </ul>
                <div className="mt-6 pt-6 border-t border-white/5 text-xs text-text-muted text-center">
                  Los minutos se reinician mensualmente
                </div>
              </div>

              {/* Growth */}
              <div className="bg-bg-card border border-brand/50 rounded-2xl p-8 relative shadow-[0_0_40px_rgba(0,212,255,0.15)] transform md:-translate-y-4 flex flex-col h-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand text-bg-main text-xs font-bold px-3 py-1 rounded-full uppercase tracking-normal">Mas popular</div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">Growth</h3>
                  <p className="text-sm text-text-muted mt-2 min-h-10">Nuestro plan estandar para clinicas en crecimiento con necesidades de agenda.</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${isAnual ? 397 : 497}</span>
                  <span className="text-text-muted">/mes</span>
                  <div className="text-xs text-text-muted mt-1">{isAnual ? 'Facturado anualmente' : 'Facturado mensualmente'}</div>
                </div>
                <a href="#demo" className="block w-full text-center py-3 bg-brand rounded-lg text-bg-main font-bold hover:bg-brand-hover transition-colors shadow-lg">Iniciar prueba de 14 dias</a>
                <ul className="mt-8 space-y-4 text-sm text-text-muted flex-grow">
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 1 agente de voz IA</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 400 minutos / mes</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Atencion de llamadas entrantes 24/7</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> <span className="text-white font-medium">Sincronizacion de calendario</span></li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Calificacion avanzada de pacientes</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Logica inteligente de agenda</li>
                </ul>
                <div className="mt-6 pt-6 border-t border-white/5 text-xs text-text-muted text-center">
                  Minutos extra disponibles
                </div>
              </div>

              {/* Pro */}
              <div className="bg-bg-card border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">Pro</h3>
                  <p className="text-sm text-text-muted mt-2 min-h-10">Cobertura maxima para clinicas con mayor volumen de llamadas.</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${isAnual ? 557 : 697}</span>
                  <span className="text-text-muted">/mes</span>
                  <div className="text-xs text-text-muted mt-1">{isAnual ? 'Facturado anualmente' : 'Facturado mensualmente'}</div>
                </div>
                <a href="#demo" className="block w-full text-center py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors">Hablar sobre Pro</a>
                <ul className="mt-8 space-y-4 text-sm text-text-muted flex-grow">
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Hasta 2 agentes de voz IA</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 600 minutos / mes</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Atencion de llamadas entrantes 24/7</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Soporte prioritario</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Gestion de desborde de llamadas</li>
                  <li className="flex gap-3"><svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Guiones personalizados</li>
                </ul>
                <div className="mt-6 pt-6 border-t border-white/5 text-xs text-text-muted text-center">
                  Ideal para clinicas de alto volumen
                </div>
              </div>

            </div>
          </div>
        </section >

        {/* 8) FAQ SECTION */}
        <section id="faq" className="py-24 relative overflow-hidden bg-[linear-gradient(180deg,rgba(10,22,40,0.98),rgba(14,30,54,0.72))]">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-20 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 rounded-full border border-brand/20 bg-brand/10 backdrop-blur-sm mb-6">
                <span className="text-brand font-bold tracking-normal uppercase text-xs">FAQ</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-normal">Preguntas frecuentes</h2>
              <p className="text-text-muted text-lg">Todo lo que necesita saber antes de probar Nova AI Voice en su clinica.</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "¿Que es exactamente Nova AI Voice?",
                  a: "Nova AI Voice es una recepcionista de IA para clinicas dentales y ortodonticas. Responde llamadas, califica pacientes, captura datos clave y agenda consultas mientras su recepcion se concentra en las personas que ya estan en la clinica."
                },
                {
                  q: "¿Nova AI Voice reemplaza a mi equipo de recepcion?",
                  a: "No. Nova AI Voice apoya a su equipo durante desbordes, llamadas fuera de horario, almuerzos y momentos ocupados. Su personal mantiene el control mientras Valentina atiende el intake repetitivo."
                },
                {
                  q: "¿Valentina puede agendar citas?",
                  a: "Si. Valentina puede recopilar la informacion correcta del paciente y agendar consultas usando las reglas de calendario que usted apruebe durante la configuracion."
                },
                {
                  q: "¿Con que calendarios puede trabajar?",
                  a: "Nova AI Voice puede configurarse con Google Calendar, Outlook, iCloud, Jane, Cliniko u otro proceso de agenda que su clinica ya use."
                },
                {
                  q: "¿Puedo probarlo antes de comprometerme?",
                  a: "Si. Podemos construir una demo adaptada a sus horarios, flujo de recepcion y reglas de agenda para que escuche como Valentina maneja escenarios reales antes del despliegue."
                }
              ].map((item, i) => (
                <details key={i} className="glass-card rounded-2xl group">
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                    <span className="font-semibold text-white text-lg pr-4">{item.q}</span>
                    <span className="text-brand text-2xl flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-6 pb-6 text-text-muted leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 9) FOOTER WITH FORM */}
        < footer className="bg-[#08111f] pt-20 pb-12 border-t border-white/5 relative overflow-hidden" id="demo" >
          {/* Ambient Background Glow for Footer */}
          < div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" ></div >

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">

              {/* Left Column: Value Prop & Trust */}
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-normal mb-6">
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                    Solicitud de llamada inicial
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-normal">
                    Vea como Nova AI Voice puede <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">apoyar a su recepcion</span>
                  </h2>
                  <p className="text-xl text-text-muted leading-relaxed">
                    Revisaremos su flujo de llamadas, mostraremos donde se escapan los leads y mapearemos una demo en vivo que encaje con su proceso actual de agenda.
                  </p>
                </div>

                {/* Trust Elements */}
                <div className="pt-8 border-t border-white/5">
                  <p className="text-sm text-text-muted font-medium mb-4 uppercase tracking-normal">Compatible con</p>
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
                  <span>Manejo seguro y privado de datos de pacientes</span>
                </div>
              </div>

              {/* Right Column: High Ticket Intake Terminal */}
              <div className="bg-bg-card border border-white/10 p-1 rounded-3xl shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none"></div>

                <div className="bg-[#0A0B10] rounded-[22px] p-6 sm:p-8 md:p-10 relative overflow-hidden">
                  {/* Glow Effect */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50"></div>

                  {formState === 'success' ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 z-20 animate-[fadeIn_0.5s_ease-out]">
                      <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-3">Solicitud recibida</h3>
                      <p className="text-text-muted mb-6">Nuestro equipo lo contactara pronto para confirmar su llamada inicial y los detalles de configuracion de la demo.</p>
                      <div className="w-full bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between text-xs text-text-muted mb-2">
                          <span>Status</span>
                          <span className="text-green-400">Revision pendiente</span>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full w-1/3 animate-[loading_2s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Solicite su llamada inicial</h3>
                        <p className="text-sm text-text-muted">Cuentenos sobre su clinica. Usaremos esta informacion para adaptar la demo de Nova AI Voice a su flujo actual.</p>
                      </div>

                      <form onSubmit={handleBookDemo} className="space-y-5 relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="name" className="block text-xs font-semibold text-text-muted uppercase tracking-normal mb-2">Responsable de la clinica</label>
                            <input type="text" id="name" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-white/20" placeholder="Dr. Nombre" />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-text-muted uppercase tracking-normal mb-2">Email de trabajo</label>
                            <input type="email" id="email" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-white/20" placeholder="nombre@clinica.com" />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="calendar" className="block text-xs font-semibold text-text-muted uppercase tracking-normal mb-2">Sistema de calendario actual</label>
                          <select id="calendar" defaultValue="" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all appearance-none cursor-pointer">
                            <option value="" disabled className="bg-[#0A0B10] text-gray-500">Seleccione sistema...</option>
                            <option value="Google Calendar" className="bg-[#0A0B10] text-white">Google Calendar</option>
                            <option value="Outlook / Office 365" className="bg-[#0A0B10] text-white">Outlook / Office 365</option>
                            <option value="iCloud" className="bg-[#0A0B10] text-white">iCloud</option>
                            <option value="Agenda en papel" className="bg-[#0A0B10] text-white">Agenda en papel</option>
                            <option value="Otro" className="bg-[#0A0B10] text-white">Otro</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="volume" className="block text-xs font-semibold text-text-muted uppercase tracking-normal mb-2">Volumen mensual de pacientes</label>
                          <select id="volume" defaultValue="" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all appearance-none cursor-pointer">
                            <option value="" disabled className="bg-[#0A0B10] text-gray-500">Seleccione volumen...</option>
                            <option value="Inicial (0-200)" className="bg-[#0A0B10] text-white">Inicial (0-200)</option>
                            <option value="En crecimiento (200-1000)" className="bg-[#0A0B10] text-white">En crecimiento (200-1000)</option>
                            <option value="Alto volumen (1000+)" className="bg-[#0A0B10] text-white">Alto volumen (1000+)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={formState === 'processing'}
                          className="w-full bg-brand hover:bg-brand-hover text-bg-main font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.22)] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-wait mt-4 flex items-center justify-center gap-2 group"
                        >
                          <span>{formState === 'processing' ? 'Procesando...' : 'Solicitar llamada inicial'}</span>
                          {formState !== 'processing' && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>}
                        </button>

                        <p className="text-center text-[10px] text-text-muted">
                          No se requiere tarjeta de credito. Toma menos de 30 segundos.
                        </p>
                      </form>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-text-muted text-sm">© 2025 Nova AI Voice. Todos los derechos reservados. Cumplimiento HIPAA.</p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
                <a href="/privacy" className="hover:text-white transition-colors">Politica de privacidad</a>
                <a href="/terms" className="hover:text-white transition-colors">Terminos de servicio</a>
                <span className="text-white/20">|</span>
                <span className="text-white/40 text-xs">Integra con:</span>
                <a href="https://workspace.google.com/products/calendar/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Google Calendar</a>
                <a href="https://www.jane.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Jane App</a>
                <a href="https://www.cliniko.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Cliniko</a>
              </div>
            </div>
          </div>
        </footer >
      </main >
    </div >
  );
};

// --- SEO helper for sub-pages ---
const updatePageMeta = (title: string, description: string, canonicalPath: string) => {
  document.title = title;
  const setMeta = (selector: string, attr: string, content: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
    if (!el) {
      const tag = selector.startsWith('link') ? 'link' : 'meta';
      el = document.createElement(tag) as any;
      const match = selector.match(/\[([\w-]+)="([^"]+)"\]/);
      if (match) (el as any).setAttribute(match[1], match[2]);
      document.head.appendChild(el);
    }
    el.setAttribute(attr, content);
  };
  setMeta('meta[name="description"]', 'content', description);
  setMeta('link[rel="canonical"]', 'href', `https://www.novaaivoice.lat${canonicalPath}`);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', `https://www.novaaivoice.lat${canonicalPath}`);
};

// --- Politica de privacidad Page ---
const PrivacyPage = () => {
  React.useEffect(() => {
    updatePageMeta(
      'Politica de privacidad | Nova AI Voice',
      'Politica de privacidad de Nova AI Voice. Conozca como manejamos datos de pacientes, cumplimiento HIPAA y retencion de datos para nuestra recepcionista de IA.',
      '/privacy'
    );
  }, []);
  return (
  <div className="min-h-screen bg-[#07080B] text-white font-sans">
    <header className="border-b border-white/5 py-6 px-8">
      <a href="/" className="text-brand font-bold text-lg hover:opacity-80 transition-opacity">← Nova AI Voice</a>
    </header>
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black mb-4">Politica de privacidad</h1>
      <p className="text-text-muted mb-10 text-sm">Ultima actualizacion: 27 de abril de 2025</p>
      <div className="space-y-8 text-text-muted leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Informacion que recopilamos</h2>
          <p>Nova AI Voice recopila la informacion que usted proporciona al solicitar una llamada o demo, incluyendo nombre, email de trabajo, nombre de la clinica y sistema de calendario. Tambien procesamos datos de llamadas a traves de nuestros agentes de voz IA en nombre de su clinica, lo que puede incluir informacion protegida de salud (PHI).</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Cumplimiento HIPAA</h2>
          <p>Nova AI Voice opera en cumplimiento con HIPAA. Actuamos como Business Associate cuando procesamos PHI en nombre de entidades cubiertas. Un Business Associate Agreement (BAA) esta disponible y es requerido para despliegues clinicos. La PHI se cifra en transito y en reposo, y nunca se vende ni se usa con fines publicitarios.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Como usamos su informacion</h2>
          <p>Usamos la informacion recopilada para prestar y mejorar el servicio de recepcionista IA, comunicarnos con usted sobre su cuenta o demo y enviar actualizaciones relevantes con su consentimiento. No vendemos datos personales a terceros.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Retencion de datos</h2>
          <p>Las grabaciones y transcripciones de llamadas se conservan durante el periodo definido en su acuerdo de servicio. Puede solicitar la eliminacion de sus datos en cualquier momento contactandonos. Los datos de la clinica se eliminan permanentemente dentro de los 30 dias posteriores a la terminacion de la cuenta.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Integraciones de terceros</h2>
          <p>Nova se integra con calendarios de terceros como Google Calendar, Microsoft Outlook, Apple iCloud, Jane App y Cliniko. Los datos compartidos con esos sistemas se rigen por sus propias politicas de privacidad. Solo transmitimos los datos minimos necesarios para completar reservas de citas.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">6. Contacto</h2>
          <p>Para consultas de privacidad, solicitudes de eliminacion de datos o ejecucion de un BAA, contactenos mediante el formulario de llamada inicial en <a href="/" className="text-brand hover:underline">novaaivoice.lat</a>.</p>
        </section>
      </div>
    </main>
  </div>
  );
};

// --- Terminos de servicio Page ---
const TermsPage = () => {
  React.useEffect(() => {
    updatePageMeta(
      'Terminos de servicio | Nova AI Voice',
      'Terminos de servicio de Nova AI Voice. Suscripcion, facturacion, uso aceptable y limitacion de responsabilidad para nuestra recepcionista de IA.',
      '/terms'
    );
  }, []);
  return (
  <div className="min-h-screen bg-[#07080B] text-white font-sans">
    <header className="border-b border-white/5 py-6 px-8">
      <a href="/" className="text-brand font-bold text-lg hover:opacity-80 transition-opacity">← Nova AI Voice</a>
    </header>
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black mb-4">Terminos de servicio</h1>
      <p className="text-text-muted mb-10 text-sm">Ultima actualizacion: 27 de abril de 2025</p>
      <div className="space-y-8 text-text-muted leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Descripcion del servicio</h2>
          <p>Nova AI Voice presta servicios de recepcionista de voz con IA para clinicas dentales y ortodonticas. Al suscribirse a cualquier plan, usted acepta estos terminos de servicio. El servicio incluye atencion de llamadas entrantes, calificacion de pacientes, agenda de citas y campanas de reactivacion segun el plan seleccionado.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Suscripcion y facturacion</h2>
          <p>Todos los planes requieren una tarifa unica de configuracion de $297. Las suscripciones mensuales se facturan el primer dia de cada ciclo. Las suscripciones anuales reciben un 20% de descuento. Los minutos se reinician mensualmente y no se acumulan. Hay minutos adicionales disponibles en Growth y Pro. Puede cancelar con aviso escrito de 30 dias.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Uso aceptable</h2>
          <p>Usted acepta usar Nova AI Voice exclusivamente para fines legales dentro de una practica de salud autorizada. Es responsable de asegurar que el uso del servicio cumpla con leyes y regulaciones aplicables, incluyendo HIPAA, y de obtener el consentimiento adecuado de pacientes sobre atencion asistida por IA.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Limitacion de responsabilidad</h2>
          <p>Nova AI Voice es una herramienta complementaria de comunicacion y no reemplaza criterio clinico ni servicios de emergencia. No somos responsables por citas perdidas, resultados de pacientes o perdida de ingresos derivada de interrupciones del servicio. Nuestra responsabilidad maxima se limita a las cuotas mensuales pagadas en los 30 dias previos a cualquier reclamo.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Modificaciones</h2>
          <p>Nos reservamos el derecho de actualizar estos terminos con aviso previo de 30 dias. El uso continuado del servicio despues de la notificacion constituye aceptacion de los terminos actualizados.</p>
        </section>
      </div>
    </main>
  </div>
  );
};

// --- Router ---
const pathname = window.location.pathname;
let AppToRender: React.FC;
if (pathname === '/privacy') {
  AppToRender = PrivacyPage;
} else if (pathname === '/terms') {
  AppToRender = TermsPage;
} else {
  AppToRender = App;
}

const root = createRoot(document.getElementById('root')!);
root.render(<AppToRender />);

// Forced clean build for Vercel production deployment
