import { getShaderBySlug, getAllShaders } from "@/lib/shaders/registry"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ShaderDetailClient } from "@/components/shader"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllShaders().map((shader) => ({
    slug: shader.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const shader = getShaderBySlug(slug)
  if (!shader) return {}

  return {
    title: `${shader.name} — ShaderDrop`,
    description: shader.description,
    openGraph: {
      title: `${shader.name} — ShaderDrop`,
      description: shader.description,
      type: "article",
    },
  }
}

export default async function ShaderPage({ params }: PageProps) {
  const { slug } = await params
  const shader = getShaderBySlug(slug)

  if (!shader) {
    notFound()
  }

  return (
    <div className="relative min-h-screen">
      {/* Fixed unified background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0f] to-black" />
        <div className="absolute inset-0 grid-pattern opacity-50" />

        {/* Animated gradient orbs */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[60%] left-[15%] w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[50%] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 container mx-auto pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
        {/* Back Navigation */}
        <Link
          href="/shaders"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group mb-6"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to shaders
        </Link>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          <span className="gradient-text">{shader.name}</span>
        </h1>

        {/* Interactive Content with Meta below preview */}
        <ShaderDetailClient shader={shader} showMeta />
      </div>
    </div>
  )
}
