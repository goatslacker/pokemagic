const {
  // type colors
  grey50,
  lime200,
  grey800,
  orange300,
  yellow300,
  pink100,
  red800,
  red500,
  amber100,
  indigo800,
  green400,
  brown500,
  lightBlue100,
  orange100,
  indigo600,
  deepPurple500,
  blueGrey500,
  grey500,
  blue500,
} = require('material-ui/styles/colors')

const TypeColors = {
  BUG: lime200,
  DARK: grey800,
  DRAGON: orange300,
  ELECTRIC: yellow300,
  FAIRY: pink100,
  FIGHTING: red800,
  FIRE: red500,
  FLYING: amber100,
  GHOST: indigo800,
  GRASS: green400,
  GROUND: brown500,
  ICE: lightBlue100,
  NORMAL: orange100,
  POISON: indigo600,
  PSYCHIC: deepPurple500,
  ROCK: blueGrey500,
  STEEL: grey500,
  WATER: blue500,
}

const getTypeColor = pokemon => (
  TypeColors[pokemon.type1] || TypeColors[pokemon.type2] || grey50
)

module.exports = getTypeColor
