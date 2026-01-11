const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'muterole',
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm && !message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        let mutedRoleId = db.fetch(`mRole_${message.guild.id}`);
        let muterole = message.guild.roles.cache.get(mutedRoleId) || message.guild.roles.cache.find(r => r.name === 'muet');

        if (!muterole) {
            try {
                message.channel.send("Création du rôle et configuration des salons... (Patientez)");
                muterole = await message.guild.roles.create({
                    name: 'muet',
                    permissions: [],
                    reason: 'Muterole command'
                });
                db.set(`mRole_${message.guild.id}`, muterole.id);
            } catch (e) { return message.channel.send("Erreur création rôle."); }
        }

        message.guild.channels.cache.forEach(async channel => {
            await channel.permissionOverwrites.create(muterole, {
                SendMessages: false,
                AddReactions: false,
                Speak: false,
                Connect: false
            }).catch(() => { });
        });

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription(`Le rôle <@&${muterole.id}> a été configuré sur tous les salons.`);
        message.channel.send({ embeds: [embed] });
    }
};