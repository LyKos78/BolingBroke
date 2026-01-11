const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'soutien',
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getEmbed = () => {
            const roleId = db.get(`rolesupp_${message.guild.id}`);
            const status = db.get(`txtsupp_${message.guild.id}`);
            return new EmbedBuilder()
                .setTitle("Configuration Soutien")
                .setColor(client.config.color)
                .addFields(
                    { name: "Rôle", value: roleId ? `<@&${roleId}>` : "Non défini", inline: true },
                    { name: "Statut à avoir", value: status ? `\`${status}\`` : "Non défini", inline: true }
                );
        };

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('soutien_menu')
                .setPlaceholder('Modifier la configuration')
                .addOptions([
                    { label: 'Définir le Rôle', value: 'role', emoji: '🏷️' },
                    { label: 'Définir le Statut', value: 'status', emoji: '📝' },
                    { label: 'Reset', value: 'reset', emoji: '🗑️' },
                ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed()], components: [row] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            if (i.values[0] === 'role') {
                await i.reply({ content: "Mentionnez le rôle ou donnez son ID.", ephemeral: true });
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
                if (collected.first()) {
                    const role = collected.first().mentions.roles.first() || message.guild.roles.cache.get(collected.first().content);
                    if (role) db.set(`rolesupp_${message.guild.id}`, role.id);
                    collected.first().delete().catch(() => { });
                    i.deleteReply().catch(() => { });
                }
            }

            if (i.values[0] === 'status') {
                await i.reply({ content: "Quel est le texte du statut ?", ephemeral: true });
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
                if (collected.first()) {
                    db.set(`txtsupp_${message.guild.id}`, collected.first().content);
                    collected.first().delete().catch(() => { });
                    i.deleteReply().catch(() => { });
                }
            }

            if (i.values[0] === 'reset') {
                db.delete(`rolesupp_${message.guild.id}`);
                db.delete(`txtsupp_${message.guild.id}`);
                await i.deferUpdate();
            }

            await msg.edit({ embeds: [getEmbed()] });
        });
    }
};