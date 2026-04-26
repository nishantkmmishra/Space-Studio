import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { supabase } from '../services/supabase';
import { logger } from '../lib/logger';

export const userCommand = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('View a traveler\'s profile in the Space Registry')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to view')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild?.members.fetch(target.id);

    await interaction.deferReply();

    // Fetch from Supabase
    const { data: dbUser, error } = await supabase
      .from('guild_members')
      .select('*')
      .eq('guild_id', interaction.guildId)
      .eq('user_id', target.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      logger.error('Failed to fetch user from DB', { error: error.message, user: target.tag });
    }

    const profileEmbed = new EmbedBuilder()
      .setColor(0x00FF99)
      .setTitle(`🛸 Profile: ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '🆔 User ID', value: target.id, inline: true },
        { name: '🎭 Role', value: dbUser?.role || 'Unregistered', inline: true },
        { name: '📅 Joined Server', value: member?.joinedAt ? member.joinedAt.toLocaleDateString() : 'Unknown', inline: true },
        { name: '⚠️ Warnings', value: `${dbUser?.warnings || 0}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Space Registry Data' });

    if (dbUser?.notes) {
      profileEmbed.addFields({ name: '📝 Notes', value: dbUser.notes });
    }

    await interaction.editReply({ embeds: [profileEmbed] });
    logger.info('User profile viewed', { target: target.tag, requestedBy: interaction.user.tag });
  }
};
