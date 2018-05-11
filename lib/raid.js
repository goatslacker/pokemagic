const raidCPM = require('../json/raid-cpm');

const tiers = [null, 6, 18, 30, 75, 125];
const dmgCPM = [null, 0.61, 0.67, 0.73, 0.79, 0.79];

function raid(poke, tier) {
  if (!poke) return {};

  if (raidCPM[poke.name]) {
    return raidCPM[poke.name];
  }

  if (!tier) return {};

  const BaseAtt = poke.stats.attack;
  const BaseDef = poke.stats.defense;
  const tierM = tiers[tier];
  const cpm = dmgCPM[tier];

  const cp = Math.floor(
    (BaseAtt + 15) * Math.sqrt(BaseDef + 15) * Math.sqrt(tierM)
  );
  const hp = tierM * 100;

  return { cp, hp, cpm };
}

module.exports = raid;
