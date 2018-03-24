const {
  BUG,
  DARK,
  DRAGON,
  ELECTRIC,
  FAIRY,
  FIGHTING,
  FIRE,
  FLYING,
  GHOST,
  GRASS,
  GROUND,
  ICE,
  NORMAL,
  POISON,
  PSYCHIC,
  ROCK,
  STEEL,
  WATER,
} = require('./types');

const SuperEffectiveTypes = {
  BUG: { FLYING, ROCK, FIRE },
  DARK: { FIGHTING, BUG, FAIRY },
  DRAGON: { ICE, DRAGON, FAIRY },
  ELECTRIC: { GROUND },
  FAIRY: { POISON, STEEL },
  FIGHTING: { FLYING, PSYCHIC, FAIRY },
  FIRE: { GROUND, ROCK, WATER },
  FLYING: { ROCK, ELECTRIC, ICE },
  GHOST: { GHOST, DARK },
  GRASS: { FLYING, POISON, BUG, FIRE, ICE },
  GROUND: { WATER, GRASS, ICE },
  ICE: { FIGHTING, ROCK, STEEL, FIRE },
  NORMAL: { FIGHTING },
  POISON: { GROUND, PSYCHIC },
  PSYCHIC: { BUG, GHOST, DARK },
  ROCK: { FIGHTING, GROUND, STEEL, WATER, GRASS },
  STEEL: { FIGHTING, GROUND, FIRE },
  WATER: { GRASS, ELECTRIC },
};

const ResistantTypes = {
  BUG: { FIGHTING, GROUND, GRASS },
  DARK: { GHOST, DARK },
  DRAGON: { FIRE, WATER, GRASS, ELECTRIC },
  ELECTRIC: { FLYING, STEEL, ELECTRIC },
  FAIRY: { FIGHTING, BUG, DARK },
  FIGHTING: { ROCK, BUG, DARK },
  FIRE: { BUG, STEEL, FIRE, GRASS, ICE, FAIRY },
  FLYING: { FIGHTING, BUG, GRASS },
  GHOST: { POISON, BUG },
  GRASS: { GROUND, WATER, GRASS, ELECTRIC },
  GROUND: { POISON, ROCK },
  ICE: { ICE },
  NORMAL: {},
  POISON: { FIGHTING, POISON, BUG, GRASS, FAIRY },
  PSYCHIC: { FIGHTING, PSYCHIC },
  ROCK: { NORMAL, FLYING, POISON, FIRE },
  STEEL: {
    NORMAL,
    FLYING,
    ROCK,
    BUG,
    STEEL,
    GRASS,
    PSYCHIC,
    ICE,
    DRAGON,
    FAIRY,
  },
  WATER: { STEEL, FIRE, WATER, ICE },
};

const ImmuneTypes = {
  BUG: {},
  DARK: { PSYCHIC },
  DRAGON: {},
  ELECTRIC: {},
  FAIRY: { DRAGON },
  FIGHTING: {},
  FIRE: {},
  FLYING: { GROUND },
  GHOST: { NORMAL, FIGHTING },
  GRASS: {},
  GROUND: { ELECTRIC },
  ICE: {},
  NORMAL: { GHOST },
  POISON: {},
  PSYCHIC: {},
  ROCK: {},
  STEEL: { POISON },
  WATER: {},
};

// Returns an array of Super Effective, Not Effective, and Immunity
function effectivenessList(pokemon) {
  const s1o = SuperEffectiveTypes[pokemon.type1];
  const s2o = SuperEffectiveTypes[pokemon.type2] || {};

  const s1 = Object.keys(s1o).map(t => (s2o.hasOwnProperty(t) ? `${t} x2` : t));
  const s2 = Object.keys(s2o).filter(t => !s1o.hasOwnProperty(t));

  const r1o = ResistantTypes[pokemon.type1];
  const r2o = ResistantTypes[pokemon.type2] || {};

  const r1 = Object.keys(r1o).map(t => (r2o.hasOwnProperty(t) ? `${t} x2` : t));
  const r2 = Object.keys(r2o).filter(t => !r1o.hasOwnProperty(t));

  const i1o = ImmuneTypes[pokemon.type1];
  const i2o = ImmuneTypes[pokemon.type2] || {};

  const i1 = Object.keys(i1o).map(t => (i2o.hasOwnProperty(t) ? `${t} x2` : t));
  const i2 = Object.keys(i2o).filter(t => !i1o.hasOwnProperty(t));

  return {
    superEffective: s1.concat(s2),
    notEffective: r1.concat(r2),
    immune: i1.concat(i2),
  };
}

module.exports = effectivenessList;
