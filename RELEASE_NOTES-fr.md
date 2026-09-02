# Notes de version — killmutants.io

🌍 🇬🇧 [English](RELEASE_NOTES-en.md) · 🇫🇷 Français (ce fichier)

Ce qui a changé sur killmutants.io, une section par tag `release/*`, en langage clair. Ce
n'est pas un journal de commits : ça dit ce qu'un lecteur remarquerait. L'historique
technique, c'est celui du dépôt lui-même.

## Unreleased

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
