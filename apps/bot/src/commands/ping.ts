import { ChatInputCommandInteraction } from 'discord.js';

export const pingCommand = {
  data: {
    name: 'ping',
    description: 'Replies with Pong'
  },
  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    
    await interaction.editReply(`Pong! 🏓\nLatency: ${latency}ms\nAPI Latency: ${Math.round(interaction.client.ws.ping)}ms`);
  }
};
