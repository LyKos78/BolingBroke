const { PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");

module.exports = {
    name: 'unlock',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm) {
            message.member.roles.cache.forEach(role => {
                if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            });
        }
        if (!perm && !message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

        if (args[0] === "all") {
            message.guild.channels.cache.forEach(c => {
                c.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: true
                }).catch(() => { });
            });
            return message.channel.send("🔓 Tous les salons ont été ouverts.");
        }

        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: true
        });
        message.channel.send(`🔓 Le salon ${channel} a été ouvert.`);
    }
};