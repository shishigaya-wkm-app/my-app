import { OrderProvider } from "../context/OrderContext";
import "./globals.css";

export const metadata = {
  title: "ネーム刺繍注文受付アプリ",
  description: "ネーム刺繍注文受付アプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <OrderProvider>
          {children}
        </OrderProvider>
      </body>
    </html>
  );
}