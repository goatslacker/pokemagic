// Formula to calculate the CP given the IVs and ECpM
function getCP(mon, ivs, ECpM) {
  const BaseAtk = mon.stats.attack
  const BaseDef = mon.stats.defense
  const BaseSta = mon.stats.stamina
  const IndAtk = ivs.atk
  const IndDef = ivs.def
  const IndSta = ivs.sta

  return Math.floor(
    (BaseAtk + IndAtk) *
    Math.pow(BaseDef + IndDef, 0.5) *
    Math.pow(BaseSta + IndSta, 0.5) *
    Math.pow(ECpM, 2) /
    10
  )
}

// The maximum possible CP for a Pokemon that has perfect IVs
function getMaxCP(mon, atk, def, sta, ECpM) {
  return getCP(mon, { atk, def, sta }, ECpM)
}

// The minimum CP for your Pokemon's level
function getMinCPForLevel(mon, ECpM) {
  return getCP(mon, {
    atk: 0,
    def: 0,
    sta: 0,
  }, ECpM)
}

// The maximum CP for your Pokemon's level
function getMaxCPForLevel(mon, ECpM) {
  return getCP(mon, {
    atk: 15,
    def: 15,
    sta: 15,
  }, ECpM)
}


module.exports = {
  getCP,
  getMaxCP,
  getMaxCPForLevel,
  getMinCPForLevel,
}
