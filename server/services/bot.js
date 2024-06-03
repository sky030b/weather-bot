const { Client, GatewayIntentBits, Partials } = require('discord.js');
const socket = require('socket.io');
const { fetchWeatherData, analyzeMessageReturnWeather } = require('./weather');

/* 
Discord
*/


const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Temporary structure 
// {id1:[{bot: false, message: "Hey"}], id2:[{bot: false, message: "Hi"}]}
const messages = {};

client.on('guildMemberAdd', (member) => {
  const user = member.user;
  if (user) {
    console.log(user, 'entered the channel');
  }
});

client.on('messageCreate', async (message) => {
  const userId = message.author.id;
  console.log(message.author)
  if (!message.guild &&  message.author.bot === false) {
    console.log(userId, message);
    if (!messages[userId]) {
      messages[userId] = [{bot: false, message: message.content}];
    } else {
      messages[userId].push({bot: false, message: message.content});
    }
    const botResponse =  analyzeMessageReturnWeather(message.content);
    sendMessageToDiscord(userId, botResponse)
    sendMessageToWebSocket(userId, message.content, message.author.globalName);
  } else{

  }
  console.log(messages);
});

async function sendMessageToDiscord(userId, messageContent) {
  try {
    const user = await client.users.fetch(userId);
    if (user) {
      await user.send(messageContent);
      console.log(`Sent message to user ${userId}: ${messageContent}`);
      messages[userId].push({bot:true, message:messageContent})
      console.log(messages);
    } else {
      console.error(`User ${userId} not found`);
    }
  } catch (error) {
    console.error(`Failed to send message to user ${userId}:`, error);
  }
}

client.login(process.env.DC_BOT_TOKEN);

/* 
Socket
*/

let io;

function setupWebSocket(server) {
  io = socket(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`後台管理員登入 room: ${roomId}`);
    });

    socket.on('sendMessageToUser', ({ roomId, message }) => {
      if (roomId) {
        sendMessageToDiscord(roomId, message); // Send DM to the user
      }
    });

    socket.on('messageFromUser', ({ roomId, message }) => {
      io.to(roomId).emit('messageFromUser', { message });
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

function sendMessageToWebSocket(roomId, message, username) {
  if (io) {
    io.to(roomId).emit('messageFromUser', { message, userId:roomId, username });
  } else {
    console.error('WebSocket server not initialized.');
  }
}

// 

module.exports = { setupWebSocket };