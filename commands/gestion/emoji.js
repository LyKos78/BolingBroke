const { parseEmoji } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
  name: 'emoji',
  run: async (client, message, args) => {
    const isPerm = client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
      message.member.permissions.has("ManageEmojisAndStickers");
    if (!isPerm) return;

    if (args[0] === "add") {
      const emojiStr = args[1];
      if (!emojiStr) return message.reply("Veuillez fournir un émoji.");

      const parsed = parseEmoji(emojiStr);
      if (!parsed || !parsed.id) return message.reply("Emoji invalide ou introuvable (doit être un émoji personnalisé).");

      const extension = parsed.animated ? ".gif" : ".png";
      const url = `https://cdn.discordapp.com/emojis/${parsed.id}${extension}`;
      const name = args[2] || parsed.name;

      try {
        const created = await message.guild.emojis.create({ attachment: url, name: name });
        message.channel.send(`Emoji créé : ${created}`);
      } catch (e) {
        console.log(e);
        message.channel.send("Erreur : Impossible de créer l'émoji (Limite atteinte ou permissions manquantes).");
      }
    }

    else if (args[0] === "remove") {
      const emojiStr = args[1];
      const parsed = parseEmoji(emojiStr);
      const emoji = message.guild.emojis.cache.get(parsed ? parsed.id : null) || message.guild.emojis.cache.find(e => e.name === emojiStr);

      if (!emoji) return message.reply("Emoji introuvable sur ce serveur.");

      try {
        await emoji.delete();
        message.channel.send("Emoji supprimé.");
      } catch (e) {
        message.channel.send("Erreur lors de la suppression.");
      }
    }
  }
};