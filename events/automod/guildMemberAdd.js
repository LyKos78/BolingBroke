const db = require("../../quick.db");
 
module.exports = async (client, member) => {
    const guild = member.guild;

    const isMuted = db.get(`mute_${guild.id}_${member.id}`);

    if (isMuted === true) {
        const mutedRoleId = db.fetch(`mRole_${guild.id}`);
        const muteRole = guild.roles.cache.get(mutedRoleId);

        if (muteRole) {
            await member.roles.add(muteRole, 'Persistent Mute (Joined back)').catch(() => { });
        }
    }
};