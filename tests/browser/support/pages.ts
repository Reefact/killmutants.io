/** The pages this site has, in every locale — the list a new page joins on the day
 *  it exists, so every spec below iterates it rather than naming URLs by hand. */
export const PAGES = [
  { locale: "en", home: "/", version: "/version/" },
  { locale: "fr", home: "/fr/", version: "/fr/version/" },
] as const;
