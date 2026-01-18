"use client"

import { Download, Copy, Check, Terminal, ChevronDown, Code } from "lucide-react"
import { useState } from "react"
import { CodeBlock } from "@/components/shared/code-block"
import { Button } from "@/components/ui/button"
import type { Shader } from "@/types/shader"
import { cn } from "@/lib/utils"

interface ShaderCodeProps {
  shader: Shader
  className?: string
}

export function ShaderCode({ shader, className }: ShaderCodeProps) {
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(false)

  // Convert shader name to PascalCase filename
  const componentName = shader.name.replace(/\s+/g, "")
  const filename = `${componentName}.tsx`

  const handleDownload = () => {
    const blob = new Blob([shader.code], { type: "text/typescript" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shader.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const usageCode = `import { ${componentName} } from "@/components/${componentName}"

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <${componentName} className="absolute inset-0 -z-10" />
      {/* Your content here */}
    </div>
  )
}`

  return (
    <div className={cn("space-y-6", className)}>
      {/* Quick Start Instructions */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-purple-400" />
          Quick Start
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-400">
              1
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 mb-2">
                Download or copy the component file
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Download {filename}</span>
                </Button>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 w-full sm:w-auto"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-400">
              2
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 mb-2">
                Save to <code className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-xs break-all">components/{filename}</code>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-400">
              3
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 mb-2">
                Import and use in your page
              </p>
              <div className="rounded-xl bg-black/40 border border-white/[0.06] overflow-hidden">
                <div className="px-3 sm:px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="text-xs text-white/40 font-mono">page.tsx</span>
                </div>
                <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm">
                  <code className="text-white/70 font-mono">{usageCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Source Code - Collapsible */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
        <button
          onClick={() => setShowCode(!showCode)}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Code className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-left min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-white">Source Code</h3>
              <p className="text-xs text-white/50 truncate">{filename}</p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-white/40 transition-transform duration-200 flex-shrink-0 ml-2",
              showCode && "rotate-180"
            )}
          />
        </button>

        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            showCode ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="px-2 sm:px-4 pb-4">
              <CodeBlock
                code={shader.code}
                language="tsx"
                filename={filename}
                showLineNumbers
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
