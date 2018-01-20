(function () {
    const sponsors = $('.sponsors')
    const last = sponsors.lastElementChild
    const first = sponsors.firstElementChild
    // window.last = last
    // window.first = first
    // console.log('loaded sponsors')
    window.onload = function () {
        // console.log(last.getBoundingClientRect().right-first.getBoundingClientRect().left)
        // console.log(sponsors.getBoundingClientRect().width)
        if (last.getBoundingClientRect().right-first.getBoundingClientRect().left > sponsors.getBoundingClientRect().width) {
            // overflowed, need to run
            // console.log('running')
            carousel(sponsors)
        }
    }
})()
function carousel(sponsors) {
    const first = sponsors.firstElementChild
    function scroll(lastx, dir) {
        sponsors.scrollBy(dir, 0)
        const { x } = first.getBoundingClientRect()
        if (lastx === x) {
            setTimeout(() => requestAnimationFrame(() => scroll(x, -dir)), 2000)
        } else {
            requestAnimationFrame(() => scroll(x, dir))
        }
    }
    requestAnimationFrame(() => scroll(first.getBoundingClientRect(), 1))
}


