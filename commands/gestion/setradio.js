const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'setradio',
    run: async (client, message, args, prefix, color) => {
        const isOwner = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
        if (!isOwner) return;
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('radio_select')
                .setPlaceholder('Choisir une radio')
                .addOptions([
                    { label: 'NRJ', value: 'nrj', description: 'Radio NRJ' },
                    { label: 'Skyrock', value: 'sky', description: 'Rap & RnB' },
                    { label: 'Mouv', value: 'mouv', description: 'Hip Hop' },
                    { label: 'Nostalgie', value: 'nost', description: 'Classiques' }
                ])
        );

        const msg = await message.channel.send({ content: "Choisissez la radio par défaut :", components: [row] });
        
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 30000 });
        collector.on('collect', i => {
            if(i.user.id !== message.author.id) return i.reply({content: "Non.", ephemeral: true});
            
            db.set(`radio_${message.guild.id}`, i.values[0]);
            i.reply({ content: `Radio définie sur **${i.values[0]}**`, ephemeral: true });
        });
    }
};