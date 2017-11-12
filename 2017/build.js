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
    // const output = uglifyjs.minify('./src/js/' + filename).code
    // fs.writeFileSync('./js/' + filename, output)
    fs.createReadStream('./src/js/' + filename).pipe(fs.createWriteStream('./js/' + filename))
}

function compressHTML(filename) {
    const source = fs.readFileSync('./src/html/' + filename).toString()
    const output = htmlminify(source, { minifyJS: true, collapseWhitespace: true, conservativeCollapse: true });
    fs.writeFileSync('./' + filename, output)
}
fs.readdirSync("./src/stylesheets/").filter(file => file.endsWith('.css')).forEach(filename => compressCSS(filename));
fs.readdirSync("./src/js/").filter(file => file.endsWith('.js')).forEach(filename => compressJS(filename));
fs.readdirSync("./src/html").filter(file => file.endsWith('.html')).forEach(filename => compressHTML(filename));