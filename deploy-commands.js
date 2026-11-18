require("dotenv").config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const command = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Crée ou met à jour la structure officielle de KEV ENTREPRISE")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const required = ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Variable manquante : ${key}`);
    process.exit(1);
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [command.toJSON()] }
    );
    console.log("Commande /setup enregistrée sur le serveur.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();