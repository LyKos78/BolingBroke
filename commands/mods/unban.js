const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'unban',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm) {
            message.member.roles.cache.forEach(role => {
                if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            });
        }
        if (!perm && !message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;

        if (args[0] === "all") {
            try {
                const bans = await message.guild.bans.fetch();
                if (bans.size === 0) return message.channel.send("Aucun membre banni.");

                message.channel.send(`Débannissement de ${bans.size} membres en cours...`);
                bans.forEach(ban => message.guild.members.unban(ban.user.id, `Unban All par ${message.author.tag}`).catch(() => { }));
                return message.channel.send("Tout le monde a été débanni (ou est en cours).");
            } catch (e) { return message.channel.send("Erreur lors du unban all."); }
        }

        const userId = args[0];
        if (!userId) return message.reply("Veuillez donner l'ID de l'utilisateur.");

        try {
            const bans = await message.guild.bans.fetch();
            const isBanned = bans.get(userId);
            if (!isBanned) return message.reply("Ce membre n'est pas banni.");

            await message.guild.members.unban(userId, `Unban par ${message.author.tag}`);
            message.channel.send(`<@${userId}> a été débanni.`);

            const logChannel = message.guild.channels.cache.get(db.get(`logmod_${message.guild.id}`));
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setDescription(`${message.author} a **unban** <@${userId}>`)
                    .setTimestamp();
                logChannel.send({ embeds: [embed] });
            }
        } catch (e) {
            message.channel.send("Impossible de débannir cet utilisateur.");
        }
    }
};