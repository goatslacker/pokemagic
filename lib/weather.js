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

const WEATHER = {
  SUNNY: {
    FIRE,
    GROUND,
    GRASS,
  },

  CLEAR: {
    FIRE,
    GROUND,
    GRASS,
  },

  PARTLY_CLOUDY: {
    NORMAL,
    ROCK,
  },

  CLOUDY: {
    FAIRY,
    FIGHTING,
    POISON,
  },

  RAIN: {
    WATER,
    ELECTRIC,
    BUG,
  },

  SNOW: {
    ICE,
    STEEL,
  },

  WINDY: {
    DRAGON,
    FLYING,
    PSYCHIC,
  },

  FOGGY: {
    GHOST,
    DARK,
  },

  EXTREME: {},
};

function weather(name, type) {
  const key = name.toUpperCase().replace('-', '_');
  const typeKey = type.toUpperCase();

  const weatherTypes = WEATHER[key] || {};
  return weatherTypes.hasOwnProperty(typeKey) ? 1.2 : 1;
}

module.exports = weather;
