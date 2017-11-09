export function $(selector, container = document) {
    return container.querySelector(selector)
}

export function $$(selector, container = document) {
    return container.querySelectorAll(selector)
}