const Pokemon = require('./json/pokemon')

const Evo = {}
const Final = {}

Pokemon.forEach(x => Evo[x.family] = x)
Object.keys(Evo).forEach(key => Final[Evo[key].name] = {
  id: Evo[key].id,
  name: Evo[key].name,
  family: Evo[key].family,
})

console.log(JSON.stringify(Final))
