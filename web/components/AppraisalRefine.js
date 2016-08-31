const B = require('../utils/Lotus.react')
const React = require('react')
const ResultsTable = require('./ResultsTable')
const Styles = require('../styles')
const n = require('../utils/n')

const IV_RANGE = {
  great: [82, 100],
  good: [67, 81],
  bad: [51, 66],
  ugly: [0, 50],
}

const STATS_RANGE = {
  great: [14, 15],
  good: [12, 13],
  bad: [8, 9, 10, 11],
  ugly: [0, 1, 2, 3, 4, 5, 6, 7],
}

class AppraisalRefine extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false,
      range: null,
      attrs: [],
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(ev) {
    if (ev.currentTarget.name === 'range') {
      this.setState({
        range: IV_RANGE[ev.currentTarget.value],
      })
    }

    if (ev.currentTarget.name === 'attr') {
      this.setState({
        attrs: this.state.attrs.concat(ev.currentTarget.value).filter(attr => (
          attr === ev.currentTarget.value ? ev.currentTarget.checked : true
        ))
      })
    }
  }

  refine(results) {
    return results.filter((result) => {
      var rangeCheck = true
      var statCheck = true

      if (this.state.range !== null) {
        rangeCheck = (
          result.percent.PerfectIV >= this.state.range[0] &&
          result.percent.PerfectIV <= this.state.range[1]
        )
      }

      if (this.state.attrs.length) {
        const maxiv = Math.max(
          result.ivs.IndAtk,
          result.ivs.IndDef,
          result.ivs.IndSta
        )

        statCheck = this.state.attrs.every(attr => result.ivs[attr] === maxiv)
      }

      return rangeCheck && statCheck
    })
  }

  renderAppraisalOptions() {
    const name = this.props.name

    return n(B.View, [
      n(B.FormControl, { label: 'IV% Range' }, [
        n(B.Text, [
          n(B.Input, {
            name: 'range',
            type: 'radio',
            value: 'great',
            onChange: this.handleChange,
          }),
          ` Overall, your ${name} simply amazes me. It can accomplish anything!`,
        ]),
        n(B.Text, [
          n(B.Input, {
            name: 'range',
            type: 'radio',
            value: 'good',
            onChange: this.handleChange,
          }),
          ` Overall, your ${name} is a strong Pokemon. You should be proud!`,
        ]),
        n(B.Text, [
          n(B.Input, {
            name: 'range',
            type: 'radio',
            value: 'bad',
            onChange: this.handleChange,
          }),
          ` Overall, your ${name} is a decent Pokemon.`,
        ]),
        n(B.Text, [
          n(B.Input, {
            name: 'range',
            type: 'radio',
            value: 'ugly',
            onChange: this.handleChange,
          }),
          ` Overall, your ${name} may not be great in battle, but I still like it!`,
        ]),
      ]),
      n(B.FormControl, { label: 'Attribute' }, [
        n(B.Text, [
          n(B.Input, {
            name: 'attr',
            type: 'checkbox',
            value: 'IndAtk',
            onChange: this.handleChange,
          }),
          ' Attack',
        ]),
        n(B.Text, [
          n(B.Input, {
            name: 'attr',
            type: 'checkbox',
            value: 'IndDef',
            onChange: this.handleChange,
          }),
          ' Defense',
        ]),
        n(B.Text, [
          n(B.Input, {
            name: 'attr',
            type: 'checkbox',
            value: 'IndSta',
            onChange: this.handleChange,
          }),
          ' HP',
        ]),
      ]),
    ])
  }

  render() {
    const results = this.refine(this.props.results)
    const chance = Math.floor(
      results.filter(x => x.percent.PerfectIV > 66).length / results.length
    ) || 0

    return n(B.View, { spacingVertical: 'md' }, [
      n('h3', { style: Styles.resultsRow }, `Possible values (${results.length})`),

      n(B.Text, { style: Styles.resultsRow }, [
        results.length === 1
          ? n('span', 'Congrats, here are your Pokemon\'s values')
          : n('span', [
            'There are ',
            n('strong', results.length),
            ' possibilities and a ',
            n('strong', `${chance}%`),
            ` chance you will have a good ${this.props.name}. `,
            'Highlighted rows show even levels since you can only catch even leveled Pokemon.',
          ]),
      ]),

      !this.state.show && results.length > 1 && (
        n(B.View, { style: Styles.resultsRow }, [
          n(B.View, { spacing: 'sm' }),
          n(B.Text, 'Refine results by selecting "Appraise" from the Pokemon screen.'),
          n(B.Button, {
            onClick: () => this.setState({ show: true }),
          }, 'Refine Results'),
          n(B.View, { spacing: 'sm' }),
        ])
      ),

      this.state.show && this.renderAppraisalOptions(),

      n(ResultsTable, { results }),
    ])
  }
}

module.exports = AppraisalRefine
