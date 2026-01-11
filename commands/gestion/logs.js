const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'logs',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const getEmbed = () => {
            const modLog = db.get(`logmod_${message.guild.id}`);
            const msgLog = db.get(`msglog_${message.guild.id}`);
            const vcLog = db.get(`logvc_${message.guild.id}`);

            return new EmbedBuilder()
                .setTitle("Configuration des Logs")
                .setColor(config.color)
                .setDescription("Sélectionnez le type de logs à configurer via le menu ci-dessous.")
                .addFields(
                    { 
                        name: "🛡️ Logs Modération", 
                        value: modLog ? `<#${modLog}>` : "❌ *Non défini*", 
                        inline: true 
                    },
                    { 
                        name: "💬 Logs Messages", 
                        value: msgLog ? `<#${msgLog}>` : "❌ *Non défini*", 
                        inline: true 
                    },
                    { 
                        name: "🔊 Logs Vocaux", 
                        value: vcLog ? `<#${vcLog}>` : "❌ *Non défini*", 
                        inline: true 
                    }
                )
                .setFooter({ text: "Tapez 'off' quand le bot vous demande un salon pour désactiver un module." });
        };

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('logs_select')
                .setPlaceholder('Choisir un module de logs')
                .addOptions([
                    {
                        label: 'Logs Modération',
                        description: 'Ban, Kick, Mute...',
                        value: 'logmod',
                        emoji: '🛡️'
                    },
                    {
                        label: 'Logs Messages',
                        description: 'Messages supprimés/modifiés',
                        value: 'msglog',
                        emoji: '💬'
                    },
                    {
                        label: 'Logs Vocaux',
                        description: 'Connexion, Déconnexion, Move',
                        value: 'logvc',
                        emoji: '🔊'
                    },
                    {
                        label: 'Tout Désactiver',
                        description: 'Réinitialiser tous les logs',
                        value: 'reset_all',
                        emoji: '🗑️'
                    }
                ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed()], components: [row] });

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: "Vous ne pouvez pas utiliser ce menu.", ephemeral: true });
            }

            const choice = i.values[0];

            if (choice === 'reset_all') {
                db.delete(`logmod_${message.guild.id}`);
                db.delete(`msglog_${message.guild.id}`);
                db.delete(`logvc_${message.guild.id}`);
                await i.update({ embeds: [getEmbed()], components: [row] });
                return;
            }

            await i.reply({ content: `Quel salon souhaitez-vous utiliser pour **${choice}** ? (Mentionnez-le ou tapez \`off\` pour désactiver).`, ephemeral: true });

            const filter = m => m.author.id === message.author.id;
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
            const responseMsg = collected.first();

            if (responseMsg) {
                responseMsg.delete().catch(() => {});

                if (responseMsg.content.toLowerCase() === "off") {
                    db.delete(`${choice}_${message.guild.id}`);
                    i.deleteReply().catch(() => {});
                } else {
                    const channel = responseMsg.mentions.channels.first() || message.guild.channels.cache.get(responseMsg.content);
                    
                    if (channel && channel.isTextBased()) {
                        db.set(`${choice}_${message.guild.id}`, channel.id);
                        i.deleteReply().catch(() => {});
                    } else {
                        i.editReply({ content: "❌ Salon invalide. Configuration annulée." });
                    }
                }
            } else {
                i.deleteReply().catch(() => {});
            }

            await msg.edit({ embeds: [getEmbed()] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                row.components[0].setDisabled(true)
            );
            msg.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};