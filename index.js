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
  var resultString;

  if (!parser) {
    return console.log(`${filename} is not a valid file type`);
  }

  if (!parser.isValid()) {
    return parser.errors.forEach(x => console.log(x));
  }

  parser.read(() => {
    console.log(parser.headerString());
    parser.pokemonList.forEach((pokemon) => {
      try {
        resultString = parser.resultString(pokemon, magic(pokemon).asObject());
      } catch(err) {
        resultString = parser.resultString(pokemon, {
          range: { iv: ['Not found', 'Not found'] }
        });
      }
      console.log(resultString);
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
