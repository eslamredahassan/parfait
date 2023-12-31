const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  TextInputComponent,
} = require("discord.js");

const { MongoClient } = require("mongodb");
const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");

const recruitments = require("../../src/database/models/recruitments");
const database = require("../../src/database/connect");
const messages = require("../assest/messages.js");
const banners = require("../assest/banners.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#ap_apply": {
          console.log(
            `\x1b[0m`,
            `\x1b[31m 〢`,
            `\x1b[33m ${moment(Date.now()).format("lll")}`,
            `\x1b[34m ${interaction.user.username} USED`,
            `\x1b[35m Apply Button`,
          );
          let member = guild.members.cache.get(interaction.user.id);
          if (member.roles.cache.has(config.coolDown))
            return interaction.reply({
              embeds: [
                {
                  title: `${emojis.cooldown} Cooldown Member Detected`,
                  description: `Hi ${interaction.user} you in <@&${config.coolDown}> duration, please try again later`,
                  color: color.gray,
                },
              ],
              //this is the important part
              ephemeral: true,
            });
          if (member.roles.cache.has(config.SquadSUN))
            return interaction.reply({
              embeds: [
                {
                  title: `${emojis.id} Sun Member Detected`,
                  description: `Hi ${interaction.user} you already in <@&${config.SquadSUN}>`,
                  color: color.gray,
                },
              ],
              //this is the important part
              ephemeral: true,
            });

          let applyChannel = interaction.guild.channels.cache.get(
            config.applyChannel,
          );
          if (!applyChannel) return;

          const user = interaction.user;
          const userName = user.username;

          const threadName = applyChannel.threads.cache.find(
            (x) => x.name === `${"🧤︱" + userName + " Tryout"}`,
          );

          if (member.roles.cache.has(config.waitRole))
            return interaction.update({
              embeds: [
                {
                  title: `${emojis.alert} Alert`,
                  description: `Hi ${interaction.user} We've already received your application`,
                  color: color.gray,
                  fields: [
                    {
                      name: `${emojis.tryOut} You're now in try out process`,
                      value: `${emojis.whiteDot} Check your try out post in ${threadName} thread`,
                      inline: true,
                    },
                  ],
                },
              ],
              //this is the important part
              ephemeral: true,
              components: [],
            });

          if (member.roles.cache.has(config.banRole))
            return interaction.update({
              embeds: [
                {
                  title: `${emojis.banApp} Freezed Member`,
                  description: `${emojis.whiteDot} Hi ${interaction.user} ${messages.Banned}`,
                  color: color.gray,
                  fields: [
                    {
                      name: `${emojis.question} If you think something is wrong`,
                      value: `${emojis.whiteDot} Talk to **Staff** or **Staff Sun**`,
                      inline: true,
                    },
                  ],
                },
              ],
              //this is the important part
              ephemeral: true,
              components: [],
            });
          //// Modal application code ///
          let application_modal = new Modal()
            .setTitle(`📝 Sun Legend Application`)
            .setCustomId(`application_modal`);

          const user_code = new TextInputComponent()
            .setCustomId("ap_usercode")
            .setLabel(`Smash Code`.substring(0, 45))
            .setMinLength(9)
            .setMaxLength(9)
            .setValue("jzso84o0q")
            .setRequired(true)
            .setPlaceholder(`Example: jzso84o0q`)
            .setStyle(1);

          const user_age = new TextInputComponent()
            .setCustomId("ap_userage")
            .setLabel(`How old are You`.substring(0, 45))
            .setMinLength(1)
            .setMaxLength(2)
            .setValue("27")
            .setRequired(true)
            .setPlaceholder(`Example: 18`)
            .setStyle(1);

          const user_ct = new TextInputComponent()
            .setCustomId("ap_userct")
            .setLabel(
              `Do you want to join competitions/trainings ?`.substring(0, 45),
            )
            .setMinLength(2)
            .setMaxLength(3)
            .setValue("Yes")
            .setRequired(true)
            .setPlaceholder(`Answer with Yes or No`)
            .setStyle(1);

          const user_legends = new TextInputComponent()
            .setCustomId("ap_userlegends")
            .setLabel(`What are your favorite legends ?`.substring(0, 45))
            .setMinLength(4)
            .setMaxLength(100)
            .setValue("Peter, Ravi, Alice, Zeppetta")
            .setRequired(true)
            .setPlaceholder(`Example: Peter, Robin, Cindy, Victor`)
            .setStyle(2);

          const user_why = new TextInputComponent()
            .setCustomId("ap_userwhy")
            .setLabel(`What can you bring to SUN ?`.substring(0, 45))
            .setMinLength(4)
            .setMaxLength(100)
            .setValue("Developing Parfait bot")
            .setRequired(true)
            .setPlaceholder(`Answer here`)
            .setStyle(2);

          let row_usercode = new MessageActionRow().addComponents(user_code);
          let row_userage = new MessageActionRow().addComponents(user_age);
          let row_userct = new MessageActionRow().addComponents(user_ct);
          let row_userlegends = new MessageActionRow().addComponents(
            user_legends,
          );
          let row_userwhy = new MessageActionRow().addComponents(user_why);
          application_modal.addComponents(
            row_usercode,
            row_userage,
            row_userct,
            row_userlegends,
            row_userwhy,
          );

          await interaction.showModal(application_modal);
        }
        default:
          break;
      }
    }
    //// Send application results in review room ////
    if (interaction.customId === "application_modal") {
      let user_code = interaction.fields.getTextInputValue("ap_usercode");
      let user_age = interaction.fields.getTextInputValue("ap_userage");
      let user_ct = interaction.fields.getTextInputValue("ap_userct");
      let user_legends = interaction.fields.getTextInputValue("ap_userlegends");
      let user_why = interaction.fields.getTextInputValue("ap_userwhy");
      if (isNaN(user_age)) {
        return interaction.reply({
          embeds: [
            {
              title: `${emojis.cross} Incorrect Age  Format`,
              description: `${emojis.threadMark} Your age must be a number, please resend the application`,
              color: color.gray,
            },
          ],
          ephemeral: true,
        });
      }

      let finishChannel = interaction.guild.channels.cache.get(
        config.finishChannel,
      );
      if (!finishChannel) return;

      const firstRow = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(5) //-->> Link Style
          .setLabel(` `)
          .setURL(`https://smashlegends.gg/en/user/${user_code}`)
          .setEmoji(emojis.slg),
        new MessageButton()
          .setStyle(3) //-->> Green Color
          .setCustomId("#ap_accept")
          .setLabel(`Aprove ${interaction.user.username}`)
          .setEmoji(emojis.accept),
        new MessageButton()
          .setStyle(1) //-->> Blurple Color
          .setCustomId("#ap_reject")
          .setLabel("Decline")
          .setEmoji(emojis.reject),
        new MessageButton()
          .setStyle(2) //-->> Grey Color
          .setCustomId("#ap_reply")
          .setLabel(``)
          .setEmoji(emojis.dm),
      ]);

      const secondRow = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(2) //-->> Grey Color
          .setCustomId("#silent_accept")
          .setLabel(`Approve Silently`)
          .setEmoji(emojis.s_accept),
        new MessageButton()
          .setStyle(2) //-->> Grey Color
          .setCustomId("#silent_reject")
          .setLabel("Decline Silently")
          .setEmoji(emojis.s_reject),
        new MessageButton()
          .setStyle(4) //-->> Red Color
          .setCustomId("#ap_freeze")
          .setLabel(`Freeze⠀`)
          .setEmoji(emojis.freeze),
      ]);

      const dev = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(2) //-->> Grey Color
          .setCustomId("#profile")
          .setLabel(`Dev`)
          .setEmoji(emojis.dev),
      ]);

      /// Embed of data in review room ///
      const application = new MessageEmbed()
        .setColor(color.gray)
        .setTitle(`${emojis.app} Requests to join SUN`)
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(` `)
        .setThumbnail(banners.appResultIcon)
        .setImage(banners.appResultBanner)
        .addFields([
          {
            name: `${emojis.discord} Discord Profile`,
            value: `${emojis.threadMark} ${interaction.user}`,
            inline: true,
          },
          {
            name: `${emojis.id} Smash Code`,
            value: `${emojis.threadMark} ||\`\`${user_code}\`\`||`,
            inline: true,
          },
          {
            name: `${emojis.competition} Competitions/Trainings`,
            value: `${emojis.threadMark} \`\`${user_ct}\`\``,
            inline: false,
          },
          {
            name: `${emojis.age} Age`,
            value: `${emojis.threadMark} ||\`\`${user_age}\`\`|| Years old`,
            inline: false,
          },
          {
            name: `${emojis.favorites} Favorite Legends`,
            value: `${emojis.threadMark} \`\`${user_legends}\`\``,
            inline: false,
          },
          {
            name: `${emojis.question} What can you bring to SUN ?`,
            value: `${emojis.threadMark} \`\`${user_why}\`\``,
            inline: false,
          },
          {
            name: `${emojis.time} Requested Since`,
            value: `${emojis.threadMark} <t:${Math.floor(
              Date.now() / 1000,
            )}:R>`,
            inline: false,
          },
        ])
        .setTimestamp()
        .setFooter({
          text: interaction.user.id,
          iconURL: banners.parfaitIcon,
        });

      const app = await finishChannel
        .send({ embeds: [application], components: [firstRow, secondRow] })
        .then((msg) => msg.pin());
      await app.startThread({
        name: `${interaction.user.username}'s Application`,
        autoArchiveDuration: 10080,
        type: "GUILD_PRIVATE_THREAD",
        reason: `${emojis.app} ${interaction.user.username} Requests to join SUN`,
      });

      async function run() {
        const client = new MongoClient(config.database);
        try {
          await client.connect();
          const database = client.db("parfaitdatabase");
          const recruitments = database.collection("recruitments");
          // create a document to insert
          const ap_user = {
            ap_id: interaction.user.id,
            name: interaction.user.username,
            code: user_code,
            competition: user_ct,
            age: user_age,
            favorites: user_legends,
            question: user_why,
            created_in: new Date(),
          };
          const result = await recruitments.insertOne(ap_user);
          console.log(
            `\x1b[0m`,
            `\x1b[32m ├`,
            `\x1b[31m ${interaction.user.username}`,
            `\x1b[0m`,
            `\x1b[33mAPPLICATION ADDED TO`,
            `\x1b[35m Database`,
            `\x1b[35 ${result.insertedId}`,
          );
        } finally {
          await client.close();
        }
      }
      run().catch(console.dir);

      //// Console Log Data ///
      console.log(
        `\x1b[0m`,
        `\x1b[32m ├`,
        `\x1b[33m Smash Code:`,
        `\x1b[35m${user_code}`,
      ),
        console.log(`\x1b[32m  ├`, `\x1b[33m Age:`, `\x1b[35m${user_age}`),
        console.log(
          `\x1b[0m`,
          `\x1b[32m ├`,
          `\x1b[33m Competitions/Trainings:`,
          `\x1b[35m${user_ct}`,
        ),
        console.log(
          `\x1b[0m`,
          `\x1b[32m ├`,
          `\x1b[33m Favorite Legends:`,
          `\x1b[35m${user_legends}`,
        ),
        console.log(
          `\x1b[0m`,
          `\x1b[32m └`,
          `\x1b[33m What can you bring to SUN:`,
          `\x1b[35m${user_why}`,
        );

      //// Create Thread ///
      try {
        let applyChannel = interaction.guild.channels.cache.get(
          config.applyChannel,
        );
        if (!applyChannel) return;

        const user = interaction.user;
        const userName = user.username;

        const thread = await applyChannel.threads.create({
          name: "🧤︱" + userName + " Tryout",
          autoArchiveDuration: 10080,
          type: "GUILD_PRIVATE_THREAD",
          reason: `${emojis.app} ${user} Requests to join SUN`,
        });

        const threads = applyChannel.threads.cache.find(
          (x) => x.name === "🧤︱" + userName + " Tryout",
        );

        await threads.members
          .add(user)
          .catch((error) => console.log(error.message));

        //// Send reply messge after applying ///
        await interaction.update({
          embeds: [
            {
              title: `${emojis.check} Your basic application has been sent for review`,
              description: `- Thank you ${interaction.user} ${messages.appSentmessage} in ${threads} channel`,
              color: color.gray,
              ///thumbnail: { url: 'https://i.imgur.com/FiSTCop.png', },
              image: { url: banners.appSentbanner },
            },
          ],
          //this is the important part
          ephemeral: true,
          components: [],
        });

        //// Send message in thread ///
        let dev = new MessageActionRow().addComponents([
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#ap_giveup")
            .setLabel(`[Dev] Tryout Report`)
            .setEmoji(emojis.dev),
        ]);
        //// Send message in thread ///
        let controller = new MessageActionRow().addComponents([
          new MessageButton()
            .setStyle(2)
            .setDisabled(false)
            .setCustomId("#ap_questions")
            .setLabel(`Continue`)
            .setEmoji(emojis.next),
        ]);

        await thread.sendTyping();
        await wait(5000);

        await thread.send({
          content: `${emojis.pinkDot} Hi ${user} We need to complete some information in your application\n${emojis.threadMarkmid} Press continue to start see the questions\n${emojis.threadMarkmid} Answer each question separately after using the reply button\n${emojis.threadMarkmid} Skipping the questions or spamming the button causes your application to be rejected\n${emojis.threadMark} Your answers most be in **English**`,
          components: [controller],
        });

        console.log(
          `\x1b[0m`,
          `\x1b[31m 〢`,
          `\x1b[33m ${moment(Date.now()).format("lll")}`,
          `\x1b[34m Created thread for`,
          `\x1b[35m ${thread.name}`,
        );
      } catch (error) {
        console.log(`Error ` + error.message);
      }
      ////----------------------------////

      //// Add Waitlist Role ///
      await interaction.member.roles
        .add(config.waitRole)
        .catch((error) => console.log(error.message));
      console.log(
        `\x1b[0m`,
        `\x1b[31m 🛠`,
        `\x1b[33m ${moment(Date.now()).format("lll")}`,
        `\x1b[34m Sun wannabe role added to`,
        `\x1b[34m ${interaction.user.username}`,
      );
      ////----------------------------////
    }
  });
};
