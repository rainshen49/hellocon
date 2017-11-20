// todo: make card looks right in both states
import { $, $$, imgblobtoUrl, swapsrc, applypreloadedstyles } from './helper.js'
import { actions, UIstore, Datastore } from './ars.js'

const container = document.body
const splash = $('#splash', container)
const banner = $('#banner', container)
const ham = $('#ham', banner)
const toc = $('#toc', container)
const cards = $('.cards', container)
const modalbg = $('.modalbg', container)
const reload = $('#reload', container)
const cardtemplate = $('.cardtem', container)
const newcardmock = $('.new.card', container)


const scrollthreshold = parseInt(reload.getBoundingClientRect().height / 2, 10);
const bannerheight = banner.getBoundingClientRect().height
const mobile = window.innerWidth <= 768

const ObsWindowScroll = Rx.Observable.fromEvent(window, 'scroll', { passive: true })
const scrollBanner = ObsWindowScroll
    .startWith(0)
    .map(() => splash.getBoundingClientRect().bottom - bannerheight)
    // 48 depends on per rem size
    .do(location => {
        const showbanner = location < 0
        requestAnimationFrame(() => {
            if (showbanner !== banner.classList.contains('ontop')) {
                banner.classList.toggle('ontop')
            }
        })
    })

const ObsSplashTouchStart = Rx.Observable.fromEvent(splash, 'touchstart', { passive: true })
const ObsSplashTouchMove = Rx.Observable.fromEvent(splash, 'touchmove', { passive: true })
const ObsSplashTouchEnd = Rx.Observable.fromEvent(splash, 'touchend', { passive: true })

// ObsSplashTouchStart.subscribe((ev) => console.log('started', scrollY))
// ObsSplashTouchMove.subscribe((ev) => console.log('moving', scrollY))
// ObsSplashTouchEnd.subscribe((ev) => console.log('ended', scrollY))

const pullToRefresh = ObsSplashTouchStart.do(() => {
    const touchstart = ObsReloadWaiting.subscribe()
        // when touch ended, unsubscript
    const touchend = ObsReloadConfirm.subscribe(() => {
        touchend.unsubscribe()
        touchstart.unsubscribe()
    })
})

const rlclassList = reload.classList
const ObsReloadWaiting = ObsSplashTouchMove
    .observeOn(Rx.Scheduler.animationFrame)
    .do(() => {
        if (scrollY < 0) {
            rlclassList.remove('detached')
            if (scrollY < -scrollthreshold) {
                rlclassList.add('activated')
            } else {
                rlclassList.remove('activated')
            }
        } else {
            rlclassList.add('detached')
        }
    })

const ObsReloadConfirm = ObsSplashTouchEnd
    .do(() => {
        if (scrollY >= -scrollthreshold) {
            // remove the refresh button if not triggered
            rlclassList.add('detached')
        } else {
            requestAnimationFrame(() => {
                rlclassList.add('active')
                requestAnimationFrame(() => window.location.reload())
            })
        }
    })

function onUIChange(UIstore) {
    const { nav } = UIstore.getState()
    requestAnimationFrame(() => {
        if (nav === toc.classList.contains('detached')) {
            // need to update toc
            toc.classList.toggle('detached')
                // manipulate dom only on change        
            if (nav) {
                modalbg.classList.remove('detached')
                document.body.classList.add('modalopen')
                modalbg.onclick = ev => {
                    ev.stopPropagation()
                    UIstore.dispatch(Object.assign({}, actions.togglenav, { tobe: false }))
                }
            } else {
                modalbg.classList.add('detached')
                document.body.classList.remove('modalopen')
                modalbg.onclick = null
            }
        }
    })
}


function onDataChange(Datastore) {
    const cardstore = Datastore.getState()
    const contents = Array.from(toc.children)
    const titles = contents.map(a => a.textContent)
    Object.keys(cardstore).filter(title => !titles.includes(title)).forEach(title => {
        // add new content items
        const a = document.createElement('a')
        Object.assign(a, {
            textContent: title,
            href: '#' + $('h2', cardstore[title]).id,
            className: "navitem"
        })
        a.addEventListener('click', (ev) => {
            UIstore.dispatch(actions.togglenav)
        })
        toc.appendChild(a)
        cards.appendChild(cardstore[title])
    })
    contents.filter(({ textContent }) => !cardstore.hasOwnProperty(textContent)).forEach(item => item.parentNode.removeChild(item))
        // remove old content items
}

function fetchCards(cardmds) {
    return Promise.all(cardmds.map(card =>
        fetch('cards/' + card).then(res => res.text()).then(mdtohtml).then(parseHtml).then(plugintemplate)
    ))
}

function plugintemplate(root) {
    const target = cardtemplate.content.children[0].cloneNode(true)
    const [h2, brief, pimg, ...details] = root.children
    const iframes = $$('iframe', root)
    iframes.forEach(swapsrc)
    Object.assign($('.cardtitle', target), { textContent: h2.textContent, id: h2.id })
    $('.thumbnail', target).appendChild(pimg.children[0])
    $('.brief', target).textContent = brief.textContent
    const detailsTarget = $('.details', target)
    details.forEach(d => detailsTarget.appendChild(d))
    listenExpandcard(target)
    return target
}

function listenExpandcard(card) {
    const expand = card.firstElementChild
    const ObsCardTransition = Rx.Observable.fromEvent(card, 'transitionend', { passive: true }).debounceTime(5)
    const iframes = $$('iframe', card)
    expand.addEventListener('click', (ev) => {
        iframes.forEach(iframe => {
            if (!mobile) swapsrc(iframe)
        })
        requestAnimationFrame(() => {
            card.classList.toggle('expanded')
            if (!mobile) ObsCardTransition.first().observeOn(Rx.Scheduler.animationFrame).subscribe(() => {
                // console.log('fired transition end')
                ev.target.scrollIntoView({ behavior: "smooth" })
            })
        })
    })
}

function parseHtml(info) {
    // generate card element from info as html text
    const dummyroot = document.createElement('div')
    dummyroot.innerHTML = info
    return dummyroot
}

function registerCard(card) {
    const action = Object.assign({}, actions.addcard, { title: $('h2', card).textContent, dom: card })
    UIstore.dispatch(action)
    Datastore.dispatch(action)
}

const converter = new showdown.Converter()

function mdtohtml(md) {
    // markdown text to html, not used in production
    return converter.makeHtml(md)
}

async function main() {
    applypreloadedstyles()
    Datastore.subscribe(() => onDataChange(Datastore))
    UIstore.subscribe(() => onUIChange(UIstore))
    const cardQueue = fetchCards(['hellocon.md', 'submit.md']).then(cards => cards.forEach(registerCard))
    ham.addEventListener('click', () => UIstore.dispatch(actions.togglenav))
        // prevent scrolling through body
    modalbg.addEventListener('touchmove', ev => ev.preventDefault())
    banner.addEventListener('touchmove', ev => ev.preventDefault())
    scrollBanner.subscribe()
    pullToRefresh.subscribe()
    listenExpandcard(newcardmock)
    newcardmock.onclick = async() => {
        newcardmock.onclick = null
        const backupcard = newcardmock.cloneNode(true)
        await editingmode(newcardmock)
            // when editing is done, do some task here
    }
    await cardQueue
    requestAnimationFrame(() => {
        reload.classList.remove('active')
        reload.classList.add('detached')
    })
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

window.main = main
main()