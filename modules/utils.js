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
    console.log('Error while reading token.txt');
    console.log(err);
    return null;
  }
}

async function getChatProgress(source){
  let progressFilePath = __dirname + '/../progress-info/' + source;
  let data = await fs.promises.readFile(progressFilePath, 'utf8');
  return parseInt(data);
}

async function setChatProgress(source, data){
  fs.promises.writeFile(__dirname + '/../progress-info/' + source, data)
}

module.exports = {fetchUrl, syncFileToStr, getChatProgress, setChatProgress};