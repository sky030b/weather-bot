const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  poolSize: 10,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function saveMessageToDatabase(userId, message, sender) {
  try {
    const database = client.db(userId);
    const collection = database.collection("messages");
    await collection.insertOne({ message, sender });
    console.log("Message inserted into database");
  } catch (err) {
    console.error("Error inserting message:", err);
  }
}

async function insertDocument(document) {
  try {
    const database = client.db("exampleDB");
    const collection = database.collection("exampleCollection");

    // // 字符串
    // let result = await collection.insertOne({
    //   type: "string",
    //   value: "hello world",
    // });
    // console.log(`Inserted string document with _id: ${result.insertedId}`);

    // // 整數
    // result = await collection.insertOne({ type: "integer", value: 42 });
    // console.log(`Inserted integer document with _id: ${result.insertedId}`);

    // // 布爾值
    // result = await collection.insertOne({ type: "boolean", value: true });
    // console.log(`Inserted boolean document with _id: ${result.insertedId}`);

    // // 雙精度浮點數
    // result = await collection.insertOne({ type: "double", value: 3.14159 });
    // console.log(`Inserted double document with _id: ${result.insertedId}`);

    // // 日期
    // result = await collection.insertOne({ type: "date", value: new Date() });
    // console.log(`Inserted date document with _id: ${result.insertedId}`);

    // // Null 值
    // result = await collection.insertOne({ type: "null", value: null });
    // console.log(`Inserted null document with _id: ${result.insertedId}`);

    // // 數組
    // result = await collection.insertOne({
    //   type: "array",
    //   value: ["apple", "banana", "cherry"],
    // });
    // console.log(`Inserted array document with _id: ${result.insertedId}`);

    // // 內嵌文檔
    // result = await collection.insertOne({
    //   type: "object",
    //   value: { name: "Alice", age: 25 },
    // });
    // console.log(`Inserted object document with _id: ${result.insertedId}`);

    // // ObjectId
    // result = await collection.insertOne({
    //   type: "objectId",
    //   value: new ObjectId(),
    // });
    // console.log(`Inserted objectId document with _id: ${result.insertedId}`);

    // // 二進制數據
    // result = await collection.insertOne({
    //   type: "binary",
    //   value: new Binary(Buffer.from("Hello, world!")),
    // });
    // console.log(`Inserted binary document with _id: ${result.insertedId}`);

    // // JavaScript 代碼
    // result = await collection.insertOne({
    //   type: "code",
    //   value: { $code: "function() { return 'Hello, world!'; }" },
    // });
    // console.log(`Inserted code document with _id: ${result.insertedId}`);

    // // 正則表達式
    // result = await collection.insertOne({ type: "regex", value: /pattern/i });
    // console.log(`Inserted regex document with _id: ${result.insertedId}`);

    // // 時間戳
    // result = await collection.insertOne({
    //   type: "timestamp",
    //   value: new Date(),
    // });
    // console.log(`Inserted timestamp document with _id: ${result.insertedId}`);

    // // Decimal128 (注意：這裡使用普通的數字來表示小數)
    // result = await collection.insertOne({ type: "decimal", value: 123.45 });
    // console.log(`Inserted decimal document with _id: ${result.insertedId}`);

    // // MinKey
    // result = await collection.insertOne({
    //   type: "minKey",
    //   value: { $minKey: 1 },
    // });
    // console.log(`Inserted minKey document with _id: ${result.insertedId}`);

    // // MaxKey
    // result = await collection.insertOne({
    //   type: "maxKey",
    //   value: { $maxKey: 1 },
    // });
    // console.log(`Inserted maxKey document with _id: ${result.insertedId}`);

    const result = await collection.insertOne(document);
    console.log(`Inserted document with _id: ${result.insertedId}`);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function findDocuments(query) {
  try {
    const database = client.db("exampleDB");
    const collection = database.collection("exampleCollection");
    const documents = await collection.find(query).toArray();
    console.log(`Found documents: ${JSON.stringify(documents)}`);
    return documents;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updateDocument(filter, update) {
  try {
    const database = client.db("exampleDB");
    const collection = database.collection("exampleCollection");
    const result = await collection.updateOne(filter, update);
    console.log(`Updated document with _id: ${result.upsertedId}`);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function deleteDocument(filter) {
  try {
    const database = client.db("exampleDB");
    const collection = database.collection("exampleCollection");
    const result = await collection.deleteOne(filter);
    console.log(`Deleted document with _id: ${result.deletedCount}`);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function closeConnection() {
  try {
    await client.close();
    console.log("Disconnected successfully from MongoDB");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// 監聽應用的關閉事件，關閉 MongoDB 連接
process.on("SIGINT", async () => {
  await client.close();
  process.exit();
});

module.exports = {
  connectToDatabase,
  insertDocument,
  findDocuments,
  updateDocument,
  deleteDocument,
  closeConnection,
};
