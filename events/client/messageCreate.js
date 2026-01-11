const db = require("../../quick.db");
const { ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;
    if (message.channel.type === ChannelType.DM) return;

    let prefix = db.get(`prefix_${message.guild.id}`) || client.config.prefix;
    let color = db.get(`color_${message.guild.id}`) || client.config.color;

    if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
        return message.channel.send(`Mon préfixe sur ce serveur est : \`${prefix}\``);
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    const cooldownKey = `${message.author.id}-${command.name}-${message.guild.id}`;
    const existingCooldown = client.cooldown.find(c => c.id === cooldownKey);

    if (existingCooldown) {
        const timeElapsed = Date.now() - existingCooldown.startedAt;
        const timeRemaining = 1000 - timeElapsed;

        if (timeRemaining > 0) {
            const msg = await message.channel.send(`${message.author}, merci d'attendre **${Math.ceil(timeRemaining / 1000)}s** avant de refaire cette commande.`);
            setTimeout(() => {
                message.delete().catch(() => { });
                msg.delete().catch(() => { });
            }, timeRemaining);

            return;
        } else {
            client.cooldown = client.cooldown.filter(c => c.id !== cooldownKey);
        }
    }

    client.cooldown.push({
        id: cooldownKey,
        startedAt: Date.now()
    });

    let isPermitted = false;

    if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true) {
        isPermitted = true;
    }
    else {
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) isPermitted = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) isPermitted = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) isPermitted = true;
        });
    }

    if (db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {
        isPermitted = true;
    }

    try {
        await command.run(client, message, args, prefix, color);
    } catch (error) {
        console.error(error);
        message.channel.send("Une erreur est survenue lors de l'exécution de la commande.");
    }
};