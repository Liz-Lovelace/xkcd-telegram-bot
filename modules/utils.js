const fs = require('fs');
const fetch = require('node-fetch');

async function fetchUrl(url){
  let res = await fetch(url);
  let data = await res.text();
  return data;
}

function syncFileToStr(filePath){
  try{
    return fs.readFileSync(filePath, 'utf8');
  } catch(err) {
    console.log('Error while reading file');
    console.log(err);
    return null;
  }
}

async function strToFile(str, path){
  await fs.promises.writeFile(path, str);
}

async function getChatProgress(source){
  let progressFilePath = __dirname + '/../database/' + source;
  let data = await fs.promises.readFile(progressFilePath, 'utf8');
  return parseInt(data);
}

async function setChatProgress(source, data){
  fs.promises.writeFile(__dirname + '/../progress/' + source, data)
}

module.exports = {fetchUrl, syncFileToStr, getChatProgress, setChatProgress, strToFile};