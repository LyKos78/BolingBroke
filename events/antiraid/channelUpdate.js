const db = require("../../quick.db");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = async (client, oldChannel, newChannel) => {
    if (!oldChannel.guild) return;
    const guild = newChannel.guild;

    const audit = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelUpdate });
    const entry = audit.entries.first();

    if (!entry || entry.target.id !== newChannel.id || Date.now() - entry.createdTimestamp > 5000) return;

    const executor = entry.executor;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    const isOwner = guild.ownerId === executor.id || client.config.owner.includes(executor.id);
    const isWhitelisted = db.get(`ownermd_${client.user.id}_${executor.id}`) === true || db.get(`wlmd_${guild.id}_${executor.id}`) === true;
    const isBot = client.user.id === executor.id;

    if (db.get(`channelsmod_${guild.id}`) === true && !isOwner && !isWhitelisted && !isBot) {

        await newChannel.edit({
            name: oldChannel.name,
            topic: oldChannel.topic,
            nsfw: oldChannel.nsfw,
            bitrate: oldChannel.bitrate,
            userLimit: oldChannel.userLimit,
            rateLimitPerUser: oldChannel.rateLimitPerUser,
            position: oldChannel.rawPosition,
            permissionOverwrites: oldChannel.permissionOverwrites.cache,
            reason: 'Anti-Channel Update'
        }).catch(() => { });

        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member) {
            const sanction = db.get(`channelsmodsanction_${guild.id}`);
            if (sanction === "ban") await member.ban({ reason: 'Anti-Channel Update' }).catch(() => { });
            else if (sanction === "kick") await member.kick('Anti-Channel Update').catch(() => { });
            else if (sanction === "derank") await member.roles.set([], 'Anti-Channel Update').catch(() => { });

            if (raidlog) {
                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setDescription(`<@${executor.id}> a modifié le salon \`${oldChannel.name}\`, il a été **${sanction}** et les modifs annulées !`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};