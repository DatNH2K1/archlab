/**
 * Picks the text of the current locale from a bilingual value.
 * @param text The Vietnamese and English versions.
 * @param locale The page locale.
 * @returns The version for the locale, Vietnamese by default.
 */
export const inLocale = <T>(text: { vi: T; en: T }, locale: string): T => (locale === 'en' ? text.en : text.vi);
