# Time Party

Party game inspiré de Time's Up, à jouer sur un seul téléphone.

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000 (sur téléphone : l'adresse IP de l'ordinateur, port 3000, sur le même Wi-Fi).

## Déployer sur Vercel

Importer le dépôt sur vercel.com : aucun réglage nécessaire.

## Où modifier quoi ?

- `data/words.ts` : les mots du mode classique
- `lib/game.ts` : règles et réglages (manches, durées du tour, nombre de cartes par joueur)
- `lib/teams.ts` : couleurs et noms par défaut des équipes
- `app/setup/page.tsx` : écrans de configuration
- `app/game/page.tsx` : écrans de jeu
