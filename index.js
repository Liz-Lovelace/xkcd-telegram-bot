"use strict"
const {Telegraf} = require('telegraf'); 
const utils = require('./modules/utils.js');
const xkcd = require('./modules/xkcd.js');

let bot = new Telegraf(utils.syncFileToStr('./token.txt'));

bot.start(ctx=>{
  ctx.reply('Hello!');
});

bot.command('next', async ctx=>{
  for (let i = 0; i < 2; i++){
    let xkcdProgress = await utils.getChatProgress('xkcd');
    let xkcdMsg = await xkcd.getMessageFromPost(xkcdProgress);
    await ctx.reply(xkcdMsg).catch(err=>console.log(err));  
    await utils.setChatProgress('xkcd', xkcdProgress + 1);
  }
});

bot.command('progressInfoDump', ctx=>{
  //TODO: implement
});

bot.launch();