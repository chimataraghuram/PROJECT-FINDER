/**
 * Safely opens a URL in a new browser tab with validation.
 * @param url The URL to open.
 */
export function openSafe(url: string | undefined | null) {
  if (!url || typeof url !== 'string' || url.trim() === '' || url === '#') {
    console.error("Invalid link target attempted:", url);
    return;
  }

  const trimmedUrl = url.trim();

  // Prevent opening relative paths or API-only snippets
  if (!trimmedUrl.startsWith('http')) {
    console.error("Security Block: Non-HTTP(S) URL attempted:", trimmedUrl);
    return;
  }

  // Strict check for LinkedIn as requested (Phase 24)
  if (trimmedUrl.includes('linkedin.com') && !trimmedUrl.startsWith('https://')) {
    console.error("Security Block: LinkedIn requires HTTPS for internal policy:", trimmedUrl);
    return;
  }

  window.open(trimmedUrl, "_blank", "noopener,noreferrer");
}
