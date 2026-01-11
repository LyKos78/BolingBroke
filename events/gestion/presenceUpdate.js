const db = require("../../quick.db");

module.exports = async (client, oldPresence, newPresence) => {
    if (!newPresence || !newPresence.guild) return;

    const guild = newPresence.guild;
    const txt = db.get(`txtsupp_${guild.id}`);
    const roleId = db.get(`rolesupp_${guild.id}`);

    if (!txt || !roleId) return;

    const member = newPresence.member;
    const role = guild.roles.cache.get(roleId);
    if (!role) return;

    const hasText = newPresence.activities.some(activity =>
        activity.state && activity.state.includes(txt)
    );

    try {
        if (hasText) {
            if (!member.roles.cache.has(roleId)) {
                await member.roles.add(role);
            }
        } else {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(role);
            }
        }
    } catch (err) {
        console.error(`[Soutien] Impossible de modifier les rôles pour ${member.user.tag}`);
    }
};