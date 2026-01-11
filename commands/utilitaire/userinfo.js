const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'userinfo',
    aliases: ['ui', 'user'],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const user = member.user;

        const flags = user.flags.toArray().map(flag => flag.replace("_", " ")).join(", ") || "Aucun";

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(client.config.color)
            .addFields(
                { name: "🆔 ID", value: user.id, inline: true },
                { name: "🏷️ Surnom", value: member.nickname || "Aucun", inline: true },
                { name: "🤖 Bot", value: user.bot ? "Oui" : "Non", inline: true },
                { name: "📅 Création Compte", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`, inline: false },
                { name: "📥 Rejoint le", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`, inline: false },
                { name: "🏅 Badges", value: flags, inline: false },
                { name: "📜 Rôles Principaux", value: member.roles.cache.filter(r => r.name !== '@everyone').map(r => r).slice(0, 5).join(", ") || "Aucun", inline: false }
            );

        message.channel.send({ embeds: [embed] });
    }
};