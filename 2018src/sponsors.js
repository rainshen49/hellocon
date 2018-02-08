/* global,Promises,loadLazyImg,waitDOMLoad */
(async function() {
  const sponsors = $(".sponsors");
  const imgs = $$("img", sponsors);
  await waitDOMLoad();
  await new Promises(
    imgs.map(loadLazyImg)
  );
  imgs.forEach(img=>{
    const a = img.parentNode.cloneNode(true)
    a.classList.add("noprint")
    sponsors.appendChild(a)
  })
  sponsors.classList.add("loaded")
})();

