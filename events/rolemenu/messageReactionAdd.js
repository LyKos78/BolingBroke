const db = require("../../quick.db");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (client, reaction, user) => {
    if (reaction.message.partial) {
        try {
            await reaction.message.fetch();
        } catch (error) {
            return;
        }
    }
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            return;
        }
    }

    if (user.bot) return;
    const { guild } = reaction.message;
    if (!guild) return;

    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) return;

    const member = guild.members.cache.get(user.id);
    if (!member) return;

    const data = db.get(`reactions_${guild.id}`);
    if (!data) return;

    const reactionConfig = data.find(
        (r) => r.emoji === reaction.emoji.toString() && r.msg === reaction.message.id
    );

    if (!reactionConfig) return;

    const role = guild.roles.cache.get(reactionConfig.roleId);
    if (role) {
        await member.roles.add(role).catch(() => { });
    }
};