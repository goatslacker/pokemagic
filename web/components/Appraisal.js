const B = require('../utils/Lotus.React')
const React = require('react')
const Styles = require('../styles')
const n = require('../utils/n')
const appraisal = require('../utils/appraisal')
const appraisalActions = require('../actions/appraisalActions')

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
    backgroundColor: props.range === props.value ? COLORS[props.team] : '',
  }, Styles.box),
}, appraisal[props.value][props.team])

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
        onSelect: appraisalActions.teamSelected,
        team: 'VALOR',
      }),
      n(Shield, {
        current: props.team,
        onSelect: appraisalActions.teamSelected,
        team: 'MYSTIC',
      }),
      n(Shield, {
        current: props.team,
        onSelect: appraisalActions.teamSelected,
        team: 'INSTINCT',
      }),
    ]),

    props.team !== null && (
      n(B.View, [
        n(B.FormControl, { label: 'IV% Range' }, [
          n(Phrase, {
            onSelect: appraisalActions.ivRangeSet,
            range: props.ivRange,
            team: props.team,
            value: 'great',
          }),
          n(Phrase, {
            onSelect: appraisalActions.ivRangeSet,
            range: props.ivRange,
            team: props.team,
            value: 'good',
          }),
          n(Phrase, {
            onSelect: appraisalActions.ivRangeSet,
            range: props.ivRange,
            team: props.team,
            value: 'bad',
          }),
          n(Phrase, {
            onSelect: appraisalActions.ivRangeSet,
            range: props.ivRange,
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
              onClick: () => appraisalActions.attrToggled('IndAtk'),
              onSelect: appraisalActions.ivRangeSet,
              style: { fontWeight: props.attrs.IndAtk ? 'bold': '' },
            }, 'Atk'),
            n(B.Link, {
              onClick: () => appraisalActions.attrToggled('IndDef'),
              style: { fontWeight: props.attrs.IndDef ? 'bold': '' },
            }, 'Def'),
            n(B.Link, {
              onClick: () => appraisalActions.attrToggled('IndSta'),
              style: { fontWeight: props.attrs.IndSta ? 'bold': '' },
            }, 'HP'),
          ]),
        ]),
      ])
    ),
  ])
}

module.exports = Appraisal
