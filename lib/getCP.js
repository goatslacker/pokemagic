const parseIV = require('./parseIV');

// Formula to calculate the CP given the IVs and ECpM
function getCP(mon, ivTxt, ECpM) {
  const ivs = parseIV(ivTxt);

  const BaseAtk = mon.stats.attack;
  const BaseDef = mon.stats.defense;
  const BaseSta = mon.stats.stamina;
  const IndAtk = ivs.atk;
  const IndDef = ivs.def;
  const IndSta = ivs.sta;

  return Math.max(
    10,
    Math.floor(
      (BaseAtk + IndAtk) *
        Math.pow(BaseDef + IndDef, 0.5) *
        Math.pow(BaseSta + IndSta, 0.5) *
        Math.pow(ECpM, 2) /
        10
    )
  );
}

module.exports = getCP;
