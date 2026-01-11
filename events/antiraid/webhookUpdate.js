const db = require("../../quick.db");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = async (client, channel) => {

    if (!channel.guild) return;
    const guild = channel.guild;

    const audit = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.WebhookCreate });
    const entry = audit.entries.first();

    if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

    const executor = entry.executor;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    const isOwner = guild.ownerId === executor.id || client.config.owner.includes(executor.id);
    const isWhitelisted = db.get(`ownermd_${client.user.id}_${executor.id}`) === true || db.get(`wlmd_${guild.id}_${executor.id}`) === true;
    const isBot = client.user.id === executor.id;

    if (db.get(`webhook_${guild.id}`) === true && !isOwner && !isWhitelisted && !isBot) {

        try {
            const webhooks = await channel.fetchWebhooks();
            webhooks.forEach(async wk => {
                await wk.delete('Anti-Webhook Protection').catch(() => { });
            });
        } catch (e) {
            console.error("[Anti-Webhook] Erreur suppression:", e);
        }

        try {
            const messages = await channel.messages.fetch({ limit: 50 });
            const webhookMessages = messages.filter(m => m.webhookId);
            if (webhookMessages.size > 0) {
                await channel.bulkDelete(webhookMessages, true).catch(() => { });
            }
        } catch (e) { }

        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member) {
            const sanction = db.get(`webhook_sanction_${guild.id}`);

            if (sanction === "ban") await member.ban({ reason: 'Anti-Webhook' }).catch(() => { });
            else if (sanction === "kick") await member.kick('Anti-Webhook').catch(() => { });
            else if (sanction === "derank") await member.roles.set([], 'Anti-Webhook').catch(() => { });

            if (raidlog) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.color)
                    .setDescription(`<@${executor.id}> a créé/modifié un webhook, il a été **${sanction}** et les webhooks supprimés.`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};