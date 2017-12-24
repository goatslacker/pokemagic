const $ = require('../utils/n')
const { View } = require('../utils/Lotus.React')

const TYPES = {
  BUG: [80, 122],
  DARK: [45, 122],
  DRAGON: [45, 77],
  ELECTRIC: [115, 77],
  FAIRY: [188, 33],
  FIGHTING: [152, 33],
  FIRE: [45, 33],
  FLYING: [188, 122],
  GHOST: [224, 77],
  GRASS: [152, 77],
  GROUND: [115, 122],
  ICE: [224, 33],
  NORMAL: [224, 122],
  POISON: [152, 122],
  PSYCHIC: [80, 77],
  ROCK: [115, 33],
  STEEL: [80, 33],
  WATER: [188, 77],
}

const TypeIcon = (props) => (
  $(View, {
    style: {
      backgroundImage: 'url("images/pokemon-types.jpg")',
      backgroundPositionX: TYPES[props.type][0],
      backgroundPositionY: TYPES[props.type][1],
      backgroundSize: 230,
      height: 30,
      width: 30,
    },
  })
)

module.exports = TypeIcon
