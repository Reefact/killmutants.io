/**
 * Every string the site displays, in every locale.
 *
 * English is the source: its object defines the key set, and French is declared as
 * `Record<UiKey, string>`, so a missing key or an extra one is a compile error —
 * `pnpm check` catches a half-translated page before it ships, rather than falling back
 * silently to English.
 *
 * What belongs here is prose. Facts — the product name, URLs — live in `site.ts` and stay
 * the same in every locale (see `KILLMUTANTS`, `killmutants.io`, and links in the markup).
 */

export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** The name of each locale, written in that locale. Never a flag: a flag names a country. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/** The BCP 47 tags used for `<html lang>` and `hreflang`. */
export const localeTags: Record<Locale, string> = {
  en: "en",
  fr: "fr",
};

const en = {
  "nav.github": "GitHub",
  "nav.primary": "Primary",

  "language.label": "Language",
  "language.switch": "Read this page in",

  "home.eyebrow": "Mutation Testing for .NET — Coming Soon",
  "home.description.before":
    "Your unit tests pass. That doesn't mean they work. KillMutants is a new mutation testing tool for .NET, built native for",
  "home.description.highlight": "xUnit v3 4.x",
  "home.description.after": "and Microsoft Testing Platform v2 — currently in development.",
  "home.cta": "Star on GitHub",
  "home.meta.description":
    "KillMutants is a new mutation testing tool for .NET, built native for xUnit v3 4.x and Microsoft Testing Platform v2. Currently in development.",

  "home.pitch.01.title": "Passing tests aren't proof",
  "home.pitch.01.body":
    "Mutation testing injects small, deliberate bugs into your own code and checks whether your test suite notices. Green coverage numbers don't tell you that — a killed mutant does.",
  "home.pitch.02.title": "Built for where .NET testing is going",
  "home.pitch.02.body":
    "Native support for xUnit v3 4.x and Microsoft Testing Platform v2 from day one — not an older architecture catching up to them later.",
  "home.pitch.03.title": "In active development",
  "home.pitch.03.body":
    "KillMutants is being built right now. Watch the repo to follow progress and get notified the moment it's ready to run against your own test suite.",

  "version.title": "Version",
  "version.subtitle": "Build & release info",
  "version.meta.description": "What this deployment of killmutants.io is, and what it last shipped.",

  "version.thisBuild.heading": "This build",
  "version.thisBuild.lead": "What this deployment of killmutants.io is.",
  "version.release": "Release",
  "version.commit": "Commit",
  "version.built": "Built",

  "version.latest.heading": "Latest release",
  "version.latest.lead": "What this site last shipped.",
  "version.noReleases": "Nothing has been tagged as a release yet — this site is still on its first, unreleased build.",
  "version.viewOnGithub": "View on GitHub",

  "version.previous.heading": "Previous releases",
  "version.previous.lead": "The releases published just before the latest one.",
  "version.previous.viewMoreOnGithub": "View more on GitHub",
};

export type UiKey = keyof typeof en;

const fr: Record<UiKey, string> = {
  "nav.github": "GitHub",
  "nav.primary": "Principale",

  "language.label": "Langue",
  "language.switch": "Lire cette page en",

  "home.eyebrow": "Tests de mutation pour .NET — Bientôt disponible",
  "home.description.before":
    "Vos tests unitaires passent. Ça ne veut pas dire qu'ils fonctionnent. KillMutants est un nouvel outil de test de mutation pour .NET, natif pour",
  "home.description.highlight": "xUnit v3 4.x",
  "home.description.after": "et Microsoft Testing Platform v2 — actuellement en développement.",
  "home.cta": "Star sur GitHub",
  "home.meta.description":
    "KillMutants est un nouvel outil de test de mutation pour .NET, natif pour xUnit v3 4.x et Microsoft Testing Platform v2. Actuellement en développement.",

  "home.pitch.01.title": "Des tests qui passent ne prouvent rien",
  "home.pitch.01.body":
    "Le test de mutation injecte de petits bugs délibérés dans votre propre code et vérifie si votre suite de tests le remarque. Un taux de couverture élevé ne le dit pas — un mutant tué, si.",
  "home.pitch.02.title": "Conçu pour l'avenir des tests .NET",
  "home.pitch.02.body":
    "Support natif de xUnit v3 4.x et de Microsoft Testing Platform v2 dès le premier jour — pas une architecture plus ancienne qui les rattrape après coup.",
  "home.pitch.03.title": "En développement actif",
  "home.pitch.03.body":
    "KillMutants est en cours de développement. Suivez le dépôt pour voir son évolution et être prévenu dès qu'il sera prêt à tourner sur votre propre suite de tests.",

  "version.title": "Version",
  "version.subtitle": "Infos de build & de release",
  "version.meta.description": "Ce qu'est ce déploiement de killmutants.io, et ce qu'il a livré en dernier.",

  "version.thisBuild.heading": "Ce build",
  "version.thisBuild.lead": "Ce qu'est ce déploiement de killmutants.io.",
  "version.release": "Release",
  "version.commit": "Commit",
  "version.built": "Généré le",

  "version.latest.heading": "Dernière release",
  "version.latest.lead": "Ce que ce site a livré en dernier.",
  "version.noReleases": "Aucune release n'a encore été taguée — ce site en est encore à son premier build, non publié.",
  "version.viewOnGithub": "Voir sur GitHub",

  "version.previous.heading": "Releases précédentes",
  "version.previous.lead": "Les releases publiées juste avant la dernière.",
  "version.previous.viewMoreOnGithub": "Voir plus sur GitHub",
};

const dictionaries: Record<Locale, Record<UiKey, string>> = { en, fr };

export function useTranslations(locale: Locale) {
  const dictionary = dictionaries[locale];

  return function t(key: UiKey): string {
    return dictionary[key];
  };
}
