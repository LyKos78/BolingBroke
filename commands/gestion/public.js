const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'public',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const subCmd = args[0];

        if (subCmd === "add") {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            
            if (!channel) return message.reply("Veuillez mentionner un salon ou donner son ID.");

            if (db.get(`channelpublic_${message.guild.id}_${channel.id}`) === true) {
                return message.reply(`Les commandes publiques sont déjà activées dans ${channel}.`);
            }

            db.set(`channelpublic_${message.guild.id}_${channel.id}`, true);
            return message.channel.send(`✅ Les commandes publiques sont maintenant **activées** dans ${channel}.`);
        }

        else if (subCmd === "remove") {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            
            if (!channel) return message.reply("Veuillez mentionner un salon ou donner son ID.");

            if (db.get(`channelpublic_${message.guild.id}_${channel.id}`) === null) {
                return message.reply(`Les commandes publiques ne sont pas activées dans ${channel}.`);
            }

            db.delete(`channelpublic_${message.guild.id}_${channel.id}`);
            return message.channel.send(`❌ Les commandes publiques sont maintenant **désactivées** dans ${channel}.`);
        }

        else if (subCmd === "list") {
            const allData = db.all(); 
            const publicChannels = allData.filter(data => data.ID.startsWith(`channelpublic_${message.guild.id}`));

            if (publicChannels.length === 0) {
                return message.channel.send("Aucun salon public configuré sur ce serveur.");
            }

            let page = 0;
            const itemsPerPage = 10;
            const maxPages = Math.ceil(publicChannels.length / itemsPerPage);

            const generateEmbed = (currPage) => {
                const start = currPage * itemsPerPage;
                const currentData = publicChannels.slice(start, start + itemsPerPage);

                const description = currentData.map((entry, i) => {
                    const channelId = entry.ID.split('_')[2];
                    const channel = message.guild.channels.cache.get(channelId);
                    return `${start + i + 1}) ${channel ? channel : "Salon introuvable"} (\`${channelId}\`)`;
                }).join("\n");

                return new EmbedBuilder()
                    .setTitle(`Salons Publics (${publicChannels.length})`)
                    .setColor(client.config.color)
                    .setDescription(description || "Aucune donnée.")
                    .setFooter({ text: `Page ${currPage + 1}/${maxPages} • ${client.config.name}` });
            };

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Primary)
            );

            const msg = await message.channel.send({ embeds: [generateEmbed(page)], components: [row] });

            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== message.author.id) return i.reply({ content: "Vous ne pouvez pas utiliser ces boutons.", ephemeral: true });

                if (i.customId === 'prev') {
                    page = page > 0 ? page - 1 : 0;
                } else if (i.customId === 'next') {
                    page = page < maxPages - 1 ? page + 1 : page;
                }

                await i.update({ embeds: [generateEmbed(page)] });
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Primary).setDisabled(true),
                    new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Primary).setDisabled(true)
                );
                msg.edit({ components: [disabledRow] }).catch(() => {});
            });
        } 
        
        else {
            return message.reply("Usage: `public <add/remove/list> <#salon>`");
        }
    }
};