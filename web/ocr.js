const img = document.querySelectorAll('img')

function scanResults(data) {
  const obj = {}
  // XXX this library does not do well handling CP :(
  data.lines.forEach((line) => {
    console.log(line.text)
    if (/CP/.test(line.text)) {
      obj.cp = Number(line.text.replace(/\D/g, ''))
    } else if (/HP/.test(line.text)) {
      obj.hp = Number(line.text.split('/')[1].trim())
    }

    // XXX collect CP, HP, and stardust
    // maybe we can get away with determining which pokemon it is
    // and...finding what level pokemon they are, we won't need the stardust
    // if we can't find their level then we let them enter in the stardust.
    // ---
    // use a neural net to determine the pokemon or try to pull the name
    // how to determine pokemon's level...
  })
  console.log(obj)
  return obj
}

Tesseract.recognize(img[0], { lang: 'eng' }).then((data) => {
  scanResults(data)
  return

  Tesseract.recognize(img[1], { lang: 'eng' }).then((data) => {
    scanResults(data)
    Tesseract.recognize(img[2], { lang: 'eng' }).then((data) => {
      scanResults(data)
      Tesseract.recognize(img[3], { lang: 'eng' }).then((data) => {
        scanResults(data)
      })
    })
  })
})
