import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Ketering Nis za proslave i poslovne dogadjaje | Pekarica 03',
  description:
    'Ketering by Pekarica za Nis i okolinu, proslave, firme, prijeme i privatne dogadjaje. Izaberite paket ili posaljite upit za ketering po meri.',
  path: '/ketering',
  images: ['/01card.webp'],
});

export default function Layout({ children }) {
  return children;
}
