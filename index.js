const magic = require('./src/magic');
const FileParser = require('./src/fileParsers/fileParser');
const pokeSerializer = require('./src/pokeHelpers');

function processInput() {
  if (process.argv.length > 3) {
    return findSingleResult();
  }

  findResultsForFile(process.argv[2]);
}

function findResultsForFile(filename) {
  const parser = new FileParser(filename).file;
  var results;

  if (!parser) {
    return console.log(`${filename} is not a valid file type`);
  }

  if (!parser.isValid()) {
    return parser.errors.forEach(x => console.log(x));
  }

  parser.read(() => {
    parser.logHeaders();
    parser.pokemonList.forEach((pokemon) => {
      try {
        results = magic(pokemon);
        parser.logResults(pokemon, results.asObject());
      } catch(err) {
        parser.logResults(pokemon, { range: { iv: ['Not found', 'Not found'] } });
      }
    });
  });
}

function findSingleResult() {
  printResult(pokeSerializer.fromArray(process.argv, 2));
}

function printResult(pokemon) {
  magic(pokemon).toString().forEach(x => console.log(x))
}

processInput();
