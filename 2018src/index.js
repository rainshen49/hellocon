/* global Rx, $, waitDOMLoad ,isInViewport*/
const mobile = window.innerWidth <= 767

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
    const [speakerDiv, infoDiv] = [$(".speakers"), $(".infocards")];
    const head = $('#header',nav)
    return {
        splash,
        content,
        reload,
        nav,
        ham,
        toc,
        modalbg,
        socialmedia,
        speakerDiv,
        infoDiv,
        head
    }
}

function getContainerActions(DOM) {
    // nav scroll then fixed
    initializeNav(DOM)
    // pull listener
    initializeReload(DOM)
    // click listeners
    initializeTOC(DOM, toggleTOC)

    function addTOC(text,id) {
        const a = document.createElement('a')
        Object.assign(a, {
            textContent: text,
            href: '/#' + id,
            // all markdown compiled headings automatically contains an id attribute
            className: "navitem"
        })
        a.subscribe('click', () => {
            toggleTOC(false)
        })
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

    function addSection(heading){
        const div = document.createElement('div')
        Object.assign(div, {
            textContent: heading,
            // all markdown compiled headings automatically contains an id attribute
            className: "navsection"
        })
        DOM.toc.appendChild(div)
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

    return {
        addTOC,
        setModal,
        addSection
    }
}

function initializeTOC(DOM, toggleTOC) {
    DOM.modalbg.subscribe('click', () => toggleTOC(false)) //force close
    DOM.ham.subscribe('click', toggleTOC)
}

function initializeNav(DOM) {
    const {
        nav,
        splash,
        head,
        speakerDiv,
        infoDiv
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
        }).do(()=>{
            if(mobile){
                const speakerhidden = !isInViewport(speakerDiv)
                const infohidden = !isInViewport(infoDiv)
                if(infohidden){
                    head.textContent= "HelloCon"
                }else if(speakerhidden){
                    head.textContent="Speakers"
                }else{
                    // default
                    head.textContent= "HelloCon"                    
                }
            }
        })
        .subscribe()
    // prevent scroll through in modal
    // nav.subscribe('touchmove', ev => ev.preventDefault())
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
    waitDOMLoad().then(function(){
        requestAnimationFrame(() => {
            DOM.reload.classList.remove('active')
            DOM.reload.classList.add('detached')
        })
    })
}

const DOM = getSharedElements(document.body)
const globalHandler = getContainerActions(DOM)

main()