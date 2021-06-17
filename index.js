"use strict"
const fs = require('fs');
const {Telegraf} = require('telegraf'); 
const fetch = require('node-fetch');

async function fetchUrl(url){
  let res = await fetch(url);
  let data = await res.text();
  return data;
}

async function findXkcdPic(html){
  //let picRegex = new RegExp('<img.*>......')
  let picRegex = new RegExp('//imgs.xkcd.com/comics/....')
  return html.match(picRegex)[0];
}

fetchUrl('https://xkcd.com/1/')
.then(findXkcdPic)
.then(console.log);


//function readTokenFromFile(filePath){
//  try{
//    return fs.readFileSync(filePath, 'utf8');
//  } catch(err) {
//    console.log('Error while reading token.txt');
//    console.log(err);
//    return null;
//  }
//}
//
//let bot = new Telegraf(readTokenFromFile('./token.txt'));
//
//bot.start(ctx=>{
//  ctx.reply('Hello! I\'ll send you new publishments from all sorts of things!');
//  ctx.reply('https://imgs.xkcd.com/comics/alien_visitors.png');
//});
//
//
//bot.launch();