"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Github, Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shaders", label: "Shaders" },
  { href: "/docs", label: "Docs" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <nav
          className={cn(
            "mt-4 flex items-center justify-between rounded-full px-5 sm:px-6 py-3 transition-all duration-500",
            "bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08]",
            scrolled && "bg-white/[0.06] border-white/[0.12] shadow-2xl shadow-purple-500/5"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/40 rounded-full blur-xl transition-all duration-300" />
              <Image
                src="/NewLogo.png"
                alt="ShaderDrop"
                width={25}
                height={25}
                className="relative group-hover:scale-110 transition-transform duration-200"
              />
            </div>
            <span className="font-bold text-white/90 group-hover:text-white transition-colors">
              Shader<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Drop</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                    isActive
                      ? "text-white bg-white/[0.08]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* GitHub */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ABE1617/ShaderDrop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-full hover:bg-white/[0.05] transition-all"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/[0.08] p-4 shadow-2xl">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                      isActive
                        ? "text-white bg-white/[0.08]"
                        : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
