/**
 * Locale-aware routing.
 *
 * Route segments are identical in every locale (no `/fr/a-propos`), and the default
 * locale is not prefixed — English lives at `/`, French at `/fr/`. Together they mean a
 * path can be translated by adding or removing one segment.
 *
 * Trimmed from justdummies.io's routing module: this site has exactly two pages, both
 * translated into both locales, so `knownRoutes` is a literal list rather than read from
 * the page files at build time. Add a route here the day a page exists in only one
 * locale — that is the day this needs the glob-based approach back.
 */
import { defaultLocale, locales, type Locale } from "./ui";

const knownRoutes: ReadonlySet<string> = new Set(["/", "/version/", "/fr/", "/fr/version/"]);

function segmentsOf(pathname: string): string[] {
  return pathname.split("/").filter((segment) => segment.length > 0);
}

function isLocalePrefix(segment: string | undefined): segment is Locale {
  return segment !== undefined && segment !== defaultLocale && (locales as readonly string[]).includes(segment);
}

/** The locale a path is served in, which is the default one unless a prefix says otherwise. */
export function localeFromPath(pathname: string): Locale {
  const first = segmentsOf(pathname)[0];
  return isLocalePrefix(first) ? first : defaultLocale;
}

/** The path with its locale prefix removed — the part that is the same in every locale. */
export function routeWithoutLocale(pathname: string): string {
  const parts = segmentsOf(pathname);

  if (isLocalePrefix(parts[0])) {
    parts.shift();
  }

  return parts.length > 0 ? `/${parts.join("/")}/` : "/";
}

/** The same page, served in another locale. */
export function pathForLocale(pathname: string, target: Locale): string {
  const route = routeWithoutLocale(pathname);
  return target === defaultLocale ? route : `/${target}${route}`;
}

/** The locales this particular page really exists in. */
export function translatedLocales(pathname: string): Locale[] {
  return locales.filter((locale) => knownRoutes.has(pathForLocale(pathname, locale)));
}
