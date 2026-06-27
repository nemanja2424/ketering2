export const siteUrl = 'https://inketering.com';

export const brandName = 'IN Ketering';
export const legalName = 'Ketering by Pekarica';
export const siteDescription =
  'IN Ketering, Pekarica 03 i Ketering by Pekarica nude ketering za Nis, okolinu, poslovne proslave i dnevne obroke po meri.';

export const seoKeywords = [
  'ketering',
  'pekarica',
  'pekarica 03',
  'ketering by pekarica',
  'IN Ketering',
  'inketering',
  'ketering Nis',
  'ketering Niš',
  'ketering okolina Nisa',
  'ketering okolina Niša',
  'dostava hrane Nis',
  'dostava hrane Niš',
  'ketering Niska Banja',
  'ketering Niška Banja',
  'ketering za proslave',
  'ketering za poslovne dogadjaje',
  'dnevni obroci',
  'personalizovani obroci',
  'clean obroci',
  'lean obroci',
];

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrl).toString();
}

export function createMetadata({
  title,
  description,
  path = '/',
  images = ['/bgHero.webp'],
  robots,
} = {}) {
  const resolvedTitle = title || `${brandName} | Ketering by Pekarica`;
  const socialTitle =
    typeof resolvedTitle === 'string'
      ? resolvedTitle
      : resolvedTitle?.default || `${brandName} | Ketering by Pekarica`;
  const resolvedDescription = description || siteDescription;
  const url = absoluteUrl(path);
  const socialImages = ['/opengraph-image', ...images.filter((image) => image !== '/opengraph-image')];

  return {
    metadataBase: new URL(siteUrl),
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'sr_RS',
      url,
      siteName: `${brandName} - ${legalName}`,
      title: socialTitle,
      description: resolvedDescription,
      images: socialImages.map((image) => ({
        url: absoluteUrl(image),
        width: 1200,
        height: 630,
        alt: `${brandName} - ${legalName}`,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: resolvedDescription,
      images: socialImages.map((image) => absoluteUrl(image)),
    },
    robots,
  };
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FoodEstablishment',
  '@id': `${siteUrl}/#organization`,
  name: brandName,
  alternateName: ['Ketering by Pekarica', 'Pekarica 03', 'Pekarica2003 Ketering'],
  url: siteUrl,
  logo: absoluteUrl('/LOGO no bg.png'),
  image: absoluteUrl('/bgHero.webp'),
  description: siteDescription,
  email: 'pekarica03@gmail.com',
  telephone: '+381641963677',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nis',
    addressCountry: 'RS',
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Niš',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Okolina Niša',
    },
    {
      '@type': 'Place',
      name: 'Niška Banja',
    },
    {
      '@type': 'Country',
      name: 'Serbia',
    },
  ],
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 43.3209,
    longitude: 21.8958,
  },
  sameAs: [
    'https://www.instagram.com/pekarica2003',
    'https://www.facebook.com/PekaricaNis',
  ],
  servesCuisine: ['Ketering', 'Dnevni obroci', 'Pekarski proizvodi'],
  priceRange: '$$',
};
