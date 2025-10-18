const { Client, GatewayIntentBits, ChannelType, Partials } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel]
});

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Store pending video posts (userId -> link)
const pendingPosts = new Map();

client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.DM) return;
  
  console.log(`📨 Message from ${message.author.username}: ${message.content}`);
  
  const content = message.content.trim();
  const userId = message.author.id;
  
  // Check if this is a URL (link)
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlPattern);
  
  // If message contains a URL
  if (urls && urls.length > 0) {
    const link = urls[0];
    
    // If user already has a pending post, replace it
    if (pendingPosts.has(userId)) {
      await message.reply('🔄 Replacing previous link with this new one. Now send me the title:');
    } else {
      await message.reply('📝 Got it! Now send me the title for this video:');
    }
    
    pendingPosts.set(userId, link);
    console.log(`📎 Link received: ${link}, waiting for title...`);
  }
  // If user has a pending post and this is NOT a URL, treat it as the title
  else if (pendingPosts.has(userId)) {
    const link = pendingPosts.get(userId);
    const title = content;
    
    console.log(`✅ Received title: "${title}" for link: ${link}`);
    
    try {
      await axios.post(N8N_WEBHOOK_URL, {
        title: title,
        link: link,
        userId: userId,
        username: message.author.username,
        timestamp: new Date().toISOString()
      });
      
      await message.reply(`✅ Video "${title}" added to posting queue! 🎬`);
      pendingPosts.delete(userId);
    } catch (error) {
      console.error('❌ Error sending to n8n:', error.message);
      await message.reply('❌ Error processing your request. Please try again by sending the link first.');
      pendingPosts.delete(userId);
    }
  }
  // No URL and no pending post
  else {
    await message.reply('👋 Send me a video link (TikTok, Instagram, YouTube, or Google Drive) to get started!');
  }
});

client.login(BOT_TOKEN);
