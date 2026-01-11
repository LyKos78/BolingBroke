const { EmbedBuilder } = require('discord.js');
const math = require('mathjs');
const db = require("../../quick.db");

const config = require("../../config");

module.exports = {
    name: 'calc',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        if (!args.length) return message.reply("Veuillez entrer un calcul.");

        try {
            const result = math.evaluate(args.join(" "));
            const embed = new EmbedBuilder()
                .setTitle("Calculatrice")
                .setColor(config.color)
                .addFields(
                    { name: "Calcul", value: `\`\`\`${args.join(" ")}\`\`\`` },
                    { name: "Résultat", value: `\`\`\`${result}\`\`\`` }
                );
            message.channel.send({ embeds: [embed] });
        } catch (e) {
            message.reply("Calcul invalide.");
        }
    }
};