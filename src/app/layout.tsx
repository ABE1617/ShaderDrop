import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://shaderdrop.dev"),
  title: "ShaderDrop",
  description:
    "Copy-paste WebGL shader backgrounds for your Next.js projects. Zero dependencies, fully customizable, MIT licensed.",
  keywords: ["shader", "webgl", "nextjs", "react", "background", "glsl"],
  authors: [{ name: "ShaderDrop" }],
  icons: {
    icon: "/NewLogo.png",
    apple: "/NewLogo.png",
  },
  openGraph: {
    title: "ShaderDrop",
    description: "Beautiful shader backgrounds for Next.js",
    url: "https://shaderdrop.dev",
    siteName: "ShaderDrop",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShaderDrop",
    description: "Copy-paste shader backgrounds for Next.js",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
