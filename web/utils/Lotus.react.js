const n = require('./n')
//const RN = require('react-native-web')
//const View = RN.View

function Table(props) {
  const classList = props.className ? props.className.split(' ') : []
  classList.push('table')

  if (props.clean) classList.push('clean')
  if (props.border) classList.push('border')

  return n('table', {
    className: classList.join(' '),
  }, props.children)
}

function View(props) {
  const classList = props.className ? props.className.split(' ') : []

  if (props.spacing) classList.push(`sp-${props.spacing}`)
  if (props.spacingVertical) classList.push(`sp-vert-${props.spacingVertical}`)
  if (props.spacingHorizontal) classList.push(`sp-horiz-${props.spacingHorizontal}`)

  return n('div', {
    className: classList.join(' '),
    style: props.style,
  }, props.children)
}

const Header = props => (
  n('h1', { style: { textAlign: 'center' } }, props.children)
)

const H3 = props => n('h3', props, props.children)

const Divider = () => n('hr')

const Button = props => (
  n('button', {
    className: `btn btn-${props.size}`,
    onClick: props.onClick,
    style: props.style,
  }, props.children)
)

const FormControl = props => (
  n('label', [
    n('strong', props.label),
  ].concat(props.children))
)

function Text(props) {
  const textProps = { style: {} }
  if (props.className) textProps.className = props.className
  if (props.style) textProps.style = props.style
  if (props.strong) textProps.style.fontWeight = 'bold'

  return n('div', textProps, props.children)
}

const Link = props => n('a', props, props.children)

const Input = props => n('input', props)

const Image = props => n('img', props)

const Panel = props => (
  n('div', {
    style: {
      border: '1px solid #b2b2b2',
      padding: '0.5em',
    },
  }, props.children)
)

module.exports = {
  Button,
  Divider,
  FormControl,
  H3,
  Header,
  Image,
  Input,
  Link,
  Panel,
  Table,
  Text,
  View,
}
