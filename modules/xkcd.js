import cheerio from 'cheerio';
import fetch from 'node-fetch';

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

export default async function xkcdMessage(xkcdProgress){
  let response = await fetch('https://xkcd.com/' + xkcdProgress);
  let htmlStr = await response.text();
  let imgUrl = findXkcdPic(htmlStr);
  let title = findXkcdTitle(htmlStr);
  return `${title}
${imgUrl}
https://xkcd.com/${xkcdProgress}
https://www.explainxkcd.com/wiki/index.php/${xkcdProgress}`;
}