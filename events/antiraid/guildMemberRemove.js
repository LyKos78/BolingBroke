const db = require("../../quick.db");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const ms = require("ms");

const kickCounts = new Map();

module.exports = async (client, member) => {
    const guild = member.guild;

    const audit = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick });
    const entry = audit.entries.first();

    if (!entry || entry.target.id !== member.id || Date.now() - entry.createdTimestamp > 5000) return;

    const executor = entry.executor;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    const isOwner = guild.ownerId === executor.id || client.config.owner.includes(executor.id);
    const isWhitelisted = db.get(`ownermd_${client.user.id}_${executor.id}`) === true || db.get(`wlmd_${guild.id}_${executor.id}`) === true;
    const isBot = client.user.id === executor.id;

    if (db.get(`massban_${guild.id}`) === true && !isOwner && !isWhitelisted && !isBot) {

        const limit = db.get(`massbannum_${guild.id}`) || 2;
        const time = ms(db.get(`massbantime_${guild.id}`) || "10s");

        if (!kickCounts.has(executor.id)) {
            kickCounts.set(executor.id, 1);
            setTimeout(() => kickCounts.delete(executor.id), time);
        } else {
            kickCounts.set(executor.id, kickCounts.get(executor.id) + 1);
        }

        if (kickCounts.get(executor.id) > limit) {
            const memberExec = await guild.members.fetch(executor.id).catch(() => null);
            if (memberExec) {
                const sanction = db.get(`massbansanction_${guild.id}`);

                if (sanction === "ban") await memberExec.ban({ reason: 'Anti-Mass Kick' }).catch(() => { });
                else if (sanction === "kick") await memberExec.kick('Anti-Mass Kick').catch(() => { });
                else if (sanction === "derank") await memberExec.roles.set([], 'Anti-Mass Kick').catch(() => { });

                if (raidlog) {
                    const embed = new EmbedBuilder()
                        .setColor(config.color)
                        .setDescription(`<@${executor.id}> a expulsé trop de membres, il a été **${sanction}** !`);
                    raidlog.send({ embeds: [embed] }).catch(() => { });
                }
            }
        }
    }
};