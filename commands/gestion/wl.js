const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'whitelist',
    aliases: ["wl"],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        if (args[0] === "add") {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (!member) return message.reply("Membre introuvable.");

            db.set(`wlmd_${message.guild.id}_${member.id}`, true);
            return message.channel.send(`${member.user.tag} est maintenant whitelist sur ce serveur.`);
        }

        if (args[0] === "remove") {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (!member) return message.reply("Membre introuvable.");

            db.delete(`wlmd_${message.guild.id}_${member.id}`);
            return message.channel.send(`${member.user.tag} n'est plus whitelist.`);
        }

        let data = db.all().filter(x => x.ID.startsWith(`wlmd_${message.guild.id}`));
        if (data.length === 0) return message.channel.send("Aucune whitelist sur ce serveur.");

        let page = 0;
        const itemsPerPage = 10;

        const generateEmbed = (curr) => {
            const start = curr * itemsPerPage;
            const desc = data.slice(start, start + itemsPerPage).map((entry, i) => {
                const userId = entry.ID.split('_')[2];
                const user = client.users.cache.get(userId);
                return `${start + i + 1}) ${user ? user.tag : "Inconnu"} (${userId})`;
            }).join("\n");

            return new EmbedBuilder()
                .setTitle("Liste Whitelist Serveur")
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