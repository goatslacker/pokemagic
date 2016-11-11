const defCP = x => (
  x.stats.stamina * 2 *
  Math.pow(x.stats.attack, 0.5) *
  Math.pow(x.stats.defense, 0.5)
)

module.exports = defCP
