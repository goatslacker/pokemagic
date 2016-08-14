const React = require('react')
const ReactDOM = require('react-dom')
const Select = require('react-select')
const Pokemon = require('../json/pokemon.json')
const DustToLevel = require('../json/dust-to-level.json')
const n = require('./n')
const magic = require('../src/magic')
const B = require('react-bootstrap')
const bestMovesFor = require('../src/best-moves')

const Alt = require('../../alt/')
const alt = new Alt()

const actions = alt.generateActions('InventoryActions', [
  'changedName',
  'changedCP',
  'changedHP',
  'changedStardust',
  'changedLevel',
  'resultsCalculated',
  'resultsReset',
  'valuesReset',
])

class Inventory extends Alt.Store {
  constructor() {
    super()
    this.bindActions(actions)
    this.state = {
      name: 'ARCANINE',
      cp: 1411,
      hp: 102,
      stardust: '2200',
      level: 0,
      results: null,
    }
  }

  fromEvent(ev) {
    return ev.currentTarget.value
  }

  changedName(name) {
    this.setState({ name })
  }

  changedCP(ev) {
    const cp = this.fromEvent(ev)
    this.setState({ cp })
  }

  changedHP(ev) {
    const hp = this.fromEvent(ev)
    this.setState({ hp })
  }

  changedStardust(stardust) {
    this.setState({ stardust })
  }

  changedLevel(ev) {
    const level = this.fromEvent(ev)
    this.setState({ level })
  }

  resultsCalculated(results) {
    this.setState({ results: results.asObject() })
  }

  valuesReset() {
    this.setState({
      name: '',
      cp: 0,
      hp: 0,
      stardust: '',
      level: 0,
      results: null,
    })
  }

  resultsReset() {
    this.setState({ results: null })
  }
}

const inventoryStore = alt.createStore('InventoryStore', new Inventory())




const options = Pokemon.map(x => ({ value: x.name, label: x.name }))
const dustOptions = Object.keys(DustToLevel).map(x => ({ value: x, label: x }))

const logName = x => actions.changedName(x.value)
const logStardust = x => actions.changedStardust(x.value)

function calculateValues() {
  const state = inventoryStore.getState()
  const results = magic({
    name: state.name,
    cp: Number(state.cp),
    hp: Number(state.hp),
    stardust: Number(state.stardust),
    level: state.level ? Number(state.level) : null,
  })
  actions.resultsCalculated(results)
}

const Styles = {
  resultsRow: {
    textAlign: 'center',
  },

  pokemonImage: {
    alignItems: 'center',
    background: 'white',
    border: '1px solid #353535',
    borderRadius: 200,
    display: 'flex',
    height: 200,
    margin: '0 auto',
    justifyContent: 'center',
    width: 200,
  }
}

function Results(props) {
  const bestMoves = bestMovesFor(props.pokemon.name)
  return (
    n('div', [
      n(B.Row, [n(B.PageHeader, 'Pokemon Analysis')]),
      n(B.Row, { style: Styles.resultsRow }, [
        n(B.Button, { onClick: actions.resultsReset }, 'Check Another'),
        n('h2', [props.pokemon.name]),
        n('div', { style: Styles.pokemonImage }, [
          n('img', { src: `images/${props.pokemon.name}.png`, height: 150, width: 150 }),
        ]),
        n('h2', `${props.range.iv[0]}% - ${props.range.iv[1]}%`),
      ]),
      n(B.Row, [
        n(B.Table, [
          n('tbody', [
            n('tr', [
              n('td', 'CP'),
              n('td', props.pokemon.cp),
            ]),
            n('tr', [
              n('td', 'HP'),
              n('td', props.pokemon.hp),
            ]),
            n('tr', [
              n('td', 'Max CP'),
              n('td', props.best.maxcpcur),
            ]),
            n('tr', [
              n('td', 'Max HP'),
              n('td', props.best.maxhpcur),
            ]),
          ]),
        ]),
        n(B.Panel, [
          props.best.stardust && (
            n('div', [
              n('div', `Candy cost to max: ${props.best.candy}`),
              n('div', `Stardust cost to max: ${props.best.stardust}`),
            ])
          ),
          props.best.evolvecp && (
            n('div', `If evolved it would have a CP of ~${props.best.evolvecp}`)
          ),
        ]),
      ]),
      n(B.Row, [
        n('h2', 'Possible values'),
        n(B.ListGroup, props.values.slice(0, 10).map((value) => (
          n(B.ListGroupItem, `${value.iv} (${value.ivp}%)`)
        ))),
      ]),
      n(B.Row, [
        n('h2', ['Detailed Report']),
        n(B.Panel, [
          n('p', `There are ${props.values.length} possibilities`),
          n('p', [
            'Should you keep it? ',
            props.chance === 100
              ? `Yes! Keep your ${props.best.cp}CP ${props.best.name}`
              : props.chance === 0
                ? `No, send this Pokemon to the grinder for candy.`
                : `Maybe, there is a ${props.chance}% chance you've got a good Pokemon.`
          ]),
          n('p', `There is a ${Math.round(1 / props.values.length * 100)}% chance you will have the one below`),
          n('p', `${props.best.name} Rating: ${props.best.rating}%`),
          n('p', `IVs: ${props.best.iv} (${props.best.ivp}%)`),
          n('p', `Attack: ${props.best.atk}`),
          n('p', `Defense: ${props.best.def}`),
          n('p', `Stamina: ${props.best.sta}`),
          n('p', 'Best moves for this Pokemon'),
          n('ul', [
            n('li', `Quick: ${bestMoves.quick} (${bestMoves.dps1} dmg/sec)`),
            n('li', `Charge: ${bestMoves.charge} (${bestMoves.dps2} dmg/sec)`),
          ]),
        ]),
      ]),
    ])
  )
}

