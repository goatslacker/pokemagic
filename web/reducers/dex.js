const baseCP = require('../utils/baseCP')
const set = require('../utils/set')
const MovesList = require('../../json/moves.json')
const Pokemon = require('../../json/pokemon.json')
const analyzeBattleEffectiveness = require('../../src/analyzeBattleEffectiveness')
const bestMovesFor = require('../../src/best-moves')
const getEffectiveness = require('../../src/getTypeEffectiveness').getEffectiveness

const Types = {}
const Mon = Pokemon.reduce((obj, mon) => {
  const type1 = mon.type1
  const type2 = mon.type2

  Types[type1] = type1
  if (type2) Types[type2] = type2

  obj[mon.name] = mon
  return obj
}, {})
const ObjMoves = MovesList.reduce((obj, move) => {
  obj[move.Name] = move
  return obj
}, {})

const getType = mon => (
  [mon.type1, mon.type2]
    .filter(Boolean)
    .map(type => n(TypeBadge, { type }))
)

const sortByBestBaseStats = (a, b) => baseCP(a) > baseCP(b) ? -1 : 1

exports.getInitialState = () => ({
  text: '',
  moves: [],
  pokemon: [],
})

exports.reducers = {
  DEX_TEXT_CHANGED(state, action) {
    const moves = state.moves
    const pokemon = state.pokemon
    const text = action.payload

    if (!text) {
      return {
        moves: [],
        pokemon: [],
        text: '',
      }
    }

    if (Mon.hasOwnProperty(text)) {
      const moves = bestMovesFor(text)
      const pokemon = Pokemon[Mon[text].id - 1]
      return {
        moves,
        pokemon: [],
        text,
      }
    }

    if (ObjMoves.hasOwnProperty(text)) {
      const moves = ObjMoves[text]
      const pokemon = Pokemon.filter(mon => (
        mon.moves1.some(m => m.Name === text) ||
        mon.moves2.some(m => m.Name === text)
      )).sort(sortByBestBaseStats)
      return {
        moves,
        pokemon,
        text,
      }
    }

    if (Types.hasOwnProperty(text)) {
      const moves = MovesList
        .filter(y => y.Type === text)
        .sort((a, b) => a.Power > b.Power ? -1 : 1)
      const pokemon = Pokemon.filter(mon => (
        mon.type1 === text ||
        mon.type2 === text
      )).sort(sortByBestBaseStats)
      return {
        moves,
        pokemon,
        text,
      }
    }

    return state
  },
}
