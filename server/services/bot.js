const { Client, GatewayIntentBits, Partials } = require('discord.js');
const socket = require('socket.io');
const { analyzeMessageReturnWeather } = require('./weather');
const { saveMessageToDB, getUserMessages, addUserToDB, getUsers, updateUserToDB } = require('./functionsOfDB.js');
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
  const [dateStr, timeStr] = datetime.split(' ');
  const [year, month, day] = dateStr.split('-');
  const [hours, minutes] = timeStr.split(':');
  
  // Month in JavaScript Date starts from 0, so subtract 1
  const targetDate = new Date(year, month - 1, day, hours, minutes);
  console.log(targetDate);
  
  schedule.scheduleJob(targetDate, async () => {
    console.log('GOOOOOOOOOOOOOOOO')
    // Send the scheduled message
    const weatherString = analyzeMessageReturnWeather('溫度')
    const messageContent = `親愛可愛的 ${username} 你好! \n ${weatherString}`
    await sendMessageToDiscord(userId, messageContent)
  });
}

client.on('messageCreate', async (message) => {
  const userId = message.author.id;
  if (!message.guild &&  message.author.bot === false) {
    await addUserToDB(message.author.id, message.author.globalName)
    await saveMessageToDB(userId, message.author.globalName, false, message.content)
    console.log(userId, message.author.globalName, message.content);
    if (message.content.startsWith('!schedule')) {
      const [command, date, time, ...otherThings] = message.content.split(' ');
      const datetime = `${date} ${time}`;
      const targetDate = new Date(`${date}T${time}:00`);
      const formattedTime = targetDate.toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
      if (isNaN(targetDate.getTime())) {
        message.reply('Invalid date format. Please use a valid date.');
        return;
      } else{
        scheduleMessage(datetime, userId, message.author.globalName);
        message.reply(`OK! I will tell you the temperature right on ${formattedTime}`)
        return
      }
    } else{
      // sendMessageToWebSocket(userId, message.content, message.author.globalName);
      const botResponse =  analyzeMessageReturnWeather(message.content);
      console.log(botResponse)
      if(botResponse === 'no match'){
        sendMessageToDiscord(userId, 'I do not understand. Try key word like 天氣 , 溫度 or sort of ;) ')
        // sendMessageToWebSocket(userId, botResponse, message.author.globalName, isBot = true)
        return 
      }
      sendMessageToDiscord(userId, botResponse);
      // sendMessageToWebSocket(userId, botResponse, message.author.globalName, isBot = true)
    }
    
    
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
      sendMessageToWebSocket(userId, messageContent, 'weather-bot', true)
      // console.log(`Sent message to user ${userId}: ${messageContent}`);
      messages[userId].push({isBot:true, message:messageContent})
      //console.log(messages);
      await addUserToDB(userId, 'weather-bot')
      await saveMessageToDB(userId, 'weather-bot', false, messageContent)
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
      console.log(roomId, message);
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

function sendMessageToWebSocket(roomId, message, username, isBot = false) {
  if (io) {
    io.to(roomId).emit('messageFromUser', { message, userId:roomId, username, isBot });
  } else {
    console.error('WebSocket server not initialized.');
  }
}

// 

module.exports = { setupWebSocket };