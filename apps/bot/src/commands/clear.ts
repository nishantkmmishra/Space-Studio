import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { logger } from '../lib/logger';

export const clearCommand = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Bulk delete messages in this channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to clear (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('amount', true);
    
    if (!interaction.channel || !('bulkDelete' in interaction.channel)) {
      return interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ content: `Successfully cleared \`${deleted.size}\` messages from orbit.`, ephemeral: true });
      logger.warn('Messages cleared', { 
        user: interaction.user.tag, 
        amount, 
        deleted: deleted.size,
        channel: interaction.channelId
      });
    } catch (error: any) {
      logger.error('Failed to clear messages', { error: error.message });
      await interaction.reply({ content: 'Failed to clear messages. They might be older than 14 days.', ephemeral: true });
    }
  }
};
