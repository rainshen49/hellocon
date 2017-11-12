const fs = require('fs')
const showdown = require('showdown')
const converter = new showdown.Converter()
const filelist = fs.readdirSync('./').filter(fn => fn.endsWith('.md'))
const tasks = filelist.map(filename => {
    return new Promise((y, n) => {
        fs.readFile('./' + filename, (err, data) => {
            if (err) n(err)
            else {
                const md = data.toString()
                const html = converter.makeHtml(md)
                y(html)
            }
        })
    })
}).map((promiseToHTML, i) => {
    return promiseToHTML.then(html => fs.writeFileSync('./' + filelist[i].replace(".md", ".html"), html))
})
Promise.all(tasks).then(() => console.log('done rendering md'))