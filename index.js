"use strict"
const {Telegraf} = require('telegraf'); 
const utils = require('./modules/utils.js');
const schedule = require('node-schedule');
const fs = require('fs');
const xkcd = require('./modules/xkcd.js');


let bot = new Telegraf(utils.syncFileToStr('./token.txt'));
let userId = parseInt(utils.syncFileToStr('./user-id.txt'));
let timezone = 0;

bot.start(async ctx=>{
  ctx.reply('Hello!');
});

//xkcd
const job = schedule.scheduleJob('0 '+ (10 - timezone) +' * * *', async ()=>{
  console.log('job!');
  for (let i = 0; i < 2; i++){
    let xkcdProgress = await utils.getChatProgress('xkcd');
    let xkcdMsg = await xkcd.getMessageFromPost(xkcdProgress);
    await bot.telegram.sendMessage(userId, xkcdMsg).catch(err=>console.log(err));  
    await utils.setChatProgress('xkcd', xkcdProgress + 1);
  }
});

bot.command('progressInfoDump', async ctx=>{
  let xkcdProgress = await fs.promises.readFile(__dirname + '/progress-info/xkcd', 'utf8');
  ctx.reply('xkcd = ' + xkcdProgress);
});

bot.launch();