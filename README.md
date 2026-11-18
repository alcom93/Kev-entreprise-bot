# KEV ENTREPRISE — Bot Discord

Ce bot crée la structure de base du serveur KEV ENTREPRISE avec une direction commune, un espace garage privé et un espace LTD privé.

## Ce que fait `/setup`

- Crée les rôles de direction, garage, LTD, RH et support.
- Crée les catégories et salons.
- Réutilise les catégories, salons et rôles déjà présents portant exactement les mêmes noms.
- Configure les accès : les employés du garage ne voient pas les salons internes du LTD, et inversement.
- Donne à la direction générale l'accès aux deux établissements.

## Important avant de lancer

1. Le bot doit être ajouté au serveur avec `Manage Channels`, `Manage Roles`, `View Channels`, `Send Messages` et `Read Message History`.
2. Dans les paramètres du serveur, place le rôle du bot au-dessus de tous les rôles qu'il doit gérer.
3. Ne donne jamais ton token de bot à quelqu'un. Ne le publie pas sur GitHub.
4. Le fichier `.env` ne doit jamais être envoyé sur GitHub. Utilise les variables d'environnement de ton hébergeur.

## Installation locale

```bash
npm install
```

Crée un fichier `.env` à partir de `.env.example`, puis renseigne :
- `DISCORD_TOKEN` : token du bot (secret)
- `CLIENT_ID` : ID de l'application Discord
- `GUILD_ID` : ID du serveur KEV ENTREPRISE

Enregistre la commande :

```bash
npm run register
```

Lance le bot :

```bash
npm start
```

Puis utilise `/setup` sur ton serveur Discord.

## Hébergement

GitHub stocke le code, mais ne fait pas tourner le bot en continu. Il faut un hébergeur Node.js qui autorise un processus persistant. Ajoute les trois variables ci-dessus dans les paramètres secrets/de variables d'environnement de cet hébergeur.

## Limites de cette première version

- `/setup` construit la structure, mais ne crée pas encore les tickets interactifs.
- Les salons RH sont privés au rôle RH et à la direction.
- Les permissions sont volontairement limitées ; le bot ne reçoit pas `Administrator`.
- La commande peut être relancée pour réappliquer les permissions. Vérifie les salons existants avant le premier lancement.
