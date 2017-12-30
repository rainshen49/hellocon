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
    const result = UglifyJS.minify(source,{mangle:false});
    return result.code
}

function compressHTML(source) {
    return htmlminify(source, { minifyJS: true, collapseWhitespace: true, conservativeCollapse: true,removeComments:true })
}

function process(filename){
    if (filename.endsWith('.css')) {
        // add vendor prefix, minify
        const file = fs.readFileSync('./2018src/'+filename).toString()
        postcss([autoprefixer]).process(file).then(function (result) {
            result.warnings().forEach(function (warn) {
                console.warn(warn.toString());
            });
            fs.writeFileSync('./2018/'+filename,compressCSS(result.css));
        });
    } else if (filename.endsWith('.js')) {
        // minify, do nothing for now
        const file = fs.readFileSync('./2018src/'+filename).toString()
        fs.writeFileSync('./2018/'+filename,compressJS(file))
        
    } else if (filename.endsWith('.html')) {
        // minify
        const file = fs.readFileSync('./2018src/'+filename).toString()
        fs.writeFileSync('./2018/'+filename,compressHTML(file))
    }
}

fs.readdirSync("./2018src/").forEach(process)

fs.watch("./2018src",(evtype,filename)=>{
    console.log(evtype,filename)
    if(evtype==="change")process(filename)
})

console.log('watching file changes, press Ctrl/Cmd+C to stop')
console.log('------------Serve the root of this repository to view the webpage------------')