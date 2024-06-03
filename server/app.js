const express = require('express');
const http = require('http');
const { setupWebSocket } = require('./services/bot.js');
// const { setupWebSocket } = require('./services/bot-backup.js');
const path = require('path');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

setupWebSocket(server);

// app.get('/', (req, res) => {
//   const indexPath = path.join(__dirname, '..', 'client', 'index.html'); // Adjust the path if needed
//   res.sendFile(indexPath);
// });

server.listen(3000, () => {
  console.log('Server is listening at port 3000');
});
