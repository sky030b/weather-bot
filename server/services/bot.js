const { Client, GatewayIntentBits, Partials } = require('discord.js');
const socket = require('socket.io');
const { fetchWeatherData, analyzeMessageReturnWeather } = require('./weather');
const schedule = require('node-schedule');

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

function scheduleMessage(datetime, userId, username) {
  // '*/5 * * * *'
  //schedule.scheduleJob(datetime, async () => {
  const [dateStr, timeStr] = datetime.split(' ');
  const [year, month, day] = dateStr.split('-');
  const [hours, minutes] = timeStr.split(':');
  
  // Month in JavaScript Date starts from 0, so subtract 1
  const targetDate = new Date(year, month - 1, day, hours, minutes);
  console.log(targetDate);
  
  schedule.scheduleJob(targetDate, async () => {
    console.log('GOOOOOOOOOOOOOOOO')
    // Send the scheduled message
    const temperatureNow = analyzeMessageReturnWeather('temperature')
    const messageContent = `親愛可愛的 ${username} 您好! \n 現在天氣如下 ${temperatureNow}`
    await sendMessageToDiscord(userId, messageContent)
  });
}

client.on('messageCreate', async (message) => {
  const userId = message.author.id;
  if (!message.guild &&  message.author.bot === false) {
    console.log(userId, message.author.globalName, message.content);
    if (message.content.startsWith('!schedule')) {
      const [command, date, time, ...otherThings] = message.content.split(' ');
      const datetime = `${date} ${time}`;
      const testTime = new Date(`${date} ${time}:00.000Z`);
      if (isNaN(testTime.getTime())) {
        message.reply('Invalid date format. Please use a valid date.');
        return;
      } else{
        scheduleMessage(datetime, userId, message.author.globalName);
        message.reply(`OK! I will tell you the temperature right at ${testTime.toLocaleString('en-US')}`)
      }
      
      return
    }
    if (!messages[userId]) {
      messages[userId] = [{bot: false, message: message.content}];
    } else {
      messages[userId].push({bot: false, message: message.content});
    }
    const botResponse =  analyzeMessageReturnWeather(message.content);
    sendMessageToDiscord(userId, botResponse)
    sendMessageToWebSocket(userId, message.content, message.author.globalName);
    
  } else{
    // message.send('DM me!')
  }
  // console.log(messages);
});

async function sendMessageToDiscord(userId, messageContent) {
  try {
    const user = await client.users.fetch(userId);
    if (user) {
      await user.send(messageContent);
      sendMessageToWebSocket(userId, messageContent, 'Weather bot')
      // console.log(`Sent message to user ${userId}: ${messageContent}`);
      messages[userId].push({bot:true, message:messageContent})
      //console.log(messages);
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