const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'pic',
    aliases: ["pp", "avatar"],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;

        const embed = new EmbedBuilder()
            .setTitle(`Avatar de ${user.username}`)
            .setColor(config.color)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setFooter({ text: `Demandé par ${message.author.tag}` });

        message.channel.send({ embeds: [embed] });
    }
};