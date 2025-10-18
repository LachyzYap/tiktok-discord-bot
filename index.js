const { Client, GatewayIntentBits, ChannelType, Partials } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel] // Fixed this line
});

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  console.log(`📨 Message received from ${message.author.username}`);
  console.log(`📝 Content: ${message.content}`);
  console.log(`📍 Channel type: ${message.channel.type}`);
  
  // Only respond to DMs (ChannelType.DM)
  if (message.channel.type !== ChannelType.DM) {
    console.log('❌ Not a DM, ignoring...');
    return;
  }
  
  console.log('✅ DM detected, processing...');
  
  const content = message.content;
  
  try {
    console.log(`🌐 Sending to n8n: ${N8N_WEBHOOK_URL}`);
    
    await axios.post(N8N_WEBHOOK_URL, {
      content: content,
      userId: message.author.id,
      username: message.author.username,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Successfully sent to n8n');
    await message.reply('✅ Video added to posting queue! Will be uploaded to TikTok shortly.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await message.reply('❌ Error processing your request. Please try again.');
  }
});

client.login(BOT_TOKEN);
