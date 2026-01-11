const db = require("../../quick.db");

module.exports = async (client, interaction) => {

    if (!interaction.isButton()) return;

    const guild = interaction.guild;
    const member = interaction.member;

    const configRoleId = db.get(`buttonmenuconfig_${guild.id}`);

    if (configRoleId && interaction.customId === `menu-${configRoleId}`) {

        const role = guild.roles.cache.get(configRoleId);
        if (!role) {
            return interaction.reply({ content: "Le rôle configuré n'existe plus.", ephemeral: true });
        }

        try {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                await interaction.reply({ content: `❌ Je vous ai retiré le rôle **${role.name}**.`, ephemeral: true });
            } else {
                await member.roles.add(role);
                await interaction.reply({ content: `✅ Je vous ai ajouté le rôle **${role.name}**.`, ephemeral: true });
            }
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: "Je n'ai pas les permissions de gérer ce rôle.", ephemeral: true });
        }
        return;
    }
};