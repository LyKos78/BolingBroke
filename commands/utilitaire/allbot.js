const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'allbot',
    aliases: ['bots'],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`);
        if (!isPerm) return;

        await message.guild.members.fetch();

        const list = message.guild.members.cache.filter(m => m.user.bot);

        if (list.size === 0) return message.channel.send("Aucun bot trouvé (Bizarre...).");

        const arrayList = Array.from(list.values());
        let page = 0;
        const itemsPerPage = 10;
        const maxPages = Math.ceil(list.size / itemsPerPage);

        const generateEmbed = (curr) => {
            const start = curr * itemsPerPage;
            const desc = arrayList.slice(start, start + itemsPerPage)
                .map((m, i) => `${start + i + 1}) **${m.user.tag}** (${m.id})`)
                .join("\n");

            return new EmbedBuilder()
                .setTitle(`Bots du serveur (${list.size})`)
                .setColor(client.config.color)
                .setDescription(desc || "Erreur")
                .setFooter({ text: `Page ${curr + 1}/${maxPages}` });
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Primary)
        );

        const msg = await message.channel.send({ embeds: [generateEmbed(page)], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            if (i.customId === 'prev') page = page > 0 ? page - 1 : 0;
            if (i.customId === 'next') page = page < maxPages - 1 ? page + 1 : page;

            i.update({ embeds: [generateEmbed(page)] });
        });
    }
};