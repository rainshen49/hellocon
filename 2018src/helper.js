function $(selector, container = document) {
  return container.querySelector(selector);
}

function $$(selector, container = document) {
  return Array.from(container.querySelectorAll(selector));
}

function parseHtml(info) {
  // generate card element from info as html text
  const dummyroot = document.createElement("div");
  dummyroot.innerHTML = info;
  return dummyroot;
}

function parseSingleRoot(html) {
  return parseHtml(html).firstElementChild;
}

function safeLink(href, innerHTML) {
  if (href) {
    return parseSingleRoot(
      `<a rel="noopener noreferrer" target="_blank" href="${href}">${innerHTML}</a>`
    );
  } else {
    return parseSingleRoot(`<a">${innerHTML}</a>`);
  }
}

class Promises extends Promise {
  // take in a number of promises, allow map and forEach operator to apply to each children promise
  constructor(promises) {
    if (Array.isArray(promises)) {
      super((yes, no) => {
        Promise.all(promises)
          .then(yes)
          .catch(no);
      });
      this.promises = promises;
    } else {
      // calling .then() will call this constructor again, which will branch to here
      super(promises);
    }
  }
  map(ftn) {
    return new Promises(this.promises.map(promise => promise.then(ftn)));
  }
  forEach(ftn) {
    return new Promises(
      this.promises.map(promise => {
        return promise.then(res => {
          ftn(res);
          return res;
        });
      })
    );
  }
}

function removeAllChildren(parent) {
  let children;
  while ((children = parent.lastChild)) {
    parent.removeChild(children);
  }
}
Object.assign(EventTarget.prototype, {
  subscribe(event, ftn) {
    const self = this;
    this.addEventListener(event, ftn);
    return {
      unsubscribe() {
        self.removeEventListener(event, ftn);
      }
    };
  }
});

function fetchJSON(url) {
  return fetch(url).then(res => res.json());
}
// console.log('loaded helper')

function waitDOMLoad() {
  return new Promise(yes => {
    if (document.readyState !== "loading") {
      console.log("already loaded");
      yes();
    } else {
      console.log("waiting for loading");
      document.addEventListener("DOMContentLoaded", yes);
    }
  });
}

function detectOverflowX(root) {
  const old = root.scrollTop;
  root.scrollTop = 10;
  if (old !== root.scrollTop) {
    // overflowed
    root.scrollTop = 0;
    return true;
  } else {
    return false;
  }
}

function detectOverflowY(root) {
  const old = root.scrollLeft;
  root.scrollLeft = 10;
  if (old !== root.scrollLeft) {
    // overflowed
    root.scrollLeft = 0;
    return true;
  } else {
    return false;
  }
}

function isInViewport(elem) {
  // console.log(elem, "checkingif in viewport");
  const bounding = elem.getBoundingClientRect();
  // console.table(bounding);
  return bounding.x >= 0 && bounding.y >= 0;
}

function loadLazyImg(img) {
  if (img.dataset.src)
    return new Promise((y, n) => {
      img.src = img.dataset.src;
      img.onload = y;
      img.onerror = n;
    });
  else return Promise.resolve(null);
}
