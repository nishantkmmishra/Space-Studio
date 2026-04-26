import { Events, Interaction } from 'discord.js';
import { pingCommand } from '../commands/ping';
import { askCommand } from '../commands/ask';
import { statsCommand } from '../commands/stats';
import { userCommand } from '../commands/user';
import { serverCommand } from '../commands/server';
import { clearCommand } from '../commands/clear';
import { logger } from '../lib/logger';

const commands = new Map<string, any>([
  [pingCommand.data.name, pingCommand],
  [askCommand.data.name, askCommand],
  [statsCommand.data.name, statsCommand],
  [userCommand.data.name, userCommand],
  [serverCommand.data.name, serverCommand],
  [clearCommand.data.name, clearCommand],
]);

export const interactionHandler = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    logger.info('Command executed', {
      command: interaction.commandName,
      user: interaction.user.tag,
      guild: interaction.guild?.name || 'DM',
    });

    try {
      await command.execute(interaction);
    } catch (error: any) {
      logger.error('Failed to execute command', {
        command: interaction.commandName,
        user: interaction.user.tag,
        error: error.message,
      });

      const response = { content: 'There was an error while executing this command!', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
      } else {
        await interaction.reply(response);
      }
    }
  }
};
