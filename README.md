# pokemagic

## Usage

```sh
npm install pokemagic
```

## API

### Battle Simulator

Example

```js
const simulateBattle = require('pokemagic/simulateBattle');

const attacker = {
  iv: 0xfff,
  lvl: 40,
  move1: 'COUNTER_FAST',
  move2: 'DYNAMIC_PUNCH',
  pokemon: findPokemon('exeggutor'),
};

const defender = {
  iv: 0xfff,
  lvl: 40,
  move1: 'WATERFALL_FAST',
  move2: 'HYDRO_PUMP',
  pokemon: findPokemon('gyarados'),
};

const options = {
  pvp: false,
  raid: null,
  weather: 'EXTREME',
};

const stats = simulateBattle(attacker, defender, options);

stats.winner === 'atk'; // true
```

Attacker/Defender Objects

```js
{
  iv: 'number', // hexadecimal
  lvl: 'number', // 1-40
  move1: 'string', // a valid Move name (see json/moves.json)
  move2: 'string',
  pokemon: { // a valid Pokemon object (see json/pokemon.json)
    id: 'number',
    name: 'string',
    type1: 'string',
    type2: 'string',
    stats: { stamina: 'number', attack: 'number', defense: 'number' },
  },
}
```

Request Options

```js
{
  pvp: 'boolean',
  raid: {
    cp: 'number',
    hp: 'number',
    cpm: 'number',
  },
  weather: 'string', // EXTREME, CLEAR, FOGGY, SUNNY (see lib/weather.js)
};
```

Response

```js
const Pokemon = {
  id: 'number',
  name: 'string',
  iv: 'string',
  moves: ['string', 'string'],
  cp: 'number',
  hp: 'number',
  dmgDealt: 'number',
  dmgTaken: 'number',
}

const Response = {
  log: [{ // A log of all the moves that took place
    p: 'string', // Pokemon
    m: 'string', // Move
    dmg: 'number', // Damage
    ms: 'number', // Time
  }],
  winner: 'string', // atk | def
  timedOut: 'boolean',
  timeElapsed: 'number',
  timeRemaining: 'number',
  atk: Pokemon,
  def: Pokemon,
}
```

### Breakpoint & Bulkpoint

Example

```js
const breakpoint = require('pokemagic/breakpoint');

// Calculate the break/bulk points for a Raikou fighting a Kyogre
const point = breakpoint('raikou', 'kyogre');
```

Response

```js
{
  atk: [{ // breakpoints
    move: 'string',
    table: [{
      dmg: 'number',
      cp: 'number',
      lvl: 'number',
      pct: 'string', // percentage increase over previous point
    }],
  }],
  def: [{ // bulkpoints
    move: 'string',
    table: [{
      dmg: 'number',
      cp: 'number',
      lvl: 'number',
      pct: 'string',
    }],
  }],
```

### Defender Profile

Response

```js
{
  counters: {
    // Each move will have its own counters list
    'EMBER_FAST/FIRE_BLAST': [
      // Each list belongs to a Pokemon, in case there are multiple movesets
      // that are viable counters
      [{
        dmg: 'number', // Damage dealt
        hp: 'number', // HP lost
        kop: 'number', // KO% How close can you get to KO opponent
        moves: ['string', 'string'], // Quick & Charge move
        name: 'string', // Pokemon's name
        retired: 'boolean', // Whether the moveset is legacy or not
        score: 'number', // Internally used to rank best counters
        time: 'number', // Time to win
        tm: 'boolean', // Whether moveset combo is exclusive to TM
      }],
    ],
  },
  immune: ['string'],
  notEffective: ['string'],
  superEffective: ['string']
}
```

### Type Rankings

Example

```js
  const typeRankings = require('pokemagic/typeRankings');

  const rank = typeRankings('electric');
```

Response

```js
[{
  name: 'string',
  moves: ['string', 'string'],
  avgHPLoss: 'number',
  avgTime: 'number',
  dps: 'number', // Damage per second
  score: 'number', // Internally used to sort
  dmg: 'number', // Total DMG
  hp: 'number', // Total HP lost
  time: 'number', // Total time
  wins: 'number', // Number of battles won
  count: 'number', // Number of battles fought
}]
```

### IV Calculator

Example

```js
  const calculateIV = require('pokemagic/calculateIV');

  const matches = calculateIV(
    findPokemon('MEWTWO'), // Pokemon
    3982, // CP
    164, // HP
    40 // Level
  );
```

Response

Possible IV values are returned.
If the array is empty then no IVs were matched.

```js
[{ atk: 'number', def: 'number', sta: 'number' }]
```
