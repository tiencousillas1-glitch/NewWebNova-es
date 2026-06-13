// Copy en español para la landing de ortodoncia (versión .lat).
// DATOS REALES del producto (Starter/Growth/Pro por minutos, integraciones de calendario reales).
// Asistente de voz: Valentina. "Nova AI Voice" es la marca del producto. Moneda: USD ($).

export interface Headline {
  pre: string;
  em: string;
  post: string;
}

export interface Feature {
  tag: string;
  title: string;
  body: string;
}

export interface Scenario {
  id: ScenarioId;
  label: string;
}

export interface Plan {
  name: string;
  price: number;
  blurb: string;
  bullets: string[];
  popular?: boolean;
}

export type ScenarioId = 'invisalign' | 'teen' | 'emergency' | 'reactivation';

export const COPY = {
  nav: ['Demo en vivo', 'Características', 'Precios', 'Calculadora ROI'],
  cta_book: 'Reservar demo',
  eyebrow: 'Diseñado para clínicas de ortodoncia',
  headline: {
    pre: 'Cada llamada perdida es un',
    em: 'caso Invisalign de $6.000',
    post: 'que se va a la competencia.',
  } as Headline,
  sub: 'Valentina es la recepcionista IA entrenada para ortodoncia. Contesta al primer tono, distingue brackets, Invisalign y retenedores, y agenda la primera visita directamente en tu calendario. Trabaja 24/7, en español e inglés, sin reemplazar a tu equipo de recepción.',
  primary_cta: 'Habla con Valentina como paciente',
  secondary_cta: 'Calcula tu ROI en 60s',

  features_kicker: 'Entrenada para tu clínica, no para árboles de teléfono genéricos',
  features_title: {
    pre: 'Sabe la diferencia entre un',
    em: 'bracket roto',
    post: 'y un retenedor perdido.',
  } as Headline,
  // 6 características REALES (sin verificación de seguros ni claims inventados).
  features: [
    { tag: 'Cobertura', title: 'Cobertura siempre activa', body: 'Valentina contesta al primer tono cuando tu equipo está ocupado, en el almuerzo o la clínica está cerrada. Ninguna llamada interesada cae al buzón de voz.' },
    { tag: 'Recepción', title: 'Recepción estructurada', body: 'Cada llamada sigue un intake estructurado: tu equipo recibe pacientes calificados y documentados, listos para la consulta.' },
    { tag: 'Seguridad', title: 'Segura y privada (HIPAA)', body: 'Maneja los datos de tus pacientes con protocolos seguros y privados, en cumplimiento con HIPAA. BAA disponible para despliegues clínicos.' },
    { tag: 'Bilingüe', title: 'Español e inglés nativos', body: 'Cambia de idioma a mitad de llamada sin perder contexto. Imprescindible si atiendes pacientes hispanohablantes.' },
    { tag: '24/7', title: 'Cobertura 24/7', body: 'Atiende noches, fines de semana y festivos, incluidas las llamadas de tus anuncios, siempre con la misma calma y profesionalidad.' },
    { tag: 'Calendario', title: 'Se integra con tu calendario', body: 'Agenda primeras visitas directamente en Google Calendar, Outlook, iCloud, Jane o Cliniko, en el horario correcto y con el bloque adecuado.' },
  ] as Feature[],

  demo_kicker: 'Demo en vivo · 60 segundos',
  demo_title: {
    pre: 'Escucha a Valentina gestionar una',
    em: 'consulta de Invisalign',
    post: 'de principio a fin.',
  } as Headline,
  demo_sub: 'Elige un escenario. Son conversaciones de ejemplo que muestran cómo Valentina gestiona una llamada entrante típica de una clínica de ortodoncia.',
  scenarios: [
    { id: 'invisalign', label: 'Adulto Invisalign · pregunta precio' },
    { id: 'teen', label: 'Adolescente brackets · primera consulta' },
    { id: 'emergency', label: 'Bracket roto fuera de horario' },
    { id: 'reactivation', label: 'Reactivación de lead frío' },
  ] as Scenario[],

  pricing_kicker: 'Precios',
  pricing_title: {
    pre: 'Una recepcionista IA cuesta menos que',
    em: 'un solo caso Invisalign perdido',
    post: 'al mes.',
  } as Headline,
  pricing_sub: 'Sin permanencia. Cancela con 30 días de aviso. Los minutos se reinician cada mes.',
  // Planes REALES: por minutos. Anual ≈ -20% (Math.round(price*0.8)).
  plans: [
    {
      name: 'Starter', price: 297, blurb: 'Para clínicas pequeñas que empiezan con automatización.',
      bullets: ['1 agente de voz IA', '250 minutos / mes', 'Atención de llamadas 24/7', 'Calificación y agenda básica', 'Notificaciones por email'],
    },
    {
      name: 'Growth', price: 497, popular: true, blurb: 'Nuestro plan estándar para clínicas en crecimiento.',
      bullets: ['1 agente de voz IA', '400 minutos / mes', 'Atención de llamadas 24/7', 'Sincronización de calendario', 'Calificación avanzada de pacientes', 'Lógica inteligente de agenda'],
    },
    {
      name: 'Pro', price: 697, blurb: 'Máxima cobertura para clínicas de alto volumen.',
      bullets: ['Hasta 2 agentes de voz IA', '600 minutos / mes', 'Atención de llamadas 24/7', 'Soporte prioritario', 'Gestión de desborde de llamadas', 'Guiones personalizados'],
    },
  ] as Plan[],

  final_kicker: 'Acceso prioritario · cupos limitados por semana',
  final_title: {
    pre: 'Te construimos tu',
    em: 'recepcionista de ortodoncia',
    post: 'en 48 horas. Gratis.',
  } as Headline,
  final_sub: 'Envíanos cómo atiendes las llamadas y entrenamos a Valentina con tu clínica concreta: tus doctores, tus horarios, tus preguntas frecuentes. La oyes en una llamada real en menos de 48h, sin tarjeta.',
  final_steps: [
    'Día 1 · Auditoría de tus llamadas y configuración',
    'Día 2 · Valentina entrenada con tus guiones y doctores',
    'Día 3 · Prueba en vivo y conexión de tu calendario',
  ],

  form_title: 'Solicita tu llamada inicial',
  form_sub: 'Cuéntanos un poco sobre tu clínica y preparamos una demo a tu medida.',
  form_fields: {
    name: ['Doctor responsable', 'Dr. Apellido'],
    email: ['Email profesional', 'tu@tuclinica.com'],
    practice: ['Nombre de la clínica', 'Clínica Dental Ortodoncia'],
    pms: ['Sistema de calendario', 'Selecciona tu calendario'],
    starts: ['Volumen de llamadas', 'Selecciona volumen'],
  },
  // Integraciones REALES de calendario.
  pms_options: ['Google Calendar', 'Outlook', 'iCloud', 'Jane', 'Cliniko', 'Otro / No estoy seguro'],
  starts_options: ['Menos de 200 / mes', '200 – 500 / mes', '500 – 1.000 / mes', 'Más de 1.000 / mes'],
  form_cta: 'Solicitar llamada inicial',
  form_disclaimer: 'Sin tarjeta. Captura segura y HIPAA-compliant.',

  // Cumplimiento REAL (sin SOC 2 ni "Invisalign Doctor Site").
  footer_compliance: ['HIPAA Compliant', 'Sincronización de calendario', 'Bilingüe ES / EN', 'Atención 24/7'],
  footer_tagline: 'Nova AI Voice. La recepcionista que tu clínica de ortodoncia merece.',
};

