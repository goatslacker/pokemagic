const B = require('../utils/Lotus.react')
const MoveCombos = require('./MoveCombos')
const ResultsTable = require('./ResultsTable')
const Styles = require('../styles')
const n = require('../utils/n')
const React = require('react')

class DetailedAnalysis extends React.Component {
  constructor(props) {
    super()

    this.state = {
      show: false,
      ivs: props.results.length === 1 ? props.results[0] : null,
      moveset: null,
    }
  }

  // TODO this should be its own page
  render() {
    if (this.state.show === false) {
      return n(B.Button, {
        onClick: () => this.setState({ show: true })
      }, 'Detailed Analysis')
    }

    if (this.state.ivs === null) {
      return n(B.View, [
        n(B.H3, 'Pick your IVs'),
        n(ResultsTable, {
          results: this.props.results,
          onSelect: ivs => this.setState({ ivs }),
        }),
      ])
    }

    if (this.state.moveset === null) {
      const moves = bestMovesFor(
        this.state.ivs.Name,
        Number(this.state.ivs.Level),
        this.state.ivs.ivs.IndAtk,
        this.state.ivs.ivs.IndDef,
        this.state.ivs.ivs.IndSta
      )
      return n(B.View, [
        n(B.H3, 'Pick your moveset'),
        n(MoveCombos, {
          moves,
          onSelect: moveset => this.setState({ moveset }),
        }),
      ])
    }

    const ivs = this.state.ivs
    const moveset = this.state.moveset

    const report = analyzeBattleEffectiveness({
      name: ivs.Name,
      level: Number(ivs.Level),
      IndAtk: ivs.ivs.IndAtk,
      IndDef: ivs.ivs.IndDef,
      IndSta: ivs.ivs.IndSta,
      moves: {
        quick: moveset.quick.name,
        charge: moveset.charge.name,
      },
    })

    return n(B.View, [
      n(B.Panel, [
        n(B.Text, `${this.state.ivs.Name} ${this.state.ivs.CP}CP ${this.state.ivs.HP}HP`),
        n(B.Text, `IV ${this.state.ivs.strings.iv} ${this.state.ivs.percent.PerfectIV}%`),
        n(B.Text, `Level ${this.state.ivs.Level}`),
        n(B.Text, `Average DPS: ${report.dps.toFixed(3)}`),
        n(B.Text, `Average TTL: ${report.ttl.toFixed(3)}`),
      ]),
      n(B.Table, [
        n('thead', [
          n('tr', [
            n('th', 'Pokemon'),
            n('th', 'DPS'),
            n('th', 'TTL'),
          ]),
        ]),
        n('tbody', Object.keys(report.breakdown).map(pokemonName => (
          n('tr', [
            n('td', pokemonName),
            n('td', report.breakdown[pokemonName].dps.toFixed(3)),
            n('td', report.breakdown[pokemonName].ttl.toFixed(3)),
          ])
        ))),
      ]),
//      n(B.Button, 'Save to My Pokemon'),
    ])
  }
}

module.exports = DetailedAnalysis
