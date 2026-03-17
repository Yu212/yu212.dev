import type { Metadata } from "next";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Yu_212's Website",
  description: "Yu_212's website",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{document.documentElement.setAttribute('data-lang',localStorage.getItem('writeup-lang')||(navigator.language.toLowerCase().startsWith('ja')?'ja':'en'));}catch(e){}})();` }} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
