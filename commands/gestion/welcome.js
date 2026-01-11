const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'welcome',
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getEmbed = () => new EmbedBuilder()
            .setTitle("Configuration Arrivées/Départs")
            .setColor(client.config.color)
            .addFields(
                { name: "Salon Join", value: db.get(`joinchannelmessage_${message.guild.id}`) ? `<#${db.get(`joinchannelmessage_${message.guild.id}`)}>` : "❌", inline: true },
                { name: "Message Join", value: db.get(`joinmessageembed_${message.guild.id}`) ? "✅ Configuré" : "❌", inline: true },
                { name: "Salon Leave", value: db.get(`leavechannelmessage_${message.guild.id}`) ? `<#${db.get(`leavechannelmessage_${message.guild.id}`)}>` : "❌", inline: true },
                { name: "Auto-Role", value: db.get(`autorole_${message.guild.id}`) ? `<@&${db.get(`autorole_${message.guild.id}`)}>` : "❌", inline: true }
            );

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('welcome_menu').setPlaceholder('Choisir...').addOptions([
                { label: 'Salon Join', value: 'join_chan', emoji: '📥' },
                { label: 'Message Join', value: 'join_msg', emoji: '📝' },
                { label: 'Salon Leave', value: 'leave_chan', emoji: '📤' },
                { label: 'Auto-Role', value: 'autorole', emoji: '🏷️' }
            ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed()], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            const ask = async (t) => {
                await i.reply({ content: t, ephemeral: true });
                const c = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                const m = c.first();
                if (m) m.delete().catch(() => { });
                i.deleteReply().catch(() => { });
                return m;
            };

            if (i.values[0] === 'join_chan') {
                const m = await ask("Salon des arrivées ?");
                if (m) db.set(`joinchannelmessage_${message.guild.id}`, (m.mentions.channels.first() || m).id);
            }
            if (i.values[0] === 'join_msg') {
                const m = await ask("Entrez le message (ou JSON Embed). Variables: {user}, {guild:name}, {guild:member}");
                if (m) db.set(`joinmessageembed_${message.guild.id}`, m.content); // Pourrait être amélioré pour gérer le JSON objet
            }
            if (i.values[0] === 'leave_chan') {
                const m = await ask("Salon des départs ?");
                if (m) db.set(`leavechannelmessage_${message.guild.id}`, (m.mentions.channels.first() || m).id);
            }
            if (i.values[0] === 'autorole') {
                const m = await ask("Role automatique ?");
                if (m) {
                    const r = m.mentions.roles.first() || message.guild.roles.cache.get(m.content);
                    if (r) db.set(`autorole_${message.guild.id}`, r.id);
                }
            }

            await msg.edit({ embeds: [getEmbed()] });
        });
    }
};