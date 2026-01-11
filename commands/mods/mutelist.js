const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'mutelist',
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isPerm) return;

        let mutedRoleId = db.fetch(`mRole_${message.guild.id}`);
        let muterole = message.guild.roles.cache.get(mutedRoleId);
        if (!muterole) return message.reply("Aucun rôle mute configuré.");

        const mutedMembers = muterole.members.map(m => m);
        if (mutedMembers.length === 0) return message.channel.send("Personne n'est mute.");

        let page = 0;
        const itemsPerPage = 10;

        const generateEmbed = (curr) => {
            const start = curr * itemsPerPage;
            const desc = mutedMembers.slice(start, start + itemsPerPage)
                .map((m, i) => `${start + i + 1}) ${m.user.tag} (${m.id})`)
                .join("\n");

            return new EmbedBuilder()
                .setTitle(`Membres Mutes (${mutedMembers.length})`)
                .setColor(config.color)
                .setDescription(desc)
                .setFooter({ text: `Page ${curr + 1}/${Math.ceil(mutedMembers.length / itemsPerPage)}` });
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
            else page = page < Math.ceil(mutedMembers.length / itemsPerPage) - 1 ? page + 1 : page;
            i.update({ embeds: [generateEmbed(page)] });
        });
    }
};