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

const Input = props => n('input', props)
const Text = props => n('div', props, props.children)
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
  FormControl,
  Header,
  Image,
  Input,
  Panel,
  Table,
  Text,
  View,
}
