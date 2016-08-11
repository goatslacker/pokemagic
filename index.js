const parse = require('./node_modules/csv-parser');
const fs = require('fs');
const magic = require('./src/magic')

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
  printResult(arrayToPokemon(process.argv, 2));
}

function arrayToPokemon(array, startIndex) {
  startIndex = startIndex || 0;

  return serializePokemon({
    name: array[startIndex],
    cp: array[startIndex + 1],
    hp: array[startIndex + 2],
    stardust: array[startIndex + 3],
    level: array[startIndex + 4]
  });
}

function serializePokemon(pokemon) {
  return {
    name: (pokemon.name || 'rhyhorn').toLowerCase(),
    cp: Number(pokemon.cp) || 634,
    hp: Number(pokemon.hp) || 103,
    stardust: Number(pokemon.stardust) || 2500,
    level: pokemon.level ? Number(pokemon.level) : null,
  }
}

function printResult(pokemon) {
  magic(pokemon).toString().forEach(x => console.log(x))
}

const FileParser = function(filename) {
  this.extension = this.findExtension(filename);

  switch(this.extension) {
    /*case 'json':
      this.file = new JsonParser(filename);
      break;*/
    case 'csv':
      this.file = new CsvParser(filename);
      break;
    default:
      this.file = null;
  }
}

FileParser.prototype.findExtension = function(filename) {
  if (!filename) { return ''; }
  return filename.split('.').pop();
}

const CsvParser = function(filename, callback) {
  this.filename = filename;
  this.errors = [];
  this.pokemonList = [];
  this.delimiter = ',';

  this.parser = parse({ delimiter: this.delimiter });

  this.parser.on('readable', () => {
    var record, pokemon;

    while(record = this.parser.read()) {
      this.pokemonList.push(serializePokemon(record));
    }
  })

  this.parser.on('error', (error) => this.errors.push(error.message));
}

CsvParser.prototype.recordToPokemon = function(record) {
  return arrayToPokemon(record);
};

CsvParser.prototype.read = function(callback) {
  const readStream = fs.createReadStream(this.filename);

  readStream.on('data', (chunk) => this.parser.write(chunk))
            .on('end', callback);
}

CsvParser.prototype.isValid = function() {
  return !this.errors.length;
}

CsvParser.prototype.logHeaders = function() {
  console.log(`name${this.delimiter}cp${this.delimiter}hp${this.delimiter}stardust${this.delimiter}leveled${this.delimiter}minIV${this.delimiter}maxIV`);
}

CsvParser.prototype.logResults = function(pokemon, results) {
  const minIV = results.range.iv[0];
  const maxIV = results.range.iv[1];

  console.log(`${pokemon.name}${this.delimiter}${pokemon.cp}${this.delimiter}${pokemon.hp}${this.delimiter}${pokemon.stardust}${this.delimiter}${!!pokemon.level}${this.delimiter}${minIV}${this.delimiter}${maxIV}`);
}

processInput();
