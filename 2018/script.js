// todo: make card looks right in both states
import { $, $$ } from './helper.js'
import { actions, UIstore, Datastore } from './ars.js'
const container = document.body
const splash = $('#splash', container)
const banner = $('#banner', container)
const cards = $('.cards', container)
const ham = $('#ham', banner)
const toc = $('#toc', container)
const modalbg = $('.modalbg', container)
const reload = $('#reload', container)
let toreload = false
const scrollthreshold = 4 * 16;
const mobile = window.innerWidth <= 48 * 16

const ObsWindowScroll = Rx.Observable.fromEvent(window, 'scroll', { passive: true })
ObsWindowScroll
    .startWith(0)
    .filter(() => !toreload)
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
    .do(() => {
        const classList = reload.classList
        if (scrollY < 0) {
            if (classList.contains('detached')) {
                // show the reload button if not already
                classList.remove('detached')
            } else if (scrollY < -scrollthreshold) {
                // refresh when released
                classList.add('activated')
                toreload = true
            }
        } else {
            if (!classList.contains('detached')) {
                // hide the reload button
                classList.add('detached')
            }
        }
    })
    .subscribe()

ObsWindowScroll.filter(() => toreload && scrollY >= -scrollthreshold).do(() => {
    requestAnimationFrame(() => {
        reload.classList.add('active')
        requestAnimationFrame(() => window.location.reload())
    })
}).subscribe()


function generateCard(info) {
    // generate card element from info as html text
    const card = document.createElement('div')
    const dummyroot = document.createElement('div')
    const details = document.createElement('div')
    dummyroot.innerHTML = info
    const [h2, brief, pimg, ...detailsele] = dummyroot.children
    const iframes = $$('iframe', dummyroot)
    const expand = expandButton()
        // put the correct classnames in
    card.classList.add('card', 'rounded')
    dummyroot.classList.add('card-content')
    h2.classList.add('cardtitle')
    brief.classList.add('brief')
    pimg.classList.add('thumbnail')
    details.classList.add('details')
        // put iframe src to # for lazy load
    iframes.forEach(swapsrc)
        // rearrange the dom tree
    detailsele.forEach(ele => details.appendChild(ele))
    dummyroot.appendChild(details)
    card.appendChild(expand)
    card.appendChild(dummyroot)
        // register listeners for expansion
    expand.addEventListener('click', () => {
        // iframe switch
        iframes.forEach(iframe => {
            if (!mobile) swapsrc(iframe)
        })
        requestAnimationFrame(() => {
            card.classList.toggle('expanded')
            requestAnimationFrame(() => h2.scrollIntoView({ behavior: "smooth" }))
        })
    })
    return card
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

function expandButton() {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `<i class="fa fa-expand" aria-hidden="true"></i>`
    wrapper.className = "expand"
    return wrapper
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
        a.textContent = title
        a.href = '#' + $('h2', cardstore[title]).id
        a.className = "navitem"
        a.addEventListener('click', (ev) => {
            UIstore.dispatch(actions.togglenav)
        })
        toc.appendChild(a)
        cards.appendChild(cardstore[title])
    })
    contents.filter(({ textContent }) => !cardstore.hasOwnProperty(textContent)).forEach(item => item.parentNode.removeChild(item))
        // remove old content items
})

$$('link[as="style"]').forEach(link => link.rel = "stylesheet")
console.log('scripted')