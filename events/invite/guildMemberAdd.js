const db = require("../../quick.db");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, member) => {
  const guild = member.guild;
  const color = db.get(`color_${guild.id}`) || client.config.color;

  const cachedInvites = client.guildInvites.get(guild.id);
  const newInvites = await guild.invites.fetch().catch(() => new Collection());

  client.guildInvites.set(guild.id, newInvites);

  let usedInvite = null;

  try {
    usedInvite = newInvites.find(inv => {
      const oldInv = cachedInvites ? cachedInvites.get(inv.code) : null;
      return oldInv && inv.uses > oldInv.uses;
    });
  } catch (e) { }

  let inviterId = null;
  let inviteCount = 0;

  if (usedInvite && usedInvite.inviter) {
    inviterId = usedInvite.inviter.id;
    db.add(`invites_${guild.id}_${inviterId}`, 1);
    inviteCount = db.get(`invites_${guild.id}_${inviterId}`);

    db.set(`inviter_${guild.id}_${member.id}`, inviterId);
  } else {
    if (guild.vanityURLCode && !usedInvite) {
      db.set(`inviter_${guild.id}_${member.id}`, "vanity");
    } else {
      db.set(`inviter_${guild.id}_${member.id}`, "unknown");
    }
  }

  const welcomeChannelId = db.get(`joinchannelmessage_${guild.id}`);
  const welcomeMsg = db.get(`joinmessageembed_${guild.id}`);
  const channel = guild.channels.cache.get(welcomeChannelId);

  if (channel && welcomeMsg) {
    const inviterUser = usedInvite ? usedInvite.inviter : null;
    const inviterTag = inviterUser ? inviterUser.tag : "Inconnu/Vanity";
    const inviterName = inviterUser ? inviterUser.username : "Inconnu/Vanity";

    const replaceVars = (text) => {
      return text
        .replace(/{user}/g, member)
        .replace(/{user:username}/g, member.user.username)
        .replace(/{user:tag}/g, member.user.tag)
        .replace(/{guild:name}/g, guild.name)
        .replace(/{guild:member}/g, guild.memberCount)
        .replace(/{inviter}/g, inviterUser || "Inconnu")
        .replace(/{inviter:name}/g, inviterName)
        .replace(/{inviter:tag}/g, inviterTag)
        .replace(/{invite}/g, inviteCount);
    };

    try {
      if (typeof welcomeMsg === 'object') {
        const embed = new EmbedBuilder(welcomeMsg);
        if (embed.data.description) embed.setDescription(replaceVars(embed.data.description));
        if (embed.data.title) embed.setTitle(replaceVars(embed.data.title));
        if (embed.data.footer && embed.data.footer.text) embed.setFooter({ text: replaceVars(embed.data.footer.text) });

        channel.send({ embeds: [embed] }).catch(() => { });
      }
      else {
        channel.send({ content: replaceVars(welcomeMsg) }).catch(() => { });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const autoRoleId = db.get(`autorole_${guild.id}`);
  if (autoRoleId) {
    const role = guild.roles.cache.get(autoRoleId);
    if (role) await member.roles.add(role).catch(() => { });
  }

  const dmMsg = db.get(`joindmee_${guild.id}`);
  if (dmMsg) {
    member.send(dmMsg
      .replace(/{user}/g, member)
      .replace(/{guild:name}/g, guild.name)
      .replace(/{guild:member}/g, guild.memberCount)
    ).catch(() => { });
  }
};