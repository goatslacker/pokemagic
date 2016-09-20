const set = require('../utils/set')

exports.getInitialState = () => ({
  text: '',
  moves: [],
  pokemon: [],
})

exports.reducers = {
  MOVES_CHANGED: set('moves'),
  POKEMON_CHANGED: set('pokemon'),
  DEX_TEXT_CHANGED: set('text'),
}
