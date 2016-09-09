const actions = require('../actions')
const mergeState = require('../utils/mergeState')
const validateActions = require('../utils/validateActions')

const set = value => payload => ({ [value]: payload })

const getInitialState = () => ({
  text: '',
  moves: [],
  pokemon: [],
})

const dex = mergeState(getInitialState(), validateActions(actions, {
  MOVES_CHANGED: set('moves'),
  POKEMON_CHANGED: set('pokemon'),
  DEX_TEXT_CHANGED: set('text'),
}))

module.exports = dex
