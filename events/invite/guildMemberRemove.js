const db = require("../../quick.db");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, member) => {
   const guild = member.guild;
   const color = db.get(`color_${guild.id}`) || client.config.color;

   const inviterId = db.get(`inviter_${guild.id}_${member.id}`);
   let inviterUser = null;
   let inviteCount = 0;

   if (inviterId && inviterId !== "vanity" && inviterId !== "unknown") {
      // Retirer 1 invitation à l'inviteur
      db.subtract(`invites_${guild.id}_${inviterId}`, 1);
      inviteCount = db.get(`invites_${guild.id}_${inviterId}`);

      try {
         inviterUser = await client.users.fetch(inviterId);
      } catch (e) { }
   }

   const leaveChannelId = db.get(`leavechannelmessage_${guild.id}`);
   const leaveMsg = db.get(`leavemessageembed_${guild.id}`);
   const channel = guild.channels.cache.get(leaveChannelId);

   if (channel && leaveMsg) {
      const inviterTag = inviterUser ? inviterUser.tag : (inviterId === 'vanity' ? "Lien Perso" : "Inconnu");
      const inviterName = inviterUser ? inviterUser.username : (inviterId === 'vanity' ? "Lien Perso" : "Inconnu");

      const replaceVars = (text) => {
         return text
            .replace(/{user}/g, member.user.tag)
            .replace(/{user:username}/g, member.user.username)
            .replace(/{user:tag}/g, member.user.tag)
            .replace(/{guild:name}/g, guild.name)
            .replace(/{guild:member}/g, guild.memberCount)
            .replace(/{inviter}/g, inviterUser ? inviterUser.tag : inviterName)
            .replace(/{inviter:name}/g, inviterName)
            .replace(/{inviter:tag}/g, inviterTag)
            .replace(/{invite}/g, inviteCount);
      };

      try {
         if (typeof leaveMsg === 'object') {
            const embed = new EmbedBuilder(leaveMsg);
            if (embed.data.description) embed.setDescription(replaceVars(embed.data.description));
            if (embed.data.title) embed.setTitle(replaceVars(embed.data.title));
            if (embed.data.footer && embed.data.footer.text) embed.setFooter({ text: replaceVars(embed.data.footer.text) });

            channel.send({ embeds: [embed] }).catch(() => { });
         } else {
            channel.send({ content: replaceVars(leaveMsg) }).catch(() => { });
         }
      } catch (e) { }
   }
};