/* global Rx:false, loadcss, importhtml, $, $$, parseHtml, globalHandler, Promises, showiframe, hideiframe, removeAllChildren,mobile, makeeditable, Awaiter, blobtoUrl */

const cards = ['submit.html', 'come.html','location.html','hellocon.html', 'coc.html']

// loading dependencies

// let showdown = loadscript('https://cdnjs.cloudflare.com/ajax/libs/showdown/1.8.6/showdown.min.js', 'showdown').then(sd => {
//     showdown = Promise.resolve(sd)
//     return sd
// })

// const converter = showdown.then(sd => new sd.Converter())

// async function mdtohtml(md) {
//     // markdown text to html, not used in production
//     return (await converter).makeHtml(md)
// }

async function main() {
    // load all assets, load cards
    // listen to add new card or edit request, and load correspondingly

    const toBestyle = loadcss('cards.css')
    const toBehtml = importhtml('cards.html')
    const cardtemplates = await toBehtml
    const mastercard = $('.mastercard', cardtemplates).content.children[0]

    const loadingcards = fetchCards(cards)
        // .map(mdtohtml)
        .map(parseHtml)
        .map(card => plugintemplate(card, mastercard))
        .forEach(card => listenExpandcard(card))
        .forEach(globalHandler.addTOC)
        .forEach(globalHandler.addcard)
    // await loadingcards
    // attachnewcard(mastercard)
}

main()

function attachnewcard(mastercard) {
    const newcardmodel = mastercard.cloneNode(true)
    cardeditable(newcardmodel, mastercard)
    listenExpandcard(newcardmodel)
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
    const img = pimg.firstElementChild
    const thumb = $('.thumbnail', target)
    const iframes = $$('iframe', card)
    iframes.forEach(hideiframe)
    Object.assign($('.cardtitle', target), {
        textContent: h2.textContent,
        id: h2.id
    })
    removeAllChildren(thumb)
    img.setAttribute('crossOrigin', "anonymous")
    thumb.appendChild(img)
    $('.brief', target).innerHTML = brief.innerHTML
    const detailsTarget = $('.details', target)
    removeAllChildren(detailsTarget)
    details.forEach(d => detailsTarget.appendChild(d))
    target.style.maxHeight = (innerHeight*0.9).toString()+"px"
    return target
}

function listenExpandcard(card) {
    const expand = $('.expand',card)
    const ObsCardTransition = Rx.Observable.fromEvent(card, 'transitionend', {
        passive: true
    }).debounceTime(5)
    return expand.subscribe('click', (ev) => {
        const iframes = $$('iframe', card)
        if (!mobile) iframes.forEach(showiframe)
        requestAnimationFrame(() => {
            card.classList.toggle('expanded')
            if (!mobile) ObsCardTransition.first().subscribe(() => {
                // console.log('fired transition end')
                ev.target.parentNode.scrollIntoView({
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
    const thumbnail = $('.thumbnail', card)
    const cardcontent = $('.card-content', card)
    thumbnail.dataset.url = $('img', thumbnail) ? $('img', thumbnail).src : ""
    makeeditable(title, brief, details)
    let previd = titletoid(title.textContent)
    cardcontent.onclick = async() => {
        if (!card.classList.contains('editing')) {
            const edited = await enterediting(card)
            if (edited) {
                console.log(edited) //see the data
                // render the markdown
                if (!card.classList.contains('reviewing')) {
                    // new card
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            alert('Thank you! We will review your card, but you can preview it in place now.')
                        })
                    })
                    globalHandler.addTOC(card)
                    attachnewcard(mastercard)
                } else {
                    // just change the id for the new heading of existing cards
                    globalHandler.redirectTOC(previd, card)
                }
                previd = title.id
                requestAnimationFrame(() => {
                    card.classList.add('reviewing')
                })
            } else {
                // not edited
                // reapply the listeners for the cloned card-content because listeners are not cloned for cloneNode
                cardeditable(card, mastercard)
            }
        }
    }
}

function titletoid(title) {
    return title.toLowerCase().replace(/\s/g, "")
}

async function enterediting(card) {
    // return false and restore card content if cancelled,otherwise return the card data and keep the card as is
    // suitable for both new cards and editing existing cards
    // todo, use the img element instead
    const doneEditingflag = new Awaiter()
    console.log('entering editing mode', card)
    // todo, change img href instead
    requestAnimationFrame(() => card.classList.add('editing'))
    const cardtitle = $('.cardtitle', card)
    const cardcontent = $('.card-content', card)
    const cardbackup = cardcontent.cloneNode(true)
    const label = $('label', cardcontent)
    const imgfileupload = $('input[type="file"]', cardcontent)
    const imglinkinput = $('input[name="imglink"]', cardcontent)
    const done = $('.done', card)
    const cancel = $('.cancel', card)
    const imgcontainer = $('.thumbnail', cardcontent)
    let thumbnailurl = imgcontainer.dataset.url || "" //will contain the latest url for thumbnail

    function changeThumbnail(url) {
        thumbnailurl = url
        requestAnimationFrame(() => {
            imgcontainer.style.backgroundImage = `url(${url})`
            imgcontainer.dataset.url = url
            // confirm relevant UI are hidden
            imgcontainer.classList.add('dragover')
        })
    }

    function cleanup() {
        card.classList.remove('editing');
        [listenenter, listendragover, litendrop, listenmodifyimg, labelclick, listenfile, listenpastelink].forEach(listener => listener.unsubscribe())
    }
    // a bunch of listeners
    // imgupload drop handlers
    const listenenter = imgcontainer.subscribe('dragenter', ev => {
        ev.preventDefault()
        console.log('dragenter')
        requestAnimationFrame(() => {
            imgcontainer.classList.add('dragover')
        })
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
    const listendragover = imgcontainer.subscribe('dragover', ev => ev.preventDefault())
    const litendrop = imgcontainer.subscribe('drop', async ev => {
        ev.preventDefault()
        const imgurl = await processimginput(ev.dataTransfer)
        if (imgurl) {
            changeThumbnail(imgurl)
        }
        // requestAnimationFrame(() => imgcontainer.classList.remove('dragover'))
    })
    // click to upload handlers
    const listenmodifyimg = imgcontainer.subscribe('click', ev => {
        requestAnimationFrame(() => imgcontainer.classList.remove('dragover'))
    })
    const labelclick = label.subscribe('click', () => {
        imgfileupload.click()
    })
    // link/filepicker handlers
    const listenfile = imgfileupload.subscribe('change', async ev => {
        const file = ev.target.files[0] //pick the first file
        if (isImgfile(file)) {
            changeThumbnail(await blobtoUrl(file))
        }
    })
    const listenpastelink = imglinkinput.subscribe('input', async ev => {
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
        // render and upload data
        const carddata = {
            title: $('h2', cardcontent).textContent,
            brief: $('.brief', cardcontent).innerHTML,
            details: $('.details', cardcontent).innerHTML,
            thumbnailurl
        }
        cardtitle.id = titletoid(cardtitle.textContent)
        doneEditingflag.done(carddata)
    }
    // when cancel is changed restore to before, exit editing mode
    cancel.onclick = (ev) => {
        ev.stopPropagation()
        cancel.onclick = null
        card.replaceChild(cardbackup, cardcontent)
        doneEditingflag.done(false)
    }
    const result = await doneEditingflag.promise
    cleanup()
    return result
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