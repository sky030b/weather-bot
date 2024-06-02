const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function uploadToDB() {
  try {
    await client.connect();
    const database = client.db("weather-bot-DB");
    const collection = database.collection("weatherB");

    // 字符串
    let result = await collection.insertOne({ value: "hello world" });
    console.log(`Inserted string document with _id: ${result.insertedId}`);

    // 整數
    result = await collection.insertOne({ value: 42 });
    console.log(`Inserted integer document with _id: ${result.insertedId}`);

    // 布爾值
    result = await collection.insertOne({ value: true });
    console.log(`Inserted boolean document with _id: ${result.insertedId}`);

    // 雙精度浮點數
    result = await collection.insertOne({ value: 3.14159 });
    console.log(`Inserted double document with _id: ${result.insertedId}`);

    // 日期
    result = await collection.insertOne({ value: new Date() });
    console.log(`Inserted date document with _id: ${result.insertedId}`);

    // 數組
    result = await collection.insertOne({
      value: ["apple", "banana", "cherry"],
    });
    console.log(`Inserted array document with _id: ${result.insertedId}`);

  } catch (err) {
    console.error(err);
  }
}

process.on("SIGINT", async () => {
  await client.close();
  process.exit();
});

module.exports = {
  client,
  uploadToDB,
};

