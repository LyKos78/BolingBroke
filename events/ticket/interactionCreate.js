const { BUTTON_IDS } = require("../../util/constants");
const TicketSystem = require("../../util/ticketSystem");

module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === BUTTON_IDS.OPEN_TICKET) {
        await TicketSystem.createTicket(client, interaction);
    }

    if (interaction.customId === BUTTON_IDS.CLOSE_TICKET) {
        await TicketSystem.closeTicket(interaction);
    }
};