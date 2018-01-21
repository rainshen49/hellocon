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
Promise.all(tasks).then(combineHTMLs).then(() => console.log('done rendering md & combining htmls'))
function combineHTMLs() {
    const htmls = fs.readdirSync('./').filter(fn => fn.endsWith('.html'))
    Promise.all(htmls.map(filename => {
        return new Promise((y, n) => {
            fs.readFile('./' + filename, (err, data) => {
                if (err) n(err)
                else {
                    const html = data.toString()
                    y({ [filename]: html })
                }
            })
        })
    })).then(cards=>{
        const result = {}
        cards.forEach(card=>Object.assign(result,card))
        return result
    }).then(cards=>fs.writeFileSync('./cards.json',JSON.stringify(cards)))
}