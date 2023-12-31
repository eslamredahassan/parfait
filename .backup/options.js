const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");

const interface = require("../../assest/interface");
const fieldsText = require("../../assest/fieldsText");
const responses = require("../../assest/responses");
const banners = require("../../assest/banners.js");
const color = require("../../assest/color.js");
const emojis = require("../../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    const choice = interaction.options.getString("mode");
    if (choice == "_opened") {
      const Messages = [
        `${responses.lazy}`,
        `${responses.know}`,
        `${responses.busy}`,
        `${responses.wait}`,
      ];
      const Response = Messages[Math.floor(Math.random() * Messages.length)];

      if (cooldown.has(interaction.user.id)) {
        interaction.reply({
          embeds: [
            {
              title: `${emojis.cooldown} Cooldown`,
              description:
                `${emojis.whiteDot} Hi  <@${interaction.user.id}>` +
                ` ${Response}`,
              color: color.gray,
            },
          ],
          //this is the important part
          ephemeral: true,
        });
      } else {
        let applyChannel = interaction.guild.channels.cache.get(
          config.applyChannel,
        );
        if (!applyChannel) return;

        let buttons = new MessageActionRow().addComponents([
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#about-menu")
            .setLabel("About us")
            .setEmoji(emojis.aboutSun),
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#faq")
            .setLabel("FAQ")
            .setEmoji(emojis.faq),
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#requirements")
            .setLabel("Sun Application")
            .setEmoji(emojis.requirements),
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#close")
            .setLabel(" ")
            .setEmoji(emojis.more),
        ]);

        const perms = [`${config.devRole}`, `${config.devRoleTest}`];
        let staff = guild.members.cache.get(interaction.user.id);
        if (staff.roles.cache.hasAny(...perms)) {
          applyChannel.send({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(
                  `${emojis.app} ${interaction.guild.name}\n${emojis.threadMark}Recruitments Application System`,
                )
                .setDescription(interface.MainUImessage)
                .setThumbnail(Logo)
                .setImage(banners.openBanner)
                .addFields(
                  {
                    name: `${emojis.r_rank} Required Rank`,
                    value: fieldsText.rank,
                    inline: true,
                  },
                  {
                    name: `${emojis.r_level} Required Level`,
                    value: fieldsText.level,
                    inline: true,
                  },
                ),
            ],
            components: [buttons],
          });
          await interaction.reply({
            embeds: [
              {
                title: `${emojis.check} Opened Interface`,
                description: `${emojis.threadMark} Opened Interface has been set up in ${applyChannel}`,
                //thumbnail: { url: banners.setupIcon },
                color: color.gray,
              },
            ],
            //this is the important part
            ephemeral: true,
            components: [],
          });
        } else {
          await interaction
            .reply({
              embeds: [
                {
                  title: `${emojis.alert} Permission denied`,
                  description: errors.permsError,
                  color: color.gray,
                },
              ],
              //this is the important part
              ephemeral: true,
            })
            .catch(() => console.log("Error Line 831"));
        }
        console.log(
          `\x1b[31m  〢`,
          `\x1b[33m ${moment(Date.now()).format("lll")}`,
          `\x1b[34m ${interaction.user.username}`,
          `\x1b[35m Setup`,
          `\x1b[32m OPENED MODE`,
        );
      }
    } else if (choice == "_closed") {
      const Messages = [
        `${responses.lazy}`,
        `${responses.know}`,
        `${responses.busy}`,
        `${responses.wait}`,
      ];
      const Response = Messages[Math.floor(Math.random() * Messages.length)];

      if (cooldown.has(interaction.user.id)) {
        interaction.reply({
          embeds: [
            {
              title: `${emojis.cooldown} Cooldown`,
              description:
                `${emojis.whiteDot} Hi  <@${interaction.user.id}>` +
                ` ${Response}`,
              color: color.gray,
            },
          ],
          //this is the important part
          ephemeral: true,
        });
      } else {
        let applyChannel = interaction.guild.channels.cache.get(
          config.applyChannel,
        );
        if (!applyChannel) return;

        let buttons = new MessageActionRow().addComponents([
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#about-menu")
            .setLabel("About us")
            .setEmoji(emojis.aboutSun),
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#faq")
            .setLabel("FAQ")
            .setEmoji(emojis.faq),
          new MessageButton()
            .setStyle(2)
            .setDisabled(true)
            .setCustomId("#requirements")
            .setLabel("Sun Application")
            .setEmoji(emojis.requirements),
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#open")
            .setLabel(" ")
            .setEmoji(emojis.on),
        ]);

        const perms = [`${config.devRole}`, `${config.devRoleTest}`];
        let staff = guild.members.cache.get(interaction.user.id);
        if (staff.roles.cache.hasAny(...perms)) {
          await applyChannel.send({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(
                  `${emojis.app} ${interaction.guild.name}\n${emojis.threadMark}Recruitments Application System`,
                )
                .setDescription(interface.MainUImessage)
                .setThumbnail(Logo)
                .setImage(banners.closeBanner)
                .addFields(
                  {
                    name: `${emojis.r_rank} Required Rank`,
                    value: fieldsText.rank,
                    inline: true,
                  },
                  {
                    name: `${emojis.r_level} Required Level`,
                    value: fieldsText.level,
                    inline: true,
                  },
                ),
            ],
            components: [buttons],
          });

          await interaction.reply({
            embeds: [
              {
                title: `${emojis.check} Closed Interface`,
                description: `${emojis.threadMark} Closed Interface has been set up in ${applyChannel}`,
                //thumbnail: { url: banners.maintenanceIcon },
                color: color.gray,
              },
            ],
            //this is the important part
            ephemeral: true,
            components: [],
          });
        } else {
          return await interaction
            .reply({
              embeds: [
                {
                  title: `${emojis.alert} Permission denied`,
                  description: errors.permsError,
                  color: color.gray,
                },
              ],
              //this is the important part
              ephemeral: true,
            })
            .catch((e) => {});
        }
        console.log(
          `\x1b[31m  〢`,
          `\x1b[33m ${moment(Date.now()).format("lll")}`,
          `\x1b[34m ${interaction.user.username}`,
          `\x1b[35m Setup`,
          `\x1b[31mCLOSED MODE`,
        );
      }
    } else if (choice == "_maintenance") {
      const Messages = [
        `${responses.lazy}`,
        `${responses.know}`,
        `${responses.busy}`,
        `${responses.wait}`,
      ];
      const Response = Messages[Math.floor(Math.random() * Messages.length)];

      if (cooldown.has(interaction.user.id)) {
        interaction.reply({
          embeds: [
            {
              title: `${emojis.cooldown} Cooldown`,
              description:
                `${emojis.whiteDot} Hi  <@${interaction.user.id}>` +
                ` ${Response}`,
              color: color.gray,
            },
          ],
          //this is the important part
          ephemeral: true,
        });
      } else {
        let applyChannel = interaction.guild.channels.cache.get(
          config.applyChannel,
        );
        if (!applyChannel) return;

        let buttons = new MessageActionRow().addComponents([
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#about-menu")
            .setLabel("About us")
            .setEmoji(emojis.aboutSun),
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#faq")
            .setLabel("FAQ")
            .setEmoji(emojis.faq),
          new MessageButton()
            .setStyle(2)
            .setDisabled(true)
            .setCustomId("#requirements")
            .setLabel("Sun Application")
            .setEmoji(emojis.requirements),
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#open")
            .setLabel(" ")
            .setEmoji(emojis.on),
        ]);

        const perms = [`${config.devRole}`, `${config.devRoleTest}`];
        let staff = guild.members.cache.get(interaction.user.id);
        if (staff.roles.cache.hasAny(...perms)) {
          await applyChannel.send({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(
                  `${emojis.app} ${interaction.guild.name}\n${emojis.threadMark}Recruitments Application System`,
                )
                .setDescription(interface.MainUImessage)
                .setThumbnail(Logo)
                .setImage(banners.closeBanner)
                .addFields(
                  {
                    name: `${emojis.r_rank} Required Rank`,
                    value: fieldsText.rank,
                    inline: true,
                  },
                  {
                    name: `${emojis.r_level} Required Level`,
                    value: fieldsText.level,
                    inline: true,
                  },
                ),
            ],
            components: [buttons],
          });

          await interaction.reply({
            embeds: [
              {
                title: `${emojis.check} Closed Interface`,
                description: `${emojis.threadMark} Closed Interface has been set up in ${applyChannel}`,
                //thumbnail: { url: banners.maintenanceIcon },
                color: color.gray,
              },
            ],
            //this is the important part
            ephemeral: true,
            components: [],
          });
        } else {
          return await interaction
            .reply({
              embeds: [
                {
                  title: `${emojis.alert} Permission denied`,
                  description: errors.permsError,
                  color: color.gray,
                },
              ],
              //this is the important part
              ephemeral: true,
            })
            .catch((e) => {});
        }
        console.log(
          `\x1b[31m  〢`,
          `\x1b[33m ${moment(Date.now()).format("lll")}`,
          `\x1b[34m ${interaction.user.username}`,
          `\x1b[35m Setup`,
          `\x1b[31mCLOSED MODE`,
        );
      }
    }
  });
};
