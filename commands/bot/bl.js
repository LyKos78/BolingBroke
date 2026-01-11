const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config.json");

module.exports = {
    name: 'blacklist',
    aliases: ["bl"],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        if (args[0] === "add") {
            const member = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (!member) return message.reply("Membre introuvable.");

            if (client.config.owner.includes(member.id)) return message.reply("Impossible de blacklist un owner.");

            db.set(`blrankmd_${client.user.id}_${member.id}`, true);
            client.guilds.cache.forEach(g => {
                const m = g.members.cache.get(member.id);
                if (m) m.ban({ reason: "Blacklist Bot" }).catch(() => { });
            });
            return message.channel.send(`${member.tag} est blacklist.`);
        }

        if (args[0] === "remove") {
            const member = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (!member) return message.reply("Membre introuvable.");
            db.delete(`blrankmd_${client.user.id}_${member.id}`);
            return message.channel.send(`${member.tag} n'est plus blacklist.`);
        }

        if (args[0] === "list") {
            let data = db.all().filter(x => x.ID.startsWith(`blrankmd_${client.user.id}`));
            if (data.length === 0) return message.channel.send("Personne n'est blacklist.");

            let page = 0;
            const itemsPerPage = 10;

            const generateEmbed = (curr) => {
                const start = curr * itemsPerPage;
                const desc = data.slice(start, start + itemsPerPage).map((e, i) => {
                    const uid = e.ID.split('_')[2];
                    return `${start + i + 1}) <@${uid}> (${uid})`;
                }).join("\n");
                return new EmbedBuilder().setTitle("Blacklist").setColor(config.color).setDescription(desc).setFooter({ text: `Page ${curr + 1}` });
            };

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Danger)
            );

            const msg = await message.channel.send({ embeds: [generateEmbed(page)], components: [row] });
            const col = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
            col.on('collect', i => {
                if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });
                if (i.customId === 'prev') page = page > 0 ? page - 1 : 0;
                else page = page < Math.ceil(data.length / itemsPerPage) - 1 ? page + 1 : page;
                i.update({ embeds: [generateEmbed(page)] });
            });
        }
    }
};