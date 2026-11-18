require("dotenv").config();
const {
  Client, GatewayIntentBits, ChannelType, PermissionsBitField,
  PermissionFlagsBits
} = require("discord.js");

if (!process.env.DISCORD_TOKEN) {
  console.error("DISCORD_TOKEN est absent des variables d'environnement.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const roleDefinitions = [
  { name: "👑・Propriétaire", color: 0xE6B422 },
  { name: "🏢・Direction générale", color: 0x5865F2 },
  { name: "💼・Direction adjointe", color: 0x7289DA },
  { name: "🔧・Responsable garage", color: 0x3498DB },
  { name: "🛠️・Chef d'équipe garage", color: 0x2980B9 },
  { name: "🔩・Mécanicien", color: 0x95A5A6 },
  { name: "🏪・Responsable LTD", color: 0x2ECC71 },
  { name: "📦・Chef d'équipe LTD", color: 0x27AE60 },
  { name: "🛒・Employé LTD", color: 0xA3CB38 },
  { name: "👷・Employé garage", color: 0x7F8C8D },
  { name: "🛡️・Ressources humaines", color: 0x9B59B6 },
  { name: "🎫・Support", color: 0x1ABC9C }
];

const everyone = (guild) => ({
  [guild.roles.everyone.id]: {
    ViewChannel: true,
    SendMessages: false,
    ReadMessageHistory: true
  }
});

function overwritesFor(guild, roleMap, allowedRoles = [], extra = {}) {
  const overwrites = [{
    id: guild.roles.everyone.id,
    deny: [PermissionFlagsBits.ViewChannel]
  }];
  for (const roleName of allowedRoles) {
    const role = roleMap.get(roleName);
    if (role) overwrites.push({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles
      ]
    });
  }
  for (const [id, perms] of Object.entries(extra)) {
    overwrites.push({ id, allow: perms });
  }
  return overwrites;
}

async function ensureRole(guild, definition) {
  let role = guild.roles.cache.find(r => r.name === definition.name);
  if (!role) {
    role = await guild.roles.create({
      name: definition.name,
      color: definition.color,
      mentionable: false,
      reason: "Configuration initiale KEV ENTREPRISE"
    });
  } else if (role.color !== definition.color) {
    await role.setColor(definition.color, "Mise à jour des couleurs KEV ENTREPRISE");
  }
  return role;
}

async function ensureCategory(guild, name, allowedRoles, roleMap) {
  let category = guild.channels.cache.find(c =>
    c.type === ChannelType.GuildCategory && c.name === name
  );
  const permissionOverwrites = overwritesFor(guild, roleMap, allowedRoles);
  if (!category) {
    category = await guild.channels.create({
      name, type: ChannelType.GuildCategory, permissionOverwrites,
      reason: "Configuration KEV ENTREPRISE"
    });
  } else {
    await category.permissionOverwrites.set(permissionOverwrites);
  }
  return category;
}

async function ensureTextChannel(guild, name, parent, allowedRoles, roleMap, topic = "") {
  let channel = guild.channels.cache.find(c =>
    c.type === ChannelType.GuildText && c.name === name
  );
  const permissionOverwrites = overwritesFor(guild, roleMap, allowedRoles);
  if (!channel) {
    channel = await guild.channels.create({
      name, type: ChannelType.GuildText, parent: parent.id,
      topic, permissionOverwrites,
      reason: "Configuration KEV ENTREPRISE"
    });
  } else {
    await channel.setParent(parent.id, { lockPermissions: false });
    await channel.permissionOverwrites.set(permissionOverwrites);
    if (topic) await channel.setTopic(topic);
  }
  return channel;
}

