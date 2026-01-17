# ShaderDrop

Copy-paste WebGL shader backgrounds for React and Next.js. No dependencies.

## Features

- **9 Shaders** — Liquid Metal, Neon Horizon, Voronoi Cells, Retro Sunset, Fluid Ink, Aurora Mesh, Wave Terrain, Gradient Orbs, Silk Flow
- **Zero Dependencies** — Each shader is a self-contained React component
- **TypeScript** — Full type support with customizable props
- **Copy & Paste** — Download or copy the code, drop it in your project

## Usage

1. Browse shaders at [shaderdrop.dev](https://shaderdrop.dev)
2. Click a shader to preview and customize
3. Download the `.tsx` file or copy the code
4. Add to your project:

```tsx
import { LiquidMetal } from "@/components/LiquidMetal"

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <LiquidMetal className="absolute inset-0 -z-10" />
      {/* Your content */}
    </div>
  )
}
```

## Customization

All shaders accept props for colors, speed, and effects:

```tsx
<SilkFlow
  color1="#6366f1"
  color2="#8b5cf6"
  color3="#ec4899"
  speed={0.8}
  className="absolute inset-0 -z-10"
/>
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS
- TypeScript
- WebGL/GLSL

## License

MIT — Free for personal and commercial use.
