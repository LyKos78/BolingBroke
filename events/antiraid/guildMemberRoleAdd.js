const db = require("../../quick.db");
const { EmbedBuilder, AuditLogEvent, PermissionFlagsBits } = require("discord.js");

module.exports = async (client, oldMember, newMember) => {
    const guild = newMember.guild;

    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    if (addedRoles.size === 0) return;
    const role = addedRoles.first();

    if (db.get(`blrankmd_${client.user.id}_${newMember.id}`)) {
        await newMember.roles.remove(role.id).catch(() => { });
        return;
    }

    const audit = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate });
    const entry = audit.entries.first();
    if (!entry || entry.target.id !== newMember.id) return;

    const executor = entry.executor;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    const isOwner = guild.ownerId === executor.id || client.config.owner.includes(executor.id);
    const isWhitelisted = db.get(`ownermd_${client.user.id}_${executor.id}`) === true || db.get(`wlmd_${guild.id}_${executor.id}`) === true;
    const isBot = client.user.id === executor.id;

    if (db.get(`rolesadd_${guild.id}`) === true && !isOwner && !isWhitelisted && !isBot) {

        const dangerousPerms = [
            PermissionFlagsBits.Administrator,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageGuild,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.MentionEveryone
        ];

        if (role.permissions.has(dangerousPerms)) {

            await newMember.roles.remove(role.id).catch(() => { });

            const memberExec = await guild.members.fetch(executor.id).catch(() => null);
            if (memberExec) {
                const sanction = db.get(`rolesaddsanction_${guild.id}`);
                if (sanction === "ban") await memberExec.ban({ reason: 'Anti-Perms Role' }).catch(() => { });
                else if (sanction === "kick") await memberExec.kick('Anti-Perms Role').catch(() => { });
                else if (sanction === "derank") await memberExec.roles.set([], 'Anti-Perms Role').catch(() => { });

                if (raidlog) {
                    const embed = new EmbedBuilder()
                        .setColor(config.color)
                        .setDescription(`<@${executor.id}> a ajouté un rôle critique à ${newMember.user.tag}, il a été **${sanction}** !`);
                    raidlog.send({ embeds: [embed] }).catch(() => { });
                }
            }
        }
    }
};