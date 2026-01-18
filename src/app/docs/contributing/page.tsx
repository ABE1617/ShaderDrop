import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Github, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contributing - ShaderDrop",
  description: "Submit shaders and contribute to ShaderDrop.",
}

export default function ContributingPage() {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/50 hover:text-white transition-colors mb-3 sm:mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Back
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
          <span className="gradient-text">Contributing</span>
        </h1>
        <p className="text-sm sm:text-base text-white/50">
          ShaderDrop is open source. Submit your shaders or help improve the project.
        </p>
      </div>

      {/* Shader Guidelines */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <FileCode className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
          Shader Requirements
        </h2>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4 space-y-2.5 sm:space-y-3">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-purple-400 flex-shrink-0">1</span>
            <div className="min-w-0">
              <span className="font-medium text-white text-xs sm:text-sm">Self-contained</span>
              <p className="text-[10px] sm:text-xs text-white/50">Single .tsx file, no external dependencies</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 sm:gap-3">
            <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-purple-400 flex-shrink-0">2</span>
            <div className="min-w-0">
              <span className="font-medium text-white text-xs sm:text-sm">TypeScript</span>
              <p className="text-[10px] sm:text-xs text-white/50">Typed props interface</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 sm:gap-3">
            <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-purple-400 flex-shrink-0">3</span>
            <div className="min-w-0">
              <span className="font-medium text-white text-xs sm:text-sm">Customizable</span>
              <p className="text-[10px] sm:text-xs text-white/50">Colors, speed, className props at minimum</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 sm:gap-3">
            <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-purple-400 flex-shrink-0">4</span>
            <div className="min-w-0">
              <span className="font-medium text-white text-xs sm:text-sm">Performant</span>
              <p className="text-[10px] sm:text-xs text-white/50">Smooth 60fps on mid-range devices</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Submit */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold">Submit a Shader</h2>

        <div className="rounded-lg bg-black/40 border border-white/[0.06] overflow-hidden">
          <div className="px-2 sm:px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
            <span className="text-[10px] sm:text-xs text-white/40 font-mono">Terminal</span>
          </div>
          <pre className="p-2 sm:p-4 overflow-x-auto text-[10px] sm:text-sm">
            <code className="font-mono text-white/60">{`# Fork and clone
git clone https://github.com/YOUR_USERNAME/shaderdrop.git

# Create branch
git checkout -b feat/my-shader

# Add shader to src/lib/shaders/
# Register in registry.ts

# Test
npm run dev

# Submit PR
git push origin feat/my-shader`}</code>
          </pre>
        </div>
      </section>

      {/* GitHub CTA */}
      <section className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-6 text-center">
        <p className="text-white/50 mb-3 sm:mb-4 text-xs sm:text-sm">
          Report bugs, request features, or browse the source.
        </p>
        <Button asChild size="sm" className="text-xs sm:text-sm">
          <a
            href="https://github.com/ABE1617/ShaderDrop"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            GitHub
          </a>
        </Button>
      </section>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-white/[0.06]">
        <Link
          href="/docs/customization"
          className="group flex items-center gap-2 text-xs sm:text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform" />
          Customization
        </Link>
        <Link
          href="/shaders"
          className="group flex items-center gap-2 text-xs sm:text-sm text-white/50 hover:text-white sm:ml-auto"
        >
          Browse Shaders
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
