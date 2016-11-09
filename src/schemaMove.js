const MovesList = require('../json/moves.json')

const Moves = MovesList.reduce((moves, move) => {
  moves[move.Name] = move
  return moves
}, {})

const ucFirst = x => x[0].toUpperCase() + x.slice(1).toLowerCase()

const fixMoveName = moveName => (
  moveName
    .replace('_FAST', '')
    .toLowerCase()
    .split('_')
    .map(ucFirst)
    .join(' ')
)

const isStab = (pokemon, move) => (
  [pokemon.type1, pokemon.type2]
    .filter(Boolean)
    .filter(type => type === move.Type)
    .length > 0
)

const quickMoveRx = /_FAST$/
const isQuickMove = name => quickMoveRx.test(name)

const calcDPS = (dmg, duration) => dmg / (duration / 1000)

const fix = x => n => Math.round(n * Math.pow(n, x)) / Math.pow(n, x)

const dodgeTime = move => fix(
  1,
  (Moves[move.Name].DamageWindowEndMs - Moves[move.Name].DamageWindowStartMs) / 1000
)

const startTime = move => fix(1, (Moves[move.Name].DamageWindowStartMs / 1000))

const calcEPS = move => fix(2, move.Energy / (move.DurationMs / 1000))

const getMove = (pokemon, move, dmg) => ({
  name: fixMoveName(move.Name),
  type: ucFirst(move.Type),
  category: isQuickMove(move.Name) ? 'quick' : 'charge',
  stab: isStab(pokemon, move),
  dps: calcDPS(dmg, move.DurationMs),
  gymDPS: calcDPS(dmg, 2000 + move.DurationMs),
  eps: calcEPS(move),
  charges: Math.abs(100 / move.Energy),
  dmg: dmg,
  startTime: startTime(move),
  dodgeTime: dodgeTime(move),
  base: {
    power: move.Power,
    energy: move.Energy,
    duration: move.DurationMs / 1000,
  },
})

module.exports = getMove
