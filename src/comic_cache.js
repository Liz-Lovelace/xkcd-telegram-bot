import fs from 'fs';
import fetch from 'node-fetch';
import cheerio from 'cheerio';


const cachePath = new URL('../var/comics.json', import.meta.url);

async function getCache(){
  let cache = await fs.promises.readFile(cachePath, 'utf8');
  return JSON.parse(cache);  
}

async function setCache(cache){
  await fs.promises.writeFile(cachePath, JSON.stringify(cache));  
}

function parseComicHtml(comicHtml){
  let comic = cheerio.load(comicHtml);
  let title = comic('#ctitle').html();
  let imageUrl = 'https:' + comic('#comic img').attr('src');
  let index = comic('#middleContainer > a[href*="https://xkcd.com/"]').attr('href');
  index = Number(index.match(RegExp('xkcd.com/(.*)'))[1]);

  return {
    "title":title,
    "imageUrl":imageUrl,
    "postNumber":index,
  };
}

async function getLatestCachedComic(){
  let cache = await getCache();
  let cachedPosts = cache.map(elem=>elem['postNumber']);
  if (cachedPosts.length == 0)
    return 0;
  else {
    let num = Math.max(...cachedPosts);
    return cache.find(comic => comic.postNumber == num);
  }
}

export async function comic(number){
  let latestCachedComic = await getLatestCachedComic();
  if (number < 0 || number > latestCachedComic.postNumber)
    return null;
  let cache = await getCache();
  return cache.find(comic => comic.postNumber==number);
}

export async function updateCache(){
  console.log('Updating the comic cache');
  let cache = await getCache();
  let latestCachedComic = await getLatestCachedComic();
  let latestOnlineComic = parseComicHtml(await (await fetch('https://xkcd.com')).text());

  if (latestOnlineComic.postNumber > latestCachedComic.postNumber)
    console.log(`Latest cached post is ${latestCachedComic.postNumber}, but actual latest is ${latestOnlineComic.postNumber}. Downloading new posts...`);
  else
    return;
    
  let downloadingComicNumber = latestCachedComic.postNumber
  while (downloadingComicNumber < latestOnlineComic.postNumber){
    downloadingComicNumber += 1;
    // because https://xkcd.com/404 is an actual 404 page
    if (downloadingComicNumber == 404){
      cache.push({
          "title":'comic not found',
          "imageUrl":'Null',
          "postNumber":404,
        })
      continue;
    }
    console.log(`Fetching post ${downloadingComicNumber}`);
    let comic = await (await fetch(`https://xkcd.com/${downloadingComicNumber}`)).text();
    comic = parseComicHtml(comic);
    cache.push(comic);
    await setCache(cache);
  }
}
