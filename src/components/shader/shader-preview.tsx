"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Maximize2, Minimize2, Layout } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  shaderComponents,
  type ShaderSlug,
} from "@/lib/shaders/components"

interface ShaderPreviewProps {
  slug: ShaderSlug
  uniforms?: Record<string, unknown>
  className?: string
  aspectRatio?: "video" | "square" | "wide" | "none"
  autoplay?: boolean
  showControls?: boolean
}

// Generic hero section overlay template
function HeroOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex flex-col pointer-events-none select-none">
      {/* Template Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center">
            <span className="text-black font-bold text-sm">L</span>
          </div>
          <span className="text-white/90 font-medium">Logo</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <span className="text-white/50 text-sm">Link</span>
          <span className="text-white/50 text-sm">Link</span>
          <span className="text-white/50 text-sm">Link</span>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm">
          Button
        </div>
      </nav>

      {/* Hero content - centered and minimal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Main headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 max-w-3xl leading-tight">
          Your headline
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> goes here</span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm sm:text-base text-white/60 mb-6 max-w-xl">
          A short description of your product or service goes here.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-full bg-white text-black font-medium text-sm">
            Button
          </div>
          <div className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm">
            Button
          </div>
        </div>
      </div>
    </div>
  )
}

const aspectRatioClasses = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
  none: "",
} as const

export function ShaderPreview({
  slug,
  uniforms = {},
  className,
  aspectRatio = "video",
  showControls = true,
}: ShaderPreviewProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showHeroOverlay, setShowHeroOverlay] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const toggleFullscreen = React.useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  const toggleHeroOverlay = React.useCallback(() => {
    setShowHeroOverlay((prev) => !prev)
  }, [])

  // Handle escape key for fullscreen
  React.useEffect(() => {
    if (!isFullscreen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isFullscreen])

  // Lock body scroll when fullscreen
  React.useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isFullscreen])

  const aspectClass = aspectRatioClasses[aspectRatio]
  const ShaderComponent = shaderComponents[slug]

  if (!ShaderComponent) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "border border-white/10",
          "bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-orange-400/20",
          "flex items-center justify-center",
          aspectClass,
          className
        )}
      >
        <p className="text-muted-foreground">Shader not found</p>
      </div>
    )
  }

  const shaderProps = {
    ...uniforms,
    isPlaying: true,
    className: "absolute inset-0",
  }

  // True fullscreen overlay - rendered via portal to escape stacking contexts
  if (isFullscreen) {
    const fullscreenContent = (
      <div className="fixed inset-0 bg-black" style={{ zIndex: 99999 }}>
        <ShaderComponent {...shaderProps} className="absolute inset-0" />

        {/* Hero overlay in fullscreen */}
        {showHeroOverlay && <HeroOverlay />}

        {/* Fullscreen controls */}
        <div className="absolute bottom-6 right-6 flex gap-3 z-30">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleHeroOverlay}
            className={cn(
              "glass border-white/20 hover:bg-white/20 h-12 w-12",
              showHeroOverlay && "bg-white/20 border-white/40"
            )}
            aria-label={showHeroOverlay ? "Hide hero preview" : "Show hero preview"}
          >
            <Layout className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleFullscreen}
            className="glass border-white/20 hover:bg-white/20 h-12 w-12"
            aria-label="Exit fullscreen"
          >
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>

        {/* ESC hint - positioned to avoid template logo overlap */}
        <div className="absolute top-16 left-6 text-white/40 text-xs z-30 px-2 py-1 rounded bg-black/30 backdrop-blur-sm">
          Press ESC to exit
        </div>
      </div>
    )

    return (
      <>
        {/* Placeholder to maintain layout */}
        <div className={cn("relative rounded-xl bg-black/50", aspectClass, className)} />

        {/* Portal renders directly to body, escaping all stacking contexts */}
        {typeof document !== "undefined" && createPortal(fullscreenContent, document.body)}
      </>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl shader-container",
        "border border-white/10",
        "shadow-2xl shadow-purple-500/10",
        aspectClass,
        className
      )}
    >
      {/* Shader always renders immediately */}
      <ShaderComponent {...shaderProps} />

      {/* Hero overlay in regular view */}
      {showHeroOverlay && <HeroOverlay />}

      {/* Control buttons */}
      {showControls && (
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleHeroOverlay}
            className={cn(
              "glass border-white/10 hover:bg-white/10",
              showHeroOverlay && "bg-white/20 border-white/30"
            )}
            aria-label={showHeroOverlay ? "Hide hero preview" : "Show hero preview"}
          >
            <Layout className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={toggleFullscreen}
            className="glass border-white/10 hover:bg-white/10"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
