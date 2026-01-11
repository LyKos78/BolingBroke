const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");
const ms = require("ms");

module.exports = {
    name: 'ban',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm) {
            message.member.roles.cache.forEach(role => {
                if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            });
        }
        if (!perm && !message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;

        const user = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!user) return message.reply(`Aucun membre trouvé pour \`${args[0] || " "}\``);

        if (user.id === message.author.id) return message.reply("Vous ne pouvez pas vous bannir vous-même.");
        if (!user.bannable) return message.reply("Je ne peux pas bannir ce membre (Rôle supérieur ou égal au mien).");

        const duration = args[1] ? ms(args[1]) : null;
        let reason;

        if (duration) {
            reason = args.slice(2).join(" ") || "Sans raison (Tempban)";
        } else {
            reason = args.slice(1).join(" ") || "Sans raison";
        }

        try {
            await user.send(`Vous avez été **banni** de ${message.guild.name} pour : ${reason}`).catch(() => { });

            await user.ban({
                reason: `Ban par ${message.author.tag}: ${reason}`,
                deleteMessageSeconds: 604800
            });

            message.channel.send(`${user.user.tag} a été **ban** ${duration ? `pendant ${args[1]}` : "définitivement"}.`);

            if (duration) {
                setTimeout(async () => {
                    await message.guild.members.unban(user.id, "Fin du Tempban").catch(() => { });
                }, duration);
            }

            const logChannel = message.guild.channels.cache.get(db.get(`logmod_${message.guild.id}`));
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setDescription(`${message.author} a **ban** ${user.user.tag}\nRaison: ${reason}\nDurée: ${duration ? args[1] : "Définitif"}`)
                    .setTimestamp();
                logChannel.send({ embeds: [embed] });
            }

        } catch (e) {
            console.error(e);
            message.channel.send("Une erreur est survenue lors du bannissement.");
        }
    }
};