const express = require("express");
const path = require("path");
const http = require("http");
const ServerSocket = require("ws").Server;
const chatController = require("./controllers/chatController");
const uploadToDB = require("./models/uploadToDB");

const app = express();
const port = 5000;
const server = http.createServer(app);
const wss = new ServerSocket({ server });

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

wss.on("connection", (ws) => {
  chatController.handleConnection(ws, wss);
});

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});

uploadToDB().catch(console.dir);
