const LEGENDARIES = {
  ARTICUNO: 1,
  ENTEI: 1,
  GROUDON: 1,
  HO_OH: 1,
  KYOGRE: 1,
  LATIAS: 1,
  LATIOS: 1,
  LUGIA: 1,
  MEWTWO: 1,
  MOLTRES: 1,
  RAIKOU: 1,
  RAYQUAZA: 1,
  SUICUNE: 1,
  ZAPDOS: 1,
};

function isLegendary(name) {
  return LEGENDARIES.hasOwnProperty(name.toUpperCase());
}

module.exports = isLegendary;