async function createStructure(guild) {
  await guild.roles.fetch();
  await guild.channels.fetch();

  const roleMap = new Map();
  for (const def of roleDefinitions) {
    roleMap.set(def.name, await ensureRole(guild, def));
  }

  const R = Object.fromEntries([...roleMap.entries()]);
  const ownerAndDirection = [
    "👑・Propriétaire", "🏢・Direction générale", "💼・Direction adjointe"
  ];
  const garageTeam = [
    ...ownerAndDirection,
    "🔧・Responsable garage", "🛠️・Chef d'équipe garage",
    "🔩・Mécanicien", "👷・Employé garage", "🛡️・Ressources humaines"
  ];
  const ltdTeam = [
    ...ownerAndDirection,
    "🏪・Responsable LTD", "📦・Chef d'équipe LTD",
    "🛒・Employé LTD", "🛡️・Ressources humaines"
  ];
  const allStaff = [...new Set([...garageTeam, ...ltdTeam, "🎫・Support"])];

  const common = await ensureCategory(guild, "📌・ESPACE COMMUN", allStaff, roleMap);
  await ensureTextChannel(guild, "👋・bienvenue", common, allStaff, roleMap,
    "Bienvenue chez KEV ENTREPRISE.");
  await ensureTextChannel(guild, "📜・règlement", common, allStaff, roleMap,
    "Règlement général de l'entreprise.");
  await ensureTextChannel(guild, "📢・annonces-générales", common, allStaff, roleMap,
    "Annonces concernant l'ensemble de KEV ENTREPRISE.");
  await ensureTextChannel(guild, "💬・discussion-générale", common, allStaff, roleMap,
    "Espace d'échange commun aux deux établissements.");
  await ensureTextChannel(guild, "🎫・support-général", common, allStaff, roleMap,
    "Demandes concernant l'entreprise dans son ensemble.");

  const direction = await ensureCategory(guild, "👑・DIRECTION GÉNÉRALE", ownerAndDirection, roleMap);
  await ensureTextChannel(guild, "💬・discussion-direction", direction, ownerAndDirection, roleMap);
  await ensureTextChannel(guild, "📊・gestion-entreprise", direction, ownerAndDirection, roleMap);
  await ensureTextChannel(guild, "📝・rapports-direction", direction, ownerAndDirection, roleMap);
  await ensureTextChannel(guild, "📅・réunions-direction", direction, ownerAndDirection, roleMap);

  const garage = await ensureCategory(guild, "🔧・KEV GARAGE AUTOMOBILE", garageTeam, roleMap);
  await ensureTextChannel(guild, "📢・annonces-garage", garage, garageTeam, roleMap);
  await ensureTextChannel(guild, "💬・discussion-garage", garage, garageTeam, roleMap);
  await ensureTextChannel(guild, "📅・planning-garage", garage, garageTeam, roleMap);
  await ensureTextChannel(guild, "🔩・interventions", garage, garageTeam, roleMap);
  await ensureTextChannel(guild, "📦・stock-garage", garage, garageTeam, roleMap);
  await ensureTextChannel(guild, "🧾・facturation-garage", garage, garageTeam, roleMap);
  await ensureTextChannel(guild, "📊・rapports-garage", garage, garageTeam, roleMap);

  const ltd = await ensureCategory(guild, "🏪・KEV LTD MIRROR PARK", ltdTeam, roleMap);
  await ensureTextChannel(guild, "📢・annonces-ltd", ltd, ltdTeam, roleMap);
  await ensureTextChannel(guild, "💬・discussion-ltd", ltd, ltdTeam, roleMap);
  await ensureTextChannel(guild, "📅・planning-ltd", ltd, ltdTeam, roleMap);
  await ensureTextChannel(guild, "📦・stock-ltd", ltd, ltdTeam, roleMap);
  await ensureTextChannel(guild, "🛒・commandes-ltd", ltd, ltdTeam, roleMap);
  await ensureTextChannel(guild, "📊・rapports-ltd", ltd, ltdTeam, roleMap);

  const hr = await ensureCategory(guild, "👥・RESSOURCES HUMAINES", [
    ...ownerAndDirection, "🛡️・Ressources humaines"
  ], roleMap);
  const hrRoles = [...ownerAndDirection, "🛡️・Ressources humaines"];
  await ensureTextChannel(guild, "📥・recrutement", hr, hrRoles, roleMap);
  await ensureTextChannel(guild, "📁・dossiers-employés", hr, hrRoles, roleMap);
  await ensureTextChannel(guild, "⚠️・suivi-disciplinaire", hr, hrRoles, roleMap);
  await ensureTextChannel(guild, "📝・demandes-absence", hr, hrRoles, roleMap);

  const staff = await ensureCategory(guild, "🛡️・ADMINISTRATION", ownerAndDirection, roleMap);
  await ensureTextChannel(guild, "📜・logs", staff, ownerAndDirection, roleMap);
  await ensureTextChannel(guild, "🤖・commandes-bot", staff, ownerAndDirection, roleMap);
  await ensureTextChannel(guild, "🔐・staff-chat", staff, ownerAndDirection, roleMap);

  return roleMap;
}

client.once("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "setup") return;

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: "Seuls les administrateurs peuvent lancer cette configuration.", ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  try {
    await createStructure(interaction.guild);
    await interaction.editReply(
      "✅ La structure KEV ENTREPRISE a été créée/mise à jour. Vérifie les rôles et les accès avant d'inviter les employés."
    );
  } catch (error) {
    console.error(error);
    await interaction.editReply(
      "❌ La configuration a rencontré une erreur. Vérifie les permissions du bot et sa position dans la hiérarchie des rôles."
    );
  }
});

client.login(process.env.DISCORD_TOKEN);