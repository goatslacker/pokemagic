function getWithContext(values) {
  const third = Math.floor(values.length / 3)
  var l = 0

  return values.reduce((arr, value, i) => {
    if (l < 3) {
      arr.push(value)
      l += 1
    } else if (i >= third && l < 7) {
      arr.push(value)
      l += 1
    } else if (i > values.length - 4 & l < 10) {
      arr.push(value)
      l += 1
    }

    return arr
  }, [])
}

module.exports = getWithContext
