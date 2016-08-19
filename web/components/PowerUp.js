const B = require('react-bootstrap')
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
    n(B.Row, [
      n(B.PageHeader, 'Power Up costs'),
      n('p', 'Find out how much stardust and candy it will cost to max your Pokemon out.'),
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
        n(B.ListGroup, [
          n(B.ListGroupItem, `Candy cost: ${power.candy}`),
          n(B.ListGroupItem, `Stardust cost: ${power.stardust}`),
        ])
      ),
    ])
  )
}

module.exports = PowerUp
