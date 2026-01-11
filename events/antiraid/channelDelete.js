const db = require("../../quick.db");
const { EmbedBuilder, AuditLogEvent, ChannelType } = require("discord.js");

const config = require("../../config");

module.exports = async (client, channel) => {
    if (!channel.guild) return;
    const guild = channel.guild;

    const audit = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
    const entry = audit.entries.first();

    if (!entry || entry.target.id !== channel.id) return;

    const executor = entry.executor;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    const isOwner = guild.ownerId === executor.id || client.config.owner.includes(executor.id);
    const isWhitelisted = db.get(`ownermd_${client.user.id}_${executor.id}`) === true || db.get(`wlmd_${guild.id}_${executor.id}`) === true;
    const isBot = client.user.id === executor.id;

    if (db.get(`channelsdel_${guild.id}`) === true && !isOwner && !isWhitelisted && !isBot) {

        try {
            await guild.channels.create({
                name: channel.name,
                type: channel.type,
                topic: channel.topic,
                nsfw: channel.nsfw,
                bitrate: channel.bitrate,
                userLimit: channel.userLimit,
                rateLimitPerUser: channel.rateLimitPerUser,
                parent: channel.parentId,
                permissionOverwrites: channel.permissionOverwrites.cache,
                position: channel.rawPosition,
                reason: 'Anti-Channel Delete'
            });
        } catch (e) { console.log(e); }

        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member) {
            const sanction = db.get(`channelsdelsanction_${guild.id}`);
            if (sanction === "ban") await member.ban({ reason: 'Anti-Channel Delete' }).catch(() => { });
            else if (sanction === "kick") await member.kick('Anti-Channel Delete').catch(() => { });
            else if (sanction === "derank") await member.roles.set([], 'Anti-Channel Delete').catch(() => { });

            if (raidlog) {
                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setDescription(`<@${executor.id}> a supprimé le salon \`${channel.name}\`, il a été **${sanction}** et le salon recréé !`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};