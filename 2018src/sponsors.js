/* global detectOverflowY,Promises,cardloaded */
(async function() {
  const sponsors = $(".sponsors");
  const imgs = $$("img", sponsors);
  await cardloaded;
  await new Promises(
    imgs.map(img => {
      img.src = img.dataset.src;
      return new Promise((yes, no) => {
        img.onload = yes;
        img.onerror = () => {
          yes();
          console.error(img.src, "error");
        };
      });
    })
  );
  // console.log(last.getBoundingClientRect().right - first.getBoundingClientRect().left, sponsors.getBoundingClientRect().width)
  if (detectOverflowY(sponsors)) {
    // overflowed, need to run
    // console.log('running sponsors')
    carousel(sponsors);
  }
})();
function carousel(sponsors) {
  const first = sponsors.firstElementChild;
  function scroll(lastx, dir) {
    if (isInViewport(sponsors)) {
      sponsors.scrollLeft += dir;
    } else {
      console.log("not in viewport");
    }
    if (lastx === sponsors.scrollLeft) {
      setTimeout(() => requestAnimationFrame(() => scroll(lastx, -dir)), 2000);
    } else {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => scroll(sponsors.scrollLeft, dir))
      );
    }
  }
  requestAnimationFrame(() => scroll(first.getBoundingClientRect(), 2));
}

