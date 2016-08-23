function scrollTop() {
  if (typeof document !== 'undefined') {
    const node = document.querySelector('.pm')
    if (node) node.scrollTop = 0
  }
}

module.exports = scrollTop
