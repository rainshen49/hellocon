const autoprefixer = require('autoprefixer');
const postcss      = require('postcss');
const fs = require('fs')

fs.readdirSync("./2018/stylesheets/").filter(file => file.endsWith('.css')).forEach(filename => compressCSS(filename));


postcss([ autoprefixer ]).process(css).then(function (result) {
    result.warnings().forEach(function (warn) {
        console.warn(warn.toString());
    });
    console.log(result.css);
});