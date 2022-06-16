"use strict"
import { Telegraf } from 'telegraf'; 
import schedule from 'node-schedule';
import fs from 'fs';
import { composeMessage, getUserStateProperty, setUserState, localToStandardTime, timeToString, parseTime } from './utils.js';
import { updateCache } from './comic_cache.js';
import user from './business_logic.js';

// keyboard that displays by default
const idleKeyboard = {
  reply_markup: {keyboard: [
    [{text:'about'},],
    [{text:'schedule'},{text:'set progress'},],
]}};

const forceReply = {reply_markup: {force_reply: true}};

const timezonesKeyboard = {reply_markup: {keyboard: [
  [{text:'back'},],
  [{text:'UTC +14'},],
  [{text:'UTC +13'},],
  [{text:'UTC +12:45'},],
  [{text:'UTC +12'},],
  [{text:'UTC +11'},],
  [{text:'UTC +10:30'},],
  [{text:'UTC +10'},],
  [{text:'UTC +9:30'},],
  [{text:'UTC +9'},],
  [{text:'UTC +8:45'},],
  [{text:'UTC +8'},],
  [{text:'UTC +7'},],
  [{text:'UTC +6:30'}],
  [{text:'UTC +6'},],
  [{text:'UTC +5:45'},],
  [{text:'UTC +5:30'},],
  [{text:'UTC +5'},],
  [{text:'UTC +4:30'},],
  [{text:'UTC +4'},],
  [{text:'UTC +3'},],
  [{text:'UTC +2'},],
  [{text:'UTC +1'},],
  [{text:'UTC +0'},],
  [{text:'UTC -1'},],
  [{text:'UTC -2'},],
  [{text:'UTC -3'},],
  [{text:'UTC -4'},],
  [{text:'UTC -5'},],
  [{text:'UTC -6'},],
  [{text:'UTC -7'},],
  [{text:'UTC -8'},],
  [{text:'UTC -9:30'},],
  [{text:'UTC -9'},],
  [{text:'UTC -10'},],
  [{text:'UTC -11'},],
  [{text:'UTC -12'},],
]}};

let bot = new Telegraf(fs.readFileSync(new URL('../var/token.txt', import.meta.url), 'utf8'));

let userStates = {};

bot.start(async ctx=>{
  await ctx.replyWithMarkdown(`Hello! I'm a bot that'll send you comics by *xkcd*. I'm different from other bots because I'll send you the first comic, then the next one, and so on, until you're all caught up, and then I'll send you new ones as they come out.

Click the *schedule\* button, or /schedule to start!`, idleKeyboard);
  await user(ctx.message.from.id).initialize(true);
});

async function sendTimezoneDialogue(ctx){
  setUserState(userStates, ctx.message.from.id, {state: 'timezone'});
  await ctx.replyWithMarkdown("Pick your *timezone*. You can change it later.", timezonesKeyboard);
}

async function sendSchedule(ctx){
  if (await user(ctx.message.from.id).getTimezone() == undefined){
    await sendTimezoneDialogue(ctx);
    return;
  }
  let schedule = await user(ctx.message.from.id).getSchedule();
  let buttons = [[{text:'back'},{text:'set timezone'}]];
  // TODO: name buttons "cancel 7:00"
  for (let schedule_entry of schedule.map(timeToString))
    buttons.push([{text:schedule_entry}])
  buttons.push([{text:'new schedule entry'}])

  let keyboard = {reply_markup: {keyboard: 
    buttons
  }};

  setUserState(userStates, ctx.message.from.id, {state: 'schedule'});
  await ctx.reply("Pick \"new schedule entry\" to add a new time when a comic will be sent to you.", keyboard);
}

async function sendProgressDialogue(ctx){
  setUserState(userStates, ctx.message.from.id, {state: 'progress'});
  let progress = await user(ctx.message.from.id).getProgress();
  await ctx.replyWithMarkdown(`What's the number of the last comic you've read.
Example: \`1223\` or \`0\`
You're at #${progress}`, forceReply);
}


