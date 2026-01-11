const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const config = require('./config.json');
const db = require('./quick.db');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildWebhooks
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
    ]
});


client.invites = new Collection();
client.guildInvites = new Collection();
client.config = config;
client.commands = new Collection();
client.aliases = new Collection();
client.cooldown = new Array();
client.inter = [];

const loadCommands = (dir = "./commands/") => {
    let totalCommands = 0;
    let loadedCount = 0;

    try {
        readdirSync(dir).forEach(dirs => {
            const files = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
            totalCommands += files.length;
        });
    } catch (e) {
    }

    try {
        readdirSync(dir).forEach(dirs => {
            const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
            for (const file of commands) {
                const getFileName = require(`${dir}/${dirs}/${file}`);
                client.commands.set(getFileName.name, getFileName);
                
                loadedCount++;

                console.log(`✅ Commande chargée : ${getFileName.name} [${loadedCount} / ${totalCommands}]`);
            }
        });
    } catch (e) {
        console.log(`⚠️ Dossier de commandes introuvable ou vide : ${e.message}`);
    }
};

const loadEvents = (dir = "./events/") => {
    try {
        readdirSync(dir).forEach(dirs => {
            const events = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
            for (const file of events) {
                const evt = require(`${dir}/${dirs}/${file}`);
                const evtName = file.split(".")[0];
                console.log(`🔔 Event chargé : ${evtName}`);
                client.on(evtName, evt.bind(null, client));
            }
        });
    } catch (e) {
        console.log(`⚠️ Dossier d'événements introuvable ou vide : ${e.message}`);
    }
};

loadCommands();
loadEvents();

process.on("unhandledRejection", err => {
    console.error("Uncaught Promise Error: ", err);
});
process.on("uncaughtException", err => {
    console.error("Uncaught Exception: ", err);
});

console.log("Token lu :", client.config.token ? "Oui (Commence par " + client.config.token.substring(0, 5) + "...)" : "Non (Undefined)");

client.login(client.config.token);