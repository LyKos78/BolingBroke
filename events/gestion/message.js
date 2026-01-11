const db = require("../../quick.db");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;

    const cmd = message.content.toLowerCase();

    const customEmbedData = db.get(`customcmdembed_${cmd}`);
    if (customEmbedData) {
        let embed = new EmbedBuilder(customEmbedData);

        const replaceVars = (str) => {
            if (!str) return str;
            return str
                .replace(/{guild:name}/g, message.guild.name)
                .replace(/{guild:member}/g, message.guild.memberCount)
                .replace(/{user}/g, message.author)
                .replace(/{user:tag}/g, message.author.tag)
                .replace(/{user:name}/g, message.author.username)
                .replace(/{user:id}/g, message.author.id);
        };

        if (embed.data.description) embed.setDescription(replaceVars(embed.data.description));
        if (embed.data.title) embed.setTitle(replaceVars(embed.data.title));
        if (embed.data.footer && embed.data.footer.text) embed.setFooter({ text: replaceVars(embed.data.footer.text) });

        return message.channel.send({ embeds: [embed] }).catch(() => { });
    }

    const customText = db.get(`customcmd_${cmd}`);
    if (customText) {
        return message.channel.send(customText).catch(() => { });
    }

};