/* eslint-disable no-param-reassign */

const Levels = require('../json/levels');
const Moves = require('../json/moves');
const getCP = require('./getCP');
const getHP = require('./getHP');
const getTypeEffectiveness = require('./getTypeEffectiveness');
const parseIV = require('./parseIV');
const weather = require('./weather');

// 100 seconds in ms.
const TIME_LIMIT = 100000;
// CPU's first attacks are every second.
const DEF_GYM_FIRST_ATTACKS = 1000;
// CPU attacks about every 2 seconds.
const DEF_GYM_ATTACK_TIME = 2000;
// Level 40.
const MAX_LEVEL = 40;

const ATK_DELAY = 700;
const DEF_DELAY = 1600;

// Reference
// https://pokemongo.gamepress.gg/damage-mechanics
function getDMG(
  moveName,
  weatherConditions,
  { player, opponent, atk, def, atkECpM, defECpM }
) {
  const move = Moves[moveName];
  const stab =
    move.Type === (player.type1 || move.Type === player.type2) ? 1.2 : 1;
  const power = typeof move.Power !== 'undefined' ? move.Power : 0;
  const fxMul = getTypeEffectiveness(opponent, move);
  const weatherBonus = weather(weatherConditions || 'EXTREME', move.Type);

  return (
    Math.floor(
      0.5 *
        (atk * atkECpM) /
        (def * defECpM) *
        power *
        stab *
        fxMul *
        weatherBonus
    ) + 1
  );
}

function getDMGVs(obj) {
  return {
    quick: getDMG(obj.move1, obj.weather, obj),
    charge: getDMG(obj.move2, obj.weather, obj),
  };
}

// The player's state which keeps track of a player's running HP, Energy,
// how much damage they've dealt, and other information.
function createState(poke, timeCanAttackMs) {
  const quickMove = Moves[poke.move1];
  const chargeMove = Moves[poke.move2];
  const cooldownQuick = quickMove.DurationMs - quickMove.DamageWindowStartMs;
  const cooldownCharge = chargeMove.DurationMs - chargeMove.DamageWindowStartMs;
  const chargeMoveLimit = Math.abs(chargeMove.Energy);
  const iv = parseIV(poke.iv);
  const fullHP = getHP(poke.pokemon, iv.sta, Levels[poke.lvl]);

  return {
    chargeMove,
    chargeMoveLimit,
    cp: getCP(poke.pokemon, poke.iv, Levels[poke.lvl]),
    cooldownCharge,
    cooldownQuick,
    energy: 0,
    fullHP,
    hp: fullHP,
    maxEnergy: 100,
    nextTurnMs: timeCanAttackMs - quickMove.DamageWindowStartMs,
    pokemon: poke,
    quickMove,
    totalDMG: 0,
    turnCounter: 0,
    useCharge: false,
  };
}

function crushState(state) {
  const iv = parseIV(state.pokemon.iv);
  return {
    id: state.pokemon.pokemon.id,
    name: state.pokemon.pokemon.name,
    iv: `${iv.atk}/${iv.def}/${iv.sta}`,
    moves: [state.pokemon.move1, state.pokemon.move2],
    cp: state.cp,
    hp: state.fullHP,
    // dmg dealt is cummulative for a defender
    dmgDealt: state.totalDMG,
    // dmg taken is capped at your HP
    dmgTaken: Math.min(state.fullHP, state.fullHP - state.hp),
  };
}

// When an end-fight condition is met this function returns the result.
function getResult({
  AttackerState,
  DefenderState,
  log,
  timeLimit,
  timeRemaining,
  winner,
}) {
  return {
    log,
    winner,
    timedOut: timeRemaining <= 0,
    timeElapsed: timeLimit - timeRemaining,
    timeRemaining,
    atk: crushState(AttackerState),
    def: crushState(DefenderState),
  };
}

function dodgeNothing(dmg) {
  return dmg;
}

