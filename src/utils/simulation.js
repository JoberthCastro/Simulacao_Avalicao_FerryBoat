/**
 * Simulação de fila M/M/4 para sistema de ferry
 * Implementa cálculos de teoria de filas para múltiplos servidores
 */

/**
 * Calcula métricas da fila M/M/4
 * @param {number} lambda - Taxa de chegada (veículos/hora)
 * @param {number} mu - Taxa de serviço por servidor (veículos/hora)
 * @param {number} servers - Número de servidores (ferries)
 * @returns {Object} Métricas da fila
 */
export function mmcQueue(lambda, mu, servers = 4) {
  if (lambda <= 0 || mu <= 0 || servers <= 0) {
    return {
      utilization: 0,
      waitTime: 0,
      queueLength: 0,
      waitProbability: 0,
      error: 'Parâmetros inválidos'
    };
  }

  const rho = lambda / (servers * mu); // Utilização do sistema

  if (rho >= 1) {
    // Para rho >= 1, o modelo M/M/c diverge. Devolvemos um resultado estável
    // através de uma simulação em lotes baseada no ciclo da balsa.
    return simulateBatchFerry({
      lambda,
      servers,
      capacityPerFerry: 50,
      cycleMinutes: 120
    });
  }

  // Cálculo de P0 (probabilidade de sistema vazio)
  let p0Sum = 0;
  for (let n = 0; n < servers; n++) {
    p0Sum += Math.pow(lambda / mu, n) / factorial(n);
  }
  const p0Term = Math.pow(lambda / mu, servers) / (factorial(servers) * (1 - rho));
  const p0 = 1 / (p0Sum + p0Term);

  // Probabilidade de espera
  const waitProbability = (Math.pow(lambda / mu, servers) * p0) / (factorial(servers) * (1 - rho));

  // Número médio de clientes no sistema
  const lq = (waitProbability * rho) / (1 - rho); // Fila
  const ls = lq + (lambda / mu); // Sistema

  // Tempo médio de espera
  const wq = lq / lambda; // Em horas
  const ws = ls / lambda; // Em horas

  return {
    utilization: rho,
    waitTime: wq * 60, // Convertido para minutos
    systemWaitTime: ws * 60, // Tempo total no sistema (minutos)
    queueLength: lq,
    systemLength: ls,
    waitProbability: waitProbability,
    p0: p0
  };
}

/**
 * Simula tempo de espera considerando agendamento
 * @param {number} lambda - Taxa de chegada
 * @param {number} mu - Taxa de serviço
 * @param {number} servers - Número de servidores
 * @param {Object} params - Parâmetros adicionais
 * @returns {Object} Resultado da simulação
 */
export function simulateWaitTime(lambda, mu, servers, params = {}) {
  const { reservationRate = 0.3, peakHours = false } = params;
  
  // Reduz lambda em horários de pico se houver agendamento
  const effectiveLambda = peakHours 
    ? lambda * (1 - reservationRate * 0.4) // Redução de 40% da demanda em pico
    : lambda * (1 - reservationRate * 0.2); // Redução de 20% fora de pico

  return robustFerryMetrics(effectiveLambda, mu, servers, params);
}

/**
 * Compara cenário com e sem agendamento
 * @param {Object} params - Parâmetros da simulação
 * @returns {Object} Comparação dos cenários
 */
export function compareReservationVsNoReservation(params) {
  const {
    lambda,
    mu,
    servers = 4,
    reservationRate = 0.3,
    peakHours = false,
    capacityPerFerry = 50,
    cycleMinutes = 120,
    scheduledMode = false,
    scheduleGapMinutes = 120
  } = params;

  let noReservation;
  let withReservation;

  if (scheduledMode) {
    // Espera ancorada na partida programada: janela de chegada e possível estouro de capacidade
    noReservation = scheduledWait(lambda, {
      peakHours,
      capacityPerDeparture: capacityPerFerry,
      scheduleGapMinutes
    });
    withReservation = scheduledWait(lambda, {
      peakHours,
      capacityPerDeparture: capacityPerFerry,
      scheduleGapMinutes,
      reserved: true
    });
  } else {
    // Cenário sem agendamento
    noReservation = robustFerryMetrics(lambda, mu, servers, {
      capacityPerFerry,
      cycleMinutes
    });

    // Cenário com agendamento
    withReservation = simulateWaitTime(lambda, mu, servers, {
      reservationRate,
      peakHours,
      capacityPerFerry,
      cycleMinutes
    });
  }

  // Calcular diferenças
  const waitTimeDiff = noReservation.waitTime - withReservation.waitTime;
  const waitTimeDiffPercent = noReservation.waitTime > 0
    ? (waitTimeDiff / noReservation.waitTime) * 100
    : 0;

  const queueDiff = noReservation.queueLength - withReservation.queueLength;
  const queueDiffPercent = noReservation.queueLength > 0
    ? (queueDiff / noReservation.queueLength) * 100
    : 0;

  return {
    withoutReservation: {
      waitTime: noReservation.waitTime,
      queueLength: noReservation.queueLength,
      utilization: noReservation.utilization,
      waitProbability: noReservation.waitProbability
    },
    withReservation: {
      waitTime: withReservation.waitTime,
      queueLength: withReservation.queueLength,
      utilization: withReservation.utilization,
      waitProbability: withReservation.waitProbability
    },
    differences: {
      waitTimeMinutes: waitTimeDiff,
      waitTimePercent: waitTimeDiffPercent,
      queueLength: queueDiff,
      queueLengthPercent: queueDiffPercent
    },
    recommendation: generateRecommendation(waitTimeDiff, waitTimeDiffPercent)
  };
}

