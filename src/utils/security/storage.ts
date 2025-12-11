/**
 * Lightweight hashing to avoid storing sensitive values under guessable storage keys.
 * Uses FNV-1a to deterministically derive obfuscated keys.
 */
export function hashedStorageKey(label: string, namespace = 'notinow'): string {
  const value = `${namespace}:${label}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `${namespace}-${(hash >>> 0).toString(16)}`;
}
