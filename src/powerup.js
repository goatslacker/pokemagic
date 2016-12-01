const DustToLevel = require('../json/dust-to-level')
const Levels = require('../json/levels')

function howMuchCandy(currentLevel, toLevel) {
  const maxLevel = toLevel * 2
  const minLevel = currentLevel * 2
  return Levels.reduce((sum, level) => {
    if (level.level < maxLevel && level.level >= minLevel) return sum + level.candy
    return sum
  }, 0)
}

function howMuchStardust(currentLevel, maxPokemonLevel) {
  return Object.keys(DustToLevel).reduce((sum, dust) => {
    const levels = DustToLevel[dust]
    const stardustIncrease = levels.reduce((num, level) => (
      level >= currentLevel && level < maxPokemonLevel
        ? num + Number(dust)
        : num
    ), 0)

    return sum + stardustIncrease
  }, 0)
}

function howMuchPowerUp(currentLevel, toLevel) {
  const candy = howMuchCandy(currentLevel, toLevel)
  const stardust = howMuchStardust(currentLevel, toLevel)
  return { candy, stardust }
}

module.exports = {
  howMuchCandy,
  howMuchPowerUp,
  howMuchStardust,
}
