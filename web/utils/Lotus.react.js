const n = require('./n')

const View = ({
  className,
  spacing,
  spacingVertical,
  spacingHorizontal,

  style,
  children,
}) => {
  const classList = className ? className.split(' ') : []

  if (spacing) classList.push(`sp-${spacing}`)
  if (spacingVertical) classList.push(`sp-vert-${spacingVertical}`)
  if (spacingHorizontal) classList.push(`sp-horiz-${spacingHorizontal}`)

  return n('div', {
    className: classList.join(' '),
    style,
  }, children)
}

const Row = props => (
  n('div', {
    style: {
      display: 'flex',
      flex: 1,
      flexDirection: 'row',
      justifyContent: props.horizontal || 'space-between',
      alignItems: props.vertical || 'baseline',
    },
  }, props.children)
)

const Col = props => (
  n('div', {
    style: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      justifyContent: props.vertical || 'space-between',
      alignItems: props.horizontal || 'baseline',
    },
  }, props.children)
)

const Text = ({
  strong,
  style,

  children,
}) => {
  const textProps = { style: {} }
  if (style) textProps.style = style
  if (strong) textProps.style.fontWeight = 'bold'

  return n('div', textProps, children)
}

const Touchable = ({
  onTouch,
  style,
  children,
}) => (
  n('div', {
    onClick: ev => onTouch(ev),
    style,
  }, children)
)

module.exports = {
  Col,
  Row,
  Text,
  Touchable,
  View,
}