export interface Line {
  who: 'caller' | 'nova';
  text: string;
}

// Transcripciones de demo (ejemplos ilustrativos). La asistente es Valentina.
// Sin aseguradoras concretas ni nombres de clínica reales.
export const SCRIPTS: Record<ScenarioId, Line[]> = {
  invisalign: [
    { who: 'caller', text: 'Hola, estoy pensando en hacerme Invisalign. ¿Cuánto cuesta ahí?' },
    { who: 'nova', text: '¡Buena elección! El precio depende de la complejidad de cada caso. La doctora hace una primera visita gratuita con escáner 3D y te da el presupuesto exacto. ¿Has llevado ortodoncia antes o sería tu primer tratamiento?' },
    { who: 'caller', text: 'Primer tratamiento. Tengo 34 años y los dientes de abajo apiñados.' },
    { who: 'nova', text: 'Entendido, adulto con apiñamiento leve. Te puedo agendar la primera visita gratuita. ¿Tienes seguro dental para que lo tengamos en cuenta antes de la cita?' },
    { who: 'caller', text: 'Sí, tengo seguro.' },
    { who: 'nova', text: 'Perfecto, lo anoto para revisarlo en consulta. Tengo martes a las 18:15 o sábado a las 10:00. ¿Cuál te encaja?' },
    { who: 'caller', text: 'El sábado a las 10 me viene bien.' },
    { who: 'nova', text: 'Reservado. Recibirás un SMS de confirmación en 30 segundos con la dirección y el formulario de admisión. Hasta el sábado, Marcus.' },
  ],
  teen: [
    { who: 'caller', text: 'Hola, el dentista de mi hijo dice que necesita brackets. Tiene 12 años.' },
    { who: 'nova', text: 'Claro, la mayoría empieza ortodoncia entre los 11 y los 14. Nos encantará verle. ¿Le han hecho una radiografía panorámica recientemente? Si sí, la pedimos directamente al dentista.' },
    { who: 'caller', text: 'Sí, el mes pasado.' },
    { who: 'nova', text: 'Genial, la solicito. La primera visita es gratuita. El miércoles a las 16:30, después del cole, le encaja a la mayoría de padres. ¿Te va bien?' },
    { who: 'caller', text: 'Perfecto, podemos.' },
    { who: 'nova', text: 'Reservado, miércoles 16:30. Te envío por SMS el checklist previo a la visita.' },
  ],
  emergency: [
    { who: 'caller', text: '¡Son las 21:00 y un alambre me está pinchando la mejilla, sangra!' },
    { who: 'nova', text: 'Lo siento mucho, debe doler. Primero, coge un trocito de cera de ortodoncia del kit de inicio y aplástalo sobre el alambre. Si no tienes cera, un trocito de chicle sin azúcar sirve. ¿Estás en casa?' },
    { who: 'caller', text: 'Sí, en el baño.' },
    { who: 'nova', text: 'Vale. Mientras coges la cera, aviso al doctor de guardia para que te llame en unos minutos. También te dejo reservada una cita mañana a primera hora para revisar el alambre, antes del horario regular.' },
    { who: 'caller', text: 'Muchas gracias.' },
    { who: 'nova', text: 'De nada. El doctor de guardia te llamará en breve. Mantén el teléfono a mano.' },
  ],
  reactivation: [
    { who: 'nova', text: 'Hola María, soy Valentina, de la clínica. Hace unos meses viniste a una consulta por Invisalign y no volvimos a hablar. Quería saber si sigues interesada antes de archivar tu ficha.' },
    { who: 'caller', text: 'Ah, hola. Sí, se complicó la vida. Lo sigo queriendo hacer, lo iba dejando.' },
    { who: 'nova', text: 'Te entiendo. Si quieres, te apunto en el calendario de la doctora este mes para retomar la valoración, sin compromiso. ¿Te apetece?' },
    { who: 'caller', text: 'Sí, va, lo hacemos.' },
    { who: 'nova', text: 'Perfecto. Tengo el jueves a las 17:45 o el lunes a mediodía. ¿Cuál?' },
    { who: 'caller', text: 'El jueves.' },
    { who: 'nova', text: 'Hecho. Te llega la confirmación por SMS. ¡Bienvenida de nuevo, María!' },
  ],
};
