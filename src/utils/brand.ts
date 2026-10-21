/** Brand name shown in the nav logo, based on which domain the site is being visited from. */
export function getBrandName(hostname: string = window.location.hostname): string {
  return hostname.includes('ardy.host') ? 'Ardy Hosts' : 'Splash Helper';
}
