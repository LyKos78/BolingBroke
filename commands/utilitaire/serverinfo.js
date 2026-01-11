const { EmbedBuilder, ChannelType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'serverinfo',
    aliases: ['si'],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        const guild = message.guild;
        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(config.color)
            .addFields(
                { name: "👑 Propriétaire", value: `<@${guild.ownerId}>`, inline: true },
                { name: "🆔 ID", value: guild.id, inline: true },
                { name: "📅 Création", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:d>`, inline: true },
                { name: "👥 Membres", value: `${guild.memberCount}`, inline: true },
                { name: "🤖 Bots", value: `${guild.members.cache.filter(m => m.user.bot).size}`, inline: true },
                { name: "💎 Boosts", value: `${guild.premiumSubscriptionCount || 0} (Niveau ${guild.premiumTier})`, inline: true },
                { name: "📜 Rôles", value: `${guild.roles.cache.size}`, inline: true },
                { name: "😀 Emojis", value: `${guild.emojis.cache.size}`, inline: true },
                { name: "📂 Salons", value: `${guild.channels.cache.size}`, inline: true }
            )
            .setFooter({ text: `Serveur Info • ${client.config.name}` });

        if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));

        message.channel.send({ embeds: [embed] });
    }
};