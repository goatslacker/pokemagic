const stringScore = require('./stringScore');

function scoreSort(arr) {
  return (str, f) => {
    const value = arr
      .map(x => ({
        x,
        score: stringScore(f(x), str),
      }))
      .filter(x => x.score > 0)
      .sort((a, b) => (a.score > b.score ? -1 : 1))[0];

    return value ? value.x : null;
  };
}

module.exports = scoreSort;
