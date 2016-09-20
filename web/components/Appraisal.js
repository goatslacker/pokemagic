const B = require('../utils/Lotus.React')
const React = require('react')
const Styles = require('../styles')
const appraisal = require('../utils/appraisal')
const dispatchableActions = require('../dispatchableActions')
const n = require('../utils/n')
const reactRedux = require('react-redux')

const COLORS = [
  '#0677ee', // Mystic
  '#f3150a', // Valor
  '#ffea00', // Instinct
]

const Shield = props => n(B.Image, {
  height: 80,
  onClick: () => props.onSelect(appraisal[props.team]),
  src: `images/${props.team.toLowerCase()}.png`,
  style: { opacity: props.current === appraisal[props.team] ? 1 : 0.4 },
})

const Phrase = props => n(B.Link, {
  onClick: () => props.onSelect(props.value),
  style: Object.assign({
    backgroundColor: props.selected === props.value ? COLORS[props.team] : '',
  }, Styles.box),
}, appraisal[props.analysis][props.value][props.team])

function Appraisal(props) {
  return n(B.View, { spacingVertical: 'md' }, [
    n(B.View, {
      style: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      },
    }, [
      n(Shield, {
        current: props.team,
        onSelect: team => dispatchableActions.teamSelected(team),
        team: 'VALOR',
      }),
      n(Shield, {
        current: props.team,
        onSelect: team => dispatchableActions.teamSelected(team),
        team: 'MYSTIC',
      }),
      n(Shield, {
        current: props.team,
        onSelect: team => dispatchableActions.teamSelected(team),
        team: 'INSTINCT',
      }),
    ]),

    props.team !== null && (
      n(B.View, [
        n(B.FormControl, { label: 'Overall' }, [
          n(Phrase, {
            analysis: 'overall',
            onSelect: x => dispatchableActions.appraisalIvRangeSet(x),
            selected: props.ivRange,
            team: props.team,
            value: 'great',
          }),
          n(Phrase, {
            analysis: 'overall',
            onSelect: x => dispatchableActions.appraisalIvRangeSet(x),
            selected: props.ivRange,
            team: props.team,
            value: 'good',
          }),
          n(Phrase, {
            analysis: 'overall',
            onSelect: x => dispatchableActions.appraisalIvRangeSet(x),
            selected: props.ivRange,
            team: props.team,
            value: 'bad',
          }),
          n(Phrase, {
            analysis: 'overall',
            onSelect: x => dispatchableActions.appraisalIvRangeSet(x),
            selected: props.ivRange,
            team: props.team,
            value: 'ugly',
          }),
        ]),
        n(B.FormControl, { label: 'Attributes' }, [
          n(B.View, {
            style: {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
            },
          }, [
            n(B.Link, {
              onClick: () => dispatchableActions.appraisalAttrToggled('IndAtk'),
              onSelect: x => dispatchableActions.appraisalIvRangeSet(x),
              style: { fontWeight: props.attrs.IndAtk ? 'bold': '' },
            }, 'Atk'),
            n(B.Link, {
              onClick: () => dispatchableActions.appraisalAttrToggled('IndDef'),
              style: { fontWeight: props.attrs.IndDef ? 'bold': '' },
            }, 'Def'),
            n(B.Link, {
              onClick: () => dispatchableActions.appraisalAttrToggled('IndSta'),
              style: { fontWeight: props.attrs.IndSta ? 'bold': '' },
            }, 'HP'),
          ]),
        ]),
        n(B.FormControl, { label: 'Stat Analysis' }, [
          n(Phrase, {
            analysis: 'stats',
            onSelect: x => dispatchableActions.appraisalStatSet(x),
            selected: props.stat,
            team: props.team,
            value: 'great',
          }),
          n(Phrase, {
            analysis: 'stats',
            onSelect: x => dispatchableActions.appraisalStatSet(x),
            selected: props.stat,
            team: props.team,
            value: 'good',
          }),
          n(Phrase, {
            analysis: 'stats',
            onSelect: x => dispatchableActions.appraisalStatSet(x),
            selected: props.stat,
            team: props.team,
            value: 'bad',
          }),
          n(Phrase, {
            analysis: 'stats',
            onSelect: x => dispatchableActions.appraisalStatSet(x),
            selected: props.stat,
            team: props.team,
            value: 'ugly',
          }),
        ]),
      ])
    ),
  ])
}

module.exports = reactRedux.connect(state => state.appraisal)(Appraisal)
