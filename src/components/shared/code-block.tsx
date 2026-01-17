"use client";

import { useState, useEffect } from "react";
import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = "tsx",
  filename,
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function highlight() {
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: "github-dark",
        });
        if (isMounted) {
          setHighlightedHtml(html);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to highlight code:", error);
        if (isMounted) {
          // Fallback to plain text if highlighting fails
          setHighlightedHtml(
            `<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
          );
          setIsLoading(false);
        }
      }
    }

    highlight();

    return () => {
      isMounted = false;
    };
  }, [code, language]);

  const lines = code.split("\n");

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-[#0d1117] overflow-hidden",
        className
      )}
    >
      {/* Header with filename and copy button */}
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#161b22]">
          <span className="text-sm text-muted-foreground font-mono">
            {filename}
          </span>
          <CopyButton value={code} className="h-8 w-8" />
        </div>
      )}

      {/* Code area */}
      <div className="relative">
        {/* Copy button (when no filename header) */}
        {!filename && (
          <div className="absolute top-2 right-2 z-10">
            <CopyButton value={code} className="h-8 w-8 bg-[#161b22] hover:bg-[#21262d]" />
          </div>
        )}

        {isLoading ? (
          // Loading skeleton
          <div className="overflow-x-auto p-4">
            <div className="flex gap-4">
              {showLineNumbers && (
                <div className="flex flex-col gap-1">
                  {lines.map((_, index) => (
                    <div
                      key={index}
                      className="h-5 w-6 bg-muted-foreground/20 rounded animate-pulse"
                    />
                  ))}
                </div>
              )}
              <div className="flex-1 flex flex-col gap-1">
                {lines.map((line, index) => (
                  <div
                    key={index}
                    className="h-5 bg-muted-foreground/20 rounded animate-pulse"
                    style={{ width: `${Math.min(Math.max(line.length * 8, 50), 100)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <div className="flex">
              {showLineNumbers && (
                <div className="flex flex-col pr-4 text-right select-none border-r border-border/50 mr-4">
                  {lines.map((_, index) => (
                    <span
                      key={index}
                      className="text-muted-foreground text-sm font-mono leading-6"
                    >
                      {index + 1}
                    </span>
                  ))}
                </div>
              )}
              <div
                className="flex-1 text-sm [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&_code]:leading-6"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
