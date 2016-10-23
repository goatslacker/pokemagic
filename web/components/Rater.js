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
const Dex = require('./Dex')
const reactRedux = require('react-redux')

const DexContainer = reactRedux.connect(state => state.dex)(Dex)

function Rater(props) {
  if (props.results) return n(Results, props.results)

  return n(B.View, { style: { width: '100%' } }, [
    n(DexContainer),
  ])
}

module.exports = Rater
