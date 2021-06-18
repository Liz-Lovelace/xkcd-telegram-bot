"use strict"
const fs = require('fs');
const {Telegraf} = require('telegraf'); 
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function fetchUrl(url){
  let res = await fetch(url);
  let data = await res.text();
  return data;
}

function findXkcdTitle(html){
  let $ = cheerio.load(html);
  let title = $('#ctitle').html();
  return title;
}

function findXkcdPic(html){
  let $ = cheerio.load(html);
  let imgLink = 'https:' + $('#comic img').attr('src');
  return imgLink;
}

function readTokenFromFile(filePath){
  try{
    return fs.readFileSync(filePath, 'utf8');
  } catch(err) {
    console.log('Error while reading token.txt');
    console.log(err);
    return null;
  }
}

function progressFilePathFromSource(source, id){
  let progressFilePath = '';
  switch (source){
    case 'xkcd':
      progressFilePath = './userinfo/xkcd/' + id;
      break;
  }
  return progressFilePath;
}

async function setFileProgress(source, id){
  return 0;
}

async function getChatProgress(source, id){
  let progressFilePath = progressFilePathFromSource(source, id);
  //this checks if the progress file exists and creates one (with value 1) if it doesn't 
  try { 
    await fs.promises.access(progressFilePath)
  } catch(err){
    await fs.promises.writeFile(progressFilePath, '1');
  }
  let data = 0;
  data = await fs.promises.readFile(progressFilePath, 'utf8');
  return data;
}

getChatProgress('xkcd', 2222).then(console.log);

//let bot = new Telegraf(readTokenFromFile('./token.txt'));
//
//bot.start(ctx=>{
//  ctx.reply('Hello! You\'ll now recieve daily xkcd posts!');
//});
//
//let xkcdNum = 0
//bot.command('get', async ctx=>{
//  console.log(ctx.chat.id);
//  let xkcdLink = 'https://xkcd.com/' + xkcdNum;
//  let html = await fetchUrl(xkcdLink);
//  let imgLink = findXkcdPic(html);
//  let title = findXkcdTitle(html);
//  ctx.reply(title +'\n\n'+ imgLink +'\n'+ xkcdLink);
//  xkcdNum+=1;
//});
//
//bot.launch();