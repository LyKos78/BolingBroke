const { AttachmentBuilder } = require('discord.js');
const canvacord = require("canvacord");
const db = require("../../quick.db");

module.exports = {
  name: 'rank',
  aliases: ['level'],
  run: async (client, message, args, prefix, color) => {
    const isPerm = client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
      db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
    if (!isPerm) return;

    const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
    const member = message.guild.members.cache.get(user.id);

    const xp = db.get(`guild_${message.guild.id}_xp_${user.id}`) || 0;
    const level = db.get(`guild_${message.guild.id}_level_${user.id}`) || 0;
    const requiredXp = (level + 1) * 500;

    const rank = new canvacord.Rank()
      .setAvatar(user.displayAvatarURL({ extension: 'png', forceStatic: true }))
      .setCurrentXP(xp)
      .setRequiredXP(requiredXp)
      .setStatus(member.presence ? member.presence.status : 'offline')
      .setProgressBar(color === "random" ? "#FFFFFF" : color, "COLOR")
      .setUsername(user.username)
      .setDiscriminator(user.discriminator)
      .setLevel(level)
      .setRank(0, "Rang", false)
      .setBackground("IMAGE", "https://i.imgur.com/8QZ7X9A.png");

    rank.build()
      .then(data => {
        const attachment = new AttachmentBuilder(data, { name: "rank.png" });
        message.channel.send({ files: [attachment] });
      })
      .catch(err => {
        console.error(err);
        message.channel.send("Erreur lors de la génération de l'image.");
      });
  }
};