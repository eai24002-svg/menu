export function needsAudioGesture(): boolean {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

  return isIOS;
}
