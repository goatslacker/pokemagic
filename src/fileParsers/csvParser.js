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

  logHeaders() {
    console.log(`name${this.delimiter}cp${this.delimiter}hp${this.delimiter}stardust${this.delimiter}leveled${this.delimiter}minIV${this.delimiter}maxIV`);
  }

  logResults(pokemon, results) {
    const minIV = results.range.iv[0];
    const maxIV = results.range.iv[1];

    console.log(`${pokemon.name}${this.delimiter}${pokemon.cp}${this.delimiter}${pokemon.hp}${this.delimiter}${pokemon.stardust}${this.delimiter}${!!pokemon.level}${this.delimiter}${minIV}${this.delimiter}${maxIV}`);
  }
}

module.exports = CsvParser
