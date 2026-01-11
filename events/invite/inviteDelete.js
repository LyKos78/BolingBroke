module.exports = async (client, invite) => {
    try {
        const invites = await invite.guild.invites.fetch();
        client.guildInvites.set(invite.guild.id, invites);
    } catch (e) {}
};