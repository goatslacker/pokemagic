const raidCPM = require('../json/raid-cpm');

function raid(poke) {
  if (!poke) return {};
  return raidCPM[poke.name];
}

module.exports = raid;
