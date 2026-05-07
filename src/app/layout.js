import { OrderProvider } from "../context/OrderContext";
import "./globals.css";

export const metadata = {
  title: "ネーム刺繍注文受付アプリ",
  description: "ネーム刺繍注文受付アプリ",

  manifest: "/manifest.json",

  icons: {
    apple: "/name.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ネーム刺繍注文",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ネーム刺繍注文" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <OrderProvider>{children}</OrderProvider>
      </body>
    </html>
  );
}
