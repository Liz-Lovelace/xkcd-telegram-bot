const cheerio = require('cheerio');
const utils = require('./utils.js');

function findXkcdTitle(htmlStr){
  let html = cheerio.load(htmlStr);
  let title = html('#ctitle').html();
  return title;
}

function findXkcdPic(htmlStr){
  let html = cheerio.load(htmlStr);
  let imgUrl = 'https:' + html('#comic img').attr('src');
  return imgUrl;
}

async function getMessageFromPost(xkcdProgress){
  let htmlStr = await utils.fetchUrl('https://xkcd.com/' + xkcdProgress);
  let imgUrl = findXkcdPic(htmlStr);
  let title = findXkcdTitle(htmlStr);
  return title + '\n' + 
    imgUrl + '\n' +
    'https://xkcd.com/' + xkcdProgress + '\n' +
    'https://www.explainxkcd.com/wiki/index.php/' + xkcdProgress;
}

module.exports = {findXkcdTitle, findXkcdPic, getMessageFromPost};
