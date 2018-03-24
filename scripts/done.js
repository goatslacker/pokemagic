function done(name) {
  console.log(name, '- Done in', `${process.uptime()}ms`);
}

module.exports = done;
