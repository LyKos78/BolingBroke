const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

/**
 * Système de pagination v14
 */
const ButtonPages = async function (interactionOrMessage, embeds, duration = 60000) {
    if (!embeds || embeds.length === 0) return;

    let currentPage = 0;

    // Création des boutons
    const prevBtn = new ButtonBuilder()
        .setCustomId('prev_page')
        .setLabel('◀️')
        .setStyle(ButtonStyle.Primary);

    const nextBtn = new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('▶️')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(prevBtn, nextBtn);

    // Envoi du message initial
    // On gère le cas où c'est un Message classique ou une Interaction Slash
    let message;
    const content = { embeds: [embeds[0]], components: [row], fetchReply: true };

    if (interactionOrMessage.commandName) {
        message = await interactionOrMessage.reply(content);
    } else {
        message = await interactionOrMessage.channel.send(content);
    }

    // Création du collecteur
    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: duration
    });

    collector.on('collect', async (i) => {
        // Vérifie que c'est bien la personne qui a fait la commande
        const authorId = interactionOrMessage.user ? interactionOrMessage.user.id : interactionOrMessage.author.id;
        
        if (i.user.id !== authorId) {
            return i.reply({ content: "Vous ne pouvez pas utiliser ces boutons.", ephemeral: true });
        }

        if (i.customId === 'prev_page') {
            currentPage = currentPage > 0 ? currentPage - 1 : embeds.length - 1;
        } else if (i.customId === 'next_page') {
            currentPage = currentPage < embeds.length - 1 ? currentPage + 1 : 0;
        }

        await i.update({ embeds: [embeds[currentPage]], components: [row] });
    });

    collector.on('end', () => {
        // Désactive les boutons à la fin
        const disabledRow = new ActionRowBuilder().addComponents(
            prevBtn.setDisabled(true),
            nextBtn.setDisabled(true)
        );
        message.edit({ components: [disabledRow] }).catch(() => {});
    });
};

module.exports = { ButtonPages };