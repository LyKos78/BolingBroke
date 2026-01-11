const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config.json");
module.exports = {
    name: 'blrank',
    aliases: ["blacklistrank"],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        if (args[0] === "add") {
            const member = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (!member) return message.reply("Utilisateur introuvable.");

            if (client.config.owner.includes(member.id)) return message.reply("Impossible de blacklist rank un owner.");

            if (db.get(`blrankmd_${client.user.id}_${member.id}`)) {
                return message.reply(`${member.username} est déjà dans la blacklist rank.`);
            }

            db.set(`blrankmd_${client.user.id}_${member.id}`, true);
            client.guilds.cache.forEach(async g => {
                const m = g.members.cache.get(member.id);
                if (m) {
                    try {
                        await m.roles.set([], "Blacklist Rank detectée");
                    } catch (e) { }
                }
            });

            return message.channel.send(`${member.tag} est maintenant dans la **Blacklist Rank** (Il ne pourra plus avoir de rôles).`);
        }

        if (args[0] === "remove") {
            const member = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (!member) return message.reply("Utilisateur introuvable.");

            if (!db.get(`blrankmd_${client.user.id}_${member.id}`)) {
                return message.reply(`${member.tag} n'est pas dans la blacklist rank.`);
            }

            db.delete(`blrankmd_${client.user.id}_${member.id}`);
            return message.channel.send(`${member.tag} a été retiré de la **Blacklist Rank**.`);
        }

        if (args[0] === "list" || !args[0]) {
            let data = db.all().filter(x => x.ID.startsWith(`blrankmd_${client.user.id}`));

            if (data.length === 0) return message.channel.send("Personne n'est dans la Blacklist Rank.");

            let page = 0;
            const itemsPerPage = 10;
            const maxPages = Math.ceil(data.length / itemsPerPage);

            const generateEmbed = (curr) => {
                const start = curr * itemsPerPage;
                const currentData = data.slice(start, start + itemsPerPage);

                const description = currentData.map((entry, i) => {
                    const userId = entry.ID.split('_')[2];
                    return `${start + i + 1}) <@${userId}> (\`${userId}\`)`;
                }).join("\n");

                return new EmbedBuilder()
                    .setTitle(`Blacklist Rank (${data.length})`)
                    .setColor(config.color)
                    .setDescription(description || "Erreur d'affichage")
                    .setFooter({ text: `Page ${curr + 1}/${maxPages}` });
            };

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Danger)
            );

            const msg = await message.channel.send({ embeds: [generateEmbed(page)], components: [row] });
            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', i => {
                if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

                if (i.customId === 'prev') page = page > 0 ? page - 1 : 0;
                if (i.customId === 'next') page = page < maxPages - 1 ? page + 1 : page;

                i.update({ embeds: [generateEmbed(page)] });
            });

            collector.on('end', () => {
                msg.edit({ components: [] }).catch(() => { });
            });
        }
    }
};