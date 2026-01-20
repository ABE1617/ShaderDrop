import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Download, FileCode } from "lucide-react"

export const metadata: Metadata = {
  title: "Getting Started",
  description: "Add WebGL shader backgrounds to your Next.js project. Copy, paste, done.",
}

export default function DocsPage() {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
          <span className="gradient-text">Getting Started</span>
        </h1>
        <p className="text-sm sm:text-base text-white/50">
          Copy-paste WebGL shaders for React/Next.js. No dependencies.
        </p>
      </div>

      {/* Steps */}
      <section className="space-y-3 sm:space-y-4">
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold text-purple-400">
              1
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium mb-1 text-sm sm:text-base text-white">Pick a shader</h3>
              <p className="text-xs sm:text-sm text-white/50 mb-2">
                Browse the collection and find one you like.
              </p>
              <Link
                href="/shaders"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-purple-400 hover:text-purple-300"
              >
                View shaders <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold text-purple-400">
              2
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium mb-1 text-sm sm:text-base text-white">Download or copy</h3>
              <p className="text-xs sm:text-sm text-white/50">
                Click <Download className="inline h-3 w-3 sm:h-3.5 sm:w-3.5" /> to download the .tsx file, or copy the code directly.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold text-purple-400">
              3
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium mb-1 text-sm sm:text-base text-white">Add to your project</h3>
              <p className="text-xs sm:text-sm text-white/50 mb-2 sm:mb-3">
                Drop it in your components folder and import.
              </p>
              <div className="rounded-lg bg-black/40 border border-white/[0.06] overflow-hidden">
                <div className="px-2 sm:px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[10px] sm:text-xs text-white/40 font-mono">page.tsx</span>
                </div>
                <pre className="p-2 sm:p-3 overflow-x-auto text-[10px] sm:text-sm">
                  <code className="font-mono text-white/60">{`import { LiquidMetal } from "@/components/LiquidMetal"

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <LiquidMetal className="absolute inset-0 -z-10" />
      {/* Your content */}
    </div>
  )
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <FileCode className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
          Requirements
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4">
            <h3 className="font-medium mb-2 text-xs sm:text-sm text-white">Framework</h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-white/50">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                React 18+
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                Next.js 13+
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4">
            <h3 className="font-medium mb-2 text-xs sm:text-sm text-white">Browser</h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-white/50">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                <span>WebGL support (all modern browsers)</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-white/40">
          Each shader is self-contained. No npm packages needed.
        </p>
      </section>

      {/* License */}
      <section className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-white/50">
          <span className="text-white/70 font-medium">MIT Licensed</span> — Free for personal and commercial use.
        </p>
      </section>

      {/* Next */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Link
          href="/docs/customization"
          className="flex-1 group flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] transition-colors"
        >
          <div className="min-w-0">
            <div className="font-medium text-xs sm:text-sm text-white">Customization</div>
            <div className="text-[10px] sm:text-xs text-white/40">Props & colors</div>
          </div>
          <ArrowRight className="h-4 w-4 text-white/30 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/shaders"
          className="flex-1 group flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] transition-colors"
        >
          <div className="min-w-0">
            <div className="font-medium text-xs sm:text-sm text-white">Browse Shaders</div>
            <div className="text-[10px] sm:text-xs text-white/40">View collection</div>
          </div>
          <ArrowRight className="h-4 w-4 text-white/30 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
