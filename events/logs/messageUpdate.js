const db = require("../../quick.db");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, oldMessage, newMessage) => {
    if (!oldMessage.author || oldMessage.author.bot) return;
    if (!oldMessage.guild) return;

    if (oldMessage.content === newMessage.content) return;

    const guild = oldMessage.guild;
    const logChannelId = db.get(`msglog_${guild.id}`);
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) return;

    const color = db.get(`color_${guild.id}`) || client.config.color;

    const embed = new EmbedBuilder()
        .setAuthor({ name: oldMessage.author.username, iconURL: oldMessage.author.displayAvatarURL({ dynamic: true }) })
        .setColor(config.color)
        .setDescription(`**Message édité dans** ${oldMessage.channel}`)
        .addFields(
            { name: "Avant", value: oldMessage.content || "*Aucun contenu texte (Image/Embed)*" },
            { name: "Après", value: newMessage.content || "*Aucun contenu texte (Image/Embed)*" }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => { });
};