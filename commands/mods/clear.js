const { PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");

module.exports = {
    name: 'clear',
    aliases: ["purge"],
    run: async (client, message, args, prefix, color) => {
        let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!perm) {
            message.member.roles.cache.forEach(role => {
                if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            });
        }
        if (!perm && !message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

        await message.delete().catch(() => { });

        if (message.mentions.members.first()) {
            const target = message.mentions.members.first();
            try {
                const messages = await message.channel.messages.fetch({ limit: 100 });
                const userMessages = messages.filter(m => m.author.id === target.id).first(100);

                await message.channel.bulkDelete(userMessages, true);
                const msg = await message.channel.send(`Messages de ${target.user.tag} supprimés.`);
                setTimeout(() => msg.delete().catch(() => { }), 3000);
            } catch (e) {
                message.channel.send("Impossible de supprimer les messages (trop vieux ?).");
            }
        }
        else if (args[0]) {
            const amount = parseInt(args[0]);
            if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Le nombre doit être entre 1 et 100.");

            try {
                await message.channel.bulkDelete(amount, true);

            } catch (e) {
                message.channel.send("Erreur: Les messages datent peut-être de plus de 14 jours.");
            }
        }
        else {
            try {
                await message.channel.bulkDelete(100, true);
            } catch (e) { }
        }
    }
};