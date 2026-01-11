const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionFlagsBits } = require('discord.js');
const db = require("../../quick.db");
const random_string = require("randomstring");

module.exports = {
    name: 'warn',
    aliases: ["sanctions"],
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm) {
            message.member.roles.cache.forEach(role => {
                if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            });
        }
        if (!perm && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;

        const user = message.mentions.users.first() || client.users.cache.get(args[1]);
        const type = args[0];

        if (type === "add") {
            if (!user) return message.reply("Utilisateur introuvable.");
            const reason = args.slice(2).join(" ") || "Aucune raison";
            const warnID = random_string.generate({ charset: 'numeric', length: 4 });

            db.push(`info.${message.guild.id}.${user.id}`, {
                moderator: message.author.tag,
                reason: reason,
                date: Date.now(),
                id: warnID
            });
            db.add(`number.${message.guild.id}.${user.id}`, 1);

            message.channel.send(`${user} a été warn pour **${reason}** (ID: ${warnID})`);
        }

        else if (type === "list") {
            if (!user) return message.reply("Utilisateur introuvable.");
            let warns = db.get(`info.${message.guild.id}.${user.id}`) || [];
            if (warns.length === 0) return message.channel.send("Ce membre n'a aucune sanction.");

            let page = 0;
            const itemsPerPage = 5;

            const generateEmbed = (curr) => {
                const start = curr * itemsPerPage;
                const desc = warns.slice(start, start + itemsPerPage).map((w, i) =>
                    `**${start + i + 1}) ID: ${w.id}**\nMod: ${w.moderator}\nRaison: ${w.reason}\nDate: <t:${Math.floor(w.date / 1000)}:R>`
                ).join("\n\n");

                return new EmbedBuilder()
                    .setTitle(`Sanctions de ${user.tag}`)
                    .setColor(config.color)
                    .setDescription(desc)
                    .setFooter({ text: `Page ${curr + 1}/${Math.ceil(warns.length / itemsPerPage)}` });
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
                else page = page < Math.ceil(warns.length / itemsPerPage) - 1 ? page + 1 : page;
                i.update({ embeds: [generateEmbed(page)] });
            });
        }

        else if (type === "clear") {
            if (!user) return message.reply("Utilisateur introuvable.");
            db.delete(`info.${message.guild.id}.${user.id}`);
            db.delete(`number.${message.guild.id}.${user.id}`);
            message.channel.send(`Toutes les sanctions de ${user} ont été supprimées.`);
        }

        else {
            message.reply(`Usage: \`${prefix}warn <add/list/clear> <user> [raison]\``);
        }
    }
};