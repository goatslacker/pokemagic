const DustToLevel = require('../json/dust-to-level')
const Levels = require('../json/levels')

function howMuchCandy(currentLevel, trainerLevel) {
  const maxLevel = (trainerLevel + 1.5) * 2
  const minLevel = currentLevel * 2
  return Levels.reduce((sum, level) => {
    if (level.level <= maxLevel && level.level >= minLevel) return sum + level.candy
    return sum
  }, 0)
}

function howMuchStardust(currentLevel, trainerLevel) {
  const maxPokemonLevel = trainerLevel + 1.5

  // Returns the candy cost of upgrading to the current maximum Pokemon level
  // cap based on the trainer's level
  return Object.keys(DustToLevel).reduce((sum, dust) => {
    const levels = DustToLevel[dust]
    const stardustIncrease = levels.reduce((num, level) => {
      return level >= currentLevel && level <= maxPokemonLevel
        ? num + Number(dust)
        : num
    }, 0)

    return sum + stardustIncrease
  }, 0)
}

function howMuchPowerUp(currentLevel, trainerLevel) {
  const candy = howMuchCandy(currentLevel, trainerLevel)
  const stardust = howMuchStardust(currentLevel, trainerLevel)
  return { candy, stardust }
}

module.exports = {
  howMuchCandy,
  howMuchPowerUp,
  howMuchStardust,
}
