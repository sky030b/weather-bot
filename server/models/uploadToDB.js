const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectToDB() {
  if (!db) {
    await client.connect();
    db = client.db("weather-bot-DB")
  }
  return db;
}

async function uploadToDB(message) {
  try {
    const database = await connectToDB();

    // 動態地使用 userId 作為集合名稱，若不存在會自動建立
    const collectionName = `user_${message.userId}`; // 確保變數名正確
    const collection = database.collection(collectionName);

    // 將時間、ID 和訊息內容存儲在不同的欄位中，如要加其他欄位再新增
    await collection.insertOne({
      timestamp: message.timestamp,
      userId: message.userId,
      content: message.content,
    });

    console.log(
      `Message uploaded to MongoDB successfully in collection: ${collectionName}`
    );
  } catch (err) {
    console.error(err);
  }
}

/* 
  呼叫使用範例：
  uploadToDB({
    timestamp: '06-02 22:57',
    userId: 'cbf04c45-3ce9-4046-8757-31eaf41b5229',
    content: 'Hello, world!'
  });
*/


async function updateToDB(collectionName, userId, newMessage) {
  try {
    const database = await connectToDB();
    const collection = database.collection(collectionName);

    // 使用 updateOne 方法依據 userId 更新資料
    const result = await collection.updateOne(
      {
        userId: userId,
      },
      { $set: { content: newMessage } } // 輸入要修改的欄位和新設定的值
    );

    if (result.matchedCount === 1) {
      console.log("Message updated successfully!");
    } else {
      console.log("Message not found!");
    }
  } catch (err) {
    console.error(err);
  }
}

/* 
  呼叫使用範例：
  updateToDB(
    'user_cbf04c45-3ce9-4046-8757-31eaf41b5229', 
    'cbf04c45-3ce9-4046-8757-31eaf41b5229', 
    'New message content'
  );
*/


async function addUserToDB(user) {
  try {
    const database = await connectToDB();
    const collection = database.collection("users");

    // 儲存 user 的 id, name? and others...
    await collection.insertOne({
      userId: user.userId,
      username: user.username,
      // location: user.location,
      // subscribe: user.subscribe,
    });

    console.log(`Uploaded to MongoDB successfully in collection: "users".`);
  } catch (err) {
    console.error(err);
  }
}

/* 
  呼叫使用範例：
  addUserToDB({
    userId: 'cbf04c45-3ce9-4046-8757-31eaf41b5229',
    username: 'newuser',
    // location: 'Taiwan',
    // subscribe: true,
  }); 
*/


async function updateUserToDB(userId, username) {
  try {
    const database = await connectToDB();
    const collection = database.collection("users");

    // 使用 updateOne 方法依據 userId 更新 username 資料
    const result = await collection.updateOne(
      { userId: userId },
      { $set: { username: username } }
    );

    if (result.matchedCount === 1) {
      console.log("User updated successfully!");
    } else {
      console.log("User not found!");
    }
  } catch (err) {
    console.error(err);
  }
}

/* 
  呼叫使用範例：
  updateUserToDB(
    'cbf04c45-3ce9-4046-8757-31eaf41b5229', 
    'updatedusername'
  );
*/

process.on("SIGINT", async () => {
  await client.close();
  process.exit();
});

module.exports = {
  uploadToDB,
  updateToDB,
  addUserToDB,
  updateUserToDB,
};
