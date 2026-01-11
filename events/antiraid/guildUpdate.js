const db = require("../../quick.db");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

const config = require("../../config");

module.exports = async (client, oldGuild, newGuild) => {
    try {
        const guild = newGuild;

        const audit = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.GuildUpdate });
        const entry = audit.entries.first();

        if (!entry || !entry.executor) return;

        const executor = entry.executor;
        const color = db.get(`color_${guild.id}`) || client.config.color;
        const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

        const isOwner = guild.ownerId === executor.id || client.config.owner.includes(executor.id);
        const isWhitelisted = db.get(`ownermd_${client.user.id}_${executor.id}`) === true || db.get(`wlmd_${guild.id}_${executor.id}`) === true;
        const isBot = client.user.id === executor.id;

        if (db.get(`update_${guild.id}`) === true && !isOwner && !isWhitelisted && !isBot) {

            await newGuild.edit({
                name: oldGuild.name,
                icon: oldGuild.iconURL(),
                banner: oldGuild.bannerURL(),
                splash: oldGuild.splashURL(),
                afkChannel: oldGuild.afkChannel,
                systemChannel: oldGuild.systemChannel,
                verificationLevel: oldGuild.verificationLevel,
            }).catch(() => { });

            const member = await guild.members.fetch(executor.id).catch(() => null);
            if (member) {
                const sanction = db.get(`updatesanction_${guild.id}`);

                if (sanction === "ban") {
                    await member.ban({ reason: 'Anti-Update Guild' }).catch(() => { });
                } else if (sanction === "kick") {
                    await member.kick('Anti-Update Guild').catch(() => { });
                } else if (sanction === "derank") {
                    await member.roles.set([], 'Anti-Update Guild').catch(() => { });
                }

                if (raidlog) {
                    const embed = new EmbedBuilder()
                        .setColor(config.color)
                        .setDescription(`<@${executor.id}> a modifié le serveur, il a été **${sanction}** et les modifications annulées !`);
                    raidlog.send({ embeds: [embed] }).catch(() => { });
                }
            }
        }
    } catch (error) {
        console.error("[Anti-Update] Erreur:", error);
    }
};