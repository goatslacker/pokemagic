const fs = require('fs');

const genSnapshot = require('../lib/genSnapshot');

fs.writeFileSync(
  './test/snapshot.json',
  JSON.stringify(genSnapshot(), null, 2)
);
