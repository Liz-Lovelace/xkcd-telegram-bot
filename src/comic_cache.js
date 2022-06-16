import fs from 'fs';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

const cachePath = new URL('../var/comics.json', import.meta.url);

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

export async function updateCache(){
  let cache = await fs.promises.readFile(cachePath, 'utf8');
  cache = JSON.parse(cache);
  let cachedPosts = cache.map(elem=>elem['postNumber']);
  let latestCachedPost;
  if (cachedPosts.length == 0)
    latestCachedPost = 0;
  else
    latestCachedPost = Math.max(...cachedPosts);
  
  let latestComic = await (await fetch('https://xkcd.com')).text();
  latestComic = parseComicHtml(latestComic);
  
  if (latestCachedPost < latestComic.postNumber)
    console.log(`Latest cached post is ${latestCachedPost}, but actual latest is ${latestComic.postNumber}!`);
  
  while (latestCachedPost < latestComic.postNumber){
    latestCachedPost += 1;
    // because https://xkcd.com/404 is an actual 404 page
    if (latestCachedPost == 404){
      cache.push({
          "title":'comic not found',
          "imageUrl":'Null',
          "postNumber":404,
        })
      continue;
    }
    console.log(`Fetching post ${latestCachedPost}`);
    let comic = await (await fetch(`https://xkcd.com/${latestCachedPost}`)).text();
    comic = parseComicHtml(comic);
    cache.push(comic);
    await fs.promises.writeFile(cachePath, JSON.stringify(cache));
  }
}

