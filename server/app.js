const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require("path");
const http = require("http");
const ServerSocket = require("ws").Server;
const chatController = require("./controllers/chatController");

const app = express();
const port = 5000;
const server = http.createServer(app);
const wss = new ServerSocket({ server });
require("dotenv").config();

const uri = process.env.MONGODB_URI;

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// app.get('/', (req, res) => {
//     res.render('chatView');
// });

wss.on("connection", (ws) => {
  chatController.handleConnection(ws, wss);
});

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // 將"A"插入到指定的數據庫和集合中
    const database = client.db("weather-bot-DB");
    const collection = database.collection("weather");
    const doc = { value: "A" };
    const result = await collection.insertOne(doc);
    console.log(`Inserted document with _id: ${result.insertedId}`);
  
  } catch (err) {
    console.error(err);
  
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
module.exports = client;
