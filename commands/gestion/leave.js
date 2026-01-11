const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'leave',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getEmbed = () => {
            return new EmbedBuilder()
                .setTitle("Configuration Départs (Leave)")
                .setColor(config.color)
                .addFields(
                    {
                        name: "Salon d'au revoir",
                        value: db.get(`leavechannelmessage_${message.guild.id}`) ? `<#${db.get(`leavechannelmessage_${message.guild.id}`)}>` : "❌ *Non défini*",
                        inline: true
                    },
                    {
                        name: "Message d'au revoir",
                        value: db.get(`leavemessageembed_${message.guild.id}`) ? "✅ *Configuré*" : "❌ *Non défini*",
                        inline: true
                    },
                    {
                        name: "Message Privé (DM)",
                        value: db.get(`leavedme_${message.guild.id}`) ? "✅ *Configuré*" : "❌ *Non défini*",
                        inline: true
                    }
                )
                .setFooter({ text: "Sélectionnez une option ci-dessous pour modifier." });
        };

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('leave_menu')
                .setPlaceholder('Choisir une configuration')
                .addOptions([
                    { label: "Définir le salon", value: 'channel', emoji: '📤' },
                    { label: "Définir le message (Salon)", value: 'message', emoji: '📝' },
                    { label: "Définir le message (DM)", value: 'dm', emoji: '📩' },
                    { label: "Supprimer le salon", value: 'del_channel', emoji: '🗑️' },
                    { label: "Supprimer le message", value: 'del_message', emoji: '🗑️' },
                    { label: "Supprimer le DM", value: 'del_dm', emoji: '🗑️' }
                ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed()], components: [row] });

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            const choice = i.values[0];

            const ask = async (question) => {
                await i.reply({ content: question, ephemeral: true });
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                const m = collected.first();
                if (m) {
                    m.delete().catch(() => { });
                    i.deleteReply().catch(() => { });
                    return m;
                }
                return null;
            };

            if (choice === 'channel') {
                const m = await ask("Quel salon voulez-vous utiliser ? (Mentionnez-le ou ID)");
                if (m) {
                    const channel = m.mentions.channels.first() || message.guild.channels.cache.get(m.content);
                    if (channel) db.set(`leavechannelmessage_${message.guild.id}`, channel.id);
                }
            }

            if (choice === 'message') {
                const m = await ask("Entrez le message de départ (ou un JSON Embed).\nVariables dispos : `{user}`, `{user:username}`, `{guild:name}`, `{guild:member}`.");
                if (m) db.set(`leavemessageembed_${message.guild.id}`, m.content);
            }

            if (choice === 'dm') {
                const m = await ask("Entrez le message à envoyer en privé (DM).\nVariables dispos : `{user}`, `{guild:name}`.");
                if (m) db.set(`leavedme_${message.guild.id}`, m.content);
            }

            if (choice === 'del_channel') db.delete(`leavechannelmessage_${message.guild.id}`);
            if (choice === 'del_message') db.delete(`leavemessageembed_${message.guild.id}`);
            if (choice === 'del_dm') db.delete(`leavedme_${message.guild.id}`);

            if (!i.replied) await i.deferUpdate();
            await msg.edit({ embeds: [getEmbed()] });
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => { });
        });
    }
};