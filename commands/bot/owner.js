const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config.json");

module.exports = {
    name: 'owner',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        if (!client.config.owner.includes(message.author.id)) return;

        if (args[0] === "add") {
            const member = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (!member) return message.reply("Utilisateur introuvable.");

            if (db.get(`ownermd_${client.user.id}_${member.id}`)) return message.reply(`${member.username} est déjà owner.`);

            db.set(`ownermd_${client.user.id}_${member.id}`, true);
            return message.channel.send(`${member.username} est maintenant owner.`);
        }

        if (args[0] === "remove") {
            const member = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (!member) return message.reply("Utilisateur introuvable.");

            if (!db.get(`ownermd_${client.user.id}_${member.id}`)) return message.reply(`${member.username} n'est pas owner.`);

            db.delete(`ownermd_${client.user.id}_${member.id}`);
            return message.channel.send(`${member.username} n'est plus owner.`);
        }

        if (args[0] === "list" || !args[0]) {
            let data = db.all().filter(x => x.ID.startsWith(`ownermd_${client.user.id}`));
            if (data.length === 0) return message.channel.send("Aucun owner configuré (hormis ceux du config.json).");

            let page = 0;
            const itemsPerPage = 10;

            const generateEmbed = (currentPage) => {
                const start = currentPage * itemsPerPage;
                const currentData = data.slice(start, start + itemsPerPage);

                const description = currentData.map((entry, i) => {
                    const userId = entry.ID.split('_')[2];
                    const user = client.users.cache.get(userId);
                    return `${start + i + 1}) ${user ? user.tag : "Inconnu"} (${userId})`;
                }).join("\n");

                return new EmbedBuilder()
                    .setTitle("Liste des Owners")
                    .setColor(client.config.color)
                    .setDescription(description || "Aucune donnée.")
                    .setFooter({ text: `Page ${currentPage + 1}/${Math.ceil(data.length / itemsPerPage)}` });
            };

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Primary)
            );

            const msg = await message.channel.send({ embeds: [generateEmbed(page)], components: [row] });

            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', i => {
                if (i.user.id !== message.author.id) return i.reply({ content: "Pas touche !", ephemeral: true });

                if (i.customId === 'prev') page = page > 0 ? page - 1 : 0;
                if (i.customId === 'next') page = page < Math.ceil(data.length / itemsPerPage) - 1 ? page + 1 : page;

                i.update({ embeds: [generateEmbed(page)] });
            });
        }
    }
};