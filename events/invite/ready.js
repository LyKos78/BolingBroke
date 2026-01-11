module.exports = async (client) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    client.guilds.cache.forEach(async guild => {
        try {
            const invites = await guild.invites.fetch();
            client.guildInvites.set(guild.id, invites);
        } catch (e) {
        }
    });
};