export function getBrandName(hostname: string = window.location.hostname): string {
  return hostname.includes('ardy.host') ? 'Ardy Hosts' : 'Splash Helper';
}
