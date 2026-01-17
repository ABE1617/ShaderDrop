import type { Shader } from "@/types/shader"

export const auroraCode = `"use client"

import { useEffect, useRef } from "react"

interface AuroraShaderProps {
  className?: string
  color1?: string
  color2?: string
  color3?: string
  speed?: number
  intensity?: number
  scale?: number
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0]
}

const vertexShader = \`
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
\`

const fragmentShader = \`
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_intensity;
  uniform float u_scale;

  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv * u_scale;

    // Create flowing aurora waves
    float t = u_time * 0.15;

    // Multiple layers of noise for organic movement
    float n1 = fbm(vec2(p.x * 2.0 + t, p.y * 0.5 + t * 0.3));
    float n2 = fbm(vec2(p.x * 1.5 - t * 0.7, p.y * 0.8 + t * 0.2));
    float n3 = fbm(vec2(p.x + t * 0.5, p.y * 1.2 - t * 0.4));

    // Vertical curtain effect
    float curtain = sin(p.x * 3.14159 * 3.0 + n1 * 2.0 + t) * 0.5 + 0.5;
    curtain *= sin(p.x * 3.14159 * 5.0 + n2 * 1.5 - t * 0.8) * 0.5 + 0.5;

    // Vertical gradient (aurora appears in upper portion)
    float vertGrad = smoothstep(0.0, 0.6, uv.y) * smoothstep(1.0, 0.4, uv.y);

    // Combine noise layers
    float aurora = (n1 + n2 * 0.7 + n3 * 0.5) * curtain * vertGrad;
    aurora = pow(max(aurora, 0.0), 1.5) * u_intensity;

    // Color mixing based on position and noise
    float colorMix1 = snoise(vec2(p.x + t, p.y * 0.3)) * 0.5 + 0.5;
    float colorMix2 = snoise(vec2(p.x * 0.5 - t, p.y * 0.5 + t)) * 0.5 + 0.5;

    vec3 auroraColor = mix(u_color1, u_color2, colorMix1);
    auroraColor = mix(auroraColor, u_color3, colorMix2 * 0.5);

    // Dark background with subtle gradient
    vec3 bgColor = vec3(0.02, 0.02, 0.05);
    bgColor += vec3(0.02, 0.01, 0.03) * (1.0 - uv.y);

    // Final composition
    vec3 color = bgColor + auroraColor * aurora;

    // Add subtle stars
    float stars = pow(snoise(uv * 200.0), 20.0) * (1.0 - aurora * 2.0);
    color += vec3(stars * 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
\`

export function AuroraShader({
  className = "",
  color1 = "#00ff87",
  color2 = "#60efff",
  color3 = "#ff00ff",
  speed = 1,
  intensity = 1.5,
  scale = 3,
}: AuroraShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", { antialias: true, alpha: false })
    if (!gl) {
      console.error("WebGL not supported")
      return
    }

    // Create shaders
    const vShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vShader, vertexShader)
    gl.compileShader(vShader)

    const fShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fShader, fragmentShader)
    gl.compileShader(fShader)

    // Create program
    const program = gl.createProgram()!
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Set up geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution")
    const timeLoc = gl.getUniformLocation(program, "u_time")
    const color1Loc = gl.getUniformLocation(program, "u_color1")
    const color2Loc = gl.getUniformLocation(program, "u_color2")
    const color3Loc = gl.getUniformLocation(program, "u_color3")
    const intensityLoc = gl.getUniformLocation(program, "u_intensity")
    const scaleLoc = gl.getUniformLocation(program, "u_scale")

    // Set colors
    const rgb1 = hexToRgb(color1)
    const rgb2 = hexToRgb(color2)
    const rgb3 = hexToRgb(color3)
    gl.uniform3fv(color1Loc, rgb1)
    gl.uniform3fv(color2Loc, rgb2)
    gl.uniform3fv(color3Loc, rgb3)
    gl.uniform1f(intensityLoc, intensity)
    gl.uniform1f(scaleLoc, scale)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener("resize", resize)

    const render = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      gl.uniform1f(timeLoc, elapsed * speed)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
      gl.deleteProgram(program)
      gl.deleteShader(vShader)
      gl.deleteShader(fShader)
    }
  }, [color1, color2, color3, speed, intensity, scale])

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />
}
`

export const aurora: Shader = {
  slug: "aurora",
  name: "Aurora Borealis",
  description: "Ethereal northern lights effect with flowing, colorful curtains of light dancing across a starry sky.",
  tags: ["animated", "gradient", "organic", "dark"],
  author: "ShaderDrop",
  createdAt: "2025-01-16",
  uniforms: [
    {
      name: "color1",
      label: "Primary Color",
      type: "color",
      default: "#00ff87",
    },
    {
      name: "color2",
      label: "Secondary Color",
      type: "color",
      default: "#60efff",
    },
    {
      name: "color3",
      label: "Accent Color",
      type: "color",
      default: "#ff00ff",
    },
    {
      name: "speed",
      label: "Animation Speed",
      type: "range",
      default: 1,
      min: 0.1,
      max: 3,
      step: 0.1,
    },
    {
      name: "intensity",
      label: "Glow Intensity",
      type: "range",
      default: 1.5,
      min: 0.5,
      max: 3,
      step: 0.1,
    },
    {
      name: "scale",
      label: "Pattern Scale",
      type: "range",
      default: 3,
      min: 1,
      max: 6,
      step: 0.5,
    },
  ],
  code: auroraCode,
  defaultProps: {
    color1: "#00ff87",
    color2: "#60efff",
    color3: "#ff00ff",
    speed: 1,
    intensity: 1.5,
    scale: 3,
  },
}
