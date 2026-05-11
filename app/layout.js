import './globals.css';
import AppProviders from '../components/AppProviders';

export const metadata = {
  title: 'Job Seeker App',
  description: 'Track applications with local + Google auth.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
