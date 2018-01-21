function $(selector, container = document) {
    return container.querySelector(selector)
}

function $$(selector, container = document) {
    return Array.from(container.querySelectorAll(selector))
}

// function removeAllChildren(parent) {
//     let children
//     while (children = parent.lastChild) {
//         parent.removeChild(children)
//     }
// }

// const fReader = new FileReader()

// function blobtoUrl(blob) {
//     return URL.createObjectURL(blob)
// }

// function blobtoDataUrl(blob) {
//     fReader.readAsDataURL(blob)
//     return new Promise((yes, no) => {
//         fReader.onload = () => yes(fReader.result)
//         fReader.onerror = no
//     })
// }

// function UrltoDataUrl(url) {
//     return URLtoblob(url).then(blobtoDataUrl)
// }

// function DataUrltoURL(dataurl) {
//     return URLtoblob(dataurl).then(blobtoUrl)
// }

// function URLtoblob(url) {
//     return fetch(url).then(res => res.blob())
// }

// function loadscript(url, name = "", ismodule = false) {
//     const script = document.createElement('script')
//     script.src = url
//     if (ismodule) script.type = "module"
//     document.body.appendChild(script)
//     return new Promise((yes, no) => {
//         script.onload = () => {
//             name === "" ? yes() : yes(window[name])
//         }
//         script.onerror = no
//     })
// }

function loadcss(url) {
    const link = document.createElement('link')
    link.href = url
    link.rel = "stylesheet"
    document.head.appendChild(link)
    return new Promise((yes, no) => {
        link.onload = yes
        link.onerror = no
    })
}

function importhtml(url) {
    return fetch(url).then(res => res.text())
        .then(parseHtml)
}

function parseHtml(info) {
    // generate card element from info as html text
    const dummyroot = document.createElement('div')
    dummyroot.innerHTML = info
    return dummyroot
}

function hideiframe(element) {
    element.dataset.src = element.src
    element.src = "//about:blank"
}

function showiframe(element) {
    if (element.src !== element.dataset.src) element.setAttribute('src', element.dataset.src)
}

// function applypreloadedstyles() {
//     $$('link[as="style"]:not([rel="stylesheet"])').forEach(link => link.rel = "stylesheet")
// }

class Promises extends Promise {
    // take in a number of promises, allow map and forEach operator to apply to each children promise
    constructor(promises) {
        if (Array.isArray(promises)) {
            super((yes, no) => {
                Promise.all(promises).then(yes).catch(no)
            })
            this.promises = promises
        }
        else {
            // calling .then() will call this constructor again, which will branch to here
            super(promises)
        }
    }
    map(ftn) {
        return new Promises(this.promises.map(promise=>promise.then(ftn)))
    }
    forEach(ftn) {
        return new Promises(this.promises.map(promise=>{
            return promise.then(res=>{
                ftn(res)
                return res
            })
        }))
    }
}

// function makeeditable(...elements) {
//     elements.forEach(element => element.setAttribute('contenteditable', 'true'))
// }

// function makenoneditable(...elements) {
//     elements.forEach(element => element.setAttribute('contenteditable', 'false'))
// }

// function Awaiter() {
//     this.promise = new Promise((yes, no) => {
//         this.done = yes
//         this.fail = no
//     })
// }

Object.assign(EventTarget.prototype, {
    subscribe(event, ftn) {
        const self = this
        this.addEventListener(event, ftn)
        return {
            unsubscribe() {
                self.removeEventListener(event, ftn)
            }
        }
    }
})

// console.log('loaded helper')