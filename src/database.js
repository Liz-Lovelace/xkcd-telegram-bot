import fs from 'fs';

const dbPath = new URL('../var/db.json', import.meta.url);

export async function getUserData(userId){
  let db = await fs.promises.readFile(dbPath, 'utf8');
  db = JSON.parse(db);
  return db[String(userId)];
}

export async function setUserData(userId, data){
  let db = await fs.promises.readFile(dbPath, 'utf8');
  db = JSON.parse(db);
  db[String(userId)] = data;
  await fs.promises.writeFile(dbPath, JSON.stringify(db));
}
