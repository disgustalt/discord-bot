const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

module.exports = async (interaction) => {
  try {
    const op = interaction.options.getUser('user');
    const user = interaction.user;

    if (op.bot || op.id === user.id) {
      return interaction.reply({ content: "You cannot play against yourself or a bot.", flags: 64 });
    }

    const invbtns = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('accept').setLabel('Accept').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('decline').setLabel('Decline').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `${op}, ${user} has challenged you to Russian Roulette!`,
      components: [invbtns]
    });

    const invmsg = await interaction.fetchReply();

    try {
      const i = await invmsg.awaitMessageComponent({ filter: (i) => i.user.id === op.id, time: 60000 });

      if (i.customId === 'decline') {
        return await i.update({ content: 'Game got declined :c', components: [] });
      }

      await i.deferUpdate();

      let players = Math.random() > 0.5 ? [user, op] : [op, user];
      let current = 0;
      const death = Math.floor(Math.random() * 6);

      await play(invmsg, players, current, death, interaction);

    } catch (e) {
      await interaction.editReply({ content: `${op} took too long to respond :\(`, components: [] });
    }
  } catch (e) {
    console.error('rr error:', e);
  }
};

async function play(message, players, current, death, interaction) {
  try {
    const currentp = players[current % 2];
    const attach = await genTurn(currentp);

    const emb = new EmbedBuilder()
      .setDescription(`${currentp}'s turn!`)
      .setColor(0xFFFF00)
      .setImage('attachment://rr.png');

    const playbtns = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('play').setLabel('Pull The Trigger').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('forf').setLabel('Forfeit').setStyle(ButtonStyle.Danger)
    );

    await interaction.editReply({
      content: ' ',
      embeds: [emb],
      files: [attach],
      components: [playbtns]
    });

    try {
      const btncol = await message.awaitMessageComponent({ filter: (btn) => btn.user.id === currentp.id, time: 60000 });

      if (btncol.customId === 'forf') {
        return await btncol.update({
          content: `${players[(current + 1) % 2]} won because ${currentp} forfeited >:(`,
          embeds: [],
          components: [],
          files: []
        });
      }

      if (current === death) {
        return await btncol.update({
          content: `**BANG!** ${currentp} died. ${players[(current + 1) % 2]} wins! \:D`,
          embeds: [],
          components: [],
          files: []
        });
      }

      current++;
      if (current >= 6) {
        return await btncol.update({ content: "It's a tie! Both of you survived :/", embeds: [], components: [], files: [] });
      }

      await btncol.deferUpdate();
      return play(message, players, current, death, interaction);

    } catch (e) {
      await interaction.editReply({ content: 'Game has timed out :c', embeds: [], components: [], files: [] });
    }
  } catch (err) {
    console.error('rr turn error:', err);
  }
}

async function genTurn(user) {
  const ipp = path.join(__dirname, 'base.png');
  const base = await loadImage(ipp);
  const canvas = createCanvas(base.width, base.height);
  const ctx = canvas.getContext('2d');
  const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));

  ctx.drawImage(base, 0, 0);
  const x = base.width * 0.72;
  const y = base.height * 0.45;
  const r = base.width * 0.12;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, x - r, y - r, r * 2, r * 2);
  ctx.restore();

  return new AttachmentBuilder(await canvas.encode(), { name: 'rr.png' });
}
