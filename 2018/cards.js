import {
    $,
    $$,
    loadscript,
    loadcss,
    importhtml,
    parseHtml,
    Promises,
    swapsrc,
    removeAllChildren
} from './helper.js'
import {
    globalHandler,
    mobile
} from './index.js'
const cards = ['hellocon.md', 'submit.md']

async function main() {
    // load all assets, load cards
    // listen to add new card or edit request, and load correspondingly

    const toBeconverter = loadscript('https://cdnjs.cloudflare.com/ajax/libs/showdown/1.8.1/showdown.min.js').then(() => new showdown.Converter())
    const toBestyle = loadcss('cards.css')
    const toBehtml = importhtml('cards.html')
    const converter = await toBeconverter

    function mdtohtml(md) {
        // markdown text to html, not used in production
        return converter.makeHtml(md)
    }
    const mastercard = $('.mastercard', await toBehtml)

    const loadingcards = fetchCards(cards)
        .map(mdtohtml)
        .map(parseHtml)
        .map(card => plugintemplate(card, mastercard))
        .forEach(listenExpandcard)
        .forEach(globalHandler.addTOC)
        .forEach(globalHandler.addcard)

}

main()

function fetchCards(cardmds) {
    return new Promises(cardmds.map(card =>
        fetch('cards/' + card).then(res => res.text())
    ))
}

function plugintemplate(card, mastercard) {
    // render card according to mastercard
    // output card
    const target = mastercard.content.children[0].cloneNode(true)
    const [h2, brief, pimg, ...details] = card.children
    const iframes = $$('iframe', card)
    iframes.forEach(swapsrc)
    Object.assign($('.cardtitle', target), {
        textContent: h2.textContent,
        id: h2.id
    })
    $('.thumbnail', target).appendChild(pimg.children[0])
    $('.brief', target).textContent = brief.textContent
    const detailsTarget = $('.details', target)
    removeAllChildren(detailsTarget)
    details.forEach(d => detailsTarget.appendChild(d))
    return target
}

function listenExpandcard(card) {
    const expand = card.firstElementChild
    const ObsCardTransition = Rx.Observable.fromEvent(card, 'transitionend', {
        passive: true
    }).debounceTime(5)
    const iframes = $$('iframe', card)
    expand.addEventListener('click', (ev) => {
        if (!mobile)iframes.forEach(swapsrc)
        requestAnimationFrame(() => {
            card.classList.toggle('expanded')
            if (!mobile) ObsCardTransition.first().observeOn(Rx.Scheduler.animationFrame).subscribe(() => {
                // console.log('fired transition end')
                ev.target.scrollIntoView({
                    behavior: "smooth"
                })
            })
        })
    })
}

function makeeditable(card){
    // make a card editable
    // add contenteditable attributes
    // add listeners for entering editing mode
    // load editing assets if not loaded yet
}

async function editingmode(newcard) {
    const actions = $('.actions', newcard)
    const imgcontainer = $('.thumbnail', newcard)
    const addimg = $('i', imgcontainer)
    let thumbnailurl = ""
    console.log('entering editing mode', newcard)
    requestAnimationFrame(() => actions.classList.remove('detached'))
    addimg.addEventListener('dragenter', ev => {
        ev.preventDefault()
        console.log('dragenter')
        requestAnimationFrame(() => addimg.classList.add('dragover'))
    })
    addimg.addEventListener('dragleave', ev => {
        ev.preventDefault()
        console.log('dragleave')
        requestAnimationFrame(() => addimg.classList.remove('dragover'))
    })
    addimg.addEventListener('dragover', ev => ev.preventDefault())
    addimg.addEventListener('drop', async ev => {
        ev.preventDefault()
        // URL.createObjectURL(files[0])
        // or use filereader
        // we can use fetch to convert blob
        debugger
        const type = ev.dataTransfer.types[0]
        if (type === "file") {

            const file = ev.dataTransfer.files[0]
            // todo: check filesize, filename, makesure it is an image
            thumbnailurl = await imgblobtoUrl(file)
            console.log(file, 'dropped')
            imgcontainer.style.backgroundImage = `url(${thumbnailurl})`
            requestAnimationFrame(() => {
                addimg.classList.add('filled')
            })
        } else if (type.includes("text")) {
            // text link
            debugger
        }
        requestAnimationFrame(() => addimg.classList.remove('dragover'))
    })

}
// const cardQueue = fetchCards(['hellocon.md', 'submit.md']).then(cards => cards.forEach(registerCard))
// newcardmock.onclick = async() => {
//     newcardmock.onclick = null
//     const backupcard = newcardmock.cloneNode(true)
//     await editingmode(newcardmock)
//     // when editing is done, do some task here
// }