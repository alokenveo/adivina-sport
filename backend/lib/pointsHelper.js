import { supabaseAdmin } from '@/lib/supabase'

/**
 * Aplica puntos automáticos a un club basándose en las reglas configuradas.
 * 
 * @param {string} clubId - ID del club
 * @param {string} eventType - Tipo de evento: 'purchase' | 'early_payment' | 'contract_signed' | 'milestone'
 * @param {number} value - Valor económico del evento (importe de factura, valor de contrato, etc.)
 * @param {string} description - Descripción para el historial
 */
export async function applyAutoPoints(clubId, eventType, value, description) {
  try {
    // 1. Obtener reglas activas para este tipo de evento
    const { data: rules, error: rulesError } = await supabaseAdmin
      .from('points_rules')
      .select('*')
      .eq('event_type', eventType)

    if (rulesError || !rules || rules.length === 0) return

    // Usar la primera regla que coincida (si hay varias, sumar todas)
    let totalPoints = 0
    for (const rule of rules) {
      // Fórmula: (valor / points_per_unit) redondeado * multiplicador
      // Ej: factura de 50.000 XAF, rule.points_per_unit=100 (1 punto cada 100 XAF), multiplier=1.5
      // → (50000 / 100) * 1.5 = 750 puntos
      const rawPoints = (value / (rule.points_per_unit || 1)) * (rule.multiplier || 1)
      totalPoints += Math.round(rawPoints)
    }

    if (totalPoints <= 0) return

    // 2. Obtener saldo actual
    const { data: current } = await supabaseAdmin
      .from('points')
      .select('balance, history')
      .eq('club_id', clubId)
      .single()

    const currentBalance = current?.balance || 0
    const currentHistory = current?.history || []

    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      action: eventType === 'purchase'         ? 'Pago de factura'
            : eventType === 'early_payment'    ? 'Pago anticipado'
            : eventType === 'contract_signed'  ? 'Contrato firmado'
            : eventType === 'milestone'        ? 'Hito alcanzado'
            : eventType,
      points: totalPoints,
      description,
    }

    // 3. Actualizar puntos
    await supabaseAdmin
      .from('points')
      .update({
        balance: currentBalance + totalPoints,
        history: [...currentHistory, historyEntry],
      })
      .eq('club_id', clubId)

    return totalPoints

  } catch (err) {
    // No lanzamos el error para no romper el flujo principal
    console.error('applyAutoPoints error:', err)
  }
}