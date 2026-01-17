import { getAllShaders, getAllTags } from "@/lib/shaders/registry"
import { ShadersGallery } from "@/components/shader/shaders-gallery"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shaders - ShaderDrop",
  description: "WebGL shader backgrounds for React and Next.js.",
}

export default function ShadersPage() {
  const shaders = getAllShaders()
  const allTags = getAllTags()

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0f] to-black" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="text-white">All </span>
            <span className="gradient-text">Shaders</span>
          </h1>
          <p className="text-white/50">
            {shaders.length} shaders. Click to preview, copy the code.
          </p>
        </div>

        {/* Gallery */}
        <ShadersGallery shaders={shaders} allTags={allTags} />
      </div>
    </div>
  )
}
