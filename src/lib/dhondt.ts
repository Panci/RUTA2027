/**
 * Motor de Simulación Electoral - Sistema D'Hondt (LOREG España)
 * 
 * NOTA METODOLÓGICA OBLIGATORIA:
 * Todo cálculo generado por este módulo es una SIMULACIÓN HIPOTÉTICA ORIENTATIVA.
 * No constituye sondeo, proyección demoscópica ni garantía electoral.
 */

export interface PartyVoteInput {
  id: string;
  name: string;
  acronym: string;
  votes: number;
  colorHex?: string;
}

export interface DhondtResult {
  partyId: string;
  partyName: string;
  acronym: string;
  votes: number;
  percentOfValidVotes: number;
  seats: number;
  isExcludedByThreshold: boolean;
  colorHex?: string;
}

export interface DhondtCalculationResult {
  totalValidVotes: number;
  thresholdVotes: number;
  totalSeats: number;
  thresholdPercent: number;
  results: DhondtResult[];
  quotientTable: {
    round: number;
    partyAcronym: string;
    quotient: number;
    assignedSeatNumber: number;
  }[];
}

/**
 * Calcula el reparto de concejales aplicando la Ley D'Hondt con barrera electoral legal (5% por defecto).
 * 
 * @param parties Lista de candidaturas con sus votos respectivos
 * @param totalSeats Número total de concejales a elegir en el municipio
 * @param blankVotes Votos en blanco (cuentan para el total de votos válidos y cálculo de barrera)
 * @param thresholdPercent Porcentaje de barrera electoral legal (5% en elecciones municipales españolas)
 */
export function calculateDhondt(
  parties: PartyVoteInput[],
  totalSeats: number,
  blankVotes: number = 0,
  thresholdPercent: number = 5.0
): DhondtCalculationResult {
  const partyVotesSum = parties.reduce((sum, p) => sum + Math.max(0, p.votes), 0);
  const totalValidVotes = partyVotesSum + Math.max(0, blankVotes);

  // Umbral electoral mínimo legal
  const thresholdVotes = totalValidVotes * (thresholdPercent / 100);

  // Filtrar candidaturas que superan la barrera
  const eligibleParties = parties.filter((p) => {
    const v = Math.max(0, p.votes);
    return totalValidVotes > 0 ? (v / totalValidVotes) * 100 >= thresholdPercent : false;
  });

  // Inicializar estado de escaños
  const seatsMap = new Map<string, number>();
  parties.forEach((p) => seatsMap.set(p.id, 0));

  const quotientHistory: {
    round: number;
    partyAcronym: string;
    quotient: number;
    assignedSeatNumber: number;
  }[] = [];

  // Algoritmo D'Hondt iterativo
  if (eligibleParties.length > 0 && totalSeats > 0) {
    for (let seatNum = 1; seatNum <= totalSeats; seatNum++) {
      let maxQuotient = -1;
      let winningParty: PartyVoteInput | null = null;

      for (const party of eligibleParties) {
        const currentSeats = seatsMap.get(party.id) || 0;
        const quotient = party.votes / (currentSeats + 1);

        if (quotient > maxQuotient) {
          maxQuotient = quotient;
          winningParty = party;
        } else if (quotient === maxQuotient && winningParty) {
          // En caso de empate técnico de cocientes, desempata la candidatura con mayor número total de votos
          if (party.votes > winningParty.votes) {
            winningParty = party;
          }
        }
      }

      if (winningParty && maxQuotient > 0) {
        const prevSeats = seatsMap.get(winningParty.id) || 0;
        seatsMap.set(winningParty.id, prevSeats + 1);

        quotientHistory.push({
          round: seatNum,
          partyAcronym: winningParty.acronym,
          quotient: Math.round(maxQuotient * 100) / 100,
          assignedSeatNumber: seatNum,
        });
      }
    }
  }

  const results: DhondtResult[] = parties.map((p) => {
    const votes = Math.max(0, p.votes);
    const percent = totalValidVotes > 0 ? (votes / totalValidVotes) * 100 : 0;
    const isExcluded = percent < thresholdPercent;

    return {
      partyId: p.id,
      partyName: p.name,
      acronym: p.acronym,
      votes,
      percentOfValidVotes: Math.round(percent * 100) / 100,
      seats: seatsMap.get(p.id) || 0,
      isExcludedByThreshold: isExcluded,
      colorHex: p.colorHex,
    };
  });

  // Ordenar de mayor a menor número de concejales y votos
  results.sort((a, b) => b.seats - a.seats || b.votes - a.votes);

  return {
    totalValidVotes,
    thresholdVotes: Math.round(thresholdVotes),
    totalSeats,
    thresholdPercent,
    results,
    quotientTable: quotientHistory,
  };
}
