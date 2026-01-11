const db = require("../../quick.db");

module.exports = {
    name: 'theme',
    aliases: ["color", "setcolor"],
    run: async (client, message, args) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const newColor = args[0];
        if (!newColor) return message.reply("Veuillez indiquer une couleur (ex: `Red`, `#ff0000`, `Random`).");

        db.set(`color_${message.guild.id}`, newColor);
        message.channel.send(`Ma couleur d'embed est maintenant : \`${newColor}\``);
    }
};