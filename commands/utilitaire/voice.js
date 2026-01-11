const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");

module.exports = {
    name: 'voice',
    aliases: ["vc"],
    run: async (client, message, args, prefix, color) => {
        const isPerm = client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`);
        if (!isPerm) return;

        if (args[0] === "move") {
            const isAdmin = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`);
            if (!isAdmin) return;

            if (args[1] === "all") {
                const targetChannel = message.member.voice.channel;
                if (!targetChannel) return message.reply("Vous devez être dans un salon vocal.");

                let count = 0;
                message.guild.members.cache.forEach(member => {
                    if (member.voice.channel && member.voice.channelId !== targetChannel.id) {
                        member.voice.setChannel(targetChannel).catch(() => { });
                        count++;
                    }
                });
                return message.channel.send(`Déplacement de ${count} membres vers **${targetChannel.name}**.`);
            }
        }

        let connected = 0;
        let mutedMic = 0;
        let mutedHeadset = 0;
        let streaming = 0;
        let camera = 0;

        message.guild.members.cache.forEach(m => {
            if (m.voice.channelId) {
                connected++;
                if (m.voice.selfMute || m.voice.serverMute) mutedMic++;
                if (m.voice.selfDeaf || m.voice.serverDeaf) mutedHeadset++;
                if (m.voice.streaming) streaming++;
                if (m.voice.selfVideo) camera++;
            }
        });

        const embed = new EmbedBuilder()
            .setTitle(`Statistiques Vocales - ${message.guild.name}`)
            .setColor(client.config.color)
            .setDescription(`
🎙️ **En vocal :** ${connected}
🔇 **Micro coupé :** ${mutedMic}
🎧 **Casque coupé :** ${mutedHeadset}
📡 **En stream :** ${streaming}
📸 **Caméra active :** ${camera}
            `)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};