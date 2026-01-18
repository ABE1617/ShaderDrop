import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Palette, Sliders } from "lucide-react"

export const metadata: Metadata = {
  title: "Customization - ShaderDrop",
  description: "Customize shader colors, speed, and effects via props.",
}

export default function CustomizationPage() {
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
          <span className="gradient-text">Customization</span>
        </h1>
        <p className="text-white/50">
          All shaders accept props for colors, speed, and effects.
        </p>
      </div>

      {/* Common Props */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sliders className="h-5 w-5 text-purple-400" />
          Props
        </h2>

        <div className="space-y-3">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <div className="flex items-center gap-3 mb-2">
              <code className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-sm font-mono">
                className
              </code>
              <span className="text-xs text-white/40">string</span>
            </div>
            <p className="text-sm text-white/50 mb-2">Position and size the shader.</p>
            <pre className="p-2 rounded-lg bg-black/40 text-xs font-mono text-white/60 overflow-x-auto">
              {`<LiquidMetal className="absolute inset-0 -z-10" />`}
            </pre>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <div className="flex items-center gap-3 mb-2">
              <code className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-sm font-mono">
                speed
              </code>
              <span className="text-xs text-white/40">number (default: 1)</span>
            </div>
            <p className="text-sm text-white/50 mb-2">Animation speed multiplier.</p>
            <pre className="p-2 rounded-lg bg-black/40 text-xs font-mono text-white/60 overflow-x-auto">
              {`<SilkFlow speed={0.5} />  // Slower
<SilkFlow speed={2} />    // Faster`}
            </pre>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <div className="flex items-center gap-3 mb-2">
              <code className="px-2 py-0.5 rounded bg-green-500/20 text-green-300 text-sm font-mono">
                baseColor / color1
              </code>
              <span className="text-xs text-white/40">string (hex)</span>
            </div>
            <p className="text-sm text-white/50 mb-2">Primary color. Use hex format.</p>
            <pre className="p-2 rounded-lg bg-black/40 text-xs font-mono text-white/60 overflow-x-auto">
              {`<LiquidMetal baseColor="#1a1a2e" highlightColor="#ffffff" />`}
            </pre>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <div className="flex items-center gap-3 mb-2">
              <code className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-sm font-mono">
                scale / distortion / intensity
              </code>
              <span className="text-xs text-white/40">number</span>
            </div>
            <p className="text-sm text-white/50">
              Effect-specific parameters. Check each shader&apos;s controls panel for available options.
            </p>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-400" />
          Colors
        </h2>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
          <p className="text-sm text-white/50 mb-4">
            Use hex format (#rrggbb). Each shader has different color props.
          </p>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-3 rounded-lg bg-black/20">
              <code className="text-xs text-white/60 font-mono">LiquidMetal</code>
              <code className="text-xs text-white/40 font-mono">baseColor, highlightColor</code>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-3 rounded-lg bg-black/20">
              <code className="text-xs text-white/60 font-mono">SilkFlow</code>
              <code className="text-xs text-white/40 font-mono break-all">color1, color2, color3, bgColor</code>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-3 rounded-lg bg-black/20">
              <code className="text-xs text-white/60 font-mono">NeonHorizon</code>
              <code className="text-xs text-white/40 font-mono break-all">skyColor1, skyColor2, gridColor, sunColor</code>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-3 rounded-lg bg-black/20">
              <code className="text-xs text-white/60 font-mono">GradientOrbs</code>
              <code className="text-xs text-white/40 font-mono">color1-4, bgColor</code>
            </div>
          </div>
        </div>
      </section>

      {/* Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Full Example</h2>

        <div className="rounded-lg bg-black/40 border border-white/[0.06] overflow-hidden">
          <div className="px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
            <span className="text-xs text-white/40 font-mono">page.tsx</span>
          </div>
          <pre className="p-4 overflow-x-auto text-sm">
            <code className="font-mono text-white/60">{`import { SilkFlow } from "@/components/SilkFlow"

export default function Hero() {
  return (
    <section className="relative h-screen">
      <SilkFlow
        className="absolute inset-0 -z-10"
        color1="#6366f1"
        color2="#8b5cf6"
        color3="#ec4899"
        bgColor="#0f0f23"
        speed={0.8}
        scale={1.2}
      />
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1>Your Content</h1>
      </div>
    </section>
  )
}`}</code>
          </pre>
        </div>
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-white/[0.06]">
        <Link
          href="/docs"
          className="group flex items-center gap-2 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Getting Started
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
