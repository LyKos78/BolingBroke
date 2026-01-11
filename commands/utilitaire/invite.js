const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'invites',
    aliases: ["invite"],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;

        let invites = db.get(`invites_${message.guild.id}_${user.id}`) || 0;

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setColor(client.config.color)
            .setDescription(`**${user.username}** a **${invites}** invitations.`);

        message.channel.send({ embeds: [embed] });
    }
};