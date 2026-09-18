import test from 'node:test';
import assert from 'node:assert/strict';

// Funciones puras de cálculo electoral D'Hondt para verificación
function calculateDhondt(parties, totalSeats, blankVotes = 0, thresholdPercent = 5.0) {
  const partyVotesSum = parties.reduce((sum, p) => sum + Math.max(0, p.votes), 0);
  const totalValidVotes = partyVotesSum + Math.max(0, blankVotes);
  const thresholdVotes = totalValidVotes * (thresholdPercent / 100);

  const eligibleParties = parties.filter((p) => {
    const v = Math.max(0, p.votes);
    return totalValidVotes > 0 ? (v / totalValidVotes) * 100 >= thresholdPercent : false;
  });

  const seatsMap = new Map();
  parties.forEach((p) => seatsMap.set(p.id, 0));

  for (let seatNum = 1; seatNum <= totalSeats; seatNum++) {
    let maxQuotient = -1;
    let winningParty = null;

    for (const party of eligibleParties) {
      const currentSeats = seatsMap.get(party.id) || 0;
      const quotient = party.votes / (currentSeats + 1);

      if (quotient > maxQuotient) {
        maxQuotient = quotient;
        winningParty = party;
      }
    }

    if (winningParty && maxQuotient > 0) {
      seatsMap.set(winningParty.id, (seatsMap.get(winningParty.id) || 0) + 1);
    }
  }

  return {
    totalValidVotes,
    thresholdVotes,
    eligibleCount: eligibleParties.length,
    seats: Object.fromEntries(seatsMap),
  };
}

test('Ley D\'Hondt: Reparto exacto en municipio estándar de 21 concejales', () => {
  const candidaturas = [
    { id: 'PP', name: 'Partido Popular', votes: 15000 },
    { id: 'AVANZA', name: 'Avanza Valle Real', votes: 12000 },
    { id: 'PSOE', name: 'PSOE', votes: 10000 },
    { id: 'VOX', name: 'VOX', votes: 4000 },
    { id: 'IU', name: 'Izquierda Unida', votes: 1200 }, // Por debajo del 5%
  ];

  const blankVotes = 500;
  const totalSeats = 21;

  const result = calculateDhondt(candidaturas, totalSeats, blankVotes, 5.0);

  // Total votos válidos: 15000 + 12000 + 10000 + 4000 + 1200 + 500 = 42700
  assert.equal(result.totalValidVotes, 42700);

  // Barrera del 5%: 42700 * 0.05 = 2135 votos
  // IU (1200 votos) queda excluida por barrera
  assert.equal(result.seats['IU'], 0);

  // La suma de concejales debe ser exactamente totalSeats (21)
  const totalConcejalesAsignados = Object.values(result.seats).reduce((a, b) => a + b, 0);
  assert.equal(totalConcejalesAsignados, 21);

  // El partido con más votos debe tener el mayor número de escaños
  assert.ok(result.seats['PP'] >= result.seats['AVANZA']);
  assert.ok(result.seats['AVANZA'] >= result.seats['PSOE']);
  assert.ok(result.seats['PSOE'] >= result.seats['VOX']);
});

test('Ley D\'Hondt: Respeto estricto del umbral del 5%', () => {
  const candidaturas = [
    { id: 'P1', name: 'Partido 1', votes: 1000 },
    { id: 'P2', name: 'Partido 2', votes: 900 },
    { id: 'P3', name: 'Partido Pequeño', votes: 40 }, // < 5% de 1940
  ];

  const result = calculateDhondt(candidaturas, 11, 0, 5.0);
  assert.equal(result.seats['P3'], 0, 'La candidatura con < 5% no debe obtener escaños');
});
