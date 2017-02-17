const Pokemon = require('../json/pokemon')
const fs = require('fs')
const request = require('request')

const images = fs.readdirSync('./static/images').map(x => x.replace('.png', ''))


var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

console.log(images)

Pokemon.filter(poke => !images.includes(poke.name)).slice(0, 10).forEach(poke => {
  const url = `https://img.pokemondb.net/sprites/black-white/normal/${poke.name.toLowerCase()}.png`
	download(url, `static/images/${poke.name}.png`, () => console.log('OK'))
})
