import { getUserData, setUserData } from './database.js';
import { rescheduleUser } from './schedule_manager.js';

class User {
  constructor(id){
    this.id = id;
  }

  async getData(){
    return await getUserData(this.id);
  }

  async setData(data){
    await setUserData(this.id, data);
  }

  async setProperty(property, value){
    let data = await this.getData();
    data[property] = value;
    await this.setData(data);
  }

  async getProperty(property){
    let data = await this.getData();
    return data[property];
  }

  async erase(){
    this.setData(null);
    rescheduleUser(this.id);
  }

  async initialize(force=false){
    // quietly return if the user is already initialized
    if (!force && await this.getData())
      return;
    
    await this.setData({
      'progress': 0,
      'schedule': [],
    });
  }
  
  async getTimezone(timezone){
    return await this.getProperty('timezone');
  }

  async setTimezone(timezone){
    await this.setProperty('timezone', timezone);
    rescheduleUser(this.id);
  }

  async getSchedule(){
    return await this.getProperty('schedule');
  }

  async addSchedule(time){
    let schedule = await this.getProperty('schedule');
    schedule.push(time);
    schedule.sort((n1,n2)=>n1-n2)
    await this.setProperty('schedule', schedule);
    rescheduleUser(this.id);
  }

  async removeSchedule(time){
    let schedule_removed = false;
    let schedule = await this.getProperty('schedule');
    let time_index = schedule.indexOf(time);
    if (time_index != -1){
      schedule.splice(time_index, 1);
      schedule_removed = true;
    }
    await this.setProperty('schedule', schedule);
    rescheduleUser(this.id);
    return schedule_removed;
  }

  async setProgress(last_read_comic){
    await this.setProperty('progress', last_read_comic);
  }

  async getProgress(){
    return await this.getProperty('progress');
  }
}

export default function user(id){
  return new User(id);
}