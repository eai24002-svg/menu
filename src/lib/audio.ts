export const DEFAULT_BACKGROUND_MUSIC = "/audio/ambiance.ogg";

export function getBackgroundMusicUrl(url?: string): string {
  return url?.trim() || DEFAULT_BACKGROUND_MUSIC;
}