// Applies the damage and adds the resulting event to the combat log.
function hitAndLog({
  AttackerState,
  DefenderState,
  dodgeModifier,
  label,
  log,
  move,
  timeRemaining,
}) {
  const dmg = dodgeModifier(move.Damage);
  const dmgDealt = DefenderState.hp - dmg > 0 ? dmg : DefenderState.hp;

  // On odd turns and where the dmg is odd we'll +1 the energy gains
  // because defenders gain 1 energy for every -2hp
  const plusOneEnergy =
    dmg % 2 === 1 && AttackerState.turnCounter % 2 === 1 ? 1 : 0;
  const defEnergyGain = Math.floor(dmgDealt / 2) + plusOneEnergy;

  AttackerState.totalDMG += dmgDealt;
  AttackerState.energy = Math.min(
    AttackerState.maxEnergy,
    AttackerState.energy + move.Energy
  );

  DefenderState.energy = Math.min(
    DefenderState.maxEnergy,
    DefenderState.energy + defEnergyGain
  );
  DefenderState.hp -= dmgDealt;

  log.push({
    p: label,
    m: move.Name,
    dmg: dmgDealt,
    ms: timeRemaining,
    a: {
      e: AttackerState.energy,
      h: AttackerState.hp,
    },
    d: {
      e: DefenderState.energy,
      h: DefenderState.hp,
    },
  });
}

// Determines if a Player should attack or not then performs the attack that
// it has been instructed to land. If the Defending Player's Pokemon loses all
// HP then the result is returned.
function landAttack({
  AttackerState,
  DefenderState,
  dmg,
  dodgeStrategy,
  label,
  log,
  timeRemaining,
}) {
  const dodgeModifier = dodgeStrategy || dodgeNothing;
  const shouldAttack = timeRemaining === AttackerState.nextTurnMs;

  if (shouldAttack) {
    const quickAttack = {
      Name: AttackerState.quickMove.Name,
      Damage: dmg.quick,
      Energy: AttackerState.quickMove.Energy,
    };
    const chargeAttack = {
      Name: AttackerState.chargeMove.Name,
      Damage: dmg.charge,
      Energy: AttackerState.chargeMove.Energy,
    };

    // Perform the DMG and add it to the combat log
    hitAndLog({
      AttackerState,
      DefenderState,
      dodgeModifier,
      label,
      log,
      move: AttackerState.useCharge ? chargeAttack : quickAttack,
      timeRemaining,
    });

    // Win condition
    if (DefenderState.hp <= 0) {
      return { ko: true };
    }

    // Increment the turn counter which is used by the defender to know
    // whether or not they'll use their charge move
    AttackerState.turnCounter += 1;
    return { ms: 0 };
  }

  return null;
}

function setAttackerNextTurn(state, timeRemaining, extraMs = 0) {
  // Set the attacker's intention to use a charge move next turn.
  state.useCharge = state.energy >= state.chargeMoveLimit;

  state.nextTurnMs = state.useCharge
    ? timeRemaining -
      state.chargeMove.DamageWindowStartMs -
      state.cooldownCharge -
      extraMs
    : timeRemaining -
      state.quickMove.DamageWindowStartMs -
      state.cooldownQuick -
      extraMs;
}

function setDefenderNextTurn(DefenderState, timeRemaining, extraMs = 0) {
  // Set the defender's intention to use a charge move next turn
  // A defender has a 50% chance of using a charge move when ready so we'll
  // just average it and say it'll use its charge on every "odd" turn.
  DefenderState.useCharge =
    DefenderState.energy >= DefenderState.chargeMoveLimit &&
    DefenderState.turnCounter % 2 !== 0;

  // The defender attacks every 2 seconds except for the first two turns
  // where it attacks each second.
  if (DefenderState.turnCounter < 2) {
    DefenderState.nextTurnMs = DefenderState.useCharge
      ? timeRemaining - DEF_GYM_FIRST_ATTACKS - extraMs
      : timeRemaining - DEF_GYM_FIRST_ATTACKS - extraMs;
  } else {
    DefenderState.nextTurnMs = DefenderState.useCharge
      ? timeRemaining -
        DefenderState.chargeMove.DamageWindowStartMs -
        DefenderState.cooldownCharge -
        DEF_GYM_ATTACK_TIME -
        extraMs
      : timeRemaining -
        DefenderState.quickMove.DamageWindowStartMs -
        DefenderState.cooldownQuick -
        DEF_GYM_ATTACK_TIME -
        extraMs;
  }
}

