import { Events } from 'discord.js';
import 'dotenv/config';
import { client } from './client';
import { interactionHandler } from './events/interactionCreate';
import { supabase } from './services/supabase';
import { logger } from './lib/logger';

logger.info('Starting Space Bot...');
logger.info('Environment loaded', {
  env: process.env.NODE_ENV || 'development',
});
logger.info('Connecting to Supabase...');
logger.info('Groq AI Engine initialized', {
  model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
});

client.once(Events.ClientReady, (readyClient) => {
  logger.success('Bot ready', { 
    user: readyClient.user.tag,
    id: readyClient.user.id,
  });
});

// Register Event Handlers
client.on(Events.InteractionCreate, (interaction) => interactionHandler.execute(interaction));

// Member Join Event
client.on(Events.GuildMemberAdd, async (member) => {
  logger.info('Member joined', {
    user: member.user.tag,
    guild: member.guild.name,
  });
  
  try {
    const { error } = await supabase.from('members').upsert({
      user_id: member.id,
      guild_id: member.guild.id,
      joined_at: new Date().toISOString()
    });
    if (error) throw error;
  } catch (err: any) {
    logger.error('Failed to log member join', {
      user: member.user.tag,
      error: err.message,
    });
  }
});

// Start the client
if (!process.env.DISCORD_TOKEN) {
  logger.error('Missing DISCORD_TOKEN in environment');
  process.exit(1);
}

logger.info('Connecting to Discord...');
client.login(process.env.DISCORD_TOKEN);
