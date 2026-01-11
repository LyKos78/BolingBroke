const db = require("../../quick.db");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const ms = require("ms");

module.exports = async (client, member) => {
    const guild = member.guild;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    if (db.get(`blmd_${client.user.id}_${member.id}`) === true) {
        await member.ban({ reason: 'Blacklisted User' }).catch(() => { });
        if (raidlog) {
            const embed = new EmbedBuilder().setColor(client.config.color).setDescription(`${member} a rejoint alors qu'il est blacklist, il a été **ban**.`);
            raidlog.send({ embeds: [embed] }).catch(() => { });
        }
        return;
    }

    if (db.get(`crealimit_${guild.id}`) === true) {
        const duration = ms(db.get(`crealimittemps_${guild.id}`) || "0s");
        const created = member.user.createdTimestamp;

        if (Date.now() - created < duration) {
            await member.kick('Compte trop récent').catch(() => { });
            if (raidlog) {
                const embed = new EmbedBuilder().setColor(client.config.color).setDescription(`${member} a été **kick** (compte trop récent).`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
            return;
        }
    }

    if (member.user.bot) {
        const audit = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd });
        const entry = audit.entries.first();
        if (!entry || entry.target.id !== member.id) return;

        const executor = entry.executor;

        const isOwner = guild.ownerId === executor.id || client.config.owner.includes(executor.id);
        const isWhitelisted = db.get(`ownermd_${client.user.id}_${executor.id}`) === true || db.get(`wlmd_${guild.id}_${executor.id}`) === true;

        if (db.get(`bot_${guild.id}`) === true && !isOwner && !isWhitelisted) {

            await member.kick('Anti-Bot').catch(() => { });

            const memberExec = await guild.members.fetch(executor.id).catch(() => null);
            if (memberExec) {
                const sanction = db.get(`botsanction_${guild.id}`);
                if (sanction === "ban") await memberExec.ban({ reason: 'Anti-Bot' }).catch(() => { });
                else if (sanction === "kick") await memberExec.kick('Anti-Bot').catch(() => { });
                else if (sanction === "derank") await memberExec.roles.set([], 'Anti-Bot').catch(() => { });

                if (raidlog) {
                    const embed = new EmbedBuilder()
                        .setColor(client.config.color)
                        .setDescription(`<@${executor.id}> a ajouté le bot ${member}, il a été **${sanction}** !`);
                    raidlog.send({ embeds: [embed] }).catch(() => { });
                }
            }
        }
    }
};