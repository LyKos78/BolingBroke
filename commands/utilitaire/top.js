const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'top',
    aliases: ["leaderboard"],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        let type = "xp";
        let title = "Classement XP";

        if (args[0] === "invite" || args[0] === "invites") {
            type = "invite";
            title = "Classement Invitations";
        }

        const allData = db.all();
        let data = [];

        if (type === "xp") {
            data = allData.filter(d => d.ID.startsWith(`guild_${message.guild.id}_xp_`))
                .sort((a, b) => b.data - a.data);
        } else {
            data = allData.filter(d => d.ID.startsWith(`invites_${message.guild.id}_`))
                .sort((a, b) => b.data - a.data);
        }

        if (data.length === 0) return message.channel.send("Aucune donnée pour le moment.");

        let page = 0;
        const itemsPerPage = 10;
        const maxPages = Math.ceil(data.length / itemsPerPage);

        const generateEmbed = (currPage) => {
            const start = currPage * itemsPerPage;
            const currentData = data.slice(start, start + itemsPerPage);

            const description = currentData.map((entry, i) => {
                const parts = entry.ID.split('_');
                const userId = parts[parts.length - 1];
                const value = entry.data;
                return `${start + i + 1}) <@${userId}> : **${value}** ${type === "xp" ? "XP" : "Invites"}`;
            }).join("\n");

            return new EmbedBuilder()
                .setTitle(`${title} (${data.length} membres)`)
                .setColor(config.color)
                .setDescription(description || "Vide")
                .setFooter({ text: `Page ${currPage + 1}/${maxPages}` });
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Primary)
        );

        const msg = await message.channel.send({ embeds: [generateEmbed(page)], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            if (i.customId === 'prev') page = page > 0 ? page - 1 : 0;
            else if (i.customId === 'next') page = page < maxPages - 1 ? page + 1 : page;

            await i.update({ embeds: [generateEmbed(page)] });
        });
    }
};