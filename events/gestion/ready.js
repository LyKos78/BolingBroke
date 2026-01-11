const db = require("../../quick.db");
const { ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
    console.log(`✅ ${client.user.tag} est connecté !`);

    setInterval(() => {
        client.guilds.cache.forEach(async guild => {
            try {
                const formats = {
                    member: db.fetch(`memberformat_${guild.id}`) || `💎・Membres: <count>`,
                    online: db.fetch(`onlineformat_${guild.id}`) || `🌟・En ligne: <count>`,
                    vocal: db.fetch(`vocalformat_${guild.id}`) || `🎧・En vocal: <count>`,
                    boost: db.fetch(`boostformat_${guild.id}`) || `🔮・Boost: <count>`
                };

                const counts = {
                    member: guild.memberCount,
                    online: guild.members.cache.filter(m => m.presence?.status && m.presence.status !== 'offline').size,
                    vocal: guild.members.cache.filter(m => m.voice.channelId).size,
                    boost: guild.premiumSubscriptionCount || 0
                };

                const channels = {
                    member: guild.channels.cache.get(db.fetch(`member_${guild.id}`)),
                    online: guild.channels.cache.get(db.fetch(`online_${guild.id}`)),
                    vocal: guild.channels.cache.get(db.fetch(`vocal_${guild.id}`)),
                    boost: guild.channels.cache.get(db.fetch(`boost_${guild.id}`))
                };

                if (channels.member) await channels.member.setName(formats.member.replace("<count>", counts.member)).catch(() => { });
                if (channels.online) await channels.online.setName(formats.online.replace("<count>", counts.online)).catch(() => { });
                if (channels.vocal) await channels.vocal.setName(formats.vocal.replace("<count>", counts.vocal)).catch(() => { });
                if (channels.boost) await channels.boost.setName(formats.boost.replace("<count>", counts.boost)).catch(() => { });

            } catch (e) {
                console.error(`[Stats] Erreur sur ${guild.name}:`, e.message);
            }
        });
    }, 600000);

    client.guilds.cache.forEach(async guild => {
        const intervalTime = db.get(`randominterval_${guild.id}`) || 120000;
        const color = db.get(`randomcolor_${guild.id}`) || "#2f3136";

        if (db.get(`randomgif_${guild.id}`)) {
            setInterval(async () => {
                const channel = guild.channels.cache.get(db.get(`randomgif_${guild.id}`));
                if (!channel) return;

                const userWithGif = client.users.cache.find(u => u.avatar && u.avatar.startsWith("a_"));
                if (!userWithGif) return;

                const avatarUrl = userWithGif.displayAvatarURL({ dynamic: true, size: 512 });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel("Télécharger").setStyle(ButtonStyle.Link).setURL(avatarUrl)
                );

                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setImage(avatarUrl)
                    .setFooter({ text: `Gif de ${userWithGif.tag}` });

                channel.send({ embeds: [embed], components: [row] }).catch(() => { });
            }, intervalTime);
        }

        if (db.get(`randompp_${guild.id}`)) {
            setInterval(() => {
                const channel = guild.channels.cache.get(db.get(`randompp_${guild.id}`));
                if (!channel) return;

                const user = client.users.cache.random();
                if (!user || user.bot) return;

                const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 512 });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel("Télécharger").setStyle(ButtonStyle.Link).setURL(avatarUrl)
                );

                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setImage(avatarUrl)
                    .setFooter({ text: `Avatar de ${user.tag}` });

                channel.send({ embeds: [embed], components: [row] }).catch(() => { });
            }, intervalTime);
        }

        if (db.get(`randombanner_${guild.id}`)) {
            setInterval(async () => {
                const channel = guild.channels.cache.get(db.get(`randombanner_${guild.id}`));
                if (!channel) return;

                const randomUser = client.users.cache.random();
                if (!randomUser) return;

                try {
                    const user = await client.users.fetch(randomUser.id, { force: true });
                    if (!user.banner) return;

                    const bannerUrl = user.bannerURL({ dynamic: true, size: 512 });

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setLabel("Télécharger").setStyle(ButtonStyle.Link).setURL(bannerUrl)
                    );

                    const embed = new EmbedBuilder()
                        .setColor(config.color)
                        .setImage(bannerUrl)
                        .setFooter({ text: `Bannière de ${user.tag}` });

                    channel.send({ embeds: [embed], components: [row] }).catch(() => { });
                } catch (e) { }
            }, intervalTime);
        }
    });
};