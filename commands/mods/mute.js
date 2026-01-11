const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");
const ms = require("ms");

const config = require("../../config");

module.exports = {
    name: 'mute',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm) {
            message.member.roles.cache.forEach(role => {
                if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            });
        }
        if (!perm && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.reply("Membre introuvable.");

        let mutedRoleId = db.fetch(`mRole_${message.guild.id}`);
        let muterole = message.guild.roles.cache.get(mutedRoleId);
        if (!muterole) return message.reply(`Aucun rôle muet configuré. Faites \`${prefix}muterole\`.`);

        let time = args[1] ? ms(args[1]) : null;
        let reason = args.slice(time ? 2 : 1).join(" ") || "Aucune raison";

        await member.roles.add(muterole);
        db.set(`mute_${message.guild.id}_${member.id}`, true);

        message.channel.send(`${member} a été **mute** ${time ? `pour ${args[1]}` : "indéfiniment"}.`);

        if (time) {
            setTimeout(async () => {
                if (member.roles.cache.has(muterole.id)) {
                    await member.roles.remove(muterole);
                    db.delete(`mute_${message.guild.id}_${member.id}`);
                }
            }, time);
        }

        const logChannel = message.guild.channels.cache.get(db.get(`logmod_${message.guild.id}`));
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(`${message.author} a **mute** ${member}\nRaison: ${reason}`);
            logChannel.send({ embeds: [embed] });
        }
    }
};