/* global showdown:false, Rx:false */
import {
    $,
    $$,
    loadscript,
    loadcss,
    importhtml,
    parseHtml,
    Promises,
    swapsrc,
    removeAllChildren,
    makeeditable,
    makenoneditable,
    blobtoUrl,
    Awaiter
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
    const cardtemplates = await toBehtml
    const mastercard = $('.mastercard', cardtemplates).content.children[0]

    const loadingcards = fetchCards(cards)
        .map(mdtohtml)
        .map(parseHtml)
        .map(card => plugintemplate(card, mastercard))
        .forEach(listenExpandcard)
        .forEach(globalHandler.addTOC)
        .forEach(globalHandler.addcard)
    await loadingcards
    attachnewcard(mastercard)
}

main()

function attachnewcard(mastercard) {
    const newcardmodel = mastercard.cloneNode(true)
    cardeditable(newcardmodel,mastercard)
    listenExpandcard(newcardmodel)
    globalHandler.addTOC(newcardmodel)
    globalHandler.addcard(newcardmodel)
}

function fetchCards(cardmds) {
    return new Promises(cardmds.map(card =>
        fetch('cards/' + card).then(res => res.text())
    ))
}

function plugintemplate(card, mastercard) {
    // render card according to mastercard
    // output card
    const target = mastercard.cloneNode(true)
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
    expand.addEventListener('click', (ev) => {
        const iframes = $$('iframe', card)
        if (!mobile) iframes.forEach(swapsrc)
        requestAnimationFrame(() => {
            card.classList.toggle('expanded')
            if (!mobile) ObsCardTransition.first().observeOn(Rx.Scheduler.animationFrame).subscribe(() => {
                // console.log('fired transition end')
                ev.target.scrollIntoView({
                    behavior: 'smooth'
                })
            })
        })
    })
}

function cardeditable(card, mastercard) {
    // make a card editable
    // add contenteditable attributes
    const title = $('.cardtitle', card)
    const brief = $('.brief', card)
    const details = $('.details', card)
    makeeditable(title, brief, details)
    card.onclick = () => {
        if (!card.classList.contains('editing')) {
            return requestAnimationFrame(async() => {
                const edited = await enterediting(card)
                if (edited) {
                    // todo, handle further edits
                    console.log(edited)//see the data
                    requestAnimationFrame(() => {
                        card.classList.remove('editing')
                        card.classList.add('reviewing')
                    })
                    makenoneditable(title, brief, details)
                    attachnewcard(mastercard)
                } else {
                    // not edited
                    requestAnimationFrame(() =>
                        card.classList.remove('editing')
                    )
                    // reapply the listeners
                    cardeditable(card,mastercard)
                }
            })
        }
    }
    title.classList.add('editable')
}

async function enterediting(card) {
    const doneEditingflag = new Awaiter()
    console.log('entering editing mode', card)
    card.classList.add('editing')
    const cardcontent = $('.card-content', card)
    const cardbackup = cardcontent.cloneNode(true)
    const imglinkinput = $('input[name="imglink"]', cardcontent)
    const done = $('.done', card)
    const cancel = $('.cancel', card)
    const imgcontainer = $('.thumbnail', cardcontent)
    let thumbnailurl = "" //will contain the latest url for thumbnail

    function changeThumbnail(url) {
        thumbnailurl = url
        requestAnimationFrame(() => {
            imgcontainer.style.backgroundImage = `url(${url})`
            // confirm relevant UI are hidden
            imgcontainer.classList.add('dragover')
        })
    }
    // a bunch of listeners
    // imgupload drop handlers
    imgcontainer.addEventListener('dragenter', ev => {
        ev.preventDefault()
        console.log('dragenter')
        requestAnimationFrame(() => {
            imgcontainer.classList.add('dragover')
            setTimeout(() => {
                imgcontainer.ondragleave = ev => {
                    console.log('dragleave')

                    ev.preventDefault()
                    requestAnimationFrame(() => {
                        imgcontainer.classList.remove('dragover')
                        imgcontainer.ondragleave = null
                    })
                }
            }, 100)
        })
    })
    imgcontainer.addEventListener('dragover', ev => ev.preventDefault())
    imgcontainer.addEventListener('drop', async ev => {
        ev.preventDefault()
        const imgurl = await processimginput(ev.dataTransfer)
        if (imgurl) {
            changeThumbnail(imgurl)
        }
        // requestAnimationFrame(() => imgcontainer.classList.remove('dragover'))
    })
    imgcontainer.addEventListener('click', ev => {
        // show the upload instruction again when clicked
        imgcontainer.classList.remove('dragover')
    })
    // link/filepicker handlers
    const filelistener = globalHandler.listenFileChooser(async ev => {
        const file = ev.target.files[0] //pick the first file
        if (isImgfile(file)) {
            changeThumbnail(await blobtoUrl(file))
        }
    })
    imglinkinput.addEventListener('input', async ev => {
        const link = ev.target.value
        // console.log(await isImgLinkValid(link))
        if (await isImgLinkValid(link)) {
            changeThumbnail(link)
        }
    })
    // when finish is clicked, save changes, exit editing mode
    done.onclick = ev => {
        ev.stopPropagation()
        done.onclick = null
        filelistener.cancel()
        // render and upload data
        const carddata = {
            title: $('h2', cardcontent).textContent,
            brief: $('.brief',cardcontent).textContent,
            details: $('.details',cardcontent).innerHTML,
            thumbnailurl
        }
        doneEditingflag.done(carddata)
    }
    // when cancel is changed restore to before, exit editing mode
    cancel.onclick = (ev) => {
        ev.stopPropagation()
        cancel.onclick = null
        filelistener.cancel()
        card.replaceChild(cardbackup, cardcontent)
        doneEditingflag.done(false)
    }
    return doneEditingflag.promise
}

async function processimginput(dataTransfer) {
    // input might be a link or a file, return a url
    const types = dataTransfer.types
    console.log(types)
    if (types.includes('Files')) {
        const file = dataTransfer.files[0]
        if (isImgfile(file)) {
            return await blobtoUrl(file)
        } else {
            return null
        }
    } else if (types.includes('text/uri-list')) {
        const link = dataTransfer.getData('text/uri-list')
        if (await isImgLinkValid(link)) {
            return link
        } else {
            return null
        }
    } else {
        return null
    }
}

function isImgfile(file) {
    return file.type.includes('image')
}

function isImgLinkValid(url) {
    // return the link if the img link is valid
    return url.length > 10 && fetch(url).then(res => res.ok).catch(() => false)
}