const Folder = 'data/2017';
const fs = require('fs');
let result = ""
fs.readdir(Folder, (err, files) => {
  files.forEach(file => {
    result += `<a href="data/2017/${file}"><img src="data/2017/${file}" /></a>` 
  });
  console.log(result)
})