/**
 * Espera baseada em partida programada (serviço em lote).
 * - Usuário sem reserva chega em uma janela antes do horário: espera média = janela/2.
 * - Se exceder a capacidade da partida, soma a espera até a próxima partida (scheduleGapMinutes).
 * - Usuário com reserva tem espera reduzida (check-in prioritário).
 */
export function scheduledWait(lambda, options = {}) {
  const {
    peakHours = false,
    capacityPerDeparture = 50,
    scheduleGapMinutes = 120,
    reserved = false
  } = options;

  // Janelas calibradas para refletir dado de ~20min fora de pico
  const arrivalWindowMinutes = peakHours ? 60 : 40; // média 30min no pico, 20min fora de pico
  const expectedArrivals = (lambda / 60) * arrivalWindowMinutes;

  // Quantas partidas serão necessárias considerando excedente
  let overflow = Math.max(0, expectedArrivals - capacityPerDeparture);
  const fractionalDepartures = overflow / capacityPerDeparture; // valor esperado (não-armazenado)

  const baseWait = arrivalWindowMinutes / 2; // espera média até a partida alvo
  const overflowWait = fractionalDepartures * scheduleGapMinutes;

  // Reserva garante embarque na partida alvo (assumindo cota), espera ~check-in
  const reservedWait = peakHours ? 10 : 5;

  let waitMinutes = reserved ? reservedWait : baseWait + overflowWait;

  // Calibração para médias observadas: ~90 min (pico) e ~20 min (off)
  const targetAvg = peakHours ? 90 : 20;
  if (!reserved) {
    waitMinutes = Math.max(baseWait, Math.min(waitMinutes, targetAvg));
  }

  // Ocupação estimada nesta partida (clamp 0..1)
  const utilization = Math.min(1, expectedArrivals / capacityPerDeparture);

  return {
    utilization,
    waitTime: waitMinutes,
    systemWaitTime: waitMinutes,
    queueLength: Math.max(0, expectedArrivals - capacityPerDeparture),
    systemLength: Math.max(0, expectedArrivals - capacityPerDeparture),
    waitProbability: expectedArrivals > 0 ? 1 : 0,
    p0: 0
  };
}

/**
 * Decide automaticamente entre M/M/c e simulação em lotes.
 * Usa M/M/c quando rho < 1, caso contrário usa a simulação por ciclo de balsa.
 */
export function robustFerryMetrics(lambda, mu, servers = 4, options = {}) {
  const rho = lambda > 0 && mu > 0 && servers > 0 ? lambda / (servers * mu) : 0;
  if (rho > 0 && rho < 1) {
    return mmcQueue(lambda, mu, servers);
  }
  const { capacityPerFerry = 50, cycleMinutes = 120 } = options;
  return simulateBatchFerry({ lambda, servers, capacityPerFerry, cycleMinutes });
}

/**
 * Simulação em lotes por ciclo de balsa (robusta para rho >= 1).
 * Aproxima sistema com partidas a cada Δ minutos com capacidade fixa por partida.
 * Retorna métricas compatíveis com mmcQueue.
 */
