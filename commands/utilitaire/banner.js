const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'banner',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);

        if (!isPerm) return;

        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;

        try {
            const fetchedUser = await client.users.fetch(user.id, { force: true });
            const banner = fetchedUser.bannerURL({ dynamic: true, size: 4096 });

            if (banner) {
                const embed = new EmbedBuilder()
                    .setTitle(`Bannière de ${fetchedUser.username}`)
                    .setColor(config.color)
                    .setImage(banner);
                message.channel.send({ embeds: [embed] });
            } else {
                message.reply("Cet utilisateur n'a pas de bannière.");
            }
        } catch (e) {
            console.error(e);
            message.reply("Impossible de récupérer la bannière.");
        }
    }
};