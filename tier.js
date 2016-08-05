const mon = require('./pokemon')

// I'm nerfing defense a bit (ok a lot) because I mostly just care about
// taking them down ASAP. We get 6 pokemon to do it anyway and that's a lot.
function Atk(p) {
  return p.stats.attack + (p.stats.defense * 0.75)
}

// I'm nerfing attack because I don't really care about attack when I leave a
// Pokemon at a gym. I just want them to stand their and take a good hit
// leaving me with more time to get other gyms so I can cash out my defender
// bonus.
// Wow, talking about leaving my Pokemon out somewhere to take a beating.
// This game, damn.
function Def(p) {
  return (p.stats.attack * 0.25) + p.stats.defense
}

// XXX
// to calculate DPS I need to get the "best moveset" for each pokemon
// and to get that I need a list of all possible moves for every pokemon quick+charge
// best moveset is highest DPS combo during a battle. so it takes into account charge move's quickness to charge

// These are mostly the best attackers/defenders. Filter them out.
const LegendaryPokemon = {
  ARTICUNO: 1,
  MEW: 1,
  MEWTWO: 1,
  MOLTRES: 1,
  ZAPDOS: 1,
}

// Used for best of type
const Types = {
  BUG: null,
  DRAGON: null,
  ELECTRIC: null,
  FAIRY: null,
  FIGHTING: null,
  FIRE: null,
  FLYING: null,
  GHOST: null,
  GRASS: null,
  GROUND: null,
  ICE: null,
  NORMAL: null,
  POISON: null,
  PSYCHIC: null,
  ROCK: null,
  STEEL: null,
  WATER: null,
}

function isNotLegendary(pokemon) {
  return !LegendaryPokemon.hasOwnProperty(pokemon.name || pokemon)
}

// This stuff does not take into account DPS!
function bestNonLegendaryDefenders() {
  return Object.keys(mon)
    .map(k => mon[k])
    .sort((a, b) => Def(a) < Def(b) ? 1 : -1)
    .filter(isNotLegendary)
    .map(p => p.name)
    .slice(0, 10)
}

// This stuff does not take into account DPS!
function bestNonLegendaryAttackers() {
  return Object.keys(mon)
    .map(k => mon[k])
    .sort((a, b) => Atk(a) < Atk(b) ? 1 : -1)
    .filter(isNotLegendary)
    .map(p => p.name)
    .slice(0, 10)
}

// This stuff does not take into account DPS!
function bestForTypeAttack() {
  const types = Object.assign({}, Types)

  return justTheName(Object.keys(mon)
    .map(k => mon[k])
    .filter(isNotLegendary)
    .sort((a, b) => Atk(a) < Atk(b) ? 1 : -1)
    .reduce((types, mon) => {
      if (!types[mon.type1]) {
        types[mon.type1] = mon
      } else {
        const reigningMon = types[mon.type1]
        if (Atk(mon) > Atk(reigningMon)) {
          types[mon.type1] = mon
        }
      }

      if (mon.type2) {
        if (!types[mon.type2]) {
          types[mon.type2] = mon
        } else {
          const reigningMon2 = types[mon.type2]
          if (Atk(mon) > Atk(reigningMon2)) {
            types[mon.type2] = mon
          }
        }
      }

      return types
    }, types))
}

function justTheName(obj) {
  return Object.keys(obj).reduce((o, key) => {
    o[key] = obj[key].name
    return o
  }, {})
}

// This stuff does not take into account DPS!
// It's good that it doesn't take into account dps. I'd want to have both...
// sometimes you don't get the best moves.
function bestForTypeDefense() {
  const types = Object.assign({}, Types)

  return justTheName(Object.keys(mon)
    .map(k => mon[k])
    .filter(isNotLegendary)
    .reduce((types, mon) => {
      if (!types[mon.type1]) {
        types[mon.type1] = mon
      } else {
        const reigningMon = types[mon.type1]
        if (Def(mon) > Def(reigningMon)) {
          types[mon.type1] = mon
        }
      }

      if (mon.type2) {
        if (!types[mon.type2]) {
          types[mon.type2] = mon
        } else {
          const reigningMon2 = types[mon.type2]
          if (Def(mon) > Def(reigningMon2)) {
            types[mon.type2] = mon
          }
        }
      }

      return types
    }, types))
}

console.log(bestForTypeAttack())
console.log(bestNonLegendaryAttackers())
