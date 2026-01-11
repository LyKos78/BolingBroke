const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'botconfig',
    aliases: ["setprofil"],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getStatus = (s) => {
            if (s === 'dnd') return '🔴';
            if (s === 'idle') return '🟠';
            if (s === 'online') return '🟢';
            return '⚫';
        };

        const updateEmbed = () => {
            return new EmbedBuilder()
                .setTitle("Configuration Bot")
                .setColor(config.color)
                .setDescription(`
**1・Changer le nom** : \`${client.user.username}\`
**2・Changer l'avatar** : [Lien](${client.user.displayAvatarURL()})
**3・Activité** : \`${client.user.presence.activities[0] ? client.user.presence.activities[0].name : "Aucune"}\`
**4・Statut** : ${getStatus(client.user.presence.status)}
**5・Sécurité Anti-Join** : ${db.get(`antijoinbot_${client.user.id}`) ? "✅" : "❌"}
                `);
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('name').setLabel('Nom').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('avatar').setLabel('Avatar').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('activity').setLabel('Activité').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('status').setLabel('Statut').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('secure').setLabel('Anti-Join').setStyle(ButtonStyle.Danger)
        );

        const msg = await message.channel.send({ embeds: [updateEmbed()], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            if (i.customId === 'name') {
                await i.reply({ content: "Quel est le nouveau nom ?", ephemeral: true });
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
                if (collected.first()) {
                    await client.user.setUsername(collected.first().content).catch(() => { });
                    collected.first().delete().catch(() => { });
                    i.deleteReply().catch(() => { });
                }
            }

            if (i.customId === 'avatar') {
                await i.reply({ content: "Envoyez l'image ou le lien.", ephemeral: true });
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
                const m = collected.first();
                if (m) {
                    const url = m.attachments.first() ? m.attachments.first().url : m.content;
                    await client.user.setAvatar(url).catch(() => { });
                    m.delete().catch(() => { });
                    i.deleteReply().catch(() => { });
                }
            }

            if (i.customId === 'activity') {
                await i.reply({ content: "Quel texte pour l'activité ? (Tapez `reset` pour enlever)", ephemeral: true });
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
                if (collected.first()) {
                    const text = collected.first().content;
                    if (text === "reset") client.user.setActivity(null);
                    else client.user.setActivity(text, { type: ActivityType.Watching });
                    collected.first().delete().catch(() => { });
                    i.deleteReply().catch(() => { });
                }
            }

            if (i.customId === 'secure') {
                const current = db.get(`antijoinbot_${client.user.id}`);
                if (current) db.delete(`antijoinbot_${client.user.id}`);
                else db.set(`antijoinbot_${client.user.id}`, true);
                await i.deferUpdate();
            }

            // Mise à jour finale du message principal
            await msg.edit({ embeds: [updateEmbed()] });
        });
    }
};