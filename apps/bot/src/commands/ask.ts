import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { askAI } from '../services/ai';
import { logger } from '../lib/logger';

export const askCommand = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the community intelligence engine a question')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The question you want to ask')
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('query', true);
    
    logger.info('AI query received', {
      user: interaction.user.tag,
      query,
    });

    await interaction.deferReply();

    try {
      const answer = await askAI(query);

      const responseEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🛰️ Intelligence Response')
        .setDescription(answer || 'The engine returned an empty response.')
        .addFields({ name: 'Query', value: query })
        .setTimestamp()
        .setFooter({ text: 'Powered by OpenRouter AI' });

      await interaction.editReply({ embeds: [responseEmbed] });
      logger.success('AI response sent', {
        user: interaction.user.tag,
      });
    } catch (error: any) {
      logger.error('AI engine error', {
        user: interaction.user.tag,
        query,
        error: error.message,
      });
      await interaction.editReply('The intelligence engine encountered an error while processing your transmission.');
    }
  }
};
