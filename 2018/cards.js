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
const cardQueue = fetchCards(['hellocon.md', 'submit.md']).then(cards => cards.forEach(registerCard))
newcardmock.onclick = async() => {
    newcardmock.onclick = null
    const backupcard = newcardmock.cloneNode(true)
    await editingmode(newcardmock)
        // when editing is done, do some task here
}