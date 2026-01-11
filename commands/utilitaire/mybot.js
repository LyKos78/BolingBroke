const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'mybot',
    run: async (client, message, args) => {
        if (!client.config.owner.includes(message.author.id)) return;

        try {
            const response = await fetch(`http://localhost:3030/api/client/${message.author.id}`, {
                headers: { "authorization": "842340361212264468" }
            });

            const json = await response.json();

            if (!json || json.status !== 200 || !json.db) {
                return message.channel.send("Vous n'avez aucun bot ou l'API locale est hors ligne.");
            }

            const description = json.db.map(m => {
                const clientId = m.ID.split("_")[2];
                const clientName = m.ID.split("_")[3];
                const expire = m.ID.split("_")[4];
                return `[${clientName}](https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot) : <t:${Math.floor(expire / 1000)}:R>`;
            }).join("\n");

            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(description || "Aucune donnée.");

            message.channel.send({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            message.channel.send("Erreur de connexion à l'API locale.");
        }
    }
};