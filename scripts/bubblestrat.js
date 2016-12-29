const Pokemon = require('../json/pokemon')
const getTypeEffectiveness = require('../src/getTypeEffectiveness').getTypeEffectiveness

const LevelToCPM = {
  "1": 0.094, "1.5": 0.135137432, "2": 0.16639787, "2.5": 0.192650919, "3": 0.21573247, "3.5": 0.236572661, "4": 0.25572005, "4.5": 0.273530381, "5": 0.29024988, "5.5": 0.306057377, "6": 0.3210876, "6.5": 0.335445036, "7": 0.34921268, "7.5": 0.362457751, "8": 0.37523559, "8.5": 0.387592406, "9": 0.39956728, "9.5": 0.411193551, "10": 0.42250001, "10.5": 0.432926419, "11": 0.44310755, "11.5": 0.4530599578, "12": 0.46279839, "12.5": 0.472336083, "13": 0.48168495, "13.5": 0.4908558, "14": 0.49985844, "14.5": 0.508701765, "15": 0.51739395, "15.5": 0.525942511, "16": 0.53435433, "16.5": 0.542635767, "17": 0.55079269, "17.5": 0.558830576, "18": 0.56675452, "18.5": 0.574569153, "19": 0.58227891, "19.5": 0.589887917, "20": 0.59740001, "20.5": 0.604818814, "21": 0.61215729, "21.5": 0.619399365, "22": 0.62656713, "22.5": 0.633644533, "23": 0.64065295, "23.5": 0.647576426, "24": 0.65443563, "24.5": 0.661214806, "25": 0.667934, "25.5": 0.674577537, "26": 0.68116492, "26.5": 0.687680648, "27": 0.69414365, "27.5": 0.700538673, "28": 0.70688421, "28.5": 0.713164996, "29": 0.71939909, "29.5": 0.725571552, "30": 0.7317, "30.5": 0.734741009, "31": 0.73776948, "31.5": 0.740785574, "32": 0.74378943, "32.5": 0.746781211, "33": 0.74976104, "33.5": 0.752729087, "34": 0.75568551, "34.5": 0.758630378, "35": 0.76156384, "35.5": 0.764486065, "36": 0.76739717, "36.5": 0.770297266, "37": 0.7731865, "37.5": 0.776064962, "38": 0.77893275, "38.5": 0.781790055, "39": 0.78463697, "39.5": 0.787473578, "40": 0.79030001
}

function getHP(mon, IndSta, ECpM) {
  const BaseSta = mon.stats.stamina
  return Math.max(10, Math.floor(ECpM * (BaseSta + IndSta)))
}

function getCP(mon, ivs, ECpM) {
  const BaseAtk = mon.stats.attack
  const BaseDef = mon.stats.defense
  const BaseSta = mon.stats.stamina
  const IndAtk = ivs.atk
  const IndDef = ivs.def
  const IndSta = ivs.sta

  return Math.max(10, Math.floor(
    (BaseAtk + IndAtk) *
    Math.pow(BaseDef + IndDef, 0.5) *
    Math.pow(BaseSta + IndSta, 0.5) *
    Math.pow(ECpM, 2) /
    10
  ))
}

function getDmgVs(obj) {
  const atk = obj.atk
  const def = obj.def
  const moves = obj.moves
  const player = obj.player
  const opponent = obj.opponent
  const pokemonLevel = obj.pokemonLevel || 1.5
  const opponentLevel = obj.opponentLevel || 1.5

  const AtkECpM = LevelToCPM[pokemonLevel]
  const DefECpM = LevelToCPM[opponentLevel]

  return moves.map((move) => {
    const stab = move.Type === player.type1 || move.Type === player.type2 ? 1.25 : 1
    const power = move.Power

    const fxMul = getTypeEffectiveness(opponent, move)

    return {
      poke: player,
      name: move.Name,
      duration: move.DurationMs,
      dmg: Math.floor((0.5 * atk * AtkECpM / (def * DefECpM) * power * stab * fxMul) + 1),
    }
  })
}

const getBubblerHP = (poke, IndSta, level) => (
  getHP(poke, IndSta, LevelToCPM[level]) * 2
)

function bubble(opponent, pokemon) {
  const name = opponent.name
  const ivs = opponent.ivs
  const opponentLevel = opponent.level

  const pokemonLevel = pokemon.level
  const pokeIvs = pokemon.ivs

  const bubbler = Pokemon.filter(x => x.name === name.toUpperCase())[0]
  const oppHP = getBubblerHP(bubbler, ivs.sta, opponentLevel)
  const oppCP = getCP(bubbler, ivs, LevelToCPM[opponentLevel])

  return bubbler.moves1.map(move => {
    return {
      bubbler: bubbler.name,
      move: move.Name,
      cp: oppCP,
      hp: oppHP,

      attackers: Pokemon.reduce((arr, trainer) => {
        return arr.concat(getDmgVs({
          atk: trainer.stats.attack + pokeIvs.atk,
          def: bubbler.stats.defense + ivs.def,
          player: trainer,
          opponent: bubbler,
          pokemonLevel,
          opponentLevel,
          moves: trainer.moves1,
        }))
      }, [])
      // calculate total damage output for entire fight
      .map(x => {
        const howManyHits = Math.floor((move.DurationMs + 1000) / x.duration)
        return {
          name: x.poke.name,
          move: x.name,
          dmg: x.dmg * howManyHits,
          cp: getCP(x.poke, pokeIvs, LevelToCPM[pokemonLevel])
        }
      })
      // how many hits can you land before the opponent gets theirs off
      // Can we destroy the opponent before they land a hit...
      .filter(x => x.dmg >= oppHP)
      // calculate the prestige gain
      .map(x => ({
        n: x.name,
        m: x.move,
        cp: x.cp,
        p: oppCP > x.cp
          ? Math.min(1000, Math.floor(500 * (oppCP / x.cp)))
          : Math.min(100, Math.floor(310 * (oppCP / x.cp)) - 55),
      }))
      .filter(x => x.p >= 500)
      // sort by most prestige
      .sort((a, b) => a.p > b.p ? -1 : 1)
    }
  })
  .filter(x => x.attackers.length > 0)
}

console.log(
  bubble({
    // bubbler
    name: 'horsea',
    ivs: { atk: 7, def: 3, sta: 3 },
    level: 1.5,
  }, {
    // attacker's stats
    ivs: { atk: 7, def: 3, sta: 3 },
    level: 1.5,
  })[0]
)
