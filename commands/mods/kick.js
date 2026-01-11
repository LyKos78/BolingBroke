const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../quick.db");
 
module.exports = {
  name: 'kick',
  aliases: ["k"],
  run: async (client, message, args, prefix, color) => {
    let perm = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
    if (!perm) {
      message.member.roles.cache.forEach(role => {
        if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
      });
    }
    if (!perm && !message.member.permissions.has(PermissionFlagsBits.KickMembers)) return;

    const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!user) return message.channel.send(`Aucun membre trouvé pour \`${args[0] || " "}\``);

    if (user.id === message.author.id) return message.reply("Vous ne pouvez pas vous kick vous-même.");
    if (!user.kickable) return message.reply("Je ne peux pas kick ce membre (Mon rôle est peut-être en dessous du sien).");

    const reason = args.slice(1).join(" ") || "Sans raison";

    try {
      await user.send(`Vous avez été **kick** de ${message.guild.name} pour : ${reason}`).catch(() => { });
      await user.kick(reason);
      message.channel.send(`${user.user.tag} a été **kick**.`);

      const logChannel = message.guild.channels.cache.get(db.get(`logmod_${message.guild.id}`));
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${message.author} a **kick** ${user.user.tag}\nRaison: ${reason}`)
          .setTimestamp();
        logChannel.send({ embeds: [embed] });
      }
    } catch (e) {
      message.channel.send("Une erreur est survenue lors du kick.");
    }
  }
};