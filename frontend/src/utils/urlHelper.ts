/**
 * Safely normalizes and validates external URLs for safe navigation.
 * Resolves missing schemes, cleans paths, and guards against broken hash links.
 * 
 * @param url The raw URL string.
 * @param fallbackPlatform The platform to use if relative paths are provided.
 * @returns A safe, normalized absolute HTTPS URL string or '#' if invalid.
 */
export function normalizeUrl(url: string | undefined | null, fallbackPlatform: string = 'GitHub'): string {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (trimmed === '' || trimmed === '#' || lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return '#';
  }

  // If already full HTTP/HTTPS URL (case-insensitive)
  if (lower.startsWith('https://')) {
    try { return new URL(trimmed).toString(); } catch { return '#'; }
  }
  if (lower.startsWith('http://')) {
    try { return new URL(trimmed.replace(/^http:\/\//i, 'https://')).toString(); } catch { return '#'; }
  }

  // Protocol-relative URLs (e.g. //github.com/foo/bar, reject ///foo)
  if (trimmed.startsWith('//') && !trimmed.startsWith('///')) {
    try { return new URL(`https:${trimmed}`).toString(); } catch { return '#'; }
  }

  // Plain domains like github.com/... or huggingface.co/...
  if (trimmed.startsWith('github.com/') || trimmed.startsWith('www.github.com/')) {
    return `https://${trimmed.replace(/^www\./i, '')}`;
  }
  if (trimmed.startsWith('huggingface.co/')) {
    return `https://${trimmed}`;
  }
  if (trimmed.startsWith('kaggle.com/') || trimmed.startsWith('www.kaggle.com/')) {
    return `https://${trimmed.replace(/^www\./i, '')}`;
  }
  if (trimmed.startsWith('linkedin.com/') || trimmed.startsWith('www.linkedin.com/')) {
    return `https://${trimmed.replace(/^www\./i, '')}`;
  }
  if (trimmed.startsWith('npmjs.com/') || trimmed.startsWith('www.npmjs.com/')) {
    return `https://${trimmed.replace(/^www\./i, '')}`;
  }

  // Handle owner/repo format like "morluto/rea" or "Significant-Gravitas/Auto-GPT"
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    const plat = fallbackPlatform.toLowerCase();
    if (plat.includes('hugging')) return `https://huggingface.co/${trimmed}`;
    if (plat.includes('kaggle')) {
      if (trimmed.startsWith('datasets/') || trimmed.startsWith('competitions/')) {
        return `https://www.kaggle.com/${trimmed}`;
      }
      return `https://www.kaggle.com/datasets/${trimmed}`;
    }
    return `https://github.com/${trimmed}`;
  }

  // Default to https prefix if it looks like a valid hostname/path
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return '#';
}

/**
 * Safely opens a URL in a new browser tab with auto-repair and validation.
 * @param url The URL to open.
 * @param fallbackPlatform Fallback platform context if a relative identifier is passed.
 */
export function openSafe(url: string | undefined | null, fallbackPlatform: string = 'GitHub'): boolean {
  const safeUrl = normalizeUrl(url, fallbackPlatform);

  if (safeUrl === '#' || !safeUrl.startsWith('https://')) {
    console.warn("Invalid or unresolvable link target blocked:", url);
    return false;
  }

  try {
    const targetWindow = window.open(safeUrl, "_blank", "noopener,noreferrer");
    if (!targetWindow) {
      // In case popup blockers block window.open, fallback to anchor click
      const a = document.createElement('a');
      a.href = safeUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    return true;
  } catch (err) {
    console.error("Failed to open safe URL:", safeUrl, err);
    return false;
  }
}
