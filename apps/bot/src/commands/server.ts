import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { supabase } from '../services/supabase';
import { logger } from '../lib/logger';

export const serverCommand = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('View current Space Station (server) configuration'),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    await interaction.deferReply();

    // Fetch config from Supabase
    const { data: config, error } = await supabase
      .from('guild_configs')
      .select('*')
      .eq('guild_id', interaction.guild.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Failed to fetch server config', { error: error.message, guild: interaction.guild.name });
    }

    const serverEmbed = new EmbedBuilder()
      .setColor(0xFF9900)
      .setTitle(`🛰️ Station Info: ${interaction.guild.name}`)
      .setThumbnail(interaction.guild.iconURL())
      .addFields(
        { name: '🏢 Workspace', value: config?.workspace_name || 'Standard Space', inline: true },
        { name: '🎭 AI Tone', value: config?.bot_tone || 'Standard', inline: true },
        { name: '👥 Population', value: `${interaction.guild.memberCount} Travelers`, inline: true },
        { name: '🛡️ Security', value: interaction.guild.verificationLevel.toString(), inline: true },
        { name: '📅 Commissioned', value: interaction.guild.createdAt.toLocaleDateString(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Space Infrastructure Registry' });

    await interaction.editReply({ embeds: [serverEmbed] });
    logger.info('Server info viewed', { guild: interaction.guild.name, user: interaction.user.tag });
  }
};
