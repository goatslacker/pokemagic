const B = require('../utils/Lotus.React')
const redux = require('../redux')
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
  return n(B.Text, {
//    onClick: () => redux.dispatch.dexTextChanged(type),
    style: {
      backgroundColor: typeColor,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#888',
      borderRadius: 4,
      color: '#fff',
      padding: 4,
    },
  }, type)
}

module.exports = TypeBadge
