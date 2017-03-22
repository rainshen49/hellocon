const fs = require('fs')
const csso = require('csso')
const uglifyjs = require('uglify-js')
const htmlminify = require('html-minifier').minify

function compressCSS(filename) {
    const source = fs.readFileSync('./src/stylesheets/' + filename).toString()
    const output = csso.minify(source).css
    fs.writeFileSync('./stylesheets/' + filename, output)
}

function compressJS(filename) {
    const output = uglifyjs.minify('./src/js/' + filename).code
    fs.writeFileSync('./js/' + filename, output)
}

function compressHTML(filename) {
    const source = fs.readFileSync('./src/html/' + filename).toString()
    const output = htmlminify(source, { minifyJS: true, collapseWhitespace: true, conservativeCollapse: true });
    fs.writeFileSync('./' + filename, output)
}

['index.css', 'schedule.css', 'speakers.css', 'stylesheet.css','nametags.css'].forEach(filename => compressCSS(filename));
['$.js', 'marked.js'].forEach(filename => compressJS(filename));
['index.html', 'schedule.html', 'speakers.html', 'CoC.html','nametags.html',"hellocon2017.html"].forEach(filename => compressHTML(filename));