const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'ping',
    aliases: ["speed", "latence"],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        const msg = await message.channel.send("Calcul en cours...");

        const latency = msg.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const embed = new EmbedBuilder()
            .setTitle("🏓 Pong !")
            .setColor(config.color)
            .addFields(
                { name: "Latence Bot", value: `${latency}ms`, inline: true },
                { name: "Latence API", value: `${apiLatency}ms`, inline: true }
            );

        await msg.edit({ content: null, embeds: [embed] });
    }
};