import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Poruci dnevne obroke | Pekarica 03',
  description:
    'Porucite Clean i Lean dnevne obroke u Nisu i okolini, pretplatu za radne dane ili personalizovani obrok kroz IN Ketering by Pekarica.',
  path: '/poruci',
});

export default function Layout({ children }) {
  return children;
}
