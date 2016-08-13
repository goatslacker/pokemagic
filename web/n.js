const React = require('react')

module.exports = function n(a, b, c) {
  var component = a
  var props = null
  var children = undefined

  var len = arguments.length

  if (len === 2) {
    component = a
    if (Array.isArray(b) || typeof b === 'string' || typeof b === 'number') {
      children = b
    } else {
      props = b
    }
  } else if (len === 3) {
    props = b
    children = c
  }

  const args = [component, props].concat(children)
  return React.createElement.apply(React, args)
}
