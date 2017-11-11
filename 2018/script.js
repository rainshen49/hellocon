// todo: make card looks right in both states
import { $, $$ } from './helper.js'
import { actions, UIstore, Datastore } from './ars.js'
const container = document.body
const splash = $('.splash', container)
const Banner = $('.banner', container)
const cards = $('.cards', container)
const below = $('.below', splash)
const ham = $('i', Banner)
const toc = $('#toc', container)
const modalbg = $('.modalbg', container)
const socialmedia = $('.socialmedia', container)
const ObsWindowScroll = Rx.Observable.fromEvent(window, 'scroll')

ObsWindowScroll
    .startWith(0)
    .debounceTime(10)
    .map(() => cards.getBoundingClientRect().y)
    .subscribe(y => {
        if (y > 10) {
            UIstore.dispatch(Object.assign({}, actions.togglebanner, { tobe: false }))
        } else if (y < 10) {
            UIstore.dispatch(Object.assign({}, actions.togglebanner, { tobe: true }))
        }
    })

ObsWindowScroll.first().subscribe(() => below.classList.add('detached'))

const ObsHamClick = Rx.Observable.fromEvent(ham, 'click')

ObsHamClick.subscribe(() => UIstore.dispatch(actions.togglenav))

const ObsModalClick = Rx.Observable.fromEvent(modalbg, 'click').do(ev => ev.stopPropagation())

UIstore.subscribe(() => {
    const { banner, nav } = UIstore.getState()
    if (banner === Banner.classList.contains('detached')) {
        // need to update banner
        Banner.classList.toggle('detached')
            // manipulate dom only on change
        if (banner) {
            Banner.insertBefore(socialmedia, ham)
        } else {
            splash.appendChild(socialmedia)
        }
    }
    if (nav === toc.classList.contains('detached')) {
        // need to update toc
        toc.classList.toggle('detached')
            // manipulate dom only on change        
        if (nav) {
            modalbg.classList.remove('detached')
            ObsModalClick.first().subscribe(() => UIstore.dispatch(Object.assign({}, actions.togglenav, { tobe: false })))
        } else {
            modalbg.classList.add('detached')
        }
    }
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
        a.addEventListener('click', (ev) => {
            UIstore.dispatch(actions.togglenav)
            requestAnimationFrame(() => window.scrollBy(0, -96))
                // offset the nav bar
        })
        toc.appendChild(a)
        cards.appendChild(cardstore[title])
    })
    contents.filter(({ textContent }) => !cardstore.hasOwnProperty(textContent)).forEach(item => item.parentNode.removeChild(item))
        // remove old content items
})

function generateCard(info) {
    // generate card element from info as html text
    const dummyroot = document.createElement('div')
    const details = document.createElement('div')
    dummyroot.innerHTML = info
    const [h2, pimg, brief, ...detailsele] = dummyroot.children
    const iframes = $$('iframe', dummyroot)
    const img = pimg.lastElementChild
    const expand = expandButton()
        // put the correct classnames in
    dummyroot.classList.add('card')
    img.classList.add('thumbnail')
    brief.classList.add('brief')
    details.classList.add('details')
        // put iframe src to null for lazy load
    iframes.forEach(swapsrc)
        // rearrange the dom tree
    dummyroot.insertBefore(expand, h2)
    dummyroot.insertBefore(img, pimg)
    dummyroot.removeChild(pimg)
    detailsele.forEach(ele => details.appendChild(ele))
    dummyroot.appendChild(details)
        // trigger action
    const action = Object.assign({}, actions.addcard, { title: h2.textContent, dom: dummyroot })
    UIstore.dispatch(action)
    Datastore.dispatch(action)
        // register listeners for expansion
    expand.addEventListener('click', () => {
        dummyroot.classList.toggle('expanded')
        setTimeout(() => requestAnimationFrame(() => dummyroot.scrollIntoView()), 300)
        iframes.forEach(swapsrc)
            // iframe switch
    })
}

function swapsrc(iframe) {
    const { src } = iframe
    const datasrc = iframe.dataset.src || ""
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

fetch('cards/hellocon.md').then(res => res.text()).then(mdtohtml).then(generateCard)
fetch('cards/submit.md').then(res => res.text()).then(mdtohtml).then(generateCard)