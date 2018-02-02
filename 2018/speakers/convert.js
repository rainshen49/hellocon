const fs = require("fs");
const { URL } = require("url");
const showdown = require("showdown");
const converter = new showdown.Converter();
const filedir = process.argv[1].split("/").slice(0, -1).join("/")

const dirfiles = fs.readdirSync(filedir);
const speakersdata = fs
  .readFileSync(
    filedir + "/sensitive.tsv"
  )
  .toString();
const parsed = speakersdata.split("\n").map(line => line.split("\t"));
const fields = parsed[0];
const ordered = parsed.slice(1).map(speakerinfo => {
  const result = {};
  speakerinfo.forEach((info, i) => {
    Object.assign(result, { [fields[i]]: info });
  });
  return result;
});
ordered.forEach(speakerinfo => {
  if (!speakerinfo["A Link to Your Profile Picture"].includes("/")) {
    // if no picture is given
    const name = speakerinfo["Your Name/Nickname"].toLowerCase();
    const findpic = dirfiles.filter(filename =>
      filename.toLowerCase().includes(name)
    );
    if (findpic.length) {
      speakerinfo["A Link to Your Profile Picture"] = "speakers/" + findpic[0];
    } else {
      console.error(name, "has no profile picture!");
    }
  }
});

function getLinkIcon(link) {
  // return the proper icon for the link
  const icon = `<i class="fas fa-link"></i>`;
  const twitter = `<i class="fab fa-twitter"></i>`;
  const github = `<i class="fab fa-github"></i>`;
  if (link.length === 0) return "";
  const linkURL = new URL(link);
  switch (linkURL.hostname.split(".")[0]) {
    case "twitter":
      return twitter;
    case "github":
      return github;
    default:
      return icon;
  }
}

function getProfilePicElement(link) {
  if (link.length) {
    // there exist a profile
    return `<img data-src="${link}" alt="loading profile picture..." />`;
  } else {
    return `<i class="far fa-user"></i>`;
  }
}

function pluginTemplate(speakerinfo) {
  return {
    name: converter.makeHtml(`## ${speakerinfo["Your Name/Nickname"]}`),
    title: converter.makeHtml(`### ${speakerinfo["Title of Your Talk"]}`),
    link: speakerinfo["A Developer-ship Link"],
    linkicon: getLinkIcon(speakerinfo["A Developer-ship Link"]),
    bio: speakerinfo["About yourself (Third Person)"],
    profilepic: getProfilePicElement(
      speakerinfo["A Link to Your Profile Picture"]
    ),
    abstract: speakerinfo["Preview of Your Talk"]
  };
}

const speakersJSON = JSON.stringify(
  ordered
    .map(pluginTemplate)
    .map((json,i) => ({ [ordered[i]["Your Name/Nickname"]]: json }))
    .reduce((prev, curr) => Object.assign(prev, curr))
);

fs.writeFileSync(
  filedir + "/speakers.json",
  speakersJSON
);
