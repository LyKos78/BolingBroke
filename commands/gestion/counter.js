const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'counter',
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getEmbed = () => new EmbedBuilder()
            .setTitle("Configuration Compteurs")
            .setColor(config.color)
            .addFields(
                { name: "Membres", value: db.get(`member_${message.guild.id}`) ? `<#${db.get(`member_${message.guild.id}`)}>` : "❌", inline: true },
                { name: "En Ligne", value: db.get(`online_${message.guild.id}`) ? `<#${db.get(`online_${message.guild.id}`)}>` : "❌", inline: true },
                { name: "Vocal", value: db.get(`vocal_${message.guild.id}`) ? `<#${db.get(`vocal_${message.guild.id}`)}>` : "❌", inline: true },
                { name: "Boost", value: db.get(`boost_${message.guild.id}`) ? `<#${db.get(`boost_${message.guild.id}`)}>` : "❌", inline: true }
            );

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('counter_menu').setPlaceholder('Modifier un compteur').addOptions([
                { label: 'Compteur Membres', value: 'member' },
                { label: 'Compteur En Ligne', value: 'online' },
                { label: 'Compteur Vocal', value: 'vocal' },
                { label: 'Compteur Boost', value: 'boost' }
            ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed()], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            await i.reply({ content: `Mentionnez le salon vocal ou donnez son ID pour **${i.values[0]}**.`, ephemeral: true });
            const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
            
            if (collected.first()) {
                const ch = collected.first().mentions.channels.first() || message.guild.channels.cache.get(collected.first().content);
                if (ch) db.set(`${i.values[0]}_${message.guild.id}`, ch.id);
                collected.first().delete().catch(() => {});
                i.deleteReply().catch(() => {});
            }
            await msg.edit({ embeds: [getEmbed()] });
        });
    }
};