import { siteUrl } from '@/lib/seo';

const routes = [
  { url: '/', priority: 1 },
  { url: '/ketering', priority: 0.95 },
  { url: '/poruci', priority: 0.9 },
  { url: '/o-nama', priority: 0.7 },
];

export default function sitemap() {
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route.url}`,
    lastModified: now,
    changeFrequency: route.url === '/' ? 'weekly' : 'monthly',
    priority: route.priority,
  }));
}
