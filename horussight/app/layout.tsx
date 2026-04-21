import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HorusSight — Cyber Défense AI',
  description:
    "HorusSight utilise le moteur d'intelligence Ewaba pour scanner votre site et vous dire exactement comment corriger les failles de sécurité — sans compétences techniques requises.",
  keywords: ['cybersécurité', 'scanner', 'vulnerability', 'OWASP', 'AI security'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Unregister any stale Vite service workers from previous builds */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var registration of registrations) {
                    registration.unregister();
                    console.log('[HorusSight] Stale service worker unregistered.');
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
