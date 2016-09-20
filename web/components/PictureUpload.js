const B = require('../utils/Lotus.react')
const DustToLevel = require('../../json/dust-to-level')
const Pokemon = require('../../json/pokemon')
const Spinner = require('react-spinkit')
const redux = require('../redux')
const liftState = require('../utils/liftState')
const n = require('../utils/n')

const Mon = Pokemon.reduce((obj, mon) => {
  obj[mon.name] = mon.name
  return obj
}, {})

function scanResults(data) {
  const obj = {}
  data.lines.forEach((line) => {
    console.log(line.text)
    if (/CP/.test(line.text)) {
      const cp = line.text
        .split(' ')
        .filter(x => /CP/.test(x))
        .map(x => x.replace('CP', ''))
      if (cp.length) obj.cp = Number(cp[0])
    } else if (/HP/.test(line.text)) {
      obj.hp = Number(line.text.split('/')[1].trim())
    } else {
      const mon = line.text
        .replace(/\W/g, ' ')
        .split(' ')
        .filter(x => Mon.hasOwnProperty(x.toUpperCase()))
      if (mon.length) obj.name = mon[0].toUpperCase()

      const mon2 = line.text.replace(/\W/g, '').toUpperCase()
      if (Mon.hasOwnProperty(mon2)) obj.name = mon2

      const dust = line.text
        .replace(/\D/g, ' ')
        .split(' ')
        .filter(Number)
        .filter(x => DustToLevel[x])
      if (dust.length) obj.stardust = Number(dust[0])
    }
  })
  return obj
}

function pictureUploaded(ev, setState) {
  const files = ev.target.files
  const url = window.URL.createObjectURL(files[0])

  const photoCanvas = document.getElementById('capturedPhoto')
  const ctx = photoCanvas.getContext('2d')

  const img = new Image()
  img.onload = function () {
    setState({
      processingImage: true,
      url,
    })

    ctx.drawImage(img, 0, 0, 750, 1334)

    window.Tesseract.recognize(img, { lang: 'eng' }).then((data) => {
      setState({ processingImage: false })

      window.URL.revokeObjectURL(url)
      const obj = scanResults(data)

      console.log('Scan results', obj)

      redux.dispatch.valuesReset()
      if (obj.cp) redux.dispatch.changedCp(obj.cp)
      if (obj.hp) redux.dispatch.changedHp(obj.hp)
      if (obj.name) redux.dispatch.changedName(obj.name)
      if (obj.stardust) redux.dispatch.changedStardust(obj.stardust)
    }, (err) => {
      setState({ processingImage: false })
      alert(err.stack)
    })
  }
  img.src = url
}

function PictureUpload(props) {
  if (props.processingImage) {
    return n(B.View, {
      style: { margin: '1em 0', textAlign: 'center' },
    }, [n(Spinner, { spinnerName: 'three-bounce' })])
  }

  const image = props.url && (
    n(B.View, {
      style: { textAlign: 'center' },
    }, [
      n(B.Image, {
        height: 400,
        src: props.url,
      }),
    ])
  )

  return n(B.View, {
    style: { margin: '1em 0' },
  }, [
    image,
    n(B.FormControl, { label: 'Read from screenshot' }, [
      n(B.Input, {
        type: 'file',
        accept: 'image/*',
        capture: 'camera',
        onChange: ev => pictureUploaded(ev, props.setState),
      }),
    ]),
  ])
}

const PictureUploadStateful = liftState({
  processingImage: false,
  url: null,
}, PictureUpload)

module.exports = PictureUploadStateful
