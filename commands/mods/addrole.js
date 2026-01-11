const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");

module.exports = {
    name: 'addrole',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm) {
            message.member.roles.cache.forEach(role => {
                if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            });
        }
        if (!perm && !message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return;

        const rMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        if (!rMember || !role) return message.reply(`Usage: \`${prefix}addrole <user> <role>\``);

        const isOwnerBot = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;

        if (!isOwnerBot) {
            const dangerous = [
                PermissionFlagsBits.Administrator,
                PermissionFlagsBits.ManageGuild,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ManageWebhooks,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.BanMembers,
                PermissionFlagsBits.KickMembers,
                PermissionFlagsBits.MentionEveryone
            ];

            if (role.permissions.has(dangerous)) {
                return message.channel.send("Ce rôle contient des permissions dangereuses, vous ne pouvez pas l'ajouter.");
            }
        }

        if (message.guild.members.me.roles.highest.position <= role.position) {
            return message.channel.send("Je ne peux pas ajouter ce rôle (il est au-dessus de moi).");
        }

        try {
            if (rMember.roles.cache.has(role.id)) {
                return message.channel.send(`Ce membre a déjà le rôle ${role.name}.`);
            }

            await rMember.roles.add(role.id);
            message.channel.send(`Rôle ${role.name} ajouté à ${rMember.user.tag}.`);

            const logChannel = message.guild.channels.cache.get(db.get(`logmod_${message.guild.id}`));
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setDescription(`${message.author} a ajouté le rôle ${role} à ${rMember}`);
                logChannel.send({ embeds: [embed] });
            }

        } catch (e) {
            message.channel.send("Erreur lors de l'ajout du rôle.");
        }
    }
};