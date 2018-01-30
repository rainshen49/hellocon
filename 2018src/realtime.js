/* global $,removeAllChildren,listenDb */
function initialize(whitecircle) {
  removeAllChildren(whitecircle);
  whitecircle.appendChild(parseSingleRoot(`<h3>Current:</h3>`));
  const now = parseSingleRoot(`<div class="now"></div>`);
  whitecircle.appendChild(now);
  whitecircle.appendChild(parseSingleRoot(`<h3>Up Next:</h3>`));
  const next = parseSingleRoot(`<div class="next"></div>`);
  whitecircle.appendChild(next);
  requestAnimationFrame(() => whitecircle.classList.add("notcircle"));
  return { now, next };
}

function updateRealtime({ now, next }, currentData, nextData) {
  // {data:{speaker,title,link},starttime:"11:00",type:"talk"}
  // {data:{title:"Networking|Lunch"},starttime:"11:00",type:"break"}
  let nowInnerHTML = [],
    nextInnerHTML = [];
  switch (currentData.type) {
    case "talk": {
      const { data: { speaker, link }, starttime } = currentData;
      const title = window.speakerData[speaker];
      if (title) nowInnerHTML.push(`<h2>${title}</h2>`);
      nowInnerHTML.push(`<p>-- By ${speaker}</p>`);
      if (link) nowInnerHTML.push(safeLink(link, "More Details").outerHTML);
      break;
    }
    case "break": {
      const { data: { title } } = currentData;
      nowInnerHTML.push(`<h2>${title}</h2>`);
      break;
    }
  }
  switch (nextData.type) {
    case "talk": {
      const { data: { speaker, link }, starttime } = nextData;
      const title = window.speakerData[speaker];
      if (title) nextInnerHTML.push(`<h2>At ${starttime}: ${title}</h2>`);
      nextInnerHTML.push(`<p>-- By ${speaker}</p>`);
      break;
    }
    case "break": {
      const { data: { title }, starttime } = nextData;
      nextInnerHTML.push(`<p><span>${starttime}</span>: ${title}</p>`);
      break;
    }
  }
  now.innerHTML = nowInnerHTML.join("");
  next.innerHTML = nextInnerHTML.join("");
}

(async function runRealtime() {
  const whitecircle = $(".whitecircle");
  if (await readDb("started")) {
    const display = initialize(whitecircle);
    listenDb("schedule", schedule => {
      let thisblock, nextblock;
      for (let block of schedule) {
        const { starttime } = block;
        if (laterThanNow(starttime)) {
          nextblock = block;
          break;
        } else {
          thisblock = block;
        }
      }
      updateRealtime(display, thisblock, nextblock);
    });
  }
})

function laterThanNow(a) {
  // return if a is later than now, no matter in 12 or 24 format
  const b = new Date().toString();
  const btime = b
    .split(" ")[4]
    .split(":")
    .slice(0, 2)
    .map(parseInt);
  const atime = a
    .split(":")
    .slice(0, 2)
    .map(parseInt);
  if (a.toLowerCase().includes("p")) atime[0] += 12;

  return atime[0] === btime[0] ? atime[1] > btime[1] : atime[0] > btime[0];
}
