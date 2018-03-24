const fs = require('fs');

function prettyWrite(fileName, data) {
  const prettyJSON = JSON.stringify(data, null, 2);
  fs.writeFileSync(fileName, prettyJSON, 'utf-8');
}

module.exports = prettyWrite;
