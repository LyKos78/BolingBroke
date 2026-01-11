const { EmbedBuilder, ChannelType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'channelinfo',
    aliases: ['ci'],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

        const embed = new EmbedBuilder()
            .setTitle(`Info salon: ${channel.name}`)
            .setColor(config.color)
            .addFields(
                { name: 'Nom', value: channel.name, inline: true },
                { name: 'ID', value: channel.id, inline: true },
                { name: 'Type', value: `${channel.type}`, inline: true },
                { name: 'Créé le', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:f>`, inline: false }
            );

        if (channel.type === ChannelType.GuildText) {
            embed.addFields({ name: 'Sujet', value: channel.topic || "Aucun", inline: false });
        }

        if (channel.type === ChannelType.GuildVoice) {
            embed.addFields(
                { name: 'Bitrate', value: `${channel.bitrate / 1000}kbps`, inline: true },
                { name: 'Utilisateurs', value: `${channel.members.size}/${channel.userLimit || '∞'}`, inline: true }
            );
        }

        message.channel.send({ embeds: [embed] });
    }
};