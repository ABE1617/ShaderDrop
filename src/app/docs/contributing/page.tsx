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
    <div className="space-y-10">
      <div>
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="gradient-text">Contributing</span>
        </h1>
        <p className="text-white/50">
          ShaderDrop is open source. Submit your shaders or help improve the project.
        </p>
      </div>

      {/* Shader Guidelines */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileCode className="h-5 w-5 text-purple-400" />
          Shader Requirements
        </h2>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">1</span>
            <div>
              <span className="font-medium text-white text-sm">Self-contained</span>
              <p className="text-xs text-white/50">Single .tsx file, no external dependencies</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">2</span>
            <div>
              <span className="font-medium text-white text-sm">TypeScript</span>
              <p className="text-xs text-white/50">Typed props interface</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">3</span>
            <div>
              <span className="font-medium text-white text-sm">Customizable</span>
              <p className="text-xs text-white/50">Colors, speed, className props at minimum</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">4</span>
            <div>
              <span className="font-medium text-white text-sm">Performant</span>
              <p className="text-xs text-white/50">Smooth 60fps on mid-range devices</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Submit */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Submit a Shader</h2>

        <div className="rounded-lg bg-black/40 border border-white/[0.06] overflow-hidden">
          <div className="px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
            <span className="text-xs text-white/40 font-mono">Terminal</span>
          </div>
          <pre className="p-4 overflow-x-auto text-sm">
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
      <section className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-6 text-center">
        <p className="text-white/50 mb-4 text-sm">
          Report bugs, request features, or browse the source.
        </p>
        <Button asChild size="sm">
          <a
            href="https://github.com/shaderdrop/shaderdrop"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </a>
        </Button>
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-white/[0.06]">
        <Link
          href="/docs/customization"
          className="group flex items-center gap-2 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Customization
        </Link>
        <Link
          href="/shaders"
          className="group flex items-center gap-2 text-sm text-white/50 hover:text-white"
        >
          Browse Shaders
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
