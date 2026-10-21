export function itemIconUrl(itemId: number): string {
  return `${import.meta.env.VITE_API_BASE_URL}/items/${itemId}/icon`;
}

const MESSAGE_ICON_TAG = /<img=\d+>/g;

export function stripMessageIconTags(text: string): string {
  return text.replace(MESSAGE_ICON_TAG, '');
}
