const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'reward',
    aliases: ["rewardrole"],
    run: async (client, message, args, prefix, color) => {

        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        if (args[0] === "add") {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
            const invites = parseInt(args[2]);
            if (!role || isNaN(invites)) return message.reply("Usage: `reward add <@role> <invites>`");

            db.set(`reward_${message.guild.id}_${invites}`, role.id);
            return message.channel.send(`Rôle ${role.name} ajouté pour ${invites} invitations.`);
        }

        let data = db.all().filter(x => x.ID.startsWith(`reward_${message.guild.id}`));
        if (data.length === 0) return message.channel.send("Aucun reward configuré.");

        data.sort((a, b) => parseInt(a.ID.split('_')[2]) - parseInt(b.ID.split('_')[2]));

        let page = 0;
        const itemsPerPage = 10;

        const generateEmbed = (curr) => {
            const start = curr * itemsPerPage;
            const desc = data.slice(start, start + itemsPerPage).map((entry, i) => {
                const invites = entry.ID.split('_')[2];
                const roleId = entry.data;
                return `${start + i + 1}) **${invites} invites** : <@&${roleId}>`;
            }).join("\n");

            return new EmbedBuilder()
                .setTitle("Récompenses d'invitations")
                .setColor(config.color)
                .setDescription(desc)
                .setFooter({ text: `Page ${curr + 1}/${Math.ceil(data.length / itemsPerPage)}` });
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
            else page = page < Math.ceil(data.length / itemsPerPage) - 1 ? page + 1 : page;
            i.update({ embeds: [generateEmbed(page)] });
        });
    }
};