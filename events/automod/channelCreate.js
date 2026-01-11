const db = require("../../quick.db");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (client, channel) => {
    if (!channel.guild) return;

    const mutedRoleId = db.fetch(`mRole_${channel.guild.id}`);
    const muteRole = channel.guild.roles.cache.get(mutedRoleId) || channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'muet' || r.name.toLowerCase() === 'muted');

    if (muteRole) {
        try {
            await channel.permissionOverwrites.create(muteRole, {
                SendMessages: false,
                Connect: false,
                AddReactions: false,
                fpSpeak: false
            });
        } catch (e) {
            console.error(`[ChannelCreate] Cannot overwrite perms for ${channel.name}:`, e.message);
        }
    }
};