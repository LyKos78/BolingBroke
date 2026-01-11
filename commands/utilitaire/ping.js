const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'ping',
    aliases: ["speed", "latence"],
    run: async (client, message, args, prefix, color) => {
        // Vérification des permissions (Owner, Whitelist ou Salon Public)
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) === true ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true;

        // Si tu veux que la commande soit pour tout le monde, supprime ces 2 lignes :
        if (!isPerm) return;

        const msg = await message.channel.send("Calcul en cours...");

        const latency = msg.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const embed = new EmbedBuilder()
            .setTitle("🏓 Pong !")
            .setColor(client.config.color) // On utilise la config du client directement
            .addFields(
                { name: "Latence Bot", value: `${latency}ms`, inline: true },
                { name: "Latence API", value: `${apiLatency}ms`, inline: true }
            );

        await msg.edit({ content: null, embeds: [embed] });
    }
};