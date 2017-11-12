export function $(selector, container = document) {
    return container.querySelector(selector)
}

export function $$(selector, container = document) {
    return Array.from(container.querySelectorAll(selector))
}

console.log('loaded helper')