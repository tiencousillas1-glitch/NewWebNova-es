// Lógica de la calculadora ROI (riesgo de llamadas perdidas). Sin cambios respecto al original.

export interface AssessmentData {
  clinicName: string;
  avgCallsPerDay: number;
  receptionConfig: 'Dedicated' | 'Multitarea';
  leadFollowUpTime: '< 5 min' | '< 1 hora' | 'Mismo día' | 'Día siguiente';
  runsAds: boolean;
  missedCallsStrategy: 'Buzón de voz' | 'Servicio de contestación' | 'Nada';
  avgCaseValue: number;
}

export interface AssessmentResults {
  riskScore: number;
  missedCallsPerMonth: number;
  potentialRevenueRecovered: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}

export const calculateMissedCallRisk = (data: AssessmentData): AssessmentResults => {
  let riskScore = 0;
  let missedCallsPerMonth = 0;
  const recommendations: string[] = [];

  const dailyCalls = data.avgCallsPerDay;
  const monthlyCalls = dailyCalls * 22; // ~22 días laborables

  // Tasa base de llamadas perdidas
  let missedCallRate = 0.15; // Incluso con cobertura perfecta, 15% se pierden

  if (data.receptionConfig === 'Multitarea') {
    missedCallRate += 0.15;
    riskScore += 25;
    recommendations.push('Cuando el equipo atiende pacientes, pagos y teléfonos al mismo tiempo, algunas llamadas quedan sin respuesta en los momentos de mayor demanda.');
  }

  switch (data.leadFollowUpTime) {
    case 'Día siguiente':
      missedCallRate += 0.15;
      riskScore += 25;
      recommendations.push('Responder al día siguiente reduce la conversión frente a responder en los primeros 5 minutos.');
      break;
    case 'Mismo día':
    case '< 1 hora':
      missedCallRate += 0.05;
      riskScore += 10;
      break;
    case '< 5 min':
      break;
  }

  if (data.missedCallsStrategy === 'Nada') {
    missedCallRate += 0.15;
    riskScore += 30;
    recommendations.push('Cuando una llamada no llega a nadie, ese lead se pierde por completo.');
  } else if (data.missedCallsStrategy === 'Buzón de voz') {
    missedCallRate += 0.10;
    riskScore += 15;
    recommendations.push('Muchos pacientes cuelgan al escuchar el buzón de voz y llaman a otra clínica.');
  }

  if (data.runsAds) {
    riskScore += 10;
    recommendations.push('El tráfico pago combinado con llamadas perdidas consume presupuesto mucho más rápido.');
  }

  missedCallsPerMonth = Math.round(monthlyCalls * missedCallRate);

  const conversionRate = 0.05;
  const lostPatients = Math.round(missedCallsPerMonth * conversionRate);
  const potentialRevenueRecovered = lostPatients * data.avgCaseValue;

  if (potentialRevenueRecovered > 20000) {
    riskScore += 20;
    recommendations.push(`Un valor por caso alto ($${data.avgCaseValue}) hace que cada llamada perdida sea costosa.`);
  }

  const riskLevel = riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW';

  if (recommendations.length === 0) {
    recommendations.push('Su cobertura es buena, pero la IA puede ayudarle a responder cada llamada 24/7.');
  }

  return {
    riskScore: Math.min(riskScore, 100),
    missedCallsPerMonth,
    potentialRevenueRecovered,
    riskLevel,
    recommendations,
  };
};
