import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Palette, Sliders } from "lucide-react"

export const metadata: Metadata = {
  title: "Customization",
  description: "Customize shader colors, speed, and effects via props.",
}

export default function CustomizationPage() {
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
          <span className="gradient-text">Customization</span>
        </h1>
        <p className="text-sm sm:text-base text-white/50">
          All shaders accept props for colors, speed, and effects.
        </p>
      </div>

      {/* Common Props */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Sliders className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
          Props
        </h2>

        <div className="space-y-2 sm:space-y-3">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <code className="px-1.5 sm:px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs sm:text-sm font-mono">
                className
              </code>
              <span className="text-[10px] sm:text-xs text-white/40">string</span>
            </div>
            <p className="text-xs sm:text-sm text-white/50 mb-2">Position and size the shader.</p>
            <pre className="p-2 rounded-lg bg-black/40 text-[10px] sm:text-xs font-mono text-white/60 overflow-x-auto">
              {`<LiquidMetal className="absolute inset-0 -z-10" />`}
            </pre>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <code className="px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs sm:text-sm font-mono">
                speed
              </code>
              <span className="text-[10px] sm:text-xs text-white/40">number (default: 1)</span>
            </div>
            <p className="text-xs sm:text-sm text-white/50 mb-2">Animation speed multiplier.</p>
            <pre className="p-2 rounded-lg bg-black/40 text-[10px] sm:text-xs font-mono text-white/60 overflow-x-auto">
              {`<SilkFlow speed={0.5} />  // Slower
<SilkFlow speed={2} />    // Faster`}
            </pre>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <code className="px-1.5 sm:px-2 py-0.5 rounded bg-green-500/20 text-green-300 text-xs sm:text-sm font-mono">
                baseColor / color1
              </code>
              <span className="text-[10px] sm:text-xs text-white/40">string (hex)</span>
            </div>
            <p className="text-xs sm:text-sm text-white/50 mb-2">Primary color. Use hex format.</p>
            <pre className="p-2 rounded-lg bg-black/40 text-[10px] sm:text-xs font-mono text-white/60 overflow-x-auto whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
              {`<LiquidMetal baseColor="#1a1a2e" highlightColor="#ffffff" />`}
            </pre>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <code className="px-1.5 sm:px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-xs sm:text-sm font-mono">
                scale / distortion / intensity
              </code>
              <span className="text-[10px] sm:text-xs text-white/40">number</span>
            </div>
            <p className="text-xs sm:text-sm text-white/50">
              Effect-specific parameters. Check each shader&apos;s controls panel for available options.
            </p>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
          Colors
        </h2>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-white/50 mb-3 sm:mb-4">
            Use hex format (#rrggbb). Each shader has different color props.
          </p>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col gap-1 p-2 sm:p-3 rounded-lg bg-black/20">
              <code className="text-[10px] sm:text-xs text-white/60 font-mono">LiquidMetal</code>
              <code className="text-[10px] sm:text-xs text-white/40 font-mono">baseColor, highlightColor</code>
            </div>
            <div className="flex flex-col gap-1 p-2 sm:p-3 rounded-lg bg-black/20">
              <code className="text-[10px] sm:text-xs text-white/60 font-mono">SilkFlow</code>
              <code className="text-[10px] sm:text-xs text-white/40 font-mono break-all">color1, color2, color3, bgColor</code>
            </div>
            <div className="flex flex-col gap-1 p-2 sm:p-3 rounded-lg bg-black/20">
              <code className="text-[10px] sm:text-xs text-white/60 font-mono">NeonHorizon</code>
              <code className="text-[10px] sm:text-xs text-white/40 font-mono break-all">skyColor1, skyColor2, gridColor, sunColor</code>
            </div>
            <div className="flex flex-col gap-1 p-2 sm:p-3 rounded-lg bg-black/20">
              <code className="text-[10px] sm:text-xs text-white/60 font-mono">GradientOrbs</code>
              <code className="text-[10px] sm:text-xs text-white/40 font-mono">color1-4, bgColor</code>
            </div>
          </div>
        </div>
      </section>

      {/* Example */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold">Full Example</h2>

        <div className="rounded-lg bg-black/40 border border-white/[0.06] overflow-hidden">
          <div className="px-2 sm:px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
            <span className="text-[10px] sm:text-xs text-white/40 font-mono">page.tsx</span>
          </div>
          <pre className="p-2 sm:p-4 overflow-x-auto text-[10px] sm:text-sm">
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
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-white/[0.06]">
        <Link
          href="/docs"
          className="group flex items-center gap-2 text-xs sm:text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform" />
          Getting Started
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
