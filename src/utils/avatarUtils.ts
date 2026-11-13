export interface AvatarStyle {
  bg: string;
  color: string;
  border: string;
}

const AVATAR_PALETTES: AvatarStyle[] = [
  { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' }, // Blue
  { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' }, // Violet
  { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' }, // Emerald
  { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' }, // Amber
  { bg: '#FDF2F8', color: '#BE185D', border: '#FBCFE8' }, // Pink
  { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' }, // Green
  { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' }, // Sky
  { bg: '#F8FAFC', color: '#334155', border: '#CBD5E1' }, // Slate
];

const initialsCache = new Map<string, string>();
const avatarStyleCache = new Map<string, AvatarStyle>();

/**
 * Returns 1 or 2 letter initials for an assignee name.
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  const cached = initialsCache.get(name);
  if (cached) return cached;

  const parts = name.trim().split(/\s+/);
  let initials: string;
  if (parts.length === 1) {
    initials = parts[0].slice(0, 2).toUpperCase();
  } else {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  initialsCache.set(name, initials);
  return initials;
}

/**
 * Deterministically computes an avatar color theme based on name string.
 */
export function getAvatarStyle(name: string): AvatarStyle {
  if (!name) return AVATAR_PALETTES[0];
  const cached = avatarStyleCache.get(name);
  if (cached) return cached;

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  const style = AVATAR_PALETTES[index];

  avatarStyleCache.set(name, style);
  return style;
}
