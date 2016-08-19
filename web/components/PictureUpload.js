const B = require('../utils/Lotus.react')
const Spinner = require('react-spinkit')
const n = require('../utils/n')

function scanResults(data) {
  const obj = {}
  data.lines.forEach((line) => {
    console.log(line.text)
    if (/CP/.test(line.text)) {
      const singledCp = line.text.split(' ').filter(x => /CP/.test(x))
      if (singledCp.length) {
        obj.cp = Number(singledCp[0].replace(/\D/g, ''))
      }
    } else if (/HP/.test(line.text)) {
      obj.hp = Number(line.text.split('/')[1].trim())
    } else if (Mon.hasOwnProperty(line.text.trim())) {
      obj.name = line.text.trim()
    }
  })
  return obj
}

function pictureUploaded(ev) {
  const files = ev.target.files
  const url = window.URL.createObjectURL(files[0])

  const photoCanvas = document.getElementById('capturedPhoto')
  const ctx = photoCanvas.getContext('2d')

  actions.imageProcessing()

  const img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0, 750, 1334)

    window.Tesseract.recognize(img, { lang: 'eng' }).then((data) => {
      window.URL.revokeObjectURL(url)
      const obj = scanResults(data)

      console.log(obj)

      actions.valuesReset()
      if (obj.cp) actions.changedCP({ currentTarget: { value: obj.cp }})
      if (obj.hp) actions.changedHP({ currentTarget: { value: obj.hp }})
      if (obj.name) actions.changedName(obj.name)
    })
  }
  img.src = url
}

function PictureUpload(props) {
  if (props.processingImage) {
    return n(Spinner, { spinnerName: 'three-bounce' })
  }

  return n(B.View,[
    n(B.FormControl, { label: 'Select Screenshot' }, [
      n(B.Input, {
        type: 'file',
        accept: 'image/*',
        capture: 'camera',
        onChange: pictureUploaded,
      }),
    ]),
  ])
}

module.exports = PictureUpload
