const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'tempvoc',
    aliases: ["tempo"],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getEmbed = () => {
            return new EmbedBuilder()
                .setTitle("Configuration Vocaux Temporaires")
                .setColor(config.color)
                .addFields(
                    { name: "Salon Hub", value: db.get(`jc_${message.guild.id}`) ? `<#${db.get(`jc_${message.guild.id}`)}>` : "❌", inline: true },
                    { name: "Catégorie", value: db.get(`catggg_${message.guild.id}`) ? `✅ Configuré` : "❌", inline: true },
                    { name: "Emoji", value: db.get(`emote_${message.guild.id}`) || "🔊", inline: true }
                );
        };

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('tempo_menu')
                .setPlaceholder('Choisir une option')
                .addOptions([
                    { label: 'Définir Salon Hub (Join to Create)', value: 'channel', emoji: '🔊' },
                    { label: 'Définir Catégorie', value: 'category', emoji: '📂' },
                    { label: 'Définir Emoji', value: 'emoji', emoji: '😀' }
                ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed()], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            const ask = async (txt) => {
                await i.reply({ content: txt, ephemeral: true });
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
                const m = collected.first();
                if (m) m.delete().catch(() => { });
                i.deleteReply().catch(() => { });
                return m;
            };

            if (i.values[0] === 'channel') {
                const m = await ask("Mentionnez le salon vocal ou donnez son ID.");
                if (m) {
                    const ch = m.mentions.channels.first() || message.guild.channels.cache.get(m.content);
                    if (ch) db.set(`jc_${message.guild.id}`, ch.id);
                }
            }
            if (i.values[0] === 'category') {
                const m = await ask("Donnez l'ID de la catégorie.");
                if (m) db.set(`catggg_${message.guild.id}`, m.content);
            }
            if (i.values[0] === 'emoji') {
                const m = await ask("Envoyez l'émoji à utiliser.");
                if (m) db.set(`emote_${message.guild.id}`, m.content);
            }

            await msg.edit({ embeds: [getEmbed()] });
        });
    }
};