"use client"

import { useState, useMemo } from "react"
import { Search, X, Filter, Grid3X3, LayoutGrid } from "lucide-react"
import { ShaderCard } from "./shader-card"
import { cn } from "@/lib/utils"
import type { Shader } from "@/types/shader"

interface ShadersGalleryProps {
  shaders: Shader[]
  allTags: string[]
}

export function ShadersGallery({ shaders, allTags }: ShadersGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [gridSize, setGridSize] = useState<"normal" | "large">("normal")

  // Filter shaders based on search and tags
  const filteredShaders = useMemo(() => {
    return shaders.filter((shader) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        shader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shader.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shader.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => shader.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [shaders, searchQuery, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
  }

  const hasFilters = searchQuery !== "" || selectedTags.length > 0

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/40" />
          </div>
          <input
            type="text"
            placeholder="Search shaders by name, description, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-14 pr-14 py-4 rounded-2xl text-base",
              "bg-white/[0.03] border border-white/[0.08]",
              "placeholder:text-white/30 text-white",
              "focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05]",
              "transition-all duration-200"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Tags Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Filter className="h-4 w-4" />
              <span>Filter by tag</span>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              const count = shaders.filter((s) => s.tags.includes(tag)).length

              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    "border",
                    isSelected
                      ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-purple-500/50 text-white"
                      : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.05]"
                  )}
                >
                  {tag}
                  <span className={cn(
                    "ml-2 text-xs",
                    isSelected ? "text-purple-300" : "text-white/30"
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/50">
          {hasFilters ? (
            <span>
              Showing <span className="text-white font-medium">{filteredShaders.length}</span> of {shaders.length} shaders
            </span>
          ) : (
            <span>
              <span className="text-white font-medium">{shaders.length}</span> shaders available
            </span>
          )}
        </div>

        {/* Grid Size Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.08]">
          <button
            onClick={() => setGridSize("normal")}
            className={cn(
              "p-2 rounded-md transition-all",
              gridSize === "normal"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70"
            )}
            title="Normal grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setGridSize("large")}
            className={cn(
              "p-2 rounded-md transition-all",
              gridSize === "large"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70"
            )}
            title="Large grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Shader Grid */}
      {filteredShaders.length > 0 ? (
        <div className={cn(
          "grid gap-6",
          gridSize === "normal"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 lg:grid-cols-2"
        )}>
          {filteredShaders.map((shader, index) => (
            <div
              key={shader.slug}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ShaderCard shader={shader} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-purple-400/50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No shaders found</h3>
          <p className="text-white/50 max-w-md mx-auto">
            No shaders match your current filters. Try adjusting your search or clearing the filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.08] transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
