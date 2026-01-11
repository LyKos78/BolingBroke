const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'banlist',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm) {
            message.member.roles.cache.forEach(role => {
                if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            });
        }
        if (!perm) return;

        try {
            const bans = await message.guild.bans.fetch();
            if (bans.size === 0) return message.channel.send("Aucun membre n'est banni sur ce serveur.");

            const banArray = Array.from(bans.values());

            let page = 0;
            const itemsPerPage = 10;

            const generateEmbed = (curr) => {
                const start = curr * itemsPerPage;
                const desc = banArray.slice(start, start + itemsPerPage)
                    .map((ban, i) => `${start + i + 1}) **${ban.user.tag}** (${ban.user.id})\nRaison: ${ban.reason || "Aucune"}`)
                    .join("\n\n");

                return new EmbedBuilder()
                    .setTitle(`Liste des bannis (${bans.size})`)
                    .setColor(config.color)
                    .setDescription(desc || "Aucune donnée")
                    .setFooter({ text: `Page ${curr + 1}/${Math.ceil(bans.size / itemsPerPage)}` });
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
                else page = page < Math.ceil(bans.size / itemsPerPage) - 1 ? page + 1 : page;

                i.update({ embeds: [generateEmbed(page)] });
            });

        } catch (e) {
            message.channel.send("Erreur lors de la récupération des bans.");
        }
    }
};