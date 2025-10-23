import "./globals.css";
import "./styles/application.scss";


import IdskInit from './components/IdskInit';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <IdskInit />
        {children}
      </body>
    </html>
  );
}
