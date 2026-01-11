const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");

module.exports = {
    name: 'derank',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm) {
            message.member.roles.cache.forEach(role => {
                if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            });
        }
        if (!perm) return message.reply("Vous n'avez pas la permission de derank.");

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) return message.reply("Utilisateur introuvable.");

        // Sécurités
        const isTargetOwner = client.config.owner.includes(user.id) || db.get(`ownermd_${client.user.id}_${user.id}`) === true;
        if (isTargetOwner) return message.reply("Impossible de derank un Owner.");

        if (user.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("Je ne peux pas derank ce membre (ses rôles sont plus hauts que les miens).");
        }

        try {
            await user.roles.set([], `Derank par ${message.author.tag}`);
            message.channel.send(`${user} a été **derank**.`);

            const logChannel = message.guild.channels.cache.get(db.get(`logmod_${message.guild.id}`));
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.color)
                    .setDescription(`${message.author} a **derank** ${user}`);
                logChannel.send({ embeds: [embed] });
            }
        } catch (e) {
            message.channel.send("Erreur lors du derank.");
        }
    }
};