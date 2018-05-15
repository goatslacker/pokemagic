// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');

const URL =
  'https://raw.githubusercontent.com/pokemongo-dev-contrib/pokemongo-game-master/master/versions/latest/GAME_MASTER.json';

module.exports = axios.get(URL).then(res => res.data);
