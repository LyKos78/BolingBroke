const { ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../../quick.db');

// Mémoire temporaire pour les salons créés
const tempomap = new Map();

module.exports = (client) => {
    client.on("voiceStateUpdate", async (oldState, newState) => {
        // Détection du serveur
        const guild = newState.guild;
        if (!guild) return;

        // ID du salon "Créer un salon" stocké en DB
        const joinChannelId = db.get(`jc_${guild.id}`);

        // 1. Création de salon (L'utilisateur rejoint le hub)
        if (newState.channelId === joinChannelId) {
            await createTempoChannel(newState);
        }

        // 2. Suppression de salon (L'utilisateur quitte un salon temporaire)
        if (oldState.channelId) {
            const key = `temp_${guild.id}_${oldState.channelId}`;
            if (tempomap.has(key)) {
                const channelId = tempomap.get(key);
                const channel = guild.channels.cache.get(channelId);

                // Si le salon existe et est vide, on supprime
                if (channel && channel.members.size === 0) {
                    try {
                        await channel.delete();
                        tempomap.delete(key);
                    } catch (err) {
                        console.error(`[Tempo] Erreur suppression salon: ${err.message}`);
                    }
                }
                // Nettoyage mémoire si le salon a été supprimé manuellement
                else if (!channel) {
                    tempomap.delete(key);
                }
            }
        }
    });

    async function createTempoChannel(voiceState) {
        const { guild, member } = voiceState;

        // Récupération config
        const categoryId = db.get(`catggg_${guild.id}`);
        const emoji = db.get(`emote_${guild.id}`) || "🔊 Salon de ";

        if (!categoryId) return; // Pas de catégorie configurée

        try {
            // Création v14
            const vc = await guild.channels.create({
                name: `${emoji}${member.user.username}`,
                type: ChannelType.GuildVoice,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.Connect],
                    },
                    {
                        id: guild.id,
                        allow: [PermissionFlagsBits.ViewChannel],
                    },
                ],
            });

            // Déplacer le membre
            await member.voice.setChannel(vc);

            // Enregistrer dans la Map
            tempomap.set(`temp_${guild.id}_${vc.id}`, vc.id);

        } catch (err) {
            console.error("[Tempo] Impossible de créer le salon :", err);
        }
    }
};