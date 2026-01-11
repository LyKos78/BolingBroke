const db = require("../../quick.db");

module.exports = async (client, guild) => {
    console.log(`[+] J'ai rejoint le serveur ${guild.name} [${guild.memberCount} membres]`);

    const ownerId = guild.ownerId;

    if (db.get(`antijoinbot_${client.user.id}`) === true) {

        client.config.owner.forEach(u => {
            client.users.fetch(u).then(user => {
                user.send(`⚠️ J'ai rejoint **${guild.name}** (${guild.memberCount} mb) mais j'ai quitté (Anti-Join activé). Propriétaire: <@${ownerId}>`).catch(() => { });
            });
        });

        return guild.leave().catch(() => { });
    }

    client.config.owner.forEach(u => {
        client.users.fetch(u).then(user => {
            user.send(`✅ J'ai rejoint **${guild.name}** (${guild.memberCount} membres). Propriétaire : <@${ownerId}>`).catch(() => { });
        });
    });

    const ownersDb = db.all().filter(data => data.ID.startsWith(`ownermd_${client.user.id}`));
    ownersDb.forEach(data => {
        const userId = data.ID.split('_')[2];
        client.users.fetch(userId).then(user => {
            user.send(`J'ai rejoint ${guild.name}`).catch(() => { });
        });
    });
};