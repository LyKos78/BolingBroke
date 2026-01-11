const db = require("../../quick.db");

module.exports = {
    name: 'massrole',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const action = args[0];
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        if (!['add', 'remove'].includes(action) || !role) {
            return message.reply("Usage: `massrole <add/remove> <@role>`");
        }

        message.channel.send(`⏳ Action en cours sur ${message.guild.memberCount} membres... Cela peut prendre du temps.`);

        const members = await message.guild.members.fetch();
        let count = 0;
        let errors = 0;

        for (const [id, member] of members) {
            await new Promise(r => setTimeout(r, 100));

            try {
                if (action === 'add' && !member.roles.cache.has(role.id)) {
                    await member.roles.add(role, `MassRole par ${message.author.tag}`);
                    count++;
                } else if (action === 'remove' && member.roles.cache.has(role.id)) {
                    await member.roles.remove(role, `MassRole par ${message.author.tag}`);
                    count++;
                }
            } catch (e) {
                errors++;
            }
        }

        message.channel.send(`✅ Terminé ! Rôle ${action === 'add' ? 'ajouté à' : 'retiré de'} **${count}** membres. (${errors} erreurs)`);
    }
};