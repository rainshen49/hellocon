/* global Rx:false, importhtml, $, $$, parseHtml, globalHandler, Promises, showiframe, hideiframe, fetchJSON,mobile, makeeditable, Awaiter, blobtoUrl, DOM, waitDOMLoad, readDb ,parseSingleRoot,safeLink,detectOverflowX */

const infocards = [
  "register.html",
  "come.html",
  "whenwhere.html",
  // "submit.html",
  "coc.html",
  "hellocon.html"
];
const { speakerDiv, infoDiv } = DOM;

const cardloaded = (async function() {
  globalHandler.addSection("Speakers")
  await renderSpeakerCards()
  globalHandler.addSection("Conference")  
  await renderInfoCards(infocards)
})();

function toArrayByKey(json, keys) {
  return keys.map(key => json[key] || null).filter(a => a);
}

function scrollHash(card) {
  const dummy = $(".dummy", card);
  if (dummy.id === location.hash.slice(1)) {
    waitDOMLoad().then(() => {
      console.log("comparing hash");
      requestAnimationFrame(() => dummy.scrollIntoView());
    });
  }
}

function readMore({ card, id, heading }) {
  const content = $(".card-content", card);
  if (mobile) {
    card.style.maxHeight = window.innerHeight * 0.7 + "px";
    // console.log('maxHeight set')
  }
  waitDOMLoad().then(() => {
    // add a "read more" element to card if overflowed
    if (detectOverflowX(content)) {
      // console.log("overflowed");
      card.appendChild(readMoreElement(card, id));
    } else {
      // console.log("not overflowed", content);
      // debugger
    }
  });
  return { card, id, heading };
}

function readMoreElement(card, id) {
  const action = parseSingleRoot(
    `<a href="/#${id}" class="readmore phoneonly">More...</a>`
  );
  action.addEventListener("click", () => {
    if(action.textContent === "More..."){
      card.style.maxHeight = "";
      action.textContent ="Less";
      action.style.position="static";
    }else{
      card.style.maxHeight = window.innerHeight * 0.7+"px";
      action.textContent ="More...";
      action.style.position="absolute";
    }
  });
  return action;
}

async function renderSpeakerCards() {
  const extractInfo = function({
    name,
    title,
    link,
    linkicon,
    bio,
    profilepic,
    abstract
  }) {
    return {
      name: parseSingleRoot(name),
      title: parseSingleRoot(title),
      linkEl: safeLink(link, linkicon),
      link,
      bio: parseSingleRoot(`<p>${bio}</p>`),
      profilepic: safeLink(link, profilepic),
      abstract: parseSingleRoot(`<p>${abstract}</p>`)
    };
  };
  const plugTemplate = function({
    name,
    title,
    linkEl,
    link,
    bio,
    profilepic,
    abstract
  }) {
    const id = name.id;
    name.id = "";
    const card = parseSingleRoot(`<div class="card">
    <div class="dummy" id="${id}"></div>
    <div class="card-content"></div>
    </div>`);
    const cardContent = $(".card-content", card);
    cardContent.appendChild(profilepic).className = "pic";
    cardContent.appendChild(name).className = "speaker-name";
    name.appendChild(linkEl);
    cardContent.appendChild(title).className = "talk-title";
    cardContent.appendChild(abstract);
    cardContent.appendChild(
      parseSingleRoot(`<h4 class="about-speaker">About the speaker</h4>`)
    );
    cardContent.appendChild(bio);
    return { card, id, heading: name.textContent };
  };
  const addToPage = function(data) {
    speakerDiv.appendChild(data.card);
    globalHandler.addTOC(data.heading, data.id);
    return data;
  };
  // fetch speakers json
  const toSpeakersjson = fetchJSON("./speakers/speakers.json");
  const toSpeakerlist = readDb("speakerlist")
  // const toSpeakerlist = Promise.resolve(toSpeakersjson.then(json=>Object.keys(json)));
  const [Speakerjson, SpeakerList] = await Promise.all([
    toSpeakersjson,
    toSpeakerlist
  ]);
  // writeDb("speakerbak",{...SpeakerList})
  // fetch speakers list
  const cards = toArrayByKey(Speakerjson, SpeakerList)
    .map(extractInfo)
    .map(plugTemplate)
    .map(addToPage)
    .map(cardObj => (scrollHash(cardObj.card), cardObj))
    .map(readMore);
  return cards;
}

async function renderInfoCards(infocards) {
  const extractInfo = function(cardhtml) {
    // title, pic, ...actions...
    const root = parseHtml(cardhtml);
    const action = $(".card-action-wrapper", root);
    
    const [title, pic, ...content] = root.children;
    return {
      title,
      pic,
      content,
      action
    };
  };
  const plugTemplate = function({ title, pic, content, action }) {
    const id = title.id;
    title.id = "";
    const card = parseSingleRoot(`<div class="card">
    <div class="dummy" id="${id}"></div>
    <div class="card-content"></div>
    </div>`);
    const cardContent = $(".card-content", card);
    cardContent.appendChild(title).className = "card-title";
    cardContent.appendChild(pic).classList = "pic";
    content.forEach(x => cardContent.appendChild(x));
    if (action) card.appendChild(action);
    return { card, id, heading: title.textContent };
  };
  const addToPage = function({ card, id, heading }) {
    infoDiv.appendChild(card);
    globalHandler.addTOC(heading, id);
    return { card, id, heading };
  };
  const raw = await fetchJSON("./cards/cards.json");
  const cards = toArrayByKey(raw, infocards)
    .map(extractInfo)
    .map(plugTemplate)
    .map(addToPage)
    .map(cardObj => (scrollHash(cardObj.card), cardObj))
    .map(readMore);
  return cards;
}
