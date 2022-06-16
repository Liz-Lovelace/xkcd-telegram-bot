import nodeSchedule from 'node-schedule';
import { comic } from './comic_cache.js';
import getUser from './business_logic.js';
import { localToStandardTime, composeMessage } from './utils.js';

let activeSchedules = {};

async function send(id){
  // damn. this place needs a bot. so maybe I need to rewrite the thing to use event emitters instead..
}

export async function rescheduleUser(id){
  if (activeSchedules[id])
    for (let job of activeSchedules[id])
      job.cancel()
  let user = getUser(id);
  if (await user.getData() == null)
    return;
  let userSchedules = await user.getSchedule();
  let timezone = await user.getTimezone();
  for (let schedule of userSchedules){
    let time = localToStandardTime(schedule, timezone);
    let cronStr = `${time % 60} ${Math.floor(time / 60)} * * *`;
    let job = nodeSchedule.scheduleJob(cronStr, async ()=>{
      // send(id);
    });
    console.log(`user ${id} will receive a post on ${cronStr} UTC`);
  }
}