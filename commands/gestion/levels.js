const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'levels',
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getEmbed = () => new EmbedBuilder()
            .setTitle("Configuration Levels")
            .setColor(client.config.color)
            .addFields(
                { name: "Salon", value: db.get(`levelchannel_${message.guild.id}`) ? `<#${db.get(`levelchannel_${message.guild.id}`)}>` : "❌", inline: true },
                { name: "Message", value: db.get(`defaultLevelmessage_${message.guild.id}`) ? "Personnalisé" : "Par défaut", inline: true }
            );

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('lvl_menu').setPlaceholder('Choisir').addOptions([
                { label: 'Définir le salon', value: 'channel' },
                { label: 'Définir le message', value: 'msg' },
                { label: 'Reset', value: 'reset' }
            ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed()], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });
        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            if (i.values[0] === 'channel') {
                await i.reply({ content: "Salon ?", ephemeral: true });
                const c = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
                if (c.first()) {
                    const ch = c.first().mentions.channels.first() || message.guild.channels.cache.get(c.first().content);
                    if (ch) db.set(`levelchannel_${message.guild.id}`, ch.id);
                    c.first().delete().catch(() => { });
                }
                i.deleteReply().catch(() => { });
            }
            if (i.values[0] === 'msg') {
                await i.reply({ content: "Message ? Variables: {user}, {level}, {xp}", ephemeral: true });
                const c = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
                if (c.first()) {
                    db.set(`defaultLevelmessage_${message.guild.id}`, c.first().content);
                    c.first().delete().catch(() => { });
                }
                i.deleteReply().catch(() => { });
            }
            if (i.values[0] === 'reset') {
                db.delete(`levelchannel_${message.guild.id}`);
                db.delete(`defaultLevelmessage_${message.guild.id}`);
                await i.deferUpdate();
            }
            await msg.edit({ embeds: [getEmbed()] });
        });
    }
};