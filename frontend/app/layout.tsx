import "./styles/globals.css";
import "./styles/application.scss";
import "./styles/menu.scss";
import IdskInit from "./components/IdskInit";
import { ToastProvider } from "./components/ToastProvider";
import TestBanner from "@/app/components/TestBanner";

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
        <ToastProvider>
          <IdskInit />
          <TestBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
