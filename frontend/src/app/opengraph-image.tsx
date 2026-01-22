import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'NameTag Pro - Automatic Nametag Generation Service';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: 'white',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              fontWeight: 'bold',
              color: '#1E3A8A',
              marginRight: 20,
            }}
          >
            N
          </div>
          <span
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            NameTag Pro
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: 60,
          }}
        >
          Automatic Nametag Generation Service
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 40,
          }}
        >
          {['Excel Upload', 'Drag & Drop Editor', 'Print-Ready PDF'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '12px 24px',
                borderRadius: 50,
                fontSize: 20,
                color: 'white',
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
