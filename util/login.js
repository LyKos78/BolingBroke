const { readdirSync } = require('fs');

const login = (client) => {

    try {
        const tempo = require("../tempo.js"); 
        tempo(client);
        console.log("✅ Module Tempo chargé");
    } catch (e) {
        console.error("⚠️ Impossible de charger tempo.js (Vérifie le chemin) :", e.message);
    }

    client.cooldown = new Array();
    client.interaction = {};
    client.guildInvites = new Map();
    client.queue = new Map();
    client.snipes = new Map();
    client.inter = new Array();

    if (!process.env.TOKEN) {
        console.error("❌ ERREUR FATALE : Le token est introuvable dans le fichier .env !");
        return;
    }

    client.login(process.env.TOKEN)
        .then(() => {
            console.log(`✅ Connecté avec succès en tant que ${client.user.tag}`);
        })
        .catch((err) => {
            console.error("❌ Erreur lors de la connexion :", err);
        });
};

module.exports = {
    login
};