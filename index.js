const http = require('http')
const markdown = require('markdown-it')
    , md = markdown()
const fs = require('fs')
const { Iconv } = require('iconv')

const iconv = new Iconv('CP850', 'UTF-8')

/**
 * Todavía no tengo muy claro para que me serviría esto
 * pero por si acaso lo voy a mantener.
 */
function loadIndex() {
  const content = iconv.convert(fs.readFileSync('help.idx', 'binary'))
  return content
    .toString()
    .split('\n')
    .map((line) => line.split(','))
    .map(([item, index]) => [item, parseInt(index, 10)])
}

/**
 * Transforma el contenido en HTML.
 */
function transform(content) {
  const text = content.toString()

  const transformed = text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^#(.*)$/mg, '')
    .replace(/\{#9999,(.*?)\}([\S\s]*?)\{-\}/g, '$1<pre><code>$2</code></pre>')
    .replace(/┬/g,'')
    .replace(/├║/g, '<br>')
    .replace(/\{\{\}/g, '{')
    .replace(/\{\}\}/g, '}')
    .replace(/\{\/\}/g, '<hr>')
    .replace(/\{\.0*([0-9]+),(.*?)\}((.*?)\{-\})?/g, '<h1><a id="_$1" href="#_$1">$2$3</a></h1>')
    .replace(/\{\+0*([0-9]+),(0|1|2)\}/g, '<img src="$1">')
    .replace(/\{#0*([0-9]+),(.*?)\}/g, '<a href="#_$1">$2</a>')
    .replace(/\{-\}/g, '')
    .replace(/\{([\S\s]*?)\}/g, '<strong>$1</strong>')
  
  const paragraphs = transformed.split(/\r\n\r\n/g)
  const paragraphed = `<p>${paragraphs.join('</p><p>')}</p>`.replace(/<p><\/p>/g, '')
  
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>DIV Games Studio 2.0</title>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans|Roboto&display=swap" rel="stylesheet">
    <style>
      html, body {
        font-family: 'Open Sans', sans-serif;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Roboto', sans-serif;
      }
    </style>
  </head>
  <body>
    ${paragraphed}
  </body>
</html>
  `
}

function loadContent() {
  return iconv.convert(fs.readFileSync('help.div', 'binary'))
}

if (process.argv[2] === 'serve') {

  const server = http.createServer((req, res) => {
    res.writeHead(200, 'OK')
    res.end(transform(loadContent()))
  })

  server.listen(9000);

} else {
  
  console.log(transform(loadContent()))

}
