export function $(selector, container = document) {
    return container.querySelector(selector)
}

export function $$(selector, container = document) {
    return Array.from(container.querySelectorAll(selector))
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

export function loadscript(url) {
    const script = document.createElement('script')
    script.src = url
        // document.body.appendChild(script)
    return new Promise((yes, no) => {
        script.onload = yes
        script.onerror = no
    })
}

export function loadcss(url) {
    const link = document.createElement('link')
    link.href = url
    link.rel = "stylesheet"
        // document.head.appendChild(link)
    return new Promise((yes, no) => {
        link.onload = yes
        link.onerror = no
    })
}

export function swapsrc(element) {
    const { src } = element
    const datasrc = element.dataset.src || "//#"
    const temp = src
    element.setAttribute('src', datasrc)
    element.dataset.src = src
}

export function applypreloadedstyles() {
    $$('link[as="style"]:not([rel="stylesheet"])').forEach(link => link.rel = "stylesheet")
}

console.log('loaded helper')