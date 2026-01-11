const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'roleinfo',
    aliases: ['role'],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply("Veuillez mentionner un rôle ou donner son ID.");

        // Vérification des permissions clés
        const perms = [];
        if (role.permissions.has(PermissionFlagsBits.Administrator)) perms.push("Administrateur");
        if (role.permissions.has(PermissionFlagsBits.BanMembers)) perms.push("Bannir");
        if (role.permissions.has(PermissionFlagsBits.KickMembers)) perms.push("Expulser");
        if (role.permissions.has(PermissionFlagsBits.ManageChannels)) perms.push("Gérer Salons");
        if (role.permissions.has(PermissionFlagsBits.ManageGuild)) perms.push("Gérer Serveur");
        if (role.permissions.has(PermissionFlagsBits.ManageMessages)) perms.push("Gérer Messages");
        if (role.permissions.has(PermissionFlagsBits.MentionEveryone)) perms.push("Mention @everyone");

        const embed = new EmbedBuilder()
            .setTitle(`Info Rôle : ${role.name}`)
            .setColor(role.hexColor)
            .addFields(
                { name: "🆔 ID", value: role.id, inline: true },
                { name: "🎨 Couleur", value: role.hexColor, inline: true },
                { name: "👥 Membres", value: `${role.members.size}`, inline: true },
                { name: "🔝 Position", value: `${role.position}`, inline: true },
                { name: "🔔 Mentionable", value: role.mentionable ? "Oui" : "Non", inline: true },
                { name: "🔑 Permissions Clés", value: perms.join(", ") || "Aucune permission dangereuse", inline: false }
            )
            .setFooter({ text: `Créé le ${role.createdAt.toLocaleDateString()}` });

        message.channel.send({ embeds: [embed] });
    }
};