const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Only respond to DMs
  if (message.channel.type !== 1) return;
  
  console.log(`📨 Received DM from ${message.author.username}: ${message.content}`);
  
  const content = message.content;
  
  try {
    await axios.post(N8N_WEBHOOK_URL, {
      content: content,
      userId: message.author.id,
      username: message.author.username,
      timestamp: new Date().toISOString()
    });
    
    await message.reply('✅ Video added to posting queue! Will be uploaded to TikTok shortly.');
  } catch (error) {
    console.error('Error sending to n8n:', error.message);
    await message.reply('❌ Error processing your request. Please try again.');
  }
});

client.login(BOT_TOKEN);
