import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'IN Ketering | Ketering by Pekarica',
  description:
    'Poručite Clean i Lean dnevne obroke u Nišu i okolini, pretplatu za radne dane ili personalizovani obrok kroz IN Ketering by Pekarica.',
  path: '/poruci',
});

export default function Layout({ children }) {
  return children;
}
