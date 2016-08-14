'use strict'

const CsvParser = require('./csvParser');

class FileParser {
  constructor(filename) {
    this.filename = filename;
    this.extension = this.findExtension();

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

  findExtension() {
    if (!this.filename) { return ''; }
    return this.filename.split('.').pop();
  }
}

module.exports = FileParser
