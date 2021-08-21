"use strict"
const {Telegraf} = require('telegraf'); 
const utils = require('./modules/utils.js');
const schedule = require('node-schedule');
const fs = require('fs');
const xkcd = require('./modules/xkcd.js');
const assert = require('assert')

let bot = new Telegraf(utils.syncFileToStr('./token.txt'));
let userId = parseInt(utils.syncFileToStr('./user-id.txt'));
let timezone = 0;

function getUserDirPath(id){
  let userDirPath = __dirname + '/database/' + id;
  return userDirPath;
}

async function initUserDir(id){
  let userDirPath = getUserDirPath(id);
  await fs.promises.mkdir(userDirPath);
  //todo: add more useful user info such as name and stuff...
  await utils.strToFile('user info!!!', userDirPath + '/user-info.txt');
}

//DEBUG!!!
let myId = 1311788757;
initUserDir(myId);

bot.start(async ctx=>{
  if (!fs.existsSync(getUserDirPath(ctx.from.id)))
    await initUserDir(ctx.from.id).catch(console.log);
  ctx.reply('Hello! type /help to see available commands.');
});

//xkcd
const job = schedule.scheduleJob('0 '+ (10 - timezone) +' * * *', async ()=>{
  console.log('job!');
  for (let i = 0; i < 2; i++){
    let xkcdProgress = await utils.getChatProgress('xkcd');
    let xkcdMsg = await xkcd.getMessageFromPost(xkcdProgress);
    await bot.telegram.sendMessage(userId, xkcdMsg).catch(console.log);
    await utils.setChatProgress('xkcd', xkcdProgress + 1);
  }
});

bot.command('progressInfoDump', async ctx=>{
  let xkcdProgress = await fs.promises.readFile(__dirname + '/database/xkcd', 'utf8');
  ctx.reply('xkcd = ' + xkcdProgress);
});

bot.launch();