async function sendNewScheduleDialogue(ctx){
  if (await user(ctx.message.from.id).getTimezone() == undefined){
    await sendTimezoneDialogue(ctx);
    return;
  }
  setUserState(userStates, ctx.message.from.id, {state: 'new schedule'});
  await ctx.replyWithMarkdown(`When would you like to receive comics?
For example, 
**15:30**
**6:00**`, forceReply);
}

async function sendAbout(ctx){
  ctx.replyWithMarkdown(`This is an unofficial bot! If something doesn't work, or if you'd just like to chat, message me @Mishanya644

Source code available at https://github.com/Mishanya644/xkcd-telegram-bot`, idleKeyboard);
}

bot.command('schedule', sendSchedule);
bot.hears('schedule', sendSchedule);

bot.command('set_progress', sendProgressDialogue);
bot.hears('set progress', sendProgressDialogue);

bot.command('set_timezone', sendTimezoneDialogue);
bot.hears('set timezone', sendTimezoneDialogue);

bot.command('/new_schedule', sendNewScheduleDialogue);
bot.hears('new schedule entry', sendNewScheduleDialogue);

bot.command('/about', sendAbout);
bot.hears('about', sendAbout);

bot.command('/forget_me', ctx=>user(ctx.message.from.id).erase());

bot.hears('back', async ctx => {
  let userState = getUserStateProperty(userStates, ctx.message.from.id);
  if (userState == 'schedule')
    await ctx.reply(`Ok, your schedule is configured.`, idleKeyboard);
  else
    await ctx.reply(':)', idleKeyboard);
});

bot.on('message', async ctx =>{
  let userState = getUserStateProperty(userStates, ctx.message.from.id);
  let text = ctx.message.text;
  // ===== timezone state =====
  if (userState == 'timezone'){
    let timezone;
    try {
      // TODO: calculate timezone from user's current time.
      let timezone_groups = text.match(RegExp('UTC (.)(\\d\\d?):?(\\d\\d)?'));
      let hours = Number(timezone_groups[2])
      let minutes = 0;
      if (timezone_groups[3])
        minutes = Number(timezone_groups[3])
      let sign = timezone_groups[1] == '+' ? 1 : -1;
      // the timezone is stored in minutes, can be positive or negative.
      timezone = sign * (hours * 60 + minutes);
    }
    catch {
      ctx.reply('Uhhhh, that\'s not a valid timezone. Try again?');
    }
    await user(ctx.message.from.id).setTimezone(timezone);
    await sendSchedule(ctx);
  // ===== new schedule state =====
  } else if (userState == 'new schedule') {
    let time;
    try {
      time = parseTime(text);
    } catch {
      ctx.reply('Uhhhh, that\'s not a valid time. Try again?', forceReply);
      return;
    }
    await user(ctx.message.from.id).addSchedule(time);
    await sendSchedule(ctx);
  // ===== schedule add state =====
  } else if (userState == 'schedule') {
    let time;
    try {
      time = parseTime(text);
    } catch {
      return;
    }
    let removed = await user(ctx.message.from.id).removeSchedule(time);
    if (removed){
      await ctx.replyWithMarkdown(`You will no longer receive an xkcd at *${text}*.`);
      await sendSchedule(ctx);
    }
  // ===== progress state =====
  } else if (userState == 'progress') {
    let progress = Number(text);
    if (isNaN(progress) || progress < 0){
      ctx.reply('Not a valid number. Try again!', forceReply);
      return;
    }
    user(ctx.message.from.id).setProgress(progress);
    setUserState(userStates, ctx.message.from.id, {state: 'idle'});
    // TODO: send the #progress comic as well
    await ctx.replyWithMarkdown(`Ok. The next comic I'll send you will be *#${progress + 1}*.`, idleKeyboard);
  }
})

updateCache();

bot.launch();