const db = require("../../quick.db");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: 'say',
    aliases: [],
    run: async (client, message, args) => {
        message.delete().catch(() => { });

        let hasPerm = false;
        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`)) hasPerm = true;
        if (message.member.permissions.has(PermissionFlagsBits.Administrator)) hasPerm = true;

        if (!hasPerm) return;

        let toSay = args.join(" ");
        if (!toSay) return;

        if ((toSay.includes("@everyone") || toSay.includes("@here")) && !message.member.permissions.has(PermissionFlagsBits.MentionEveryone)) {
            return message.channel.send("Vous n'avez pas la permission de mentionner everyone.");
        }

        message.channel.send(toSay);
    }
};