/* global Rx */
const mobile = window.innerWidth <= 768

function getSharedElements(container = document.body) {
    // keep all selectors in here, the rest is HTML agnostic
    const splash = $('#splash', container)
    const content = $('.content', container)
    const reload = $('#reload', container)
    const nav = $('#nav', container)
    const ham = $('#ham', nav)
    const toc = $('#toc', container)
    const modalbg = $('.modalbg', container)
    const socialmedia = $('#socialmedia', container)
    const filechooser = $('#filechooser', container)
    return {
        splash,
        content,
        reload,
        nav,
        ham,
        toc,
        modalbg,
        socialmedia,
        filechooser
    }
}

function getContainerActions(DOM) {
    // nav scroll then fixed
    initializeNav(DOM)
    // pull listener
    initializeReload(DOM)
    // click listeners
    initializeTOC(DOM, toggleTOC)

    function addTOC(target) {
        const a = document.createElement('a')
        const h2 = $('h2', target)
        Object.assign(a, {
            textContent: h2.textContent,
            href: '/#' + h2.id,
            // all markdown compiled headings automatically contains an id attribute
            className: "navitem"
        })
        a.subscribe('click', (ev) => toggleTOC(false))
        DOM.toc.appendChild(a)
    }

    function toggleTOC(open) {
        const cl = DOM.toc.classList
        if (open === undefined) open = cl.contains('detached')
        requestAnimationFrame(() => {
            if (open && cl.contains('detached')) {
                // open
                cl.remove('detached')
                setModal(true)
            } else if (!open && !cl.contains('detached')) {
                // close
                cl.add('detached')
                setModal(false)
            }
        })
    }

    function redirectTOC(oldid, target) {
        const h2 = $('h2', target)
        const a = $('a[href="#' + oldid + '"]',DOM.toc)
        a.href = "#" + h2.id
        a.textContent = h2.textContent
        console.log('changing', oldid, 'to', h2.id)
    }

    DOM.modalbg.subscribe('touchmove', ev => ev.preventDefault())

    function setModal(on = false) {
        requestAnimationFrame(() => {
            if (on) {
                DOM.modalbg.classList.remove('detached')
                document.body.classList.add('modalopen')
            } else {
                DOM.modalbg.classList.add('detached')
                document.body.classList.remove('modalopen')
            }
        })
    }

    function addcard(card) {
        DOM.content.appendChild(card)
    }

    return {
        addTOC,
        setModal,
        addcard,
        redirectTOC
    }
}

function initializeTOC(DOM, toggleTOC) {
    DOM.modalbg.subscribe('click', () => toggleTOC(false)) //force close
    DOM.ham.subscribe('click', toggleTOC)
}

function initializeNav(DOM) {
    const {
        nav,
        splash
    } = DOM
    const navheight = nav.getBoundingClientRect().height
    const ObsWindowScroll = Rx.Observable.fromEvent(window, 'scroll', {
        passive: true
    })
    const scrollNav = ObsWindowScroll
        .startWith(0)
        .map(() => splash.getBoundingClientRect().bottom - navheight)
        .observeOn(Rx.Scheduler.animationFrame)
        .do(location => {
            const showbanner = location < 0
            if (showbanner !== nav.classList.contains('ontop'))
                nav.classList.toggle('ontop')
        }).subscribe()
    // prevent scroll through in modal
    nav.subscribe('touchmove', ev => ev.preventDefault())
}

function initializeReload(DOM) {
    const {
        reload,
        splash
    } = DOM
    const scrollthreshold = Math.floor(reload.getBoundingClientRect().bottom)
    // console.log(scrollthreshold)
    const ObsSplashTouchStart = Rx.Observable.fromEvent(splash, 'touchstart', {
        passive: true
    })
    const ObsSplashTouchMove = Rx.Observable.fromEvent(splash, 'touchmove', {
        passive: true
    })
    const ObsSplashTouchEnd = Rx.Observable.fromEvent(splash, 'touchend', {
        passive: true
    })
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
    }).subscribe()
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
        .observeOn(Rx.Scheduler.animationFrame)
        .do(() => {
            if (scrollY >= -scrollthreshold) {
                // remove the refresh button if not triggered
                rlclassList.add('detached')
            } else {
                rlclassList.add('active')
                requestAnimationFrame(() => window.location.reload())
            }
        })
}

async function main() {
    applypreloadedstyles()
    const loadcards = loadscript('cards.js', "") //will be awaited later
    // prevent scrolling through body
    await loadcards
    requestAnimationFrame(() => {
        DOM.reload.classList.remove('active')
        DOM.reload.classList.add('detached')
    })
}

const DOM = getSharedElements(document.body)
const globalHandler = getContainerActions(DOM)
main()