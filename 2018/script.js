import { $, $$ } from './helper.js'
const container = document.body
const splash = $('.splash', container)
const banner = $('.banner', container)
const cards = $('.cards', container)
const below = $('.below', splash)
window.addEventListener('scroll', () => {
    console.log('triggering')
    below.classList.add('detached')
}, { once: true })

window.addEventListener('scroll', toggleBanner)
below.onclick = () => cards.scrollIntoView()

window.splash = splash

function toggleBanner() {
    console.log(cards.getBoundingClientRect().y)
    const { y } = cards.getBoundingClientRect()
    if (y <= 0 && banner.classList.contains('detached')) {
        // splash hidden, banner invisible
        banner.classList.remove('detached') //show banner
    } else if (y >= 80 && !banner.classList.contains('detached')) {
        // splash into view, banner visible
        banner.classList.add('detached') //show banner
    }
}