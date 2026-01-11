const db = require("../../quick.db");

const voiceTimers = new Map();

module.exports = async (client, oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    const guildId = member.guild.id;
    const userId = member.user.id;
    const key = `${guildId}_${userId}`;

    const isConnected = newState.channelId !== null;
    const isAfk = newState.selfMute || newState.selfDeaf || newState.serverMute || newState.serverDeaf;

    if (isConnected && !voiceTimers.has(key)) {

        const interval = setInterval(() => {

            if (!member.voice.channelId) {
                clearInterval(interval);
                voiceTimers.delete(key);
                return;
            }

            db.add(`vocalrank_${guildId}_${userId}`, 1000);
        }, 1000);

        voiceTimers.set(key, interval);
    }

    if (!newState.channelId && oldState.channelId) {
        if (voiceTimers.has(key)) {
            clearInterval(voiceTimers.get(key));
            voiceTimers.delete(key);
        }
    }
};