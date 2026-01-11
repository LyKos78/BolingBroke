const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
  name: 'snipe',
  aliases: [],
  run: async (client, message, args, prefix, color) => {
    const isPerm = client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
      db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
    if (!isPerm) return;

    const msg = client.snipes.get(message.channel.id);
    if (!msg) return message.channel.send("Aucun message supprimé récemment.");

    const embed = new EmbedBuilder()
      .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
      .setDescription(msg.content || "Image/Embed uniquement")
      .setColor(config.color)
      .setFooter({ text: `Supprimé il y a ${Math.floor((Date.now() - msg.timestamp) / 1000)}s` });

    if (msg.image) embed.setImage(msg.image);

    message.channel.send({ embeds: [embed] });
  }
};