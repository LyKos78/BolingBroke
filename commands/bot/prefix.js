const db = require("../../quick.db");

module.exports = {
    name: 'prefix',
    aliases: ["setprefix"],
    run: async (client, message, args) => {

        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const newPrefix = args[0];
        if (!newPrefix) return message.reply(`Mon préfixe actuel est : \`${db.get(`prefix_${message.guild.id}`) || client.config.prefix}\``);

        db.set(`prefix_${message.guild.id}`, newPrefix);
        message.channel.send(`Mon préfixe est maintenant : \`${newPrefix}\``);
    }
};