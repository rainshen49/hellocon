// todo: make card looks right in both states
import { $, $$ } from './helper.js'
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

window.cardtemplate = cardtemplate

const scrollthreshold = 4 * 16;
const mobile = window.innerWidth <= 48 * 16

const ObsWindowScroll = Rx.Observable.fromEvent(window, 'scroll', { passive: true })
ObsWindowScroll
    .startWith(0)
    .map(() => splash.getBoundingClientRect().bottom - 48)
    // 48 depends on per rem size
    .do(location => {
        const showbanner = location < 0
        requestAnimationFrame(() => {
            if (showbanner !== banner.classList.contains('ontop')) {
                banner.classList.toggle('ontop')
            }
        })
    })
    .subscribe()

const ObsSplashTouchStart = Rx.Observable.fromEvent(splash, 'touchstart', { passive: true })
const ObsSplashTouchMove = Rx.Observable.fromEvent(splash, 'touchmove', { passive: true })
const ObsSplashTouchEnd = Rx.Observable.fromEvent(splash, 'touchend', { passive: true })

// ObsSplashTouchStart.subscribe((ev) => console.log('started', scrollY))
// ObsSplashTouchMove.subscribe((ev) => console.log('moving', scrollY))
// ObsSplashTouchEnd.subscribe((ev) => console.log('ended', scrollY))

ObsSplashTouchStart.subscribe(() => {
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
    $('.expand', target).addEventListener('click', () => {
        iframes.forEach(iframe => {
            if (!mobile) swapsrc(iframe)
        })
        requestAnimationFrame(() => {
            target.classList.toggle('expanded')
            requestAnimationFrame(() => h2.scrollIntoView({ behavior: "smooth" }))
        })
    })
    return target
}

function generateCard(info) {
    // generate card element from info as html text
    const dummyroot = document.createElement('div')
    dummyroot.innerHTML = info
    return plugintemplate(dummyroot)
}

function registerCard(card) {
    const action = Object.assign({}, actions.addcard, { title: $('h2', card).textContent, dom: card })
    UIstore.dispatch(action)
    Datastore.dispatch(action)
}

function swapsrc(iframe) {
    const { src } = iframe
    const datasrc = iframe.dataset.src || "//#"
    const temp = src
    iframe.setAttribute('src', datasrc)
    iframe.dataset.src = src
}

const converter = new showdown.Converter()

function mdtohtml(md) {
    // markdown text to html, not used in production
    return converter.makeHtml(md)
}

fetch('cards/hellocon.md').then(res => res.text()).then(mdtohtml).then(generateCard).then(registerCard)

fetch('cards/submit.md').then(res => res.text()).then(mdtohtml).then(generateCard).then(registerCard)

ham.addEventListener('click', () => UIstore.dispatch(actions.togglenav))
modalbg.addEventListener('touchmove', ev => {
    ev.preventDefault()
        // console.log('moving')
})
banner.addEventListener('touchmove', ev => {
    ev.preventDefault()
        // console.log('moving banner')
})

UIstore.subscribe(() => {
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
})

Datastore.subscribe(() => {
    // managing card content changes
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
})

$$('link[as="style"]:not([rel="stylesheet"])').forEach(link => link.rel = "stylesheet")
console.log('scripted')