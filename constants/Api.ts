export const API_CONFIG = {
  BASE_URL: 'https://archivart.onrender.com',
  MATCH_ENDPOINT: '/api/media/match',
};

export function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_CONFIG.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}


