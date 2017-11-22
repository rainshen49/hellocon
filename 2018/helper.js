export function $(selector, container = document) {
    return container.querySelector(selector)
}

export function $$(selector, container = document) {
    return Array.from(container.querySelectorAll(selector))
}

export function removeAllChildren(parent){
    let children
    while(children = parent.lastChild ){
        parent.removeChild(children)
    }
}

const fReader = new FileReader()

export function blobtoUrl(blob) {
    return URL.createObjectURL(blob)
}

export function blobtoDataUrl(blob) {
    fReader.readAsDataURL(blob)
    return new Promise((yes, no) => {
        fReader.onload = () => yes(fReader.result)
        fReader.onerror = no
    })
}

export function UrltoDataUrl(url) {
    return URLtoblob(url).then(blobtoDataUrl)
}

export function DataUrltoURL(dataurl) {
    return URLtoblob(dataurl).then(blobtoUrl)
}

export function URLtoblob(url) {
    return fetch(url).then(res => res.blob())
}

export function loadscript(url, module = false) {
    const script = document.createElement('script')
    script.src = url
    if (module) script.type = "module"
    document.head.appendChild(script)
    return new Promise((yes, no) => {
        script.onload = yes
        script.onerror = no
    })
}

export function loadcss(url) {
    const link = document.createElement('link')
    link.href = url
    link.rel = "stylesheet"
    document.head.appendChild(link)
    return new Promise((yes, no) => {
        link.onload = yes
        link.onerror = no
    })
}

export function importhtml(url) {
    return fetch(url).then(res => res.text())
        .then(parseHtml)
}

export function parseHtml(info) {
    // generate card element from info as html text
    const dummyroot = document.createElement('div')
    dummyroot.innerHTML = info
    return dummyroot
}

export function swapsrc(element) {
    const {
        src
    } = element
    const datasrc = element.dataset.src || "//#"
    const temp = src
    element.setAttribute('src', datasrc)
    element.dataset.src = src
}

export function applypreloadedstyles() {
    $$('link[as="style"]:not([rel="stylesheet"])').forEach(link => link.rel = "stylesheet")
}

export class Promises extends Promise {
    constructor(promises) {
        if (Array.isArray(promises))
        super((yes, no) => {
            Promise.all(promises).then(yes).catch(no)
        })
        else{
            // calling .then() will call this constructor again, which will branch to here
            super(promises)
        }
    }
    map(ftn) {
        return this.then(results => new Promises(results.map((item, i) => ftn(item, i))))
    }
    forEach(ftn) {
        return this.then(results => new Promises(results.map((item, i) => {
            ftn(item, i)
            return item
        })))
    }
}
window.Promises = Promises
console.log('loaded helper')