function Form(props) {
  if (props.results) return n('noscript')

  return n('div', [
    n(B.Row, [
      n(B.PageHeader, 'Pokemon Rater'),
    ]),
    n(B.Row, [
      n(B.FormGroup, { controlId: 'pokemon' }, [
        n(B.ControlLabel, 'Name'),
        n(Select, {
          name: 'pokemon-selector',
          value: props.name,
          options,
          onChange: logName,
        }),
      ]),
      n(B.FormGroup, { controlId: 'cp' }, [
        n(B.ControlLabel, 'CP'),
        n(B.FormControl, {
          type: 'number',
          onChange: actions.changedCP,
          value: props.cp,
        }),
      ]),
      n(B.FormGroup, { controlId: 'hp' }, [
        n(B.ControlLabel, 'HP'),
        n(B.FormControl, {
          type: 'number',
          onChange: actions.changedHP,
          value: props.hp,
        }),
      ]),
      n(B.FormGroup, { controlId: 'dust' }, [
        n(B.ControlLabel, 'Stardust'),
        n(Select, {
          name: 'stardust-selector',
          value: props.stardust,
          options: dustOptions,
          onChange: logStardust,
        }),
      ]),
      n(B.FormGroup, { controlId: 'level' }, [
        n(B.ControlLabel, 'Level'),
        n(B.FormControl, {
          type: 'number',
          onChange: actions.changedLevel,
          value: props.level,
        }),
      ]),
      n(B.Button, { bsStyle: 'primary', onClick: calculateValues }, 'Calculate'),
      n(B.Button, { onClick: actions.valuesReset }, 'Clear'),
    ])
  ])
}

function Calculator(props) {
  return n(B.Grid, [
    n(Form, props),
    props.results && n(Results, props.results),
  ])
}



function connect(Component, o) {
  return class ConnectedComponent extends React.Component {
    constructor() {
      super()

      this.stores = o.listenTo()
      this.subscriptions = []

      this.state = this.computeState()
    }

    computeState() {
      return Object.keys(this.stores).reduce((obj, key) => {
        const store = this.stores[key]
        obj[key] = store.getState()
        return obj
      }, {})
    }

    componentDidMount() {
      this.subscriptions = Object.keys(this.stores).map((key) => {
        return this.stores[key].subscribe(
          () => this.setState(this.computeState())
        )
      })
    }

    componentWillUnmount() {
      this.subscriptions.forEach(sub => sub.destroy())
      this.subscriptions = []
    }

    render() {
      return n(Component, o.getProps(this.state, this.props), this.props.children)
    }
  }
}






const ConnectedCalculator = connect(Calculator, {
  listenTo() {
    return { inventoryStore }
  },

  getProps(state, props) {
    return state.inventoryStore
  },
})

ReactDOM.render(
  n(ConnectedCalculator),
  document.querySelector('#app')
)
