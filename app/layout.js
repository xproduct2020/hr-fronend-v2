import './globals.css';
import AppProviders from '../components/AppProviders';

export const metadata = {
  title: 'Job Seeker App',
  description: 'Track applications with local + Google auth.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
