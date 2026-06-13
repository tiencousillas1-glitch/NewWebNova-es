import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './src/lib/supabase';
import { AssessmentData, AssessmentResults as Results, calculateMissedCallRisk } from './src/lib/assessment';
import Landing from './src/components/Landing';
import AssessmentForm from './src/components/AssessmentForm';
import AssessmentResults from './src/components/AssessmentResults';
import { IntakeData } from './src/components/IntakeForm';

type View = 'landing' | 'assessment' | 'results';

const App = () => {
  const [view, setView] = useState<View>('landing');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<Results | null>(null);

  // --- ROI Calculator ---
  const handleAssessmentComplete = async (data: AssessmentData) => {
    const results = calculateMissedCallRisk(data);
    setAssessmentData(data);
    setAssessmentResults(results);
    setView('results');
    window.scrollTo({ top: 0 });

    // Guardar el assessment en Supabase (en segundo plano).
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
        risk_level: results.riskLevel,
      });
    } catch (err) {
      console.error('Failed to save assessment', err);
    }
  };

  // --- Intake form (Supabase strategy_calls) ---
  const handleSubmitForm = async (data: IntakeData): Promise<boolean> => {
    try {
      const { error } = await supabase.from('strategy_calls').insert({
        name: data.name,
        email: data.email,
        practice_name: data.practice_name,
        pms: data.pms,
        annual_starts: data.annual_starts,
        status: 'pending',
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // --- Nedzo voice widget ---
  const handleStartVoiceDemo = () => {
    const findAndClickWidget = (attempts = 0) => {
      const container = document.querySelector('#nedzo-widget-container');
      let widgetBtn: HTMLElement | null = null;

      if (container && container.shadowRoot) {
        widgetBtn =
          container.shadowRoot.querySelector('button[aria-label="Hablar con Valentina"]') ||
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
        alert('La agente de IA está cargando. Intenta nuevamente en un momento.');
      }
    };

    findAndClickWidget();
  };

  // Localiza el widget Nedzo: renombra el CTA a "Valentina".
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

  const openRoi = () => {
    setView('assessment');
    window.scrollTo({ top: 0 });
  };

  const backToLanding = () => {
    setView('landing');
    window.scrollTo({ top: 0 });
  };

  const bookDemoFromResults = () => {
    setView('landing');
    setTimeout(() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // --- RENDER ---
  if (view === 'assessment') {
    return <AssessmentForm onComplete={handleAssessmentComplete} onBack={backToLanding} />;
  }

  if (view === 'results' && assessmentData && assessmentResults) {
    return <AssessmentResults data={assessmentData} results={assessmentResults} onBookDemo={bookDemoFromResults} onBack={backToLanding} />;
  }

  return <Landing onStartVoiceDemo={handleStartVoiceDemo} onOpenRoi={openRoi} onSubmitForm={handleSubmitForm} />;
};

// --- Page meta helper (para páginas legales) ---
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

// --- Política de privacidad ---
const PrivacyPage = () => {
  useEffect(() => {
    updatePageMeta(
      'Política de privacidad | Nova AI Voice',
      'Política de privacidad de Nova AI Voice. Conoce cómo manejamos datos de pacientes, cumplimiento HIPAA y retención de datos para nuestra recepcionista de IA de ortodoncia.',
      '/privacy',
    );
  }, []);
  return (
    <div className="min-h-screen bg-[#07080B] text-white font-sans">
      <header className="border-b border-white/5 py-6 px-8">
        <a href="/" className="text-brand font-bold text-lg hover:opacity-80 transition-opacity">← Nova AI Voice</a>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black mb-4">Política de privacidad</h1>
        <p className="text-text-muted mb-10 text-sm">Última actualización: 27 de abril de 2025</p>
        <div className="space-y-8 text-text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Información que recopilamos</h2>
            <p>Nova AI Voice recopila la información que usted proporciona al solicitar una llamada o demo, incluyendo nombre, email de trabajo, nombre de la clínica y software de gestión. También procesamos datos de llamadas a través de nuestros agentes de voz IA en nombre de su clínica, lo que puede incluir información protegida de salud (PHI).</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Cumplimiento HIPAA</h2>
            <p>Nova AI Voice opera en cumplimiento con HIPAA. Actuamos como Business Associate cuando procesamos PHI en nombre de entidades cubiertas. Un Business Associate Agreement (BAA) está disponible y es requerido para despliegues clínicos. La PHI se cifra en tránsito y en reposo, y nunca se vende ni se usa con fines publicitarios.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Cómo usamos su información</h2>
            <p>Usamos la información recopilada para prestar y mejorar el servicio de recepcionista IA, comunicarnos con usted sobre su cuenta o demo y enviar actualizaciones relevantes con su consentimiento. No vendemos datos personales a terceros.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Retención de datos</h2>
            <p>Las grabaciones y transcripciones de llamadas se conservan durante el periodo definido en su acuerdo de servicio. Puede solicitar la eliminación de sus datos en cualquier momento contactándonos. Los datos de la clínica se eliminan permanentemente dentro de los 30 días posteriores a la terminación de la cuenta.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Integraciones de terceros</h2>
            <p>Nova AI Voice se integra con calendarios y software de terceros como Google Calendar, Outlook, iCloud, Jane y Cliniko. Los datos compartidos con esos sistemas se rigen por sus propias políticas de privacidad. Solo transmitimos los datos mínimos necesarios para completar reservas de citas.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Contacto</h2>
            <p>Para consultas de privacidad, solicitudes de eliminación de datos o ejecución de un BAA, contáctenos mediante el formulario de la página principal en <a href="/" className="text-brand hover:underline">novaaivoice.lat</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

// --- Términos de servicio ---
const TermsPage = () => {
  useEffect(() => {
    updatePageMeta(
      'Términos de servicio | Nova AI Voice',
      'Términos de servicio de Nova AI Voice. Suscripción, facturación, uso aceptable y limitación de responsabilidad para nuestra recepcionista de IA de ortodoncia.',
      '/terms',
    );
  }, []);
  return (
    <div className="min-h-screen bg-[#07080B] text-white font-sans">
      <header className="border-b border-white/5 py-6 px-8">
        <a href="/" className="text-brand font-bold text-lg hover:opacity-80 transition-opacity">← Nova AI Voice</a>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black mb-4">Términos de servicio</h1>
        <p className="text-text-muted mb-10 text-sm">Última actualización: 27 de abril de 2025</p>
        <div className="space-y-8 text-text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Descripción del servicio</h2>
            <p>Nova AI Voice presta servicios de recepcionista de voz con IA para clínicas de ortodoncia. Al suscribirse a cualquier plan, usted acepta estos términos de servicio. El servicio incluye atención de llamadas entrantes, calificación de pacientes, agenda de primeras visitas y campañas de reactivación según el plan seleccionado.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Suscripción y facturación</h2>
            <p>Todos los planes requieren una tarifa única de configuración de $297. Las suscripciones mensuales se facturan el primer día de cada ciclo. Las suscripciones anuales reciben un 20% de descuento. Los minutos se reinician mensualmente y no se acumulan. Hay minutos adicionales disponibles en Growth y Pro. Puede cancelar con aviso escrito de 30 días.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Uso aceptable</h2>
            <p>Usted acepta usar Nova AI Voice exclusivamente para fines legales dentro de una práctica de salud autorizada. Es responsable de asegurar que el uso del servicio cumpla con leyes y regulaciones aplicables, incluyendo HIPAA, y de obtener el consentimiento adecuado de pacientes sobre atención asistida por IA.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Limitación de responsabilidad</h2>
            <p>Nova AI Voice es una herramienta complementaria de comunicación y no reemplaza criterio clínico ni servicios de emergencia. No somos responsables por citas perdidas, resultados de pacientes o pérdida de ingresos derivada de interrupciones del servicio. Nuestra responsabilidad máxima se limita a las cuotas mensuales pagadas en los 30 días previos a cualquier reclamo.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Modificaciones</h2>
            <p>Nos reservamos el derecho de actualizar estos términos con aviso previo de 30 días. El uso continuado del servicio después de la notificación constituye aceptación de los términos actualizados.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

// --- Router ---
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
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
