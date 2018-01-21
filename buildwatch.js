const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const fs = require('fs')
const csso = require('csso')
const htmlminify = require('html-minifier').minify
const UglifyJS = require("uglify-es");

function compressCSS(source) {
    return csso.minify(source).css
}

function compressJS(source) {
    const result = UglifyJS.minify(source, { mangle: false });
    return result.code
}

function compressHTML(source) {
    return htmlminify(source, { minifyJS: true, collapseWhitespace: true, conservativeCollapse: true, removeComments: true })
}

const jssequence = { 'helper.js': "", 'index.js': "", 'cards.js': "", 'sponsors.js': "" }
const csssequence = { 'index.css': "", 'animations.css': "", 'cards.css': "" }

async function process(filename) {
    if (filename.endsWith('.css')) {
        // add vendor prefix, minify
        const file = fs.readFileSync('./2018src/' + filename).toString()
        const css = await postcss([autoprefixer]).process(file).then(function (result) {
            result.warnings().forEach(function (warn) {
                console.warn(warn.toString());
            });
            return compressCSS(result.css)
        })
        if (csssequence.hasOwnProperty(filename)) {
            csssequence[filename] = css
        }
    } else if (filename.endsWith('.js')) {
        // minify, do nothing for now
        const file = fs.readFileSync('./2018src/' + filename).toString()
        const js = compressJS(file)
        if (jssequence.hasOwnProperty(filename)) {
            jssequence[filename] = js
        }
    } else if (filename.endsWith('.html')) {
        // minify
        const file = fs.readFileSync('./2018src/' + filename).toString()
        fs.writeFileSync('./2018/' + filename, compressHTML(file))
    }
}

function writeBundles() {
    fs.writeFileSync('./2018/bundle.js', Object.keys(jssequence).map(key => jssequence[key]).join(''))
    fs.writeFileSync('./2018/bundle.css', Object.keys(csssequence).map(key => csssequence[key]).join(''))
}

Promise.all(fs.readdirSync("./2018src/").map(process)).then(writeBundles)

fs.watch("./2018src", async (evtype, filename) => {
    console.log(evtype, filename)
    if (evtype === "change") {
        await process(filename)
        writeBundles()
    }
})

console.log('watching file changes, press Ctrl/Cmd+C to stop')
console.log('------------Serve the root of this repository to view the webpage------------')