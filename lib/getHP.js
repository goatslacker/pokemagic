// Formula to calculate the HP given the IV stamina and ECpM
function getHP(mon, IndSta, ECpM) {
  const BaseSta = mon.stats.stamina;
  return Math.max(10, Math.floor(ECpM * (BaseSta + IndSta)));
}

module.exports = getHP;
