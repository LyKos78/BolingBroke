const db = require("../../quick.db");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

const config = require("../../config");

module.exports = async (client, role) => {
    const guild = role.guild;
    const audit = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete });
    const entry = audit.entries.first();

    if (!entry || entry.target.id !== role.id) return;

    const executor = entry.executor;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    const isOwner = guild.ownerId === executor.id || client.config.owner.includes(executor.id);
    const isWhitelisted = db.get(`ownermd_${client.user.id}_${executor.id}`) === true || db.get(`wlmd_${guild.id}_${executor.id}`) === true;
    const isBot = client.user.id === executor.id;

    if (db.get(`rolesdel_${guild.id}`) === true && !isOwner && !isWhitelisted && !isBot) {

        await guild.roles.create({
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            permissions: role.permissions,
            position: role.rawPosition,
            mentionable: role.mentionable,
            reason: 'Anti-Role Delete'
        }).catch(() => { });

        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member) {
            const sanction = db.get(`rolesdelsanction_${guild.id}`);
            if (sanction === "ban") await member.ban({ reason: 'Anti-Role Delete' }).catch(() => { });
            else if (sanction === "kick") await member.kick('Anti-Role Delete').catch(() => { });
            else if (sanction === "derank") await member.roles.set([], 'Anti-Role Delete').catch(() => { });

            if (raidlog) {
                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setDescription(`<@${executor.id}> a supprimé le rôle \`${role.name}\`, il a été **${sanction}** et le rôle recréé !`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};