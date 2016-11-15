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

const fix = n => Math.round(n * 100) / 100

const calcDPS = (dmg, duration) => fix(dmg / (duration / 1000))

const dodgeTime = move => fix(
  (Moves[move.Name].DamageWindowEndMs - Moves[move.Name].DamageWindowStartMs) / 1000
)

const startTime = move => fix(Moves[move.Name].DamageWindowStartMs / 1000)

const calcEPS = move => fix(move.Energy / (move.DurationMs / 1000))

const getMove = (pokemon, move, dmg) => ({
  name: fixMoveName(move.Name),
  type: ucFirst(move.Type),
  category: isQuickMove(move.Name) ? 'quick' : 'charge',
  stab: isStab(pokemon, move),
  dps: calcDPS(dmg, move.DurationMs),
  gymDPS: calcDPS(dmg, 2000 + move.DurationMs),
  eps: calcEPS(move),
  charges: Math.floor(Math.abs(100 / move.Energy)),
  dmg: fix(dmg),
  startTime: startTime(move),
  dodgeTime: dodgeTime(move),
  base: {
    power: move.Power,
    energy: move.Energy,
    duration: move.DurationMs / 1000,
  },
  retired: move.retired === true,
})

module.exports = getMove
