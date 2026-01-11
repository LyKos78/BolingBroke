const db = require("../../quick.db");

module.exports = {
    name: 'renew',
    aliases: ["nuke", "purge"],
    run: async (client, message, args) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const channel = message.channel;

        if (args[0] === "all") {
            message.channel.send("Commande `renew all` désactivée par sécurité dans la migration.");
            return;
        }

        try {
            const position = channel.position;
            const newChannel = await channel.clone();
            await channel.delete();
            await newChannel.setPosition(position);
            newChannel.send(`${message.author} a recréé ce salon.`);
        } catch (e) {
            console.error(e);
        }
    }
};