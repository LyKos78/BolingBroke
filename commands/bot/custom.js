const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'custom',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        if (args[0] === "add") {

        }

        if (args[0] === "embed") {
            const channelId = args[1];
            const msgId = args[2];

            try {
                const channel = client.channels.cache.get(channelId);
                if (!channel) return message.reply("Salon introuvable.");
                const targetMsg = await channel.messages.fetch(msgId);
                if (!targetMsg || !targetMsg.embeds.length) return message.reply("Message ou Embed introuvable.");

                const embedData = targetMsg.embeds[0].data;
                message.reply("Embed copié !");
            } catch (e) {
                console.error(e);
                message.reply("Erreur lors de la copie.");
            }
        }
    }
};