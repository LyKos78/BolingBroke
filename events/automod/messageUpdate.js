const db = require("../../quick.db");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, oldMessage, newMessage) => {
    if (!newMessage.guild || newMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const guild = newMessage.guild;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    let mutedRoleId = db.fetch(`mRole_${guild.id}`);
    let muterole = guild.roles.cache.get(mutedRoleId);

    const isAntiLinkOn = db.get(`link_${guild.id}`) === true;
    if (!isAntiLinkOn) return;

    const isOwner = guild.ownerId === newMessage.author.id || dHclient.config.owner.includes(newMessage.author.id);
    const isWhitelisted = db.get(`ownermd_${client.user.id}_${newMessage.author.id}`) === true || db.get(`wlmd_${guild.id}_${newMessage.author.id}`) === true;

    if (isOwner || isWhitelisted) return;

    let forbiddenWords = ["discord.gg", ".gg", "discord.me", "discord.io", "invite.me"];
    if (db.get(`typelink_${guild.id}`) === "all") {
        forbiddenWords.push("http", "https", "www.", "discord.com");
    }

    if (forbiddenWords.some(word => newMessage.content.toLowerCase().includes(word))) {

        await newMessage.delete().catch(() => { });

        db.add(`warn_${newMessage.author.id}`, 1);
        const warnCount = db.get(`warn_${newMessage.author.id}`);

        const msg = await newMessage.channel.send(`${newMessage.author}, modification interdite (Lien détecté).`).catch(() => { });
        if (msg) setTimeout(() => msg.delete().catch(() => { }), 3000);

        if (warnCount <= 3) {
            if (muterole) await newMessage.member.roles.add(muterole).catch(() => { });
            if (raidlog) {
                const embed = new EmbedBuilder().setColor(client.config.color).setDescription(`${newMessage.author} a été **mute** (Edit Link)`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
            setTimeout(() => db.delete(`warn_${newMessage.author.id}`), 3600000);

        } else if (warnCount <= 5) {
            await newMessage.member.kick('Anti-Link Edit').catch(() => { });
            if (raidlog) {
                const embed = new EmbedBuilder().setColor(client.config.color).setDescription(`${newMessage.author} a été **kick** (Edit Link)`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
        } else {
            await newMessage.member.ban({ reason: 'Anti-Link Edit' }).catch(() => { });
            if (raidlog) {
                const embed = new EmbedBuilder().setColor(client.config.color).setDescription(`${newMessage.author} a été **ban** (Edit Link)`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};