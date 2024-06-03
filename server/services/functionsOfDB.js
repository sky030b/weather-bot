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
    db = client.db("weather-bot-DB");
  }
  return db;
}

// 使用前記得宣告 const { saveMessageToDB, getUserMessages, addUserToDB, getUsers, updateUserToDB } = require('./functionsOfDB.js');

async function saveMessageToDB(userId, globalName, isBot, content) {
  // example: await saveMessageToDB(userId, message.author.globalName, false, message.content);
  try {
    const database = await connectToDB();
    const collection = database.collection(userId);

    const date = new Date();
    const formattedDate = date
      .toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // 24-hour format
      })
      .replace(/\//g, "-")
      .replace(",", "");

    await collection.insertOne({
      timestamp: formattedDate,
      userId: isBot ? "1246056144028303514" : userId,
      globalName: globalName,
      isBot: isBot,
      content: content,
    });

    console.log(
      `Message uploaded to MongoDB successfully in collection: ${userId}`
    );
  } catch (err) {
    console.error(err);
  }
}

async function getUserMessages(collectionName) {
  // example: await getUserMessages("817701085757964298");
  try {
    const database = await connectToDB();
    const collection = database.collection(collectionName);

    const chatHistory = await collection
      .find({}, { projection: { _id: 0 } })
      .toArray();
    const messages = {
      userId: collectionName,
      messages: chatHistory,
    };
    console.log(messages);
    return messages;
  } catch (err) {
    console.error(err);
  }
}

async function addUserToDB(userId, globalName) {
  // example: await addUserToDB(userId, message.author.globalName);
  try {
    const database = await connectToDB();
    const collection = database.collection("users");

    await collection.insertOne({
      userId: userId,
      globalName: globalName
    });

    console.log(
      `Uploaded user ${globalName} successfully in collection: "users".`
    );
  } catch (err) {
    console.error(err);
  }
}

async function getUsers() {
  // example: await getUsers();
  try {
    const database = await connectToDB();
    const collection = database.collection("users");

    const users = await collection
      .find({}, { projection: { _id: 0 } })
      .toArray();

    console.log(users);
    return users;
  } catch (err) {
    console.error(err);
  }
}

async function updateUserToDB(userId, newglobalName) {
  // example: await updateUserToDB(userId, "薑薑薑薑薑薑醬");
  try {
    const database = await connectToDB();
    const collection = database.collection("users");

    const result = await collection.updateOne(
      { userId: userId },
      { $set: { globalName: newglobalName } }
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

process.on("SIGINT", async () => {
  await client.close();
  process.exit();
});

module.exports = {
  saveMessageToDB,
  getUserMessages,
  addUserToDB,
  getUsers,
  updateUserToDB,
};
