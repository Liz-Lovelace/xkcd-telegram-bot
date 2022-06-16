export function composeMessage(comic){
  return `${comic.title}
${comic.imageUrl}
link: https://xkcd.com/${comic.postNumber}
explanation: https://www.explainxkcd.com/wiki/index.php/${comic.postNumber}`;
}

export function getUserStateProperty(stateObj, userId, property='state'){
  if (stateObj[String(userId)])
    return stateObj[String(userId)][property];
  else
    return null;
}

export function setUserState(stateObj, userId, userState){
  stateObj[String(userId)] = userState;
  return stateObj;
}

export function localToStandardTime(time, timezone){
  return (1440 + time - timezone) % 1440;
}

export function timeToString(time){
  return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
}

export function parseTime(timeStr){
  let groups = timeStr.match(RegExp('([0-2]?\\d)[: -;.,]([0-5]\\d)'))
  let time = Number(groups[1]) * 60 + Number(groups[2]);
  if (time > 1439)
    throw 'time too big';
  return time;
}
