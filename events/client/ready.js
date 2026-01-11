const db = require("../../quick.db");

module.exports = async (client) => {
    console.log(`✅ Connecté en tant que ${client.user.tag} !`);
    console.log(`💻 ${client.guilds.cache.size} serveurs | ${client.users.cache.size} utilisateurs`);

    client.user.setPresence({
        activities: [{ name: `${client.config.prefix}help | V2.0.5`, type: 3 }],
        status: 'online'
    });

    client.guilds.cache.forEach(async (guild) => {
        await guild.members.fetch().catch(() => { });
    });
};