const Moves = require('../json/moves');

const scoreSort = require('./scoreSort');

const moveNames = Object.keys(Moves);

function identity(x) {
  return x;
}

function findMove(name) {
  const moveName = name.toUpperCase().replace(/-/g, '_');

  if (Moves[moveName.toUpperCase()]) {
    return Moves[moveName.toUpperCase()];
  }

  const moveNameGuess = scoreSort(moveNames)(moveName, identity);
  if (moveNameGuess) {
    return Moves[moveNameGuess];
  }

  return null;
}

module.exports = findMove;
