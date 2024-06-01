const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js'); 
require('dotenv').config();

const app = express();


app.get('/', (req, res) => {
  res.send('OK')
})

const client = new Client({intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
]});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
  if (msg.content === '回家') {
    msg.reply('記得打卡喔');
  }
});

//this line must be at the very end
client.login(process.env.DC_BOT_TOKEN); //signs the bot in with token

app.listen(3000, ()=>{
  console.log(`Server is listening at port 3000`)
})