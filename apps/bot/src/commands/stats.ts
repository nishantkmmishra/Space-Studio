import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { logger } from '../lib/logger';

export const statsCommand = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View technical statistics of the Space Bot'),
  async execute(interaction: ChatInputCommandInteraction) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime % 60);

    const statsEmbed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📊 Space Bot Statistics')
      .addFields(
        { name: '🛰️ Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '🏠 Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
        { name: '👥 Users', value: `${interaction.client.users.cache.size}`, inline: true },
        { name: '📶 API Latency', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
        { name: '🔧 Environment', value: process.env.NODE_ENV || 'development', inline: true },
        { name: '📚 Node.js', value: process.version, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Space Intelligence Engine' });

    await interaction.reply({ embeds: [statsEmbed] });
    logger.info('Stats viewed', { user: interaction.user.tag });
  }
};
