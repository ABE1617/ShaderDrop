import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full mt-20 border-t border-white/[0.06] bg-black/20">
      <div className="w-full px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-4">
          {/* Top row - Brand and navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left - Brand */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/40 rounded-full blur-xl transition-all duration-300" />
                  <Image
                    src="/NewLogo.png"
                    alt="ShaderDrop"
                    width={28}
                    height={28}
                    className="relative group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
                <span className="font-semibold text-white/80 group-hover:text-white transition-colors">ShaderDrop</span>
              </Link>

              {/* Links - visible on mobile too */}
              <div className="flex items-center gap-4 text-sm text-white/40">
                <Link href="/shaders" className="hover:text-white transition-colors">Shaders</Link>
                <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
                <a
                  href="https://github.com/ABE1617/ShaderDrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>

            {/* Right - Social & Copyright */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1">
                <a
                  href="https://github.com/ABE1617/ShaderDrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com/shaderdrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </div>

              <div className="h-4 w-px bg-white/10 hidden sm:block" />

              <span className="text-xs sm:text-sm text-white/30">&copy; {new Date().getFullYear()} ShaderDrop</span>
            </div>
          </div>

          {/* Made with love - visible on all screens */}
          <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-white/30 sm:hidden">
            <span>Made with</span>
            <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500 fill-red-500" />
            <span>for developers</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
