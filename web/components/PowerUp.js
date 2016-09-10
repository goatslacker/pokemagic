const B = require('../utils/Lotus.react')
const DustToLevel = require('../../json/dust-to-level.json')
const n = require('../utils/n')
const powerupTools = require('../../src/powerup')
const FormTrainerLevel = require('./FormTrainerLevel')
const FormStardust = require('./FormStardust')
const FormPokemonLevel = require('./FormPokemonLevel')

function PowerUp(props) {
  const dust = DustToLevel[props.stardust] || []
  const minPokemonLevel = Math.min.apply(null, dust)

  const power = powerupTools.howMuchPowerUp(
    Number(props.level || minPokemonLevel),
    Number(props.trainerLevel)
  )

  return (
    n(B.View, [
      n(B.Header, 'Power Up costs'),
      n(B.Text, 'Find out how much stardust and candy it will cost to max your Pokemon out.'),
      n(B.Divider),
      n(FormTrainerLevel, {
        trainerLevel: props.trainerLevel,
      }),
      n(FormStardust, {
        stardust: props.stardust,
      }),
      n(FormPokemonLevel, {
        level: props.level,
      }),
      power && (
        n(B.View, { spacingVertical: 'md' }, [
          n(B.H3, 'Results'),
          n(B.Panel, `Candy cost: ${power.candy}`),
          n(B.Panel, `Stardust cost: ${power.stardust}`),
        ])
      ),
    ])
  )
}

module.exports = PowerUp
