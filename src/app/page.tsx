import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Sparkles } from "lucide-react"
import { getAllShaders } from "@/lib/shaders/registry"
import { ShaderCard } from "@/components/shader"

export default function HomePage() {
  const shaders = getAllShaders()

  return (
    <div className="relative">
      {/* Fixed unified background for entire page */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0f] to-black" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[60%] left-[20%] w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-purple-500/5 via-transparent to-transparent" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <h1 className="animate-fade-in text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
            <span className="block">WebGL shaders</span>
            <span className="gradient-text">copy & paste</span>
          </h1>

          <p className="animate-fade-in-delay-1 text-xl md:text-2xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Self-contained React components. No dependencies. Just drop them in your project.
          </p>

          <div className="animate-fade-in-delay-2 flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="text-base px-8 h-14 text-lg shadow-lg shadow-purple-500/20">
              <Link href="/shaders">
                Browse Shaders
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base px-8 h-14 text-lg bg-white/[0.02] border-white/10 hover:bg-white/[0.05]">
              <a href="https://github.com/shaderdrop/shaderdrop" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </a>
            </Button>
          </div>

          <div className="animate-fade-in-delay-3 flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span><span className="text-white font-medium">{shaders.length}</span> shaders</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Zero deps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>TypeScript</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Featured Shaders Section */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-16">
            <div>
              <span className="text-purple-400 font-medium text-sm tracking-wider mb-3 block">COLLECTION</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-3">Featured Shaders</h2>
              <p className="text-white/50 text-lg">Hand-crafted backgrounds for your next project</p>
            </div>
            <Button variant="outline" asChild className="bg-white/[0.02] border-white/10 hover:bg-white/[0.05] h-12 px-6">
              <Link href="/shaders">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {shaders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {shaders.slice(0, 6).map((shader) => (
                <ShaderCard key={shader.slug} shader={shader} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Shaders Coming Soon</h3>
              <p className="text-white/50 max-w-md mx-auto">
                We&apos;re crafting beautiful, high-quality shader backgrounds. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">get started</span>?
          </h2>
          <p className="text-lg text-white/50 mb-10">
            Pick a shader, copy the code, drop it in your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8 h-12 shadow-lg shadow-purple-500/20">
              <Link href="/shaders">
                Browse Shaders
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="px-8 h-12 bg-white/[0.02] border-white/10 hover:bg-white/[0.05]">
              <a href="https://github.com/shaderdrop/shaderdrop" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
