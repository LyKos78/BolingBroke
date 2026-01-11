const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'giveaway',
    aliases: ["gvw"],
    run: async (client, message, args) => {
        if (!message.member.permissions.has("ManageMessages")) return;

        if (args[0] === "reroll") {
            return message.reply("Fonction reroll à implémenter selon votre système de réaction.");
        }
        message.reply("Pour créer un giveaway, utilisez un module dédié ou configurez le script `start`.");
    }
};