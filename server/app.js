const express = require('express');
const http = require('http');
const path = require('path');
require('dotenv').config();
const { setupWebSocket } = require('./services/bot.js');
const { getUsers, getUserMessages } = require('./services/functionsOfDB.js')
// const { setupWebSocket } = require('./services/bot-backup.js');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

setupWebSocket(server);

// app.get('/', (req, res) => {
//   const indexPath = path.join(__dirname, '..', 'client', 'index.html'); // Adjust the path if needed
//   res.sendFile(indexPath);
// });

app.get('/api/users', async (req, res) => {
  try{
    const messageHistory = await getUsers();
    return res.status(200).json({users: messageHistory})
  } catch{
    return res.status(400).json({error: "Failed to fetch data"})
  }
})

app.get('/api/messages', async (req, res) => {
  const userId = req.query.id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const messageHistory = await getUserMessages(userId);
    return res.status(200).json( messageHistory );
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(400).json({ error: 'Internal Server Error' });
  }
});


server.listen(3000, () => {
  console.log('Server is listening at port 3000');
});
