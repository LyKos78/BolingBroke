const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'embed',
    aliases: ["embedbuilder"],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`);
        if (!isPerm) return;

        let currentEmbed = new EmbedBuilder().setDescription("Description par défaut");
        let currentChannel = message.channel;

        const getRow = () => new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('embed_builder').setPlaceholder('Modifier l\'embed').addOptions([
                { label: 'Modifier Titre', value: 'title' },
                { label: 'Modifier Description', value: 'desc' },
                { label: 'Modifier Footer', value: 'footer' },
                { label: 'Modifier Couleur', value: 'color' },
                { label: 'Changer Salon', value: 'channel' },
                { label: 'Envoyer', value: 'send' }
            ])
        );

        const msg = await message.channel.send({ content: "Prévisualisation :", embeds: [currentEmbed], components: [getRow()] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            const ask = async (q) => {
                await i.reply({ content: q, ephemeral: true });
                const c = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                if (c.first()) {
                    c.first().delete().catch(() => { });
                    i.deleteReply().catch(() => { });
                    return c.first().content;
                }
                return null;
            };

            if (i.values[0] === 'title') {
                const res = await ask("Titre ?");
                if (res) currentEmbed.setTitle(res);
            }
            if (i.values[0] === 'desc') {
                const res = await ask("Description ?");
                if (res) currentEmbed.setDescription(res);
            }
            if (i.values[0] === 'footer') {
                const res = await ask("Footer ?");
                if (res) currentEmbed.setFooter({ text: res });
            }
            if (i.values[0] === 'color') {
                const res = await ask("Couleur (Hex ou Anglais) ?");
                if (res) try { currentEmbed.setColor(res); } catch { }
            }
            if (i.values[0] === 'channel') {
                await i.reply({ content: "Mentionnez le salon.", ephemeral: true });
                const c = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                if (c.first()) {
                    const ch = c.first().mentions.channels.first() || message.guild.channels.cache.get(c.first().content);
                    if (ch) currentChannel = ch;
                    c.first().delete().catch(() => { });
                    i.deleteReply().catch(() => { });
                }
            }
            if (i.values[0] === 'send') {
                await currentChannel.send({ embeds: [currentEmbed] });
                await i.reply({ content: `Embed envoyé dans ${currentChannel} !`, ephemeral: true });
                return;
            }

            if (!i.replied) await i.deferUpdate();
            await msg.edit({ content: `Prévisualisation (Salon cible: ${currentChannel}):`, embeds: [currentEmbed] });
        });
    }
};