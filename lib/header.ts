/** Height of the fixed header (CSS var --header-h), so pinned sections sit just below it. */
export const headerH = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 80;

/** ScrollTrigger start for sections pinned under the header. */
export const underHeader = () => `top ${headerH()}px`;
