import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// import { SiteFooter } from "@/components/site-footer";
// import { SiteHeader } from "@/components/site-header";

// interface AppLayoutProps {
//   children: React.ReactNode
// }

// export default function AppLayout({ children }: AppLayoutProps) {
//   return (
//     <div data-wrapper="" className="border-grid flex flex-1 flex-col">
//       <SiteHeader />
//       <main className="flex flex-1 flex-col">{children}</main>
//       <SiteFooter />
//     </div>
//   )
// }
