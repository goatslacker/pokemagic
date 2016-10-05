function ping(check, f, time) {
  if (time > 5000) return

  setTimeout(() => {
    console.log('@CHECKING', check())

    if (typeof check() !== 'undefined') f()
    else ping(check, f, (time || 10) * 1.5)
  }, time || 10)
}

module.exports = ping