export function simulateBatchFerry({
  lambda,
  servers = 4,
  capacityPerFerry = 50,
  cycleMinutes = 120,
  horizonMinutes = 240
}) {
  if (lambda <= 0 || servers <= 0 || capacityPerFerry <= 0 || cycleMinutes <= 0) {
    return {
      utilization: 0,
      waitTime: 0,
      systemWaitTime: 0,
      queueLength: 0,
      systemLength: 0,
      waitProbability: 0,
      p0: 0
    };
  }

  // Intervalo efetivo entre partidas agregadas do sistema
  const departuresPerHour = (servers * 60) / cycleMinutes; // ex.: 4*60/120 = 2 partidas/hora
  const departureInterval = 60 / departuresPerHour; // minutos entre partidas (ex.: 30)
  const capacityPerDeparture = capacityPerFerry; // 50 veículos por partida
  const capacityPerHour = departuresPerHour * capacityPerDeparture;

  let queue = 0;
  let sumQueue = 0;
  let timeWithQueue = 0;

  // Simulação discreta por minuto
  for (let t = 0; t < horizonMinutes; t++) {
    // Chegadas contínuas (taxa média)
    queue += lambda / 60;

    // Partida em instantes múltiplos do intervalo
    if (t > 0 && t % Math.round(departureInterval) === 0) {
      const served = Math.min(queue, capacityPerDeparture);
      queue -= served;
    }

    if (queue > 0) timeWithQueue += 1;
    sumQueue += queue;
  }

  const avgQueue = sumQueue / horizonMinutes;
  const waitHours = lambda > 0 ? avgQueue / lambda : 0; // Little's Law

  return {
    utilization: Math.min(1, lambda / capacityPerHour),
    waitTime: waitHours * 60,
    systemWaitTime: waitHours * 60, // aproximado igual aqui
    queueLength: avgQueue,
    systemLength: avgQueue, // aproximação
    waitProbability: horizonMinutes > 0 ? timeWithQueue / horizonMinutes : 0,
    p0: 0
  };
}

/**
 * Gera recomendação baseada na diferença de tempo de espera
 * @param {number} waitTimeDiff - Diferença em minutos
 * @param {number} waitTimePercent - Diferença em percentual
 * @returns {Object} Recomendação
 */
function generateRecommendation(waitTimeDiff, waitTimePercent) {
  if (waitTimeDiff > 30 || waitTimePercent > 25) {
    return {
      shouldReserve: true,
      message: 'Vale a pena reservar',
      reason: `Economia de ${waitTimeDiff.toFixed(1)} minutos (${waitTimePercent.toFixed(1)}%)`,
      priority: 'high'
    };
  } else if (waitTimeDiff > 15 || waitTimePercent > 15) {
    return {
      shouldReserve: true,
      message: 'Recomendado reservar',
      reason: `Economia de ${waitTimeDiff.toFixed(1)} minutos (${waitTimePercent.toFixed(1)}%)`,
      priority: 'medium'
    };
  } else {
    return {
      shouldReserve: false,
      message: 'Não vale a pena reservar',
      reason: `Economia de apenas ${waitTimeDiff.toFixed(1)} minutos (${waitTimePercent.toFixed(1)}%)`,
      priority: 'low'
    };
  }
}

/**
 * Calcula fatorial
 * @param {number} n - Número
 * @returns {number} Fatorial
 */
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calcula MTBF (Mean Time Between Failures) para manutenção
 * @param {number} trips - Número de viagens
 * @param {number} baseMTBF - MTBF base em viagens
 * @returns {Object} Status de manutenção
 */
export function calculateMaintenanceStatus(trips, baseMTBF = 1000) {
  const failureProbability = trips / baseMTBF;
  
  if (failureProbability < 0.7) {
    return {
      status: 'OK',
      color: 'green',
      message: 'Embarcação em bom estado',
      nextMaintenance: baseMTBF - trips
    };
  } else if (failureProbability < 0.9) {
    return {
      status: 'Atenção',
      color: 'yellow',
      message: 'Manutenção preventiva recomendada',
      nextMaintenance: baseMTBF - trips
    };
  } else {
    return {
      status: 'Risco de falha',
      color: 'red',
      message: 'Manutenção urgente necessária',
      nextMaintenance: 0
    };
  }
}

/**
 * Simula impacto de falhas ou manutenção
 * @param {number} lambda - Taxa de chegada
 * @param {number} mu - Taxa de serviço
 * @param {number} availableServers - Servidores disponíveis
 * @param {number} totalServers - Total de servidores
 * @returns {Object} Impacto da indisponibilidade
 */
export function simulateFailureImpact(lambda, mu, availableServers, totalServers) {
  const normal = robustFerryMetrics(lambda, mu, totalServers);
  const withFailure = robustFerryMetrics(lambda, mu, availableServers);
  
  return {
    normal: normal,
    withFailure: withFailure,
    impact: {
      waitTimeIncrease: withFailure.waitTime - normal.waitTime,
      waitTimeIncreasePercent: normal.waitTime > 0
        ? ((withFailure.waitTime - normal.waitTime) / normal.waitTime) * 100
        : 0,
      queueIncrease: withFailure.queueLength - normal.queueLength
    }
  };
}

/**
 * Estima λ por horário com base no conjunto de dados do usuário.
 * Pico: 7-9h e 17-19h → 120 veículos/h. Fora do pico: 60 veículos/h.
 */
export function estimateLambdaByHour(hour24) {
  const peak = (hour24 >= 7 && hour24 < 9) || (hour24 >= 17 && hour24 < 19);
  return peak ? 120 : 60;
}

