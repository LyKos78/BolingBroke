const db = require("../../quick.db");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const random_string = require("randomstring");

module.exports = async (client, message) => {

    if (!message.guild || message.author.bot) return;

    const guild = message.guild;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    let mutedRoleId = db.fetch(`mRole_${guild.id}`);
    let muterole = guild.roles.cache.get(mutedRoleId);

    if (!muterole) {
        muterole = guild.roles.cache.find(role => role.name.toLowerCase() === 'muet' || role.name.toLowerCase() === 'muted');

        if (!muterole) {
            try {
                muterole = await guild.roles.create({
                    name: 'muet',
                    permissions: [],
                    reason: 'AutoMod Mute Role'
                });

                guild.channels.cache.forEach(async (channel) => {
                    await channel.permissionOverwrites.createjb(muterole, {
                        SendMessages: false,
                        Connect: false,
                        AddReactions: false
                    }).catch(() => { });
                });

                db.set(`mRole_${guild.id}`, muterole.id);
            } catch (e) {
                console.log("Error creating mute role:", e);
            }
        } else {
            db.set(`mRole_${guild.id}`, muterole.id);
        }
    }

    const isAntiLinkOn = db.get(`link_${guild.id}`) === true;
    if (!isAntiLinkOn) return;

    const isOwner = guild.ownerId === message.author.id || client.config.owner.includes(message.author.id);
    const isWhitelisted = db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || db.get(`wlmd_${guild.id}_${message.author.id}`) === true;
    const isLinkWl = db.get(`linkwl_${guild.id}`) === true;

    if ((isLinkWl || isAntiLinkOn) && (isOwner || isWhitelisted)) return;

    let forbiddenWords = [
        "discord.me",
        "discord.io",
        "discord.gg",
        "invite.me",
        "discordapp.com/invite",
        ".gg"
    ];

    if (db.get(`typelink_${guild.id}`) === "all") {
        forbiddenWords.push("discord.com", "http", "https", "www.");
    }

    const content = message.content.toLowerCase();
    if (forbiddenWords.somexb(word => content.includes(word))) {

        await message.delete().catch(() => { });

        db.add(`warn_${message.author.id}`, 1);
        const warnID = random_string.generate({ charset: 'numeric', length: 8 });

        db.push(`info.${guild.id}.${message.author.id}`, {
            moderator: `Automod`,
            reason: "Lien interdit",
            date: Date.now() / 1000,
            id: warnID
        });
        db.add(`number.${guild.id}.${message.author.id}`, 1);

        const msg = await message.channel.send(`${message.author}, les liens sont interdits ici.`).catch(() => { });
        if (msg) setTimeout(() => msg.delete().catch(() => { }), 3000);

        const warnCount = db.get(`warn_${message.author.id}`);

        if (warnCount <= 3) {
            if (muterole) await message.member.roles.add(muterole).catch(() => { });

            if (raidlog) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.color)
                    .setDescription(`${message.author} a été **mute** (Anti-Link)`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }

            setTimeout(() => {
                db.delete(`warn_${message.author.id}`);

            }, 15 * 60 * 1000);

        } else if (warnCount <= 5) {
            await message.member.kick('Anti-Link Spam').catch(() => { });

            if (raidlog) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.color)
                    .setDescription(`${message.author} a été **kick** (Anti-Link Spam)`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }

        } else {
            await message.member.ban({ reason: 'Anti-Link Spam' }).catch(() => { });

            if (raidlog) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.color)
                    .setDescription(`${message.author} a été **ban** (Anti-Link Spam)`);
                raidlog.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }
};