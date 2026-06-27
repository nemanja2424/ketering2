/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { absoluteUrl } from '@/lib/seo';

export const alt = 'IN Ketering | Ketering by Pekarica - ketering Nis i okolina';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff8ef',
          color: '#24160f',
          padding: '72px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            width: '690px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#b66b2d',
              fontWeight: 700,
            }}
          >
            Ketering by Pekarica
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              lineHeight: 1.03,
              fontWeight: 800,
            }}
          >
            IN Ketering | Ketering by Pekarica
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 34,
              lineHeight: 1.3,
              color: '#5c4434',
            }}
          >
            Ketering za proslave, firme i dnevne obroke po meri.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#8b4f24',
              fontWeight: 700,
            }}
          >
            inketering.com
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 330,
            height: 330,
            borderRadius: 999,
            background: '#ffffff',
            border: '8px solid #efd2b7',
            boxShadow: '0 26px 80px rgba(83, 45, 17, 0.18)',
          }}
        >
          <img
            src={absoluteUrl('/LOGO no bg.png')}
            alt="IN Ketering logo"
            width={230}
            height={230}
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
    ),
    size
  );
}
