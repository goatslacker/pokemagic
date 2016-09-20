const baseCP = require('./baseCP')

const percentInRange = (num, min, max) => ((num - min) * 100) / (max - min)

const MEWTWO_OV = 58771
const CATERPIE_OV = 4778

const ovRating = mon => percentInRange(baseCP(mon), CATERPIE_OV, MEWTWO_OV)

module.exports = ovRating
