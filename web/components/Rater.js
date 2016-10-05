const Appraisal = require('./Appraisal')
const B = require('../utils/Lotus.React')
const FormPokemonLevel = require('./FormPokemonLevel')
const FormPokemonName = require('./FormPokemonName')
const FormStardust = require('./FormStardust')
const PictureUpload = require('./PictureUpload')
const Results = require('./Results')
const SearchHistoryContainer = require('../containers/SearchHistoryContainer')
const redux = require('../redux')
const n = require('../utils/n')

function Rater(props) {
  if (props.results) return n(Results, props.results)

  return n(B.View, [
    n(FormPokemonName, { name: props.name }),
    n(B.FormControl, { label: 'CP' }, [
      n(B.Input, {
        type: 'number',
        onChange: ev => redux.dispatch.changedCp(ev.currentTarget.value),
        onClick: () => redux.dispatch.changedCp(''),
        value: props.cp,
      }),
    ]),
    n(B.FormControl, { label: 'HP' }, [
      n(B.Input, {
        type: 'number',
        onChange: ev => redux.dispatch.changedHp(ev.currentTarget.value),
        onClick: () => redux.dispatch.changedHp(''),
        value: props.hp,
      }),
    ]),
    n(FormStardust, { stardust: props.stardust }),
    n(Appraisal),
    n(PictureUpload),
    n(B.Button, {
      size: 'sm',
      onClick: () => redux.dispatch.resultsCalculated(),
      style: {
        backgroundColor: '#6297de',
      },
    }, 'Calculate'),
    ' ',
    n(B.Button, { size: 'sm', onClick: redux.dispatch.valuesReset }, 'Clear'),
    n(B.Divider),
    n(SearchHistoryContainer),
  ])
}

module.exports = Rater