// Reference
// https://pokemongo.gamepress.gg/gym-combat-mechanics
function simulateBattle(pokeAtk, pokeDef, options) {
  const isPvP = !!options.pvp;
  const isRaid = !!options.raid;
  const raidInfo = options.raid || {};

  const atkECpM = Levels[pokeAtk.lvl || MAX_LEVEL];
  // Can be overwritten for raids
  const defECpM = raidInfo.cpm || Levels[pokeDef.lvl || MAX_LEVEL];

  const atkIV = parseIV(pokeAtk.iv);
  const defIV = parseIV(pokeDef.iv);

  const atkDMG = getDMGVs({
    player: pokeAtk.pokemon,
    atk: pokeAtk.pokemon.stats.attack + atkIV.atk,
    atkECpM,

    opponent: pokeDef.pokemon,
    def: pokeDef.pokemon.stats.defense + defIV.def,
    defECpM,

    move1: pokeAtk.move1,
    move2: pokeAtk.move2,

    weather: options.weather,
  });

  const defDMG = getDMGVs({
    player: pokeDef.pokemon,
    atk: pokeDef.pokemon.stats.attack + defIV.atk,
    atkECpM: defECpM,

    opponent: pokeAtk.pokemon,
    def: pokeAtk.pokemon.stats.defense + atkIV.def,
    defECpM: atkECpM,

    move1: pokeDef.move1,
    move2: pokeDef.move2,

    weather: options.weather,
  });

  // This is where the battle happens.
  //
  // The battle goes on until there is a winner or until the time limit of 100
  // seconds is reached. Each step represents a user's turn.
  const log = [];

  const timeLimit = TIME_LIMIT * (isRaid ? 1.8 : 1);
  let timeRemaining = timeLimit;

  // Attacker can go after 700ms.
  let AttackerState = createState(pokeAtk, timeLimit - ATK_DELAY);

  // Defender can go after 1600ms.
  // The Defender's HP can be overwritten in case of a raid.
  const DefenderState = createState(
    pokeDef,
    timeLimit - (isPvP ? ATK_DELAY : DEF_DELAY)
  );

  if (!isPvP) {
    // Set the Defender's HP to either the Raid defined amount or double.
    DefenderState.fullHP = raidInfo.hp || DefenderState.fullHP * 2;
    DefenderState.cp = raidInfo.cp || DefenderState.cp;
    DefenderState.hp = DefenderState.fullHP;
    // Max energy allotted is doubled
    DefenderState.maxEnergy *= 2;
  }

  let raidParty = 6;

  // Simulate the battle!
  for (timeRemaining; timeRemaining > 0; timeRemaining -= 10) {
    // Attacking Player goes first.
    const winAtk = landAttack({
      AttackerState,
      DefenderState,
      dmg: atkDMG,
      label: 'atk',
      log,
      timeLimit,
      timeRemaining,
    });

    if (winAtk) {
      if (winAtk.ko) {
        return getResult({
          AttackerState,
          DefenderState,
          log,
          timeLimit,
          timeRemaining,
          winner: 'atk',
        });
      }

      setAttackerNextTurn(AttackerState, timeRemaining, winAtk.ms);
    }

    // Defending Player goes next.
    const winDef = landAttack({
      // Flipped here because the Defender is attacking the Attacker.
      AttackerState: DefenderState,
      DefenderState: AttackerState,
      dmg: defDMG,
      label: 'def',
      log,
      timeLimit,
      timeRemaining,
    });

    if (winDef) {
      if (winDef.ko) {
        if (isRaid) {
          raidParty -= 1;
          log.push({
            p: 'atk',
            m: '@FAINT',
            dmg: null,
            ms: timeRemaining,
          });

          if (raidParty === 0) {
            return getResult({
              AttackerState,
              DefenderState,
              log,
              timeLimit,
              timeRemaining,
              winner: 'def',
            });
          }

          AttackerState = createState(pokeAtk, timeRemaining - 1000);
          log.push({
            p: 'atk',
            m: '@SWITCH',
            dmg: null,
            ms: timeRemaining,
          });
        } else {
          return getResult({
            AttackerState,
            DefenderState,
            log,
            timeLimit,
            timeRemaining,
            winner: 'def',
          });
        }
      }

      if (isPvP) {
        setAttackerNextTurn(DefenderState, timeRemaining, winDef.ms);
      } else {
        setDefenderNextTurn(DefenderState, timeRemaining, winDef.ms);
      }
    }
  }

  log.push({
    p: 'atk',
    m: '@TIME_OUT',
    dmg: null,
    ms: timeRemaining,
  });

  // The battle timed out :(
  return getResult({
    AttackerState,
    DefenderState,
    log,
    timeLimit,
    timeRemaining,
    winner: null,
  });
}

module.exports = simulateBattle;
