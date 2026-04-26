import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import { pingCommand } from './commands/ping';
import { askCommand } from './commands/ask';
import { statsCommand } from './commands/stats';
import { userCommand } from './commands/user';
import { serverCommand } from './commands/server';
import { clearCommand } from './commands/clear';
import { logger } from './lib/logger';

const commands = [
  pingCommand.data,
  askCommand.data,
  statsCommand.data,
  userCommand.data,
  serverCommand.data,
  clearCommand.data,
];

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
  logger.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID');
  process.exit(1);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    logger.info(`Refreshing ${commands.length} application (/) commands...`);

    const data: any = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commands },
    );

    logger.success(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error: any) {
    logger.error('Failed to reload application commands', { error: error.message });
  }
})();
