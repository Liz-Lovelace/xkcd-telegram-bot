import mongodb from 'mongodb';
class db{
  constructor(){
    this.db = null;
  }
  async init(){
    let url = "mongodb://localhost:27017/";
    this.client = new mongodb.MongoClient(url);
    if (this.db)
      throw 'db init called twice';
    await this.client.connect();
    this.db = this.client.db('testdb');
    if (!(await this.collectionExists('users'))){
      await this.db.createCollection('users');
      console.log('created "users" collection');
    }
  }
  async close(){
    await this.client.close();
  }
  
  async collectionExists(collection_name){
    return await this.db.listCollections({name: collection_name}).hasNext();
  }
  
  async userExists(user_id){
    return await this.db.collection('users').find({id:user_id}).hasNext()
  }
  
  async newUser(user_id){
    if (await this.userExists(user_id)){
      console.log(`user ${user_id} already exists! Cancelling newUser...`);
      return;
    }
    let user = {
      id: user_id, 
      current_subscriptions:[], 
      progress_documents:{}
    };
    await this.db.collection('users').insertOne(user);
  }
  
  async getUserDocument(user_id){
    return this.db.collection('users').findOne({id:user_id});
  }
  
  async getSourceState(user_id, source){
    return await getUserDocument(user_id).progress_documents
  }
  async setSourceState(user_id, source, new_state){
    this.db.collection('users').updateOne(
      {id: user_id},
      //FIX: this overwrites current_subscriptions
      {$set: {'progress_documents.aaaa': new_state}}
    )
  }
  async subscribe(user_id, source){
    
  }
  
}

async function test(){
  let d = new db();
  await d.init()
  await d.newUser(10);
  await d.setSourceState(10, 'kxcd', 'new_state');
  console.log(await d.getUserDocument(10));
  await d.close();
}

test();