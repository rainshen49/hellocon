const fs = require("fs");
const filedir = process.argv[1].split("/").slice(0, -1).join("/")

const splited = fs
  .readFileSync(filedir+"/Schedule - Formatted Schedule.tsv")
  .toString()
  .replace(/\r/g,"")
  .split("\n")
const scheduleTable = splited.map(line => {
    const trs = line.split("\t")
    return ["| ",trs[5],"|",trs[3]," | ",trs[0]," |"].join('')
})

const result = `
## Schedule

<i class="far fa-clock"></i>

|  | Activity | Start |
|:-----: | :---- | -------:|
${scheduleTable.slice(1).join('\n')}`;
fs.writeFileSync(filedir+"/schedule.md", result);

console.log("done rendering schedule")