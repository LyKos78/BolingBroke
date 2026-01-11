const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'server',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        if (args[0] === "leave") {
            const guildId = args[1];
            const guild = client.guilds.cache.get(guildId);
            if (guild) {
                await guild.leave();
                return message.channel.send(`J'ai quitté **${guild.name}**.`);
            }
            return message.reply("Serveur introuvable.");
        }

        const guilds = [...client.guilds.cache.values()];
        let page = 0;
        const itemsPerPage = 10;

        const generateEmbed = (curr) => {
            const start = curr * itemsPerPage;
            const desc = guilds.slice(start, start + itemsPerPage).map((g, i) => {
                return `${start + i + 1}) **${g.name}** (${g.id}) - ${g.memberCount} membres`;
            }).join("\n");

            return new EmbedBuilder()
                .setTitle(`Liste des serveurs (${guilds.length})`)
                .setColor(client.config.color)
                .setDescription(desc || "Vide")
                .setFooter({ text: `Page ${curr + 1}/${Math.ceil(guilds.length / itemsPerPage)}` });
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Secondary)
        );

        const msg = await message.channel.send({ embeds: [generateEmbed(page)], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });
            if (i.customId === 'prev') page = page > 0 ? page - 1 : 0;
            else page = page < Math.ceil(guilds.length / itemsPerPage) - 1 ? page + 1 : page;
            i.update({ embeds: [generateEmbed(page)] });
        });
    }
};