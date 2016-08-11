const csvParser = require('csv-parser');
const fs = require('fs');
const pokeSerializer = require('../pokeHelpers');

class CsvParser {
  constructor(filename, callback) {
    this.filename = filename;
    this.errors = [];
    this.pokemonList = [];
    this.delimiter = ',';

    this.parser = csvParser({ delimiter: this.delimiter });

    this.parser.on('readable', () => {
      var record, pokemon;

      while(record = this.parser.read()) {
        this.pokemonList.push(pokeSerializer.fromObject(record));
      }
    })

    this.parser.on('error', (error) => this.errors.push(error.message));
  }

  read(callback) {
    const readStream = fs.createReadStream(this.filename);

    readStream.on('data', (chunk) => this.parser.write(chunk))
              .on('end', callback);
  }

  isValid() {
    return !this.errors.length;
  }

  headerString() {
    var headers = [
      'name', 'cp', 'hp', 'stardust', 'leveled',
      'minIV', 'maxIV'
    ];

    return headers.join(this.delimiter);
  }

  resultString(pokemon, results) {
    const minIV = results.range.iv[0];
    const maxIV = results.range.iv[1];

    var results = [
      pokemon.name, pokemon.cp, pokemon.hp, pokemon.stardust, !!pokemon.level,
      minIV, maxIV
    ];

    return results.join(this.delimiter);
  }
}

module.exports = CsvParser
