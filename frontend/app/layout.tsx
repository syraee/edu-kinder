import "./styles/globals.css";
import "./styles/application.scss";


import IdskInit from './components/IdskInit';
export const metadata = {
  title: "EduKinder",
  description: "kindergarden",
  icons: {
    icon: "idsk-assets/images/icon.png",
  },
};


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
