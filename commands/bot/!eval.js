const { EmbedBuilder } = require('discord.js');
const db = require("../../quick.db");
const util = require("util");

module.exports = {
    name: 'eval',
    aliases: [],
    run: async (client, message, args, prefix, color) => {

        const isOwner = client.config.owner.includes(message.author.id);
        if (!isOwner) return;

        try {
            const content = args.join(" ");
            if (!content) return message.reply("Code vide.");

            let result = eval(content);

            if (result instanceof Promise) {
                result = await result;
            }

            if (typeof result !== "string") {
                result = util.inspect(result, { depth: 0 });
            }

            if (result.includes(client.token)) result = result.replace(client.token, "T0K3N_H1DD3N");

            message.channel.send({
                content: `\`\`\`js\n${result.slice(0, 1950)}\n\`\`\``
            });

        } catch (err) {
            message.channel.send({
                content: `\`\`\`js\n${err.toString().slice(0, 1950)}\n\`\`\``
            });
        }
    }
};