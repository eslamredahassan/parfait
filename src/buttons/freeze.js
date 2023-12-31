const {
  MessageActionRow,
  MessageEmbed,
  Modal,
  TextInputComponent,
} = require("discord.js");

const { MongoClient } = require("mongodb");
const moment = require("moment");
const wait = require("util").promisify(setTimeout);

const freezeSchema = require("../../src/database/models/freeze");
const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#ap_freeze": {
          const ID = interaction.message.embeds[0].footer.text;
          const user = await interaction.guild.members.fetch(ID);

          //// Modal application code ///
          let reply_modal = new Modal()
            .setTitle(`Freeze reason of ${user.user.username}`)
            .setCustomId(`ap_freeze`);

          const ap_reason = new TextInputComponent()
            .setCustomId("ap_reason")
            .setLabel(`Direct Messaging box`.substring(0, 45))
            .setMinLength(1)
            .setMaxLength(365)
            .setRequired(false)
            .setPlaceholder(`Type your message here`)
            .setStyle(2);

          let row_reply = new MessageActionRow().addComponents(ap_reason);
          reply_modal.addComponents(row_reply);

          const perms = [`${config.devRole}`, `${config.devRoleTest}`];
          let staff = guild.members.cache.get(interaction.user.id);
          if (staff.roles.cache.hasAny(...perms)) {
            await interaction.showModal(reply_modal);
          } else {
            await interaction
              .reply({
                embeds: [
                  {
                    title: `${emojis.alert} Permission denied`,
                    description: `${errors.permsError}`,
                    color: color.gray,
                  },
                ],
                //this is the important part
                ephemeral: true,
              })
              .catch(() => console.log("Error Line 185"));
            console.log(
              `\x1b[0m`,
              `\x1b[31m 🛠`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[33m Permission denied`,
            );
          }
        }
        default:
          break;
      }
    }
    //// Send application results in review room ////
    if (interaction.customId === "ap_freeze") {
      let reason = interaction.fields.getTextInputValue("ap_reason");

      /// Embed of data in review room ///
      let embed = new MessageEmbed(interaction.message.embeds[0])
        .setTitle(`${emojis.alert} Banned by ${interaction.user.username}`)
        .setColor(color.gray)
        .setImage(banners.bannedBanner)
        .setThumbnail(banners.bannedIcon)
        .setTimestamp();
      /// Edit Review Embed ///
      await interaction.message
        .edit({
          embeds: [embed],
          components: [],
        })
        .then((msg) => msg.unpin());
      //// Send message to rejected member ///
      const ID = interaction.message.embeds[0].footer.text;
      const ap_user = await interaction.guild.members.fetch(ID);
      /// Console Action ///
      console.log(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("lll")}`,
        `\x1b[34m ${ap_user.user.username}`,
        `\x1b[32m REJECTED BY ${interaction.user.username}`,
      );
      await ap_user.send({
        embeds: [
          new MessageEmbed()
            .setColor(color.gray)
            .setTitle(`${emojis.freeze} Freezed`)
            .setImage(banners.bannedBanner)
            .setDescription(
              reason ||
                `You have been frozen from the recruitments application system for breaking the rules`,
            ),
        ],
      });
      //// Send reply message after rejecting member ///
      await interaction.reply({
        embeds: [
          {
            title: `${emojis.snow} Freeze Alert`,
            description: `${emojis.threadMarkmid} You frozen ${ap_user} from the recruitments application system\n${emojis.threadMarkmid} Removed his application from pin list\n${emojis.threadMark} His thread will be automatically archived in \`\`20 Seconds\`\``,
            color: color.gray,
          },
        ],
        //this is the important part
        ephemeral: true,
      });
      //// Send message to log channel after freezing member ///
      const log = interaction.guild.channels.cache.get(config.log);
      await log.send({
        embeds: [
          {
            title: `${emojis.log} Freez Log`,
            description: `${emojis.snow} ${ap_user.user} have been frozen by ${interaction.user}`,
            color: color.gray,
            fields: [
              {
                name: `${emojis.reason} Frozen Reason`,
                value: reason || `No Reason Found`,
                inline: false,
              },
            ],
            timestamp: new Date(),
            footer: {
              text: "Freezed in",
              icon_url: banners.parfaitIcon,
            },
          },
        ],
        //this is the important part
        ephemeral: false,
      });
      //// Try to manage his roles ///
      async function run() {
        const client = new MongoClient(config.database);
        try {
          //// Send message to rejected member ///
          const ID = interaction.message.embeds[0].footer.text;
          const ap_user = await interaction.guild.members.fetch(ID);
          await client.connect();
          const database = client.db("parfaitdatabase");
          const freeze = database.collection("freeze");
          // create a document to insert
          const freeze_user = {
            ap_user_id: ap_user.id,
            username: ap_user.user.username,
            staff_id: interaction.user.id,
            reason: reason || `no reason`,
            freeze_role: config.banRole,
            created_in: new Date(),
          };
          const result = await freeze.insertOne(freeze_user);
          console.log(
            `\x1b[0m`,
            `\x1b[32m ├`,
            `\x1b[31m ${interaction.user.username}`,
            `\x1b[0m`,
            `\x1b[33mAPPLICATION ADDED TO`,
            `\x1b[35m Database`,
            `\x1b[35 ${result.insertedId}`,
          );

          await ap_user.roles
            .remove(config.waitRole)
            .catch(() => console.log("Error Line 134"));
          await ap_user.roles
            .add(config.banRole)
            .catch(() => console.log("Error Line 135"));

          console.log(
            `\x1b[0m`,
            `\x1b[31m 🛠`,
            `\x1b[33m ${moment(Date.now()).format("lll")}`,
            `\x1b[33m Sun wannabe role REMOVED\n`,
            `\x1b[33m Freeze role ADDED`,
          );
        } finally {
          await client.close();
        }
      }
      run().catch(console.dir);
      let applyChannel = interaction.guild.channels.cache.get(
        config.applyChannel,
      );
      if (!applyChannel) return;

      const user = ap_user.user;
      const userName = user.username;

      const threadName = applyChannel.threads.cache.find(
        (x) => x.name === `${"🧤︱" + userName + " Tryout" || " Accepted"}`,
      );

      /// Rename The Thread ///
      await threadName.setName("🧤︱" + `${userName}` + " Freezed");
      /// Lock the thread ///
      await wait(5000); // ** cooldown 10 seconds ** \\
      await threadName.setLocked(true);
      /// Archive the thread ///
      await wait(8000); // ** cooldown 10 seconds ** \\
      await threadName.setArchived(true);
    }
  });
};
