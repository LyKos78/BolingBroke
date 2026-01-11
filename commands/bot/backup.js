const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("../../quick.db");
const backup = require("discord-backup");

backup.setStorageFolder(__dirname + "/backups/");

module.exports = {
    name: 'backup',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        if (args[0] === "create") {
            const msg = await message.channel.send("Création de la backup en cours...");
            try {
                const backupData = await backup.create(message.guild, {
                    maxMessagesPerChannel: 0,
                    jsonSave: true,
                    jsonBeautify: true,
                    saveImages: "base64"
                });
                msg.edit(`✅ Backup créée ! ID: \`${backupData.id}\`\nUtilisez \`${prefix}backup load ${backupData.id}\` pour la charger.`);

                db.push(`backups_${message.author.id}`, { id: backupData.id, name: message.guild.name, date: Date.now() });

            } catch (e) {
                console.error(e);
                msg.edit("Erreur lors de la création de la backup.");
            }
        }

        if (args[0] === "list") {
            let backups = db.get(`backups_${message.author.id}`) || [];
            if (backups.length === 0) return message.channel.send("Aucune backup enregistrée.");

            const embed = new EmbedBuilder()
                .setTitle("Vos Backups")
                .setColor(client.config.color)
                .setDescription(backups.map((b, i) => `${i + 1}) **${b.name}** - \`${b.id}\``).join("\n"));

            message.channel.send({ embeds: [embed] });
        }
    }
};