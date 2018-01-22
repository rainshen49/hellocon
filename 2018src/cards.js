/* global Rx:false, loadcss, importhtml, $, $$, parseHtml, globalHandler, Promises, showiframe, hideiframe, removeAllChildren,mobile, makeeditable, Awaiter, blobtoUrl, DOM */

const cards = ['register.html', 'come.html', 'whenwhere.html', 'submit.html', 'hellocon.html', 'coc.html']

const cardloaded = (async function () {
    const toBehtml = importhtml('cards.html')
    const cardtemplates = await toBehtml
    const mastercard = $('.mastercard', cardtemplates).content.children[0]

    const loadingcards = await fetchCards(cards)
        // .map(mdtohtml)
        .map(parseHtml)
        .map(card => plugintemplate(card, mastercard))
        .forEach(card => listenExpandcard(card))

    loadingcards.forEach(card => {
        globalHandler.addTOC(card)
        globalHandler.addcard(card)
        scrollHash(card)
    })
})()

function fetchCards(urls) {
    const cardsJSONRes = fetch('./cards/cards.json').then(res => res.json())
    return new Promises(urls.map(url => cardsJSONRes.then(cardsjson => {
        if (cardsjson.hasOwnProperty(url)) {
            return cardsjson[url]
        } else {
            return fetch('./cards/' + url).then(res => res.text())
        }
    })))
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
    if(!mobile)target.style.maxHeight = (innerHeight * 0.9).toString() + "px"
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
        window.addEventListener('load', () => {
            console.log('comparing hash')
            requestAnimationFrame(() => dummy.scrollIntoView())
        })
    }
}