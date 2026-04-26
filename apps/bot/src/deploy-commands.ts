import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import { pingCommand } from './commands/ping';
import { askCommand } from './commands/ask';

const commands = [
  pingCommand.data,
  askCommand.data
];

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
  throw new Error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID');
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`[SYSTEM] Refreshing ${commands.length} application (/) commands.`);

    const data: any = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );

    console.log(`[SYSTEM] Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('[ERROR]', error);
  }
})();
