# Notes de version — killmutants.io

🌍 🇬🇧 [English](RELEASE_NOTES-en.md) · 🇫🇷 Français (ce fichier)

Ce qui a changé sur killmutants.io, une section par tag `release/*`, en langage clair. Ce
n'est pas un journal de commits : ça dit ce qu'un lecteur remarquerait. L'historique
technique, c'est celui du dépôt lui-même.

## Unreleased

## release/2026-09-03T09-40-33Z — 3 septembre 2026

### 🙌 Améliorations

- L'en-tête de la page d'accueil n'affiche plus un second lien GitHub — le hero a déjà son
  propre bouton bien visible « Star on GitHub » qui pointe vers la même page.

### 🐛 Corrections

- Restauration de l'ordre d'origine GitHub-avant-langue de l'en-tête sur ordinateur, après que
  la correction de l'ordre de tabulation mobile de la version précédente l'avait aussi changé
  là par effet de bord.
- Correction de l'accroche du hero (« Mutation testing for .NET · Coming soon ») qui se
  retrouvait collée à l'en-tête sur les fenêtres de largeur moyenne, et suppression de son
  icône.

## release/2026-09-03T06-48-42Z — 3 septembre 2026

### 🐛 Corrections

- Correction de l'en-tête sur les petits écrans de téléphone, où l'accroche du hero
  (« Mutation testing for .NET · Coming soon ») pouvait chevaucher la barre de navigation
  au-dessus.
- Sur les téléphones étroits, GitHub occupe désormais sa propre ligne centrée sous le
  sélecteur de langue, au lieu d'être serré sur la même ligne que le logo KillMutants.
- Correction d'un problème de navigation au clavier où la tabulation dans l'en-tête ne
  suivait pas l'ordre d'affichage à l'écran.
- Les liens de l'en-tête (GitHub, le sélecteur de langue) ont désormais le même effet de
  survol violet que tous les autres liens du site.

## release/2026-09-02T02-51-56Z — 2 septembre 2026

### ✨ Nouveautés

- Première version du site : une page d'annonce « bientôt disponible » avec le hero
  KillMutants, un court pitch, et un lien vers le dépôt GitHub de l'outil.
- Le site est désormais déployé sur Cloudflare Workers, accessible sur `killmutants.io`.
- Chaque page porte désormais un en-tête commun : le logo KillMutants (qui ramène à
  l'accueil), un lien vers le dépôt GitHub de l'outil, et un sélecteur de langue.
- Ajout d'une page `/version`, indiquant ce qu'est ce déploiement (release, commit, date de
  build) et ce que le site a livré en dernier — ces notes de version, en somme.
- Le site est désormais disponible en français, sur `/fr/`.

### 🐛 Corrections

- Correction de l'en-tête sur les petits écrans de téléphone, où le sélecteur de langue
  pouvait se retrouver superposé au logo KillMutants au lieu de passer en dessous.
