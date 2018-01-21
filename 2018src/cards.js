/* global Rx:false, loadcss, importhtml, $, $$, parseHtml, globalHandler, Promises, showiframe, hideiframe, removeAllChildren,mobile, makeeditable, Awaiter, blobtoUrl */

const cards = ['register.html', 'come.html', 'whenwhere.html', 'submit.html', 'hellocon.html', 'coc.html']

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
        .forEach(scrollHash)
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
    const target = mastercard.cloneNode(true)
    const [h2, brief, pimg, ...details] = card.children
    const img = pimg.firstElementChild
    const thumb = $('.thumbnail', target)
    const iframes = $$('iframe', card)
    // hide iframe for lazy load
    iframes.forEach(hideiframe)
    Object.assign($('.cardtitle', target), {
        textContent: h2.textContent
    })
    Object.assign($('.dummy', target), {
        id: h2.id
    })
    // removeAllChildren(thumb)
    img.setAttribute('crossOrigin', "anonymous")
    thumb.appendChild(img)
    $('.brief', target).innerHTML = brief.innerHTML
    const detailsTarget = $('.details', target)
    // removeAllChildren(detailsTarget)
    details.forEach(d => detailsTarget.appendChild(d))
    target.style.maxHeight = (innerHeight * 0.9).toString() + "px"
    return target
}

function listenExpandcard(card) {
    const expand = $('.expand', card)
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
                expand.parentNode.scrollIntoView({
                    behavior: 'smooth'
                })
            })
        })
    })
}

function scrollHash(card) {
    const dummy = $('.dummy', card)
    if (dummy.id === location.hash.slice(1)) {
        window.addEventListener('load', ()=>{
            console.log('comparing hash')
            requestAnimationFrame(()=> dummy.scrollIntoView())
        })
    }
}