const db = require("../../quick.db");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: 'raidlog',
    aliases: [],
    run: async (client, message, args) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if (args[0] === "on") {
            db.set(`${message.guild.id}.raidlog`, message.channel.id);
            return message.channel.send(`Ce salon (${message.channel}) sera utilisé pour les logs de raid.`);
        }

        if (args[0] === "off") {
            db.delete(`${message.guild.id}.raidlog`);
            return message.channel.send(`Logs de raid désactivés.`);
        }

        if (channel) {
            db.set(`${message.guild.id}.raidlog`, channel.id);
            return message.channel.send(`Le salon ${channel} sera utilisé pour les logs de raid.`);
        }

        return message.reply("Usage: `raidlog <on/off/#channel>`");
    }
};