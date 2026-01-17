const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BUTTON_IDS } = require('./constants');
const config = require('../config.json');

class TicketSystem {
    static async createTicket(client, interaction) {
        const existingChannel = interaction.guild.channels.cache.find(c => c.topic === interaction.user.id);
        if (existingChannel) {
            return interaction.reply({ content: `Vous avez déjà un ticket ouvert ici : ${existingChannel}`, ephemeral: true });
        }

        try {
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                topic: interaction.user.id,
                parent: interaction.channel.parentId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
                    },
                    {
                        id: client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    }
                ],
            });

            await interaction.reply({ content: `✅ Votre ticket a été créé : ${channel}`, ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle(`Ticket de ${interaction.user.username}`)
                .setDescription("Un membre du staff va bientôt prendre en charge votre demande.\nExpliquez votre problème en attendant.")
                .setColor(config.color);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(BUTTON_IDS.CLOSE_TICKET)
                        .setLabel('Fermer le ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            await channel.send({ content: `${interaction.user} | @here`, embeds: [embed], components: [row] });

        } catch (e) {
            console.error("Error creating ticket:", e);
            interaction.reply({ content: "Une erreur est survenue lors de la création du ticket.", ephemeral: true });
        }
    }

    static async closeTicket(interaction) {
        await interaction.reply({ content: "🔒 Le ticket va être supprimé dans 5 secondes..." });

        setTimeout(() => {
            interaction.channel.delete().catch(() => { });
        }, 5000);
    }
}

module.exports = TicketSystem;
