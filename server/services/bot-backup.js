// const { Client, GatewayIntentBits, Partials } = require('discord.js');
// const socket = require('socket.io');
// require('dotenv').config();


// const client = new Client({
//   intents: [
//     GatewayIntentBits.DirectMessages,
//     GatewayIntentBits.DirectMessageReactions,
//     GatewayIntentBits.DirectMessageTyping,
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.GuildMessages,
//     GatewayIntentBits.MessageContent,
//     GatewayIntentBits.GuildMembers,
//   ],
//   partials: [Partials.Channel],
// });

// client.on('ready', () => {
//   console.log(`Logged in as ${client.user.tag}!`);
// });

// const data = {};

// client.on('guildMemberAdd', (member) => {
//   const user = member.user;
//   if (user) {
//     console.log(user, 'entered the channel');
//   }
// });

// client.on('messageCreate', async (message) => {
//   const userId = message.author.id;
//   if (!message.guild) {
//     console.log(userId, message.content);
//     if (!data[userId]) {
//       data[userId] = [message.content];
//     } else {
//       data[userId].push(message.content);
//     }
//     sendMessageToWebSocket(userId, message.content);
//   }
//   console.log(data);
// });

// async function sendMessageToDiscord(userId, messageContent) {
//   try {
//     const user = await client.users.fetch(userId);
//     if (user) {
//       await user.send(messageContent);
//       console.log(`Sent message to user ${userId}: ${messageContent}`);
//     } else {
//       console.error(`User ${userId} not found`);
//     }
//   } catch (error) {
//     console.error(`Failed to send message to user ${userId}:`, error);
//   }
// }

// client.login(process.env.DC_BOT_TOKEN);

// /// Socket


// let io;

// function setupWebSocket(server) {
//   io = socket(server);

//   io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('joinRoom', (roomId) => {
//       socket.join(roomId);
//       console.log(`User joined room: ${roomId}`);
//     });

//     socket.on('sendMessageToBot', ({ roomId, message }) => {
//       if (roomId) {
//         sendMessageToDiscord(roomId, message); // Send DM to the user
//       }
//     });

//     socket.on('sendMessage', ({ roomId, message }) => {
//       io.to(roomId).emit('messageFromBot', { message });
//     });

//     socket.on('disconnect', () => {
//       console.log('A user disconnected');
//     });
//   });
// }

// function sendMessageToWebSocket(roomId, message) {
//   if (io) {
//     io.to(roomId).emit('messageFromBot', { message });
//   } else {
//     console.error('WebSocket server not initialized.');
//   }
// }


// // 


// module.exports = { setupWebSocket };