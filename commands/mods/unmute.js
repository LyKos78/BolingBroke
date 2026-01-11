const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'unmute',
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.reply("Membre introuvable.");

        let mutedRoleId = db.fetch(`mRole_${message.guild.id}`);
        let muterole = message.guild.roles.cache.get(mutedRoleId);
        if (!muterole) return message.reply("Aucun rôle muet configuré.");

        if (!member.roles.cache.has(muterole.id)) return message.reply("Ce membre n'est pas mute.");

        await member.roles.remove(muterole);
        db.delete(`mute_${message.guild.id}_${member.id}`);

        message.channel.send(`${member} a été **unmute**.`);

        const logChannel = message.guild.channels.cache.get(db.get(`logmod_${message.guild.id}`));
        if (logChannel) {
            const embed = new EmbedBuilder().setColor(config.color).setDescription(`${message.author} a **unmute** ${member}`);
            logChannel.send({ embeds: [embed] });
        }
    }
};