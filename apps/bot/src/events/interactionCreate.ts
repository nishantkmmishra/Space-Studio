import { Events, Interaction } from 'discord.js';
import { pingCommand } from '../commands/ping';
import { askCommand } from '../commands/ask';

export const interactionHandler = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    try {
      if (interaction.commandName === 'ping') {
        await pingCommand.execute(interaction);
      } else if (interaction.commandName === 'ask') {
        await askCommand.execute(interaction);
      }
    } catch (error) {
      console.error('Error executing command:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  }
};
