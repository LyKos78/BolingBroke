const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");
const GoogleImages = require('images-scraper');

const google = new GoogleImages({
    puppeteer: { headless: true }
});

module.exports = {
    name: 'image',
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        const query = args.join(" ");
        if (!query) return message.reply("Que cherchez-vous ?");

        const msg = await message.channel.send("🔎 Recherche en cours...");

        try {
            const results = await google.scrape(query, 1);
            if (!results || results.length === 0) {
                return msg.edit("Aucune image trouvée.");
            }

            const embed = new EmbedBuilder()
                .setTitle(`Recherche : ${query}`)
                .setColor(config.color)
                .setImage(results[0].url)
                .setFooter({ text: "Google Images" });

            msg.edit({ content: null, embeds: [embed] });

        } catch (e) {
            console.error(e);
            msg.edit("Une erreur est survenue lors de la recherche (Module Scraper Error).");
        }
    }
};