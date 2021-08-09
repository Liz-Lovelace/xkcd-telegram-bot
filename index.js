"use strict"
const {Telegraf} = require('telegraf'); 
const utils = require('./modules/utils.js');
const schedule = require('node-schedule');
const fs = require('fs');
const xkcd = require('./modules/xkcd.js');


let bot = new Telegraf(utils.syncFileToStr('./token.txt'));
let userId = parseInt(utils.syncFileToStr('./user-id.txt'));
let timezone = 3;

bot.start(ctx=>{
  ctx.reply('Hello!');
  console.log(ctx.from);
});

//xkcd
const job = schedule.scheduleJob('* '+ 10 + timezone +' * * *', async ()=>{
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