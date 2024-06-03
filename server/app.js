const express = require('express');
const http = require('http');
const path = require('path');
require('dotenv').config();
const { setupWebSocket } = require('./services/bot.js');
const { getUsers, getUserMessages } = require('./services/functionsOfDB.js')
// const { setupWebSocket } = require('./services/bot-backup.js');

const app = express();
const server = http.createServer(app);

setupWebSocket(server);

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'client', 'index.html'); // Adjust the path if needed
  res.sendFile(indexPath);
});

app.get('/api/users', async (req, res) => {
  try{
    const messageHistory = await getUsers();
    res.status(200).json({users: messageHistory})
  } catch{
    res.status(400).json({error: "Failed to fetch data"})
  }
})


app.get('/api/messages', async (req, res) => {
  const userId = req.query.id;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  try {
    const messageHistory = await getUserMessages(userId);
    res.status(200).json( messageHistory );
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(400).json({ error: 'Internal Server Error' });
  }
});


server.listen(3000, () => {
  console.log('Server is listening at port 3000');
});
