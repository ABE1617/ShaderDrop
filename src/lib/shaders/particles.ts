import type { Shader } from "@/types/shader"

export const particlesCode = `"use client"

import { useEffect, useRef } from "react"

interface ParticlesShaderProps {
  className?: string
  particleColor?: string
  bgColor?: string
  particleCount?: number
  speed?: number
  particleSize?: number
  connectionDistance?: number
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
  uniform vec3 u_particleColor;
  uniform vec3 u_bgColor;
  uniform float u_particleCount;
  uniform float u_particleSize;
  uniform float u_connectionDistance;

  // Hash function for pseudo-random values
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  vec2 hash2(float n) {
    return vec2(hash(n), hash(n + 57.0));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    vec3 color = u_bgColor;
    float t = u_time * 0.3;

    // Accumulate particle influence
    float particles = 0.0;
    float connections = 0.0;

    // Store nearest particle positions for connections
    vec2 nearestParticles[4];
    float nearestDists[4];
    for (int i = 0; i < 4; i++) {
      nearestDists[i] = 1000.0;
    }

    // Calculate particles
    for (float i = 0.0; i < 80.0; i++) {
      if (i >= u_particleCount) break;

      // Generate particle position with smooth movement
      vec2 basePos = hash2(i * 17.0);
      float speedMod = 0.3 + hash(i * 23.0) * 0.7;

      vec2 particlePos = vec2(
        basePos.x + sin(t * speedMod + i) * 0.1 + cos(t * 0.7 + i * 0.3) * 0.05,
        basePos.y + cos(t * speedMod * 0.8 + i) * 0.1 + sin(t * 0.5 + i * 0.2) * 0.05
      );

      // Wrap around edges
      particlePos = fract(particlePos);
      particlePos.x *= aspect;

      // Calculate distance to particle
      float dist = length(p - particlePos);

      // Draw particle glow
      float particleGlow = u_particleSize * 0.01 / (dist + 0.001);
      particleGlow = pow(particleGlow, 1.5);
      particles += particleGlow * 0.15;

      // Track nearest particles for connections
      if (dist < nearestDists[0]) {
        nearestDists[3] = nearestDists[2];
        nearestParticles[3] = nearestParticles[2];
        nearestDists[2] = nearestDists[1];
        nearestParticles[2] = nearestParticles[1];
        nearestDists[1] = nearestDists[0];
        nearestParticles[1] = nearestParticles[0];
        nearestDists[0] = dist;
        nearestParticles[0] = particlePos;
      } else if (dist < nearestDists[1]) {
        nearestDists[3] = nearestDists[2];
        nearestParticles[3] = nearestParticles[2];
        nearestDists[2] = nearestDists[1];
        nearestParticles[2] = nearestParticles[1];
        nearestDists[1] = dist;
        nearestParticles[1] = particlePos;
      } else if (dist < nearestDists[2]) {
        nearestDists[3] = nearestDists[2];
        nearestParticles[3] = nearestParticles[2];
        nearestDists[2] = dist;
        nearestParticles[2] = particlePos;
      } else if (dist < nearestDists[3]) {
        nearestDists[3] = dist;
        nearestParticles[3] = particlePos;
      }
    }

    // Draw connections between nearby particles
    float connDist = u_connectionDistance * 0.3;
    for (int i = 0; i < 3; i++) {
      for (int j = i + 1; j < 4; j++) {
        vec2 p1 = nearestParticles[i];
        vec2 p2 = nearestParticles[j];
        float d = length(p1 - p2);

        if (d < connDist) {
          // Calculate distance from current pixel to line segment
          vec2 pa = p - p1;
          vec2 ba = p2 - p1;
          float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
          float lineDist = length(pa - ba * h);

          float lineStrength = (1.0 - d / connDist) * 0.5;
          float line = smoothstep(0.003, 0.0, lineDist) * lineStrength;
          connections += line;
        }
      }
    }

    // Combine effects
    color += u_particleColor * (particles + connections);

    // Subtle vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.4;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
\`

export function ParticlesShader({
  className = "",
  particleColor = "#667eea",
  bgColor = "#0a0a0f",
  particleCount = 50,
  speed = 1,
  particleSize = 3,
  connectionDistance = 3,
}: ParticlesShaderProps) {
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
    const particleColorLoc = gl.getUniformLocation(program, "u_particleColor")
    const bgColorLoc = gl.getUniformLocation(program, "u_bgColor")
    const particleCountLoc = gl.getUniformLocation(program, "u_particleCount")
    const particleSizeLoc = gl.getUniformLocation(program, "u_particleSize")
    const connectionDistanceLoc = gl.getUniformLocation(program, "u_connectionDistance")

    gl.uniform3fv(particleColorLoc, hexToRgb(particleColor))
    gl.uniform3fv(bgColorLoc, hexToRgb(bgColor))
    gl.uniform1f(particleCountLoc, particleCount)
    gl.uniform1f(particleSizeLoc, particleSize)
    gl.uniform1f(connectionDistanceLoc, connectionDistance)

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
  }, [particleColor, bgColor, particleCount, speed, particleSize, connectionDistance])

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />
}
`

export const particles: Shader = {
  slug: "particles",
  name: "Connected Particles",
  description: "Floating particle network with glowing nodes and dynamic connections, perfect for tech-focused backgrounds.",
  tags: ["animated", "particles", "tech", "network"],
  author: "ShaderDrop",
  createdAt: "2025-01-16",
  uniforms: [
    {
      name: "particleColor",
      label: "Particle Color",
      type: "color",
      default: "#667eea",
    },
    {
      name: "bgColor",
      label: "Background Color",
      type: "color",
      default: "#0a0a0f",
    },
    {
      name: "particleCount",
      label: "Particle Count",
      type: "range",
      default: 50,
      min: 10,
      max: 80,
      step: 5,
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
      name: "particleSize",
      label: "Particle Size",
      type: "range",
      default: 3,
      min: 1,
      max: 6,
      step: 0.5,
    },
    {
      name: "connectionDistance",
      label: "Connection Range",
      type: "range",
      default: 3,
      min: 1,
      max: 5,
      step: 0.5,
    },
  ],
  code: particlesCode,
  defaultProps: {
    particleColor: "#667eea",
    bgColor: "#0a0a0f",
    particleCount: 50,
    speed: 1,
    particleSize: 3,
    connectionDistance: 3,
  },
}
