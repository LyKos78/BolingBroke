const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ticket',
    aliases: ["ticket-setup"],
    run: async (client, message, args) => {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        message.delete().catch(() => { });

        const embed = new EmbedBuilder()
            .setTitle("🎫 Support & Tickets")
            .setDescription("Pour contacter le staff, veuillez cliquer sur le bouton ci-dessous.\nUn salon privé sera créé automatiquement.")
            .setColor(client.config.color)
            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('open_ticket')
                    .setLabel('Ouvrir un ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📩')
            );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
};