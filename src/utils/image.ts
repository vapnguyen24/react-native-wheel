const uriCache = new Map<string, string>();

export function getCachedImageUri(uri: string): string {
  if (!uriCache.has(uri)) {
    uriCache.set(uri, uri);
  }
  // Map.get is always defined after the has/set above
  return uriCache.get(uri) as string;
}

export function clearImageCache(): void {
  uriCache.clear();
}
