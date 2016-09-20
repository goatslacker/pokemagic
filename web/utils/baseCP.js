const baseCP = x => (
  x.stats.attack *
  Math.pow(x.stats.defense, 0.5) *
  Math.pow(x.stats.stamina, 0.5)
)

module.exports = baseCP
