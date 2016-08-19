const B = require('react-bootstrap')
const Styles = require('../styles')
const bestMovesFor = require('../../src/best-moves')
const finalEvolutions = require('../../json/finalEvolutions')
const getWithContext = require('../utils/getWithContext')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

function Results(props) {
  var bestMoves = null
  if (finalEvolutions[props.pokemon.name]) {
    bestMoves = bestMovesFor(props.pokemon.name, props.best.ivs.IndAtk)
  }

  console.log(props)

  return (
    n('div', [
      n(B.Row, [
        n(B.Button, { onClick: pokemonActions.resultsReset }, 'Check Another'),
      ]),

      n(B.Row, { style: Styles.resultsRow }, [
        n('div', { style: Styles.bigText }, props.pokemon.name),
        n('div', `CP: ${props.pokemon.cp} | HP: ${props.pokemon.hp}`),
        n('div', { style: Styles.pokemonImage }, [
          n('img', { src: `images/${props.pokemon.name}.png`, height: 150, width: 150 }),
        ]),
        n(
          'div',
          { style: Styles.bigText },
          props.range.iv[0] === props.range.iv[1]
            ? `${props.range.iv[0]}%`
            : `${props.range.iv[0]}% - ${props.range.iv[1]}%`
        ),
        n('div', { style: Styles.resultsRow }, [
          props.chance === 100
            ? `Keep your ${props.pokemon.cp}CP ${props.pokemon.name}`
            : props.chance === 0
              ? `Send this Pokemon to the grinder for candy.`
              : `Maybe you should keep this Pokemon around.`
        ]),
      ]),

      n(B.Row, [
        n('h3', { style: Styles.resultsRow }, `Possible values (${props.values.length})`),
        n('p', { style: Styles.resultsRow }, [
          props.values.length === 1
            ? n('span', 'Congrats, here are your Pokemon\'s values')
            : n('span', [
              'There are ',
              n('strong', props.values.length),
              ' possibilities and a ',
              n('strong', `${props.chance}%`),
              ` chance you will have a good ${props.pokemon.name}. `,
              props.values.length > 10 && (
                n('span', [
                  'We are showing up to ',
                  n('strong', 10),
                  ' possibilities below. ',
                ])
              ),
              'Highlighted rows show even levels since you can only catch even leveled Pokemon.',
            ]),
        ]),
        n(B.Table, {
          bordered: true,
        }, [
          n('thead', [
            n('tr', [
              n('th', 'IV'),
              n('th', 'Level'),
              n('th', 'CP %'),
              n('th', 'HP %'),
              n('th', 'Battle %'),
            ]),
          ]),
          n('tbody', getWithContext(props.values).map((value) => (
            n('tr', {
              style: {
                backgroundColor: Number(value.Level) % 1 === 0 ? '#fef4f4' : '',
              },
            }, [
              n('td', [
                n(B.Label, {
                  bsStyle: value.percent.PerfectIV > 80
                    ? 'success'
                    : value.percent.PerfectIV > 69
                    ? 'warning'
                    : 'danger',
                }, `${value.percent.PerfectIV}%`),
                ' ',
                n('strong', value.strings.iv),
              ]),
              n('td', value.Level),
              n('td', value.percent.PercentCP),
              n('td', value.percent.PercentHP),
              n('td', value.percent.PercentBatt),
            ])
          ))),
        ]),
      ]),

      // We should only show best moveset if it is in its final evolved form...
      bestMoves && (
        n(B.Row, [
          n('h3', { style: Styles.resultsRow }, `Best moveset combos for ${props.pokemon.name}`),
          n(B.Table, {
            bordered: true,
            condensed: true,
            hover: true,
            striped: true,
          }, [
            n('thead', [
              n('tr', [
                n('th', 'Quick Move'),
                n('th', 'Charge Move'),
                n('th', 'Combo DPS'),
              ]),
            ]),
            n('tbody', bestMoves.map((move) => (
              n('tr', [
                n('td', move.quick.name),
                n('td', move.charge.name),
                n('td', move.dps),
              ])
            ))),
          ]),
        ])
      ),

      props.best.meta.EvolveCP && (
        n(B.Row, { style: Styles.resultsRow }, [
          n('h3', 'Evolution'),
          n(B.Panel, [
            n('span', `If evolved it would have a CP of about ${props.best.meta.EvolveCP}`),
          ]),
        ])
      ),

      console.log(props.best),

      props.best.meta.Stardust > 0 && (
        n(B.Row, { style: Styles.resultsRow }, [
          n('h3', { style: Styles.resultsRow }, `Maxing out to level ${props.best.meta.MaxLevel}`),
          props.pokemon.level === null && (
            n('p', `Assuming that your Pokemon's current level is ${props.best.Level}. The information below is just an estimate.`)
          ),
          n(B.ListGroup, [
            n(B.ListGroupItem, `Current level: ${props.best.Level}`),
            n(B.ListGroupItem, `Candy cost: ${props.best.meta.Candy}`),
            n(B.ListGroupItem, `Stardust cost: ${props.best.meta.Stardust}`),
            n(B.ListGroupItem, `CP: ${props.best.meta.MaxCP}`),
            n(B.ListGroupItem, `HP: ${props.best.meta.MaxHP}`),
          ]),
        ])
      ),

      n(B.Row, [
        n('h3', { style: Styles.resultsRow }, 'Yours vs Perfect by level'),
        n(B.Table, {
          bordered: true,
          condensed: true,
          hover: true,
          striped: true,
        }, [
          n('thead', [
            n('tr', [
              n('th', 'Level'),
              n('th', 'Your CP'),
              n('th', 'Best CP'),
              n('th', 'Your HP'),
              n('th', 'Best HP'),
            ]),
          ]),
          n('tbody', props.values.reduce((o, value) => {
            if (o._[value.Level]) return o
            o._[value.Level] = 1
            o.rows.push(
              n('tr', [
                n('td', value.Level),
                n('td', value.CP),
                n('td', value.meta.MaxLevelCP),
                n('td', value.HP),
                n('td', value.meta.MaxLevelHP),
              ])
            )
            return o
          }, { rows: [], _: {} }).rows),
        ]),
      ]),
    ])
  )
}

module.exports = Results
