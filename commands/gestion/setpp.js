const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'setpp',
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getEmbed = () => new EmbedBuilder()
            .setTitle("Configuration Random Images")
            .setColor(config.color)
            .addFields(
                { name: "Salon PP", value: db.get(`randompp_${message.guild.id}`) ? `<#${db.get(`randompp_${message.guild.id}`)}>` : "❌", inline: true },
                { name: "Salon Banner", value: db.get(`randombanner_${message.guild.id}`) ? `<#${db.get(`randombanner_${message.guild.id}`)}>` : "❌", inline: true },
                { name: "Salon Gif", value: db.get(`randomgif_${message.guild.id}`) ? `<#${db.get(`randomgif_${message.guild.id}`)}>` : "❌", inline: true }
            );

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('pp_menu').setPlaceholder('Configurer un module').addOptions([
                { label: 'Salon PP', value: 'pp', emoji: '🖼️' },
                { label: 'Salon Bannière', value: 'banner', emoji: '🎇' },
                { label: 'Salon Gif', value: 'gif', emoji: '🎞️' }
            ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed()], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            await i.reply({ content: "Mentionnez le salon.", ephemeral: true });
            const col = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
            const m = col.first();
            if (m) {
                const ch = m.mentions.channels.first() || message.guild.channels.cache.get(m.content);
                if (ch) {
                    if (i.values[0] === 'pp') db.set(`randompp_${message.guild.id}`, ch.id);
                    if (i.values[0] === 'banner') db.set(`randombanner_${message.guild.id}`, ch.id);
                    if (i.values[0] === 'gif') db.set(`randomgif_${message.guild.id}`, ch.id);
                }
                m.delete().catch(() => { });
                i.deleteReply().catch(() => { });
            }
            await msg.edit({ embeds: [getEmbed()] });
        });
    }
};