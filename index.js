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
  let chatInfo = await bot.telegram.getChat(id);
  await fs.promises.writeFile(userDirPath + '/info.txt',
    'User: ' + chatInfo.first_name + ' ' + chatInfo.last_name + ' (' + chatInfo.username + ')\n'+
    'Id:' + id + '\n'
  );
}

async function subscribe(id, source){
  let userDirPath = getUserDirPath(id);
  switch (source){
    case 'xkcd':
      let xkcdObj = {'progress': 1, 'mode':'manual'};
      await fs.promises.writeFile(userDirPath + '/xkcd.json', JSON.stringify(xkcdObj));
      break;
  }
}
async function next(id, source){
  let userDirPath = getUserDirPath(id);
  switch (source){
    case 'xkcd':
      let xkcdInfo = JSON.parse(await fs.promises.readFile(userDirPath + '/xkcd.json'));
      let xkcdMsg = await xkcd.getMessageFromPost(xkcdInfo.progress);
      xkcdInfo.progress += 1;
      await fs.promises.writeFile(userDirPath + '/xkcd.json', JSON.stringify(xkcdInfo));
      return xkcdMsg;
  }
}
//DEBUG!!!
let myId = 1311788757;
initUserDir(myId);
subscribe(myId, 'xkcd');
let testNext = async ()=>{
  console.log(await next(myId, 'xkcd'));
  console.log(await next(myId, 'xkcd'));
  console.log(await next(myId, 'xkcd'));
  let jsonInfo = JSON.parse(await fs.promises.readFile(getUserDirPath(myId) + '/xkcd.json'));
  console.log(xkcd.getInfoFromJson(jsonInfo));
}
testNext();
/*
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
*/