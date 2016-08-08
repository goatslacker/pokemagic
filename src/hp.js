// Formula to calculate the HP given the IV stamina and ECpM
function getHP(mon, IndSta, ECpM) {
  const BaseSta = mon.stats.stamina
  return Math.floor(ECpM * (BaseSta + IndSta))
}

// The minimum HP for a Pokemon that has perfect IVs
function getMaxHP(mon, sta, ECpM) {
  return getHP(mon, sta, ECpM)
}

// The maximum HP for your Pokemon's current level
function getMaxHPForLevel(mon, ECpM) {
  return getHP(mon, 15, ECpM)
}

// The minimum HP for your Pokemon's current level
function getMinHPForLevel(mon, ECpM) {
  return getHP(mon, 0, ECpM)
}

module.exports = {
  getHP,
  getMaxHP,
  getMaxHPForLevel,
  getMinHPForLevel,
}
