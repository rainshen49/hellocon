const data = [
    'IMG_5160.jpg',
    'IMG_5182.jpg',
    'IMG_5191.jpg',
    'IMG_5198.jpg',
    'IMG_5221.jpg',
    'IMG_5229.jpg',
    'IMG_5248.jpg',
    'IMG_5249.jpg',
    'IMG_5266.jpg',
    'IMG_5282.jpg',
    'IMG_5292.jpg',
    'IMG_5303.jpg',
    'IMG_5310.jpg',
    'IMG_5320.jpg',
    'IMG_5321.jpg',
    'IMG_5336.jpg',
    'IMG_5349.jpg',
    'IMG_5362.jpg',
    'IMG_5370.jpg',
    'IMG_5384.jpg',
    'IMG_5391.jpg',
    'IMG_5413.jpg'
]
const galleries = $('.gallery-top .swiper-wrapper')
galleries.innerHTML = data.map(dir => `
<img class="swiper-slide swiper-lazy downloadimg" data-src="data/2017/${dir}" />
`).join('')
var galleryTop = new Swiper('.gallery-top', {
    pagination: '.swiper-pagination',
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflow: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true
    },
    loop: true,
    // Enable lazy loading
    lazyLoading: true,
    lazyLoadingInPrevNext: true,
    lazyLoadingInPrevNextAmount: 2
});