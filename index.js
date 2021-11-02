"use strict"
import { Telegraf } from 'telegraf';
import schedule from 'node-schedule';
import fs from 'fs';
import xkcdMessage from './modules/xkcd.js';


let bot = new Telegraf(fs.readFileSync(new URL('./token.txt', import.meta.url), 'utf8'));

let timezone = 3;

bot.start(async ctx=>{
  ctx.reply('Hello!');
});

async function sendXkcd(user_id){
  //let xkcdProgress = await utils.getChatProgress('xkcd');
  let msg = await xkcdMessage(2);
  await bot.telegram.sendMessage(user_id, msg);
  //await utils.setChatProgress('xkcd', xkcdProgress + 1);
}


//xkcd
const job = schedule.scheduleJob(`0 ${10 - timezone} * * *`, ()=>sendXkcd(1311788757));

bot.launch();