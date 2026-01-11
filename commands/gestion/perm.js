const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'perm',
    run: async (client, message, args) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const sub = args[0];
        const type = args[1];

        if (sub === "set") {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
            if (!role) return message.reply("Rôle introuvable.");

            if (['mods', 'admin', 'ownerp', 'gvwp'].includes(type)) {
                db.set(`${type}_${message.guild.id}_${role.id}`, true);
                message.channel.send(`Le rôle ${role.name} a maintenant la permission **${type}**.`);
            } else {
                message.reply("Type invalide. Types: `mods`, `admin`, `ownerp`, `gvwp`");
            }
        }
        else {
            message.reply("Usage: `perm set <mods/admin/ownerp/gvwp> <@role>`");
        }
    }
};