const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
let dbData = {};

if (fs.existsSync(dbPath)) {
    try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
        console.error("[DB] Erreur de lecture, base vide créée.");
        dbData = {};
    }
}

let saveTimeout = null;
function scheduleSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        fs.writeFile(dbPath, JSON.stringify(dbData, null, 2), (err) => {
            if (err) console.error("[DB] Erreur sauvegarde:", err);
        });
    }, 1000);
}

module.exports = {
    get: (key) => dbData[key] ?? null,
    fetch: (key) => dbData[key] ?? null,
    has: (key) => dbData[key] !== undefined,
    all: () => Object.keys(dbData).map(key => ({ ID: key, data: dbData[key] })),
    
    set: (key, value) => {
        dbData[key] = value;
        scheduleSave();
        return value;
    },
    delete: (key) => {
        delete dbData[key];
        scheduleSave();
        return true;
    },
    add: (key, value) => {
        if (!dbData[key]) dbData[key] = 0;
        dbData[key] += value;
        scheduleSave();
        return dbData[key];
    },
    push: (key, value) => {
        if (!Array.isArray(dbData[key])) dbData[key] = [];
        dbData[key].push(value);
        scheduleSave();
        return dbData[key];
    }
};