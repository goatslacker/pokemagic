const parse = require('./node_modules/csv-parser');
const fs = require('fs');
const magic = require('./src/magic')

function processInput() {
  console.log(`# of args ${process.argv.length}`);

  if (process.argv.length > 3) {
    return findSingleResult();
  }

  findResultsForFile(process.argv[2]);
}

function findResultsForFile(filename) {
  const fileParser = new FileParser(filename);
  var results;

  if (!fileParser.file) {
    return console.log(`${filename} is not a valid file type`);
  }

  if (!fileParser.file.isValid()) {
    return fileParser.file.errors.forEach(x => console.log(x));
  }

  fileParser.file.read(() => {
    fileParser.file.pokemonList.forEach((pokemon) => {
      try {
        results = magic(pokemon);
        fileParser.file.logResults(pokemon, results.asObject());
      } catch(err) {
        console.log(err.message);
      }
    });
  });
}

function findSingleResult() {
  console.log('findSingleResult');
  printResult(arrayToPokemon(process.argv, 2));
}

function arrayToPokemon(array, startIndex) {
  startIndex = startIndex || 0;

  return {
    name: array[startIndex] || 'rhyhorn',
    cp: Number(array[startIndex + 1]) || 634,
    hp: Number(array[startIndex + 2]) || 103,
    stardust: Number(array[startIndex + 3]) || 2500,
    level: array[startIndex + 4] ? Number(array[startIndex + 4]) : null,
  }
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
  console.log(`FileParser filename: ${filename}`);
  this.extension = this.findExtension(filename);
  console.log(`FileParser extension: ${this.extension}`);

  switch(this.extension) {
    case 'json':
      this.file = new JsonParser(filename);
      break;
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

CsvParser.prototype.logResults = function(pokemon, results) {
  const minIV = results.range.iv[0];
  const maxIV = results.range.iv[1];

  console.log(`${pokemon.name}${this.delimiter}${pokemon.cp}${this.delimiter}${pokemon.hp}${this.delimiter}${pokemon.stardust}${this.delimiter}${minIV}${this.delimiter}${maxIV}`);
}

processInput();
