const B = require('../utils/Lotus.React')
const MovesList = require('../../json/moves.json')
const Pokemon = require('../../json/pokemon.json')
const dispatchableActions = require('../dispatchableActions')
const n = require('../utils/n')

const cpIsh = x => (
  x.stats.attack *
  Math.pow(x.stats.defense, 0.5) *
  Math.pow(x.stats.stamina, 0.5)
)

const sortByBestBaseStats = (a, b) => cpIsh(a) > cpIsh(b) ? -1 : 1

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
  return n(B.Link, {
    onClick() {
      dispatchableActions.movesChanged(
        MovesList
          .filter(y => y.Type === type)
          .sort((a, b) => a.Power > b.Power ? -1 : 1)
      )
      dispatchableActions.pokemonChanged(
        Pokemon.filter(mon => (
          mon.type1 === type ||
          mon.type2 === type
        )).sort(sortByBestBaseStats)
      )
      dispatchableActions.dexTextChanged(type)
    },
    style: {
      backgroundColor: typeColor,
      border: '1px solid #888',
      borderRadius: 4,
      color: '#fff',
      display: 'inline-block',
      fontSize: props.small ? '0.5em' : '0.75em',
      lineHeight: '1em',
      marginRight: '0.5em',
      padding: '0.25em',
      textShadow: '0 0 1px #000',
    },
  }, type)
}

module.exports = TypeBadge
