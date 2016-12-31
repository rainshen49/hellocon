const fs = require('fs')
const csso = require('csso')
const uglifyjs = require('uglify-js')

function compressCSS(filename) {
    const source = fs.readFileSync('./src/stylesheets/' + filename).toString()
    const output = csso.minify(source).css
    fs.writeFileSync('./stylesheets/' + filename, output)
}

function compressJS(filename) {
    const output = uglifyjs.minify('./src/js/' + filename).code
    fs.writeFileSync('./js/' + filename, output)
}

['index.css', 'schedule.css', 'speakers.css', 'stylesheet.css', 'submit.css'].forEach(filename => compressCSS(filename));
['$.js', 'marked.js'].forEach(filename => compressJS(filename));