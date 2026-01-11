const db = require("../../quick.db");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, oldState, newState) => {

    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    const logChannelId = db.get(`logvc_${guild.id}`);
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const color = db.get(`color_${guild.id}`) || client.config.color;
    const member = newState.member || oldState.member;
    if (!member) return;

    if (!oldState.channelId && newState.channelId) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setColor(config.color)
            .setDescription(`**${member}** se connecte au salon ${newState.channel}`)
            .setTimestamp();
        return logChannel.send({ embeds: [embed] }).catch(() => { });
    }

    if (oldState.channelId && !newState.channelId) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setColor(config.color)
            .setDescription(`**${member}** quitte le salon ${oldState.channel}`)
            .setTimestamp();
        return logChannel.send({ embeds: [embed] }).catch(() => { });
    }

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setColor(config.color)
            .setDescription(`**${member}** a changé de salon vocal.\n📤 **Avant:** ${oldState.channel}\n📥 **Après:** ${newState.channel}`)
            .setTimestamp();
        return logChannel.send({ embeds: [embed] }).catch(() => { });
    }

    if (!oldState.streaming && newState.streaming) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setColor(config.color)
            .setDescription(`**${member}** commence un partage d'écran dans ${newState.channel}`)
            .setTimestamp();
        return logChannel.send({ embeds: [embed] }).catch(() => { });
    }

    if (oldState.streaming && !newState.streaming) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setColor(config.color)
            .setDescription(`**${member}** a arrêté son partage d'écran dans ${newState.channel}`)
            .setTimestamp();
        return logChannel.send({ embeds: [embed] }).catch(() => { });
    }
};