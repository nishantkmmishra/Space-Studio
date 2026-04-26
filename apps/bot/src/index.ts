import 'dotenv/config';
import { client } from './client';
import { interactionHandler } from './events/interactionCreate';
import { supabase } from './services/supabase';

client.once('ready', () => {
  console.log(`[SYSTEM] Bot ready as ${client.user?.tag}`);
  console.log(`[SYSTEM] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Register Event Handlers
client.on(interactionHandler.name, (...args) => interactionHandler.execute(...args));

// Member Join Event (Example Integration)
client.on('guildMemberAdd', async (member) => {
  console.log(`[EVENT] New member joined: ${member.user.tag}`);
  try {
    const { error } = await supabase.from('members').upsert({
      user_id: member.id,
      guild_id: member.guild.id,
      joined_at: new Date().toISOString()
    });
    if (error) throw error;
  } catch (err) {
    console.error('[ERROR] Failed to log member join:', err);
  }
});

// Start the client
if (!process.env.DISCORD_TOKEN) {
  console.error('[ERROR] Missing DISCORD_TOKEN in environment');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
