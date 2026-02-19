/**
 * Default avatar: modern UI Avatars (initials on gradient-friendly background).
 * Size: 40, 60, 96, 128, 200 etc.
 */
const UI_AVATAR_BASE = 'https://ui-avatars.com/api/';

export function getAvatarUrl(user, size = 96) {
  const photo = user?.photo?.trim?.();
  if (photo && (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:'))) {
    return photo;
  }
  const name = user?.name || 'User';
  const params = new URLSearchParams({
    name: name.substring(0, 2).toUpperCase(),
    size: String(size),
    background: '6366f1',
    color: 'fff',
    bold: 'true',
    format: 'png',
  });
  return `${UI_AVATAR_BASE}?${params.toString()}`;
}

/**
 * For small inline avatars (nav, list items). Default size 40.
 */
export function getAvatarUrlSmall(user) {
  return getAvatarUrl(user, 40);
}
