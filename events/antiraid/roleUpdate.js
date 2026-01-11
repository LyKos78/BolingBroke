const db = require("../../quick.db");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

const config = require("../../config");

module.exports = async (client, oldRole, newRole) => {
    const guild = newRole.guild;

    const audit = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleUpdate });
    const entry = audit.entries.first();

    if (!entry || entry.target.id !== newRole.id) return;

    const executor = entry.executor;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    const isOwner = guild.ownerId === executor.id || client.config.owner.includes(executor.id);
    const isWhitelisted = db.get(`ownermd_${client.user.id}_${executor.id}`) === true || db.get(`wlmd_${guild.id}_${executor.id}`) === true;
    const isBot = client.user.id === executor.id;

    if (db.get(`rolesmod_${guild.id}`) === true && !isOwner && !isWhitelisted && !isBot) {

        try {
            await newRole.edit({
                name: oldRole.name,
                color: oldRole.color,
                permissions: oldRole.permissions,
                hoist: oldRole.hoist,
                mentionable: oldRole.mentionable,
                position: oldRole.rawPosition,
                reason: 'Anti-Role Update'
            });
        } catch (err) {
            console.error("[Anti-Role] Impossible de revert le rôle:", err);
        }

        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member) {
            const sanction = db.get(`rolesmodsanction_${guild.id}`);

            if (sanction === "ban") await member.ban({ reason: 'Anti-Role Update' }).catch(() => { });
            else if (sanction === "kick") await member.kick('Anti-Role Update').catch(() => { });
            else if (sanction === "derank") await member.roles.set([], 'Anti-Role Update').catch(() => { });

            if (raidlog) {
                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setDescription(`<@${executor.id}> a modifié le rôle **${oldRole.name}**, il a été **${sanction}** et les modifications annulées !`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};