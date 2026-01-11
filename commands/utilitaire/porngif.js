const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");
const axios = require('axios');

module.exports = {
  name: 'porngif',
  aliases: ["pgif"],
  run: async (client, message, args, prefix, color) => {
    const isPerm = client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`);

    if (!isPerm) return;

    if (!message.channel.nsfw) {
      return message.reply("❌ Cette commande ne peut être utilisée que dans un salon NSFW (🔞).");
    }

    const type = args[0] || "pgif";
    const validTypes = ["pgif", "4k", "hentai", "pussy", "boobs"];
    if (!validTypes.includes(type)) {
      return message.reply(`Type invalide. Types dispo: \`${validTypes.join(", ")}\``);
    }

    try {
      const res = await axios.get(`https://nekobot.xyz/api/image?type=${type}`);
      const imageUrl = res.data.message;

      const embed = new EmbedBuilder()
        .setTitle(`Image : ${type}`)
        .setColor(config.color)
        .setImage(imageUrl)
        .setFooter({ text: "Nekobot API" });

      message.channel.send({ embeds: [embed] });

    } catch (e) {
      console.error(e);
      message.channel.send("Erreur lors de la récupération de l'image.");
    }
  }
};