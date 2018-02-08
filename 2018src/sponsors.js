/* global,Promises,loadLazyImg,waitDOMLoad */
(async function() {
  const sponsors = $(".sponsors");
  const imgs = $$("img", sponsors);
  await waitDOMLoad();
  await new Promises(
    imgs.map(loadLazyImg)
  );
  imgs.forEach(img=>sponsors.appendChild(img.parentNode.cloneNode(true)))
  sponsors.style.animationPlayState="running";
})();

