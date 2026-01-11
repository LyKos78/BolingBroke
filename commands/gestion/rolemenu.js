const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'rolemenu',
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;

        await message.reply("Mentionnez le rôle à donner/retirer.");
        const col1 = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
        if (!col1.first()) return;
        const role = col1.first().mentions.roles.first() || message.guild.roles.cache.get(col1.first().content);
        if (!role) return message.reply("Rôle introuvable.");

        await message.reply("Quel texte sur le bouton ?");
        const col2 = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 30000 });
        if (!col2.first()) return;
        const label = col2.first().content;

        db.set(`buttonmenuconfig_${message.guild.id}`, role.id);

        // 4. Envoi du menu
        const embed = new EmbedBuilder()
            .setTitle("Menu de Rôle")
            .setDescription(`Cliquez ci-dessous pour obtenir/retirer le rôle ${role}`)
            .setColor(config.color);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`menu-${role.id}`)
                .setLabel(label)
                .setStyle(ButtonStyle.Success)
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
};