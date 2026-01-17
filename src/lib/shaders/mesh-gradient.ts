import type { Shader } from "@/types/shader"

export const meshGradientCode = `"use client"

import { useEffect, useRef } from "react"

interface MeshGradientShaderProps {
  className?: string
  color1?: string
  color2?: string
  color3?: string
  color4?: string
  speed?: number
  noiseScale?: number
  blend?: number
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
  uniform vec3 u_color4;
  uniform float u_noiseScale;
  uniform float u_blend;

  // Simplex noise
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

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = u_time * 0.2;

    // Create organic blob movements
    vec2 p1 = vec2(
      0.3 + 0.2 * sin(t * 0.7),
      0.3 + 0.2 * cos(t * 0.5)
    );
    vec2 p2 = vec2(
      0.7 + 0.2 * cos(t * 0.6),
      0.3 + 0.2 * sin(t * 0.8)
    );
    vec2 p3 = vec2(
      0.5 + 0.2 * sin(t * 0.9),
      0.7 + 0.2 * cos(t * 0.4)
    );
    vec2 p4 = vec2(
      0.2 + 0.15 * cos(t * 0.5),
      0.7 + 0.15 * sin(t * 0.6)
    );

    // Add noise distortion to UV
    vec2 noiseUV = uv * u_noiseScale;
    float noise = snoise(noiseUV + t * 0.3) * 0.1;
    vec2 distortedUV = uv + noise;

    // Calculate distances to each blob center
    float d1 = length(distortedUV - p1);
    float d2 = length(distortedUV - p2);
    float d3 = length(distortedUV - p3);
    float d4 = length(distortedUV - p4);

    // Smooth blob influence
    float influence = u_blend;
    float w1 = 1.0 / (pow(d1, influence) + 0.001);
    float w2 = 1.0 / (pow(d2, influence) + 0.001);
    float w3 = 1.0 / (pow(d3, influence) + 0.001);
    float w4 = 1.0 / (pow(d4, influence) + 0.001);

    float totalWeight = w1 + w2 + w3 + w4;

    // Normalize weights
    w1 /= totalWeight;
    w2 /= totalWeight;
    w3 /= totalWeight;
    w4 /= totalWeight;

    // Blend colors based on proximity
    vec3 color = u_color1 * w1 + u_color2 * w2 + u_color3 * w3 + u_color4 * w4;

    // Add subtle grain for texture
    float grain = snoise(uv * 500.0 + t * 10.0) * 0.02;
    color += grain;

    // Slight contrast boost
    color = pow(color, vec3(0.95));

    gl_FragColor = vec4(color, 1.0);
  }
\`

export function MeshGradientShader({
  className = "",
  color1 = "#ff6b6b",
  color2 = "#4ecdc4",
  color3 = "#ffe66d",
  color4 = "#95e1d3",
  speed = 1,
  noiseScale = 2,
  blend = 2,
}: MeshGradientShaderProps) {
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

    const vShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vShader, vertexShader)
    gl.compileShader(vShader)

    const fShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fShader, fragmentShader)
    gl.compileShader(fShader)

    const program = gl.createProgram()!
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution")
    const timeLoc = gl.getUniformLocation(program, "u_time")
    const color1Loc = gl.getUniformLocation(program, "u_color1")
    const color2Loc = gl.getUniformLocation(program, "u_color2")
    const color3Loc = gl.getUniformLocation(program, "u_color3")
    const color4Loc = gl.getUniformLocation(program, "u_color4")
    const noiseScaleLoc = gl.getUniformLocation(program, "u_noiseScale")
    const blendLoc = gl.getUniformLocation(program, "u_blend")

    gl.uniform3fv(color1Loc, hexToRgb(color1))
    gl.uniform3fv(color2Loc, hexToRgb(color2))
    gl.uniform3fv(color3Loc, hexToRgb(color3))
    gl.uniform3fv(color4Loc, hexToRgb(color4))
    gl.uniform1f(noiseScaleLoc, noiseScale)
    gl.uniform1f(blendLoc, blend)

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
  }, [color1, color2, color3, color4, speed, noiseScale, blend])

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />
}
`

export const meshGradient: Shader = {
  slug: "mesh-gradient",
  name: "Mesh Gradient",
  description: "Modern, organic mesh gradient with smooth color blobs that morph and flow like liquid glass.",
  tags: ["animated", "gradient", "modern", "soft"],
  author: "ShaderDrop",
  createdAt: "2025-01-16",
  uniforms: [
    {
      name: "color1",
      label: "Color 1",
      type: "color",
      default: "#ff6b6b",
    },
    {
      name: "color2",
      label: "Color 2",
      type: "color",
      default: "#4ecdc4",
    },
    {
      name: "color3",
      label: "Color 3",
      type: "color",
      default: "#ffe66d",
    },
    {
      name: "color4",
      label: "Color 4",
      type: "color",
      default: "#95e1d3",
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
      name: "noiseScale",
      label: "Noise Distortion",
      type: "range",
      default: 2,
      min: 0,
      max: 5,
      step: 0.5,
    },
    {
      name: "blend",
      label: "Color Blend",
      type: "range",
      default: 2,
      min: 1,
      max: 4,
      step: 0.25,
    },
  ],
  code: meshGradientCode,
  defaultProps: {
    color1: "#ff6b6b",
    color2: "#4ecdc4",
    color3: "#ffe66d",
    color4: "#95e1d3",
    speed: 1,
    noiseScale: 2,
    blend: 2,
  },
}
