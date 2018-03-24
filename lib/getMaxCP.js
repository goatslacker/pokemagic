const getCP = require('./getCP');
const Levels = require('../json/levels');

function getMaxCP(mon, optionalLevel) {
  const ECpM = Levels[optionalLevel || '40'];
  return getCP(mon, 0xfff, ECpM);
}

module.exports = getMaxCP;
