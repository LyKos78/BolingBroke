const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'antiraid',
    aliases: ["secur"],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getEmbed = () => {
            const state = (key) => db.get(key) ? "✅" : "❌";
            const sanction = (key) => db.get(key) || "N/A";

            return new EmbedBuilder()
                .setTitle("Panneau Anti-Raid")
                .setColor(config.color)
                .setDescription(`
**Anti-MassBan:** ${state(`massban_${message.guild.id}`)} (Sanction: ${sanction(`massbansanction_${message.guild.id}`)})
**Anti-Bot:** ${state(`bot_${message.guild.id}`)} (Sanction: ${sanction(`botsanction_${message.guild.id}`)})
**Anti-Link:** ${state(`link_${message.guild.id}`)}
**Anti-Webhook:** ${state(`webhook_${message.guild.id}`)}
**Anti-Update:** ${state(`update_${message.guild.id}`)}
**Anti-Channel (C/D/U):** ${state(`channelscreate_${message.guild.id}`)} / ${state(`channelsdel_${message.guild.id}`)} / ${state(`channelsmod_${message.guild.id}`)}
**Anti-Role (C/D/U/Add):** ${state(`rolescreate_${message.guild.id}`)} / ${state(`rolesdel_${message.guild.id}`)} / ${state(`rolesmod_${message.guild.id}`)} / ${state(`rolesadd_${message.guild.id}`)}
                `)
                .setFooter({ text: "Utilisez le menu pour configurer" });
        };

        const rowBtns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ar_on').setLabel('Tout Activer').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ar_off').setLabel('Tout Désactiver').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ar_max').setLabel('Sécurité Max (Ban)').setStyle(ButtonStyle.Primary)
        );

        const rowSelect = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ar_select')
                .setPlaceholder('Basculer un module (ON/OFF)')
                .addOptions([
                    { label: 'Anti-MassBan', value: 'massban' },
                    { label: 'Anti-Bot', value: 'bot' },
                    { label: 'Anti-Link', value: 'link' },
                    { label: 'Anti-Webhook', value: 'webhook' },
                    { label: 'Anti-Channel', value: 'channel' },
                    { label: 'Anti-Role', value: 'role' }
                ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed()], components: [rowBtns, rowSelect] });
        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Non.", ephemeral: true });

            const guildId = message.guild.id;

            if (i.customId === 'ar_on') {
                ['massban', 'bot', 'link', 'webhook', 'update', 'channelscreate', 'channelsdel', 'channelsmod', 'rolescreate', 'rolesdel', 'rolesmod', 'rolesadd'].forEach(k => db.set(`${k}_${guildId}`, true));
                await i.reply({ content: "Tous les modules activés.", ephemeral: true });
            }
            else if (i.customId === 'ar_off') {
                ['massban', 'bot', 'link', 'webhook', 'update', 'channelscreate', 'channelsdel', 'channelsmod', 'rolescreate', 'rolesdel', 'rolesmod', 'rolesadd'].forEach(k => db.set(`${k}_${guildId}`, false));
                await i.reply({ content: "Tous les modules désactivés.", ephemeral: true });
            }
            else if (i.customId === 'ar_max') {
                ['massbansanction', 'botsanction', 'webhook_sanction', 'updatesanction', 'channelscreatesanction', 'channelsdelsanction', 'channelsmodsanction', 'rolescreatesanction', 'rolesdelsanction', 'rolesmodsanction', 'rolesaddsanction'].forEach(k => db.set(`${k}_${guildId}`, "ban"));
                await i.reply({ content: "Toutes les sanctions réglées sur BAN.", ephemeral: true });
            }

            else if (i.isStringSelectMenu()) {
                const val = i.values[0];
                const toggle = (key) => db.set(`${key}_${guildId}`, !db.get(`${key}_${guildId}`));

                if (val === 'channel') { toggle('channelscreate'); toggle('channelsdel'); toggle('channelsmod'); }
                else if (val === 'role') { toggle('rolescreate'); toggle('rolesdel'); toggle('rolesmod'); toggle('rolesadd'); }
                else { toggle(val); }

                await i.deferUpdate();
            }

            await msg.edit({ embeds: [getEmbed()] });
        });
    }
};