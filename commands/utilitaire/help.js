const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

const config = require("../../config.json");

module.exports = {
    name: 'help',
    aliases: ["h"],
    run: async (client, message, args, prefix, color) => {
        const categories = {
            utilitaire: {
                label: 'Utilitaire',
                emoji: '🛠️',
                description: 'Commandes publiques et outils',
                cmds: [
                    `\`${prefix}banner [user]\` : Affiche la bannière`,
                    `\`${prefix}calc <calcul>\` : Calculatrice`,
                    `\`${prefix}image <recherche>\` : Recherche d'images`,
                    `\`${prefix}invite [user]\` : Voir les invitations`,
                    `\`${prefix}pic [user]\` : Affiche l'avatar`,
                    `\`${prefix}channelinfo [salon]\` : Infos salon`,
                    `\`${prefix}serverinfo\` : Infos serveur`,
                    `\`${prefix}userinfo [user]\` : Infos utilisateur`,
                    `\`${prefix}snipe\` : Dernier message supprimé`,
                    `\`${prefix}allbot / alladmin\` : Listes`
                ]
            },
            moderation: {
                label: 'Modération',
                emoji: '🛡️',
                description: 'Commandes de sanction et gestion',
                cmds: [
                    `\`${prefix}ban <user>\` : Bannir`,
                    `\`${prefix}kick <user>\` : Expulser`,
                    `\`${prefix}mute <user>\` : Rendre muet`,
                    `\`${prefix}unmute <user>\` : Rendre la parole`,
                    `\`${prefix}clear <nombre>\` : Supprimer des messages`,
                    `\`${prefix}lock / unlock\` : Verrouiller un salon`,
                    `\`${prefix}derank <user>\` : Retirer les rôles`,
                    `\`${prefix}warn <add/list>\` : Avertissements`
                ]
            },
            gestion: {
                label: 'Gestion',
                emoji: '⚙️',
                description: 'Configuration du bot',
                cmds: [
                    `\`${prefix}antiraid\` : Panel de sécurité`,
                    `\`${prefix}logs\` : Configurer les logs`,
                    `\`${prefix}welcome\` : Configurer les arrivées`,
                    `\`${prefix}leave\` : Configurer les départs`,
                    `\`${prefix}counter\` : Compteurs de stats`,
                    `\`${prefix}perm set <role>\` : Gestion permissions bot`,
                    `\`${prefix}wl / owner / bl\` : Gestion listes`
                ]
            }
        };

        const getEmbed = (categoryKey) => {
            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Menu d'aide - ${client.user.username}`)
                .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            if (!categoryKey) {
                embed.setDescription(`👋 Bonjour **${message.author.username}**,\n\nUtilisez le menu ci-dessous pour explorer les commandes.\nMon préfixe actuel est : \`${prefix}\``);
            } else {
                const cat = categories[categoryKey];
                embed.setTitle(`${cat.emoji} ${cat.label}`)
                    .setDescription(cat.cmds.join('\n'));
            }
            return embed;
        };

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder('Choisir une catégorie')
                .addOptions([
                    { label: 'Accueil', value: 'home', emoji: '🏠' },
                    { label: 'Utilitaire', value: 'utilitaire', emoji: '🛠️' },
                    { label: 'Modération', value: 'moderation', emoji: '🛡️' },
                    { label: 'Gestion', value: 'gestion', emoji: '⚙️' }
                ])
        );

        const msg = await message.channel.send({ embeds: [getEmbed(null)], components: [row] });

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Ce menu n'est pas pour vous.", ephemeral: true });

            const val = i.values[0];
            await i.update({ embeds: [getEmbed(val === 'home' ? null : val)] });
        });
    }
};