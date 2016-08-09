const magic = require('./src/magic')

magic({
  name: process.argv[2] || 'rhyhorn',
  cp: Number(process.argv[3]) || 634,
  hp: Number(process.argv[4]) || 103,
  stardust: Number(process.argv[5]) || 2500,
  level: process.argv[6] ? Number(process.argv[6]) : null,
})

module.exports = magic
