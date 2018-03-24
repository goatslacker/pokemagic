const GameMaster = require('./GameMaster');

const prettyWrite = require('./prettyWrite');
const done = require('./done');

function type(t) {
  return t ? t.replace('POKEMON_TYPE_', '') : null;
}

GameMaster.then(data => {
  const MovesObj = {};

  data.itemTemplates
    .filter(x => x.hasOwnProperty('moveSettings'))
    .forEach(({ moveSettings }) => {
      MovesObj[moveSettings.movementId] = {
        Name: moveSettings.movementId,
        Type: type(moveSettings.pokemonType),
        Power: moveSettings.power,
        DurationMs: moveSettings.durationMs,
        Energy: moveSettings.energyDelta,
        DamageWindowStartMs: moveSettings.damageWindowStartMs,
        DamageWindowEndMs: moveSettings.damageWindowEndMs,
      };
    });

  prettyWrite('./json/moves.json', MovesObj);
  done('Moves');
});
