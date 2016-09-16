const B = require('../utils/Lotus.React')
const n = require('../utils/n')

const TypeColors = {
  BUG: 'chartreuse',
  DARK: 'dimgray',
  DRAGON: 'orange',
  ELECTRIC: 'gold',
  FAIRY: 'pink',
  FIGHTING: 'firebrick',
  FIRE: 'red',
  FLYING: 'palegoldenrod',
  GHOST: 'mediumorchid',
  GRASS: 'green',
  GROUND: 'peru',
  ICE: 'lightskyblue',
  NORMAL: 'floralwhite',
  POISON: 'indigo',
  PSYCHIC: 'plum',
  ROCK: 'slategray',
  STEEL: 'silver',
  WATER: 'blue',
}

function TypeBadge(props) {
  const type = props.type.toUpperCase()
  const typeColor = TypeColors[type]
  return n(B.View, {
    style: {
      backgroundColor: typeColor,
      border: '1px solid #888',
      borderRadius: 4,
      color: '#fff',
      display: 'inline-block',
      fontSize: '0.75em',
      lineHeight: '1em',
      marginRight: '0.5em',
      padding: '0.25em',
      textShadow: '0 0 1px #000',
    },
  }, type)
}

module.exports = TypeBadge
