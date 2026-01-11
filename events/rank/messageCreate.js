const db = require("../../quick.db");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;

    const prefix = db.get(`prefix_${message.guild.id}`) || client.config.prefix;
    if (message.content.startsWith(prefix)) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    db.add(`msg_${guildId}_${userId}`, 1);

    const xpAdd = Math.floor(Math.random() * 10) + 15;

    db.add(`guild_${guildId}_xp_${userId}`, xpAdd);
    db.add(`guild_${guildId}_xptotal_${guildId}`, xpAdd);

    let currentXp = db.get(`guild_${guildId}_xp_${userId}`);
    let currentLevel = db.get(`guild_${guildId}_level_${userId}`) || 0;

    let xpNeeded = (currentLevel + 1) * 500;

    if (currentXp >= xpNeeded) {
        const newLevel = currentLevel + 1;
        db.set(`guild_${guildId}_level_${userId}`, newLevel);

        const levelChannelId = db.get(`levelchannel_${guildId}`);
        const channel = message.guild.channels.cache.get(levelChannelId) || message.channel;

        const levelMsg = db.get(`defaultLevelmessage_${guildId}`) || client.config.defaultLevelmessage || "**{user}** vient de passer au niveau **{level}** !";

        const msgContent = levelMsg
            .replace("{user}", message.author)
            .replace("{user:username}", message.author.username)
            .replace("{user:tag}", message.author.tag)
            .replace("{level}", newLevel)
            .replace("{xp}", currentXp);

        channel.send(msgContent).catch(() => { });
    }
};