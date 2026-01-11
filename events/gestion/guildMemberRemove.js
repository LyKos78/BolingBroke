const db = require("../../quick.db");

module.exports = async (client, member) => {
    const guild = member.guild;

    let leavedm = db.get(`leavedme_${guild.id}`);

    if (leavedm) {
        const messageContent = leavedm
            .replace("{user}", member.user)
            .replace("{user:username}", member.user.username)
            .replace("{user:tag}", member.user.tag)
            .replace("{user:id}", member.id)
            .replace("{guild:name}", guild.name)
            .replace("{guild:member}", guild.memberCount);

        try {
            await member.send(messageContent);
        } catch (e) {
        }
    }

};