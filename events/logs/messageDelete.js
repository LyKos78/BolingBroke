const db = require("../../quick.db");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, message) => {

    if (message.partial || (message.author && message.author.bot) || !message.guild) return;

    const guild = message.guild;
    const logChannelId = db.get(`msglog_${guild.id}`);
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) return;

    const color = db.get(`color_${guild.id}`) || client.config.color;

    let attachmentUrl = null;
    if (message.attachments.size > 0) {
        attachmentUrl = message.attachments.first().proxyURL;
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setColor(config.color)
        .setDescription(`**Message supprimé dans** ${message.channel}\n\n${message.content || "*Aucun contenu texte*"}`)
        .setTimestamp();

    if (attachmentUrl) {
        embed.addFields({ name: "Pièce jointe", value: `[Lien de l'image](${attachmentUrl})` });
        embed.setImage(attachmentUrl);
    }

    logChannel.send({ embeds: [embed] }).catch(() => { });
};