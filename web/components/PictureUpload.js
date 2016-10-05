const B = require('../utils/Lotus.react')
const DustToLevel = require('../../json/dust-to-level')
const Pokemon = require('../../json/pokemon')
const Spinner = require('react-spinkit')
const didMount = require('../utils/didMount')
const liftState = require('../utils/liftState')
const n = require('../utils/n')
const ping = require('../utils/ping')
const redux = require('../redux')

const Mon = Pokemon.reduce((obj, mon) => {
  obj[mon.name] = mon.name
  return obj
}, {})

function drawImage(canvas, img, dim) {
  const ctx = canvas.getContext('2d')

  ctx.drawImage(
    img,
    dim.x,
    dim.y,
    dim.width,
    dim.height,
    0,
    0,
    dim.width,
    dim.height
  )

  return ctx
}

function pictureUploaded(ev, setState) {
  const files = ev.target.files
  const url = window.URL.createObjectURL(files[0])

  const cCp = document.querySelector('#cp')
  const cHp = document.querySelector('#hp')
  const cDust = document.querySelector('#dust')

  const img = new Image()
  img.onload = function () {
    setState({
      processingImage: true,
      url,
    })

    const ctxCp = drawImage(cCp, img, {
      x: 230,
      y: 50,
      width: 260,
      height: 140,
    })

    const ctxHp = drawImage(cHp, img, {
      x: 295,
      y: 680,
      width: 160,
      height: 80,
    })

    const ctxDust = drawImage(cDust, img, {
      x: 372,
      y: 1035,
      width: 140,
      height: 80,
    })

    const obj = {}

    window.Tesseract.recognize(ctxCp, { lang: 'eng' })
      .then(data => obj.cp = Number(data.text.replace(/\D/g, '')))
      .then(() => window.Tesseract.recognize(ctxHp, { lang: 'eng' }))
      .then(data => obj.hp = Number(data.text.split('/')[1].trim()))
      .then(() => window.Tesseract.recognize(ctxDust, { lang: 'eng' }))
      .then(data => obj.dust = Number(data.text.replace(/\D/g, '')))
      .then(() => {
        setState({ processingImage: false })
        window.URL.revokeObjectURL(url)

        redux.dispatch.valuesReset()
        if (obj.name) redux.dispatch.changedName(obj.name)
        if (obj.cp) redux.dispatch.changedCp(obj.cp)
        if (obj.hp) redux.dispatch.changedHp(obj.hp)
        if (obj.dust) redux.dispatch.changedStardust(obj.dust)
      })
      .catch((err) => {
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
    }, [
      n(Spinner, { spinnerName: 'three-bounce' }),
      n(B.Input, {
        onChange: (ev) => {
          const value = ev.currentTarget.value
          const args = value.split(',').map(x => x.trim().replace(')', '')).filter((_, i) => i > 0)
          window.ctx.drawImage.apply(window.ctx, [window.img].concat(args))
        },
        defaultValue: 'ctx.drawImage(img, 50, 50, 200, 200, 0, 0, 200, 200)',
      }),
    ])
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

module.exports = didMount(() => {
  // Warm up the Tesseract worker
  ping(
    () => window.Tesseract,
    () => window.Tesseract.recognize(document.querySelector('img'), { lang: 'eng' })
  )
}, PictureUploadStateful)
