"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// Super low DPR for thumbnails - performance first
const THUMB_DPR = 0.75
const FRAME_INTERVAL = 1000 / 24 // 24fps for thumbnails

const vertexShader = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`

// Simplified shaders for thumbnails - lighter but still look good
const thumbnailShaders: Record<string, string> = {
  "liquid-metal": `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(dot(hash(i), f), dot(hash(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
                 mix(dot(hash(i + vec2(0, 1)), f - vec2(0, 1)), dot(hash(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = (uv - 0.5) * 2.0;
      p.x *= u_resolution.x / u_resolution.y;
      float t = u_time * 0.3;

      // Surface noise
      float n1 = noise(p * 1.5 + t * 0.4);
      float n2 = noise(p * 3.0 + t * 0.5 + 5.0);
      float surface = n1 * 0.6 + n2 * 0.4;

      // Calculate fake normals
      float eps = 0.1;
      float nx = noise(p * 2.0 + vec2(eps, 0.0) + t * 0.4) - noise(p * 2.0 - vec2(eps, 0.0) + t * 0.4);
      float ny = noise(p * 2.0 + vec2(0.0, eps) + t * 0.4) - noise(p * 2.0 - vec2(0.0, eps) + t * 0.4);
      vec3 normal = normalize(vec3(nx * 3.0, ny * 3.0, 1.0));

      // Lighting
      vec3 lightDir = normalize(vec3(sin(t * 0.5) * 0.5, 0.6, 1.0));
      float diffuse = max(dot(normal, lightDir), 0.0);

      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      vec3 halfDir = normalize(lightDir + viewDir);
      float specular = pow(max(dot(normal, halfDir), 0.0), 60.0) * 1.5;
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

      vec3 baseColor = vec3(0.1, 0.1, 0.18);
      vec3 highlight = vec3(0.9, 0.9, 0.95);

      vec3 color = baseColor * (0.2 + diffuse * 0.5);
      color += highlight * specular;
      color += highlight * fresnel * 0.4;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
  "neon-horizon": `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;

    float hash(float n) { return fract(sin(n) * 43758.5453); }
    float noise(float x) {
      float i = floor(x);
      float f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(hash(i), hash(i + 1.0), f);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;

      // Sky gradient
      float skyGrad = pow(uv.y, 0.5);
      vec3 sky = mix(vec3(0.04, 0.0, 0.08), vec3(0.1, 0.0, 0.19), skyGrad);
      sky += vec3(0.12, 0.0, 0.18) * sin(skyGrad * 3.14159) * 0.4;

      // Sun
      vec2 sunPos = vec2(0.5, 0.42);
      float sunDist = length((uv - sunPos) * vec2(aspect, 1.0));
      float sun = smoothstep(0.18, 0.155, sunDist);

      // Animated stripes moving downward
      float stripeY = (uv.y - sunPos.y + 0.18) / 0.36;
      float stripeAnim = stripeY - u_time * 0.08;
      float stripe = sin(stripeAnim * 18.0 * 3.14159) * 0.5 + 0.5;
      stripe = smoothstep(0.2, 0.8, stripe);
      float stripeMask = smoothstep(0.6, 0.3, stripeY);
      sun *= mix(1.0, stripe, stripeMask * 0.85);

      // Glow
      float glow = exp(-sunDist * 4.0) * 1.2;

      // Mountains
      float horizon = 0.35;
      float mountainX = uv.x * aspect;
      float m1 = noise(mountainX * 2.0) * 0.08 + noise(mountainX * 4.0) * 0.04;
      float m2 = noise(mountainX * 3.5 + 10.0) * 0.05 + noise(mountainX * 7.0 + 10.0) * 0.025;
      sky = mix(sky, vec3(0.02, 0.0, 0.04), smoothstep(horizon + m1 + 0.02, horizon + m1, uv.y) * 0.9);
      sky = mix(sky, vec3(0.04, 0.0, 0.06), smoothstep(horizon + m2 + 0.015, horizon + m2, uv.y) * 0.95);

      // Haze
      sky += vec3(0.8, 0.2, 0.6) * exp(-abs(uv.y - horizon) * 8.0) * 0.3;

      if (uv.y < horizon) {
        float perspY = (horizon - uv.y) / horizon;
        float z = 1.0 / (perspY + 0.0001);
        float gridZ = abs(fract(z * 0.2 - u_time * 0.8) - 0.5);
        float aaScale = 0.5 / u_resolution.y * z;
        float line = smoothstep(0.025 + aaScale * 5.0, 0.025 - aaScale * 5.0, gridZ);
        line *= smoothstep(0.0, 0.25, perspY) * (1.0 - perspY * 0.7);

        vec3 groundColor = mix(vec3(0.01, 0.0, 0.02), vec3(0.03, 0.0, 0.05), perspY * 0.5);
        groundColor += vec3(1.0, 0.0, 1.0) * line * (1.2 + (1.0 - perspY) * 0.8);

        // Reflection
        float reflectX = abs(uv.x - 0.5);
        float reflection = exp(-reflectX * 10.0) * exp(-perspY * 2.5) * 0.4;
        groundColor += vec3(1.0, 0.67, 0.0) * reflection;

        // Fog
        groundColor = mix(groundColor, vec3(0.04, 0.0, 0.08) + vec3(0.1, 0.0, 0.1), perspY * perspY * 0.6);
        sky = groundColor;
      }

      vec3 color = sky + vec3(1.0, 0.67, 0.0) * (sun + glow * 0.5);
      color += vec3(1.0, 0.0, 1.0) * exp(-abs(uv.y - horizon) * 40.0) * 0.5;
      color *= 1.0 - length((uv - 0.5) * vec2(1.3, 1.0)) * 0.4;
      color = color / (1.0 + color * 0.2);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  "voronoi": `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;

    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 p = vec2(uv.x * aspect, uv.y) * 5.0;
      float t = u_time * 0.3;

      vec2 n = floor(p), f = fract(p);
      float d1 = 10.0, d2 = 10.0;
      vec2 minCell, cellCenter;

      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 cell = n + g;
        vec2 o = hash2(cell);
        float phase = dot(cell, vec2(1.0, 1.7));
        o = 0.5 + 0.4 * sin(t + 6.28 * o + phase);
        vec2 r = g + o - f;
        float d = length(r);
        if (d < d1) { d2 = d1; d1 = d; minCell = cell; cellCenter = p - f + g + o; }
        else if (d < d2) { d2 = d; }
      }

      float edge = d2 - d1;
      float id1 = hash(minCell);

      // 3D depth effect
      float dome = max(0.0, 1.0 - d1 * d1 * 4.0);
      float highlight = pow(dome, 3.0);
      float depth3d = mix(0.4, 1.0, smoothstep(0.0, 0.15, edge)) + highlight * 0.5;

      vec3 cellColor = mix(vec3(0.1, 0.1, 0.24), vec3(0.18, 0.1, 0.3), id1);
      cellColor *= depth3d;

      float pulse = sin(t * 2.0 + id1 * 6.28) * 0.5 + 0.5;
      cellColor *= 0.9 + pulse * 0.2;

      // Energy flow
      float energyPhase = t * 3.0;
      float energy = sin(cellCenter.x * 10.0 + cellCenter.y * 7.0 + energyPhase) * 0.5 + 0.5;
      energy *= sin(cellCenter.x * 7.0 - cellCenter.y * 11.0 + energyPhase * 1.3) * 0.5 + 0.5;

      vec3 glowColor = vec3(0.0, 1.0, 1.0) * (0.7 + pulse * 0.3 + energy * 0.3);

      float edgeCore = smoothstep(0.02, 0.0, edge);
      float edgeMid = smoothstep(0.075, 0.015, edge);
      float edgeOuter = smoothstep(0.15, 0.05, edge);

      vec3 color = cellColor;
      color = mix(color, vec3(0.0, 0.3, 0.3), edgeOuter * 0.4);
      color = mix(color, glowColor * 0.7, edgeMid);
      color = mix(color, glowColor, edgeCore);
      color += glowColor * edgeCore * 0.8;
      color += glowColor * energy * edgeMid * 0.3;

      color *= 1.0 - length(uv - 0.5) * 0.4;
      color = color / (1.0 + color * 0.2);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  "pixel-art": `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    float hash1(float n) { return fract(sin(n) * 43758.5453); }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      float pixelRes = 100.0;
      vec2 pxCoord = floor(uv * pixelRes);
      vec2 pxUV = pxCoord / pixelRes;
      vec2 pxUVaspect = vec2(pxUV.x * aspect, pxUV.y);
      float t = u_time;

      // Sky with color bands
      vec3 skyTop = vec3(0.29, 0.1, 0.26);
      vec3 skyMid = vec3(0.6, 0.25, 0.3);
      vec3 sunCol = vec3(1.0, 0.42, 0.21);
      float band = floor(pxUV.y * 10.0) / 10.0;
      vec3 color = mix(sunCol, skyTop, band);

      // Stars
      if (pxUV.y > 0.55) {
        float star = hash(pxCoord * 0.5);
        float twinkle = sin(t * 2.0 + star * 100.0) * 0.5 + 0.5;
        if (star > 0.97) color = mix(color, vec3(1.0), twinkle * twinkle);
      }

      // Sun (clean, no stripes)
      vec2 sunPos = vec2(0.5, 0.52);
      float sunRadius = 0.11;
      vec2 sunUV = (pxUV - sunPos) * vec2(aspect, 1.0);
      float sunDist = length(sunUV);
      if (sunDist < sunRadius) {
        float sunGrad = sunDist / sunRadius;
        color = mix(sunCol * 1.5, sunCol * vec3(1.0, 0.5, 0.3), sunGrad * 0.7);
      }
      else if (sunDist < sunRadius + 0.03) color = mix(color, sunCol * 1.2, 0.6);
      else if (sunDist < sunRadius + 0.06) color = mix(color, sunCol * 0.8, 0.3);

      // Sun rays
      float rayAngle = atan(sunUV.y, sunUV.x);
      float rayPattern = sin(rayAngle * 10.0) * 0.5 + 0.5;
      float rayDist = sunDist - sunRadius;
      float rayFade = smoothstep(0.0, 0.12, rayDist) * (1.0 - smoothstep(0.12, 0.25, rayDist));
      color += sunCol * rayPattern * rayFade * 0.12;

      // Mountains (3 layers)
      float horizon = 0.32;

      // Far mountains
      float m3 = sin(pxUVaspect.x * 0.6) * 0.1 + sin(pxUVaspect.x * 1.3) * 0.05;
      if (pxUV.y < horizon + max(0.0, m3) + 0.06 && pxUV.y > horizon)
        color = vec3(0.2, 0.12, 0.28);

      // Mid mountains
      float m2 = sin(pxUVaspect.x * 1.3 + 1.0) * 0.07 + sin(pxUVaspect.x * 2.5) * 0.03;
      if (pxUV.y < horizon + max(0.0, m2) + 0.03 && pxUV.y > horizon - 0.01)
        color = vec3(0.12, 0.06, 0.18);

      // Near silhouette
      float m1 = sin(pxUVaspect.x * 2.2) * 0.04;
      if (pxUV.y < horizon + max(0.0, m1) && pxUV.y > horizon - 0.02)
        color = vec3(0.05, 0.02, 0.08);

      // Palm silhouette
      if (abs(pxUV.x - 0.78) < 0.006 && pxUV.y > horizon - 0.01 && pxUV.y < horizon + 0.06)
        color = vec3(0.03, 0.01, 0.05);

      // Ultra premium water
      if (pxUV.y < horizon) {
        float waveT = t;
        float rowH = 0.016;
        float rowIdx = floor((horizon - pxUV.y) / rowH);
        float posInRow = fract((horizon - pxUV.y) / rowH);

        // Multi-layer wave motion
        float w1 = sin(rowIdx * 0.6 + waveT * 0.7) * 0.02;
        float w2 = sin(rowIdx * 0.9 + waveT * 1.1) * 0.01;
        float localX = pxUV.x + w1 + w2;

        float depth = min(rowIdx / 15.0, 1.0);

        // Water gradient
        vec3 water = mix(
          mix(vec3(0.15, 0.28, 0.35), sunCol * 0.25, 0.25),
          vec3(0.05, 0.12, 0.18),
          depth
        );

        // Wave shading
        float waveTop = 1.0 - smoothstep(0.0, 0.15, posInRow);
        float waveTrough = smoothstep(0.6, 1.0, posInRow);
        water = mix(water, water * 1.4 + vec3(0.1, 0.15, 0.2), waveTop * 0.7);
        water = mix(water, water * 0.5, waveTrough * 0.6);

        // Foam system
        float foamSeed = hash(vec2(floor(localX * 18.0), rowIdx));
        float foamVisible = step(0.65 - depth * 0.15, foamSeed) * step(posInRow, 0.1);
        vec3 foam = vec3(0.9, 0.95, 1.0) * (0.85 + 0.15 * sin(localX * 40.0 + waveT * 6.0));
        water = mix(water, foam, foamVisible * 0.85);

        // Edge highlight
        water += vec3(0.12, 0.16, 0.2) * step(posInRow, 0.04) * (1.0 - depth * 0.4);

        // Sun reflection
        float rx = abs(pxUV.x - 0.5);
        float rw = 0.035 + depth * 0.15;
        if (rx < rw) {
          float ri = pow(1.0 - rx / rw, 3.0);
          float sparkle = hash(vec2(floor(localX * 22.0 + waveT * 3.5), rowIdx + floor(t * 5.0)));
          float sv = step(0.45, sparkle) * (1.0 - smoothstep(0.0, 0.3, posInRow));
          water = mix(water, sunCol * 1.4, ri * (0.2 + sv * 0.6));
        }

        // Retro banding
        water *= mod(rowIdx, 3.0) < 1.0 ? 0.93 : (mod(rowIdx, 3.0) < 2.0 ? 0.97 : 1.0);

        color = water;
      }

      // Sailboat (middle of the sea, closer to viewer)
      float boatX = mod(t * 0.025 + 0.3, 1.4) - 0.2;
      float boatY = horizon - 0.08 + sin(t * 1.8) * 0.003;  // Middle of water
      float hull = step(abs(pxUV.x - boatX), 0.035) * step(abs(pxUV.y - boatY), 0.01);
      float mast = step(abs(pxUV.x - boatX), 0.003) * step(boatY, pxUV.y) * step(pxUV.y, boatY + 0.055);
      float sailH = pxUV.y - boatY - 0.006;
      float sailW = sailH * 0.7;
      float sail = step(boatX, pxUV.x) * step(pxUV.x, boatX + sailW) * step(boatY + 0.006, pxUV.y) * step(pxUV.y, boatY + 0.048);
      // Boat colors - brown hull, white sail
      color = mix(color, vec3(0.35, 0.2, 0.1), hull);  // Brown hull
      color = mix(color, vec3(0.25, 0.15, 0.08), mast);  // Dark brown mast
      color = mix(color, vec3(0.95, 0.92, 0.88), sail);  // White sail

      // Horizon glow
      color += sunCol * exp(-abs(pxUV.y - horizon) * 60.0) * 0.4;

      // Birds (V-formation)
      float formX = mod(t * 0.03, 1.3) - 0.15;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float bx = formX + (fi - 2.0) * 0.018;
        float by = 0.6 - abs(fi - 2.0) * 0.02 + sin(t * 4.0 + fi) * 0.006;
        if (length(pxUV - vec2(bx, by)) < 0.005) color = vec3(0.05, 0.02, 0.08);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `,
  "fluid-ink": `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;

    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(dot(hash2(i), f), dot(hash2(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
                 mix(dot(hash2(i + vec2(0, 1)), f - vec2(0, 1)), dot(hash2(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y);
    }

    float fbm(vec2 p, float t) {
      float v = 0.0;
      float amp = 0.5;
      mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
      for (int i = 0; i < 5; i++) {
        v += amp * noise(p + t * (0.15 + float(i) * 0.05));
        p = rot * p * 2.0;
        amp *= 0.5;
      }
      return v;
    }

    vec2 vortex(vec2 p, vec2 c, float str, float rad) {
      vec2 d = p - c;
      float dist = length(d);
      float angle = str * exp(-dist * dist / (rad * rad));
      float s = sin(angle), co = cos(angle);
      return vec2(co * d.x - s * d.y, s * d.x + co * d.y) + c;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5) * 2.0;
      float t = u_time * 0.4;

      // Multi-layer domain warping
      vec2 baseP = p * 1.5;
      vec2 q = vec2(fbm(baseP + t * 0.1, t), fbm(baseP + vec2(5.2, 1.3) + t * 0.12, t));
      vec2 r = vec2(fbm(baseP + q * 4.0 + vec2(1.7, 9.2) + t * 0.15, t),
                    fbm(baseP + q * 4.0 + vec2(8.3, 2.8) + t * 0.18, t));

      // Vortex swirls
      vec2 warpedP = baseP + q * 3.0 + r * 1.5;
      vec2 v1 = vec2(sin(t * 0.3) * 0.5, cos(t * 0.25) * 0.5);
      vec2 v2 = vec2(cos(t * 0.35) * 0.6, sin(t * 0.4) * 0.4);
      warpedP = vortex(warpedP, v1 * 1.5, 2.0 * sin(t * 0.5), 1.5);
      warpedP = vortex(warpedP, v2 * 1.5, -1.4 * cos(t * 0.6), 1.2);

      // Ink field
      float ink = fbm(warpedP, t) * 0.5 + 0.5;

      // Colors
      vec3 c1 = vec3(0.04, 0.04, 0.1);
      vec3 c2 = vec3(0.1, 0.1, 0.3);
      vec3 c3 = vec3(0.42, 0.05, 0.68);

      float zone1 = smoothstep(0.0, 0.35, ink);
      float zone2 = smoothstep(0.3, 0.65, ink);

      vec3 color = c1;
      color = mix(color, c2, zone1);
      color = mix(color, c3, zone2);

      // Highlights
      float highlight = pow(length(q) * 0.8 + length(r) * 0.4, 2.0);
      highlight = smoothstep(0.3, 1.2, highlight);
      color += mix(c2, c3, 0.5) * highlight * 0.4;

      // Edge glow
      float eps = 0.02;
      float edgeX = abs(fbm(warpedP + vec2(eps, 0.0), t) - fbm(warpedP - vec2(eps, 0.0), t));
      float edgeY = abs(fbm(warpedP + vec2(0.0, eps), t) - fbm(warpedP - vec2(0.0, eps), t));
      float edge = sqrt(edgeX * edgeX + edgeY * edgeY) * 6.0;
      color += c3 * edge * 0.3;

      // Vignette and tone mapping
      color *= 1.0 - length(uv - 0.5) * 0.4;
      color = color / (1.0 + color * 0.15);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
  "aurora-mesh": `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;

    // Multi-directional wave
    float wave(vec2 p, float t) {
      float w1 = sin((p.x + p.y) * 1.8 + t * 1.4) * 0.4;
      float w2 = sin((p.x - p.y) * 2.2 - t * 1.1) * 0.3;
      float w3 = sin(p.x * 3.0 + t * 1.8) * cos(p.y * 0.5 + t * 0.3) * 0.25;
      float dist = length(p);
      float w4 = sin(dist * 2.5 - t * 2.0) * 0.2 * exp(-dist * 0.3);
      return (w1 + w2 + w3 + w4) * 0.4;
    }

    vec3 calcNormal(vec2 p, float t) {
      float eps = 0.06;
      float h = wave(p, t);
      float hx = wave(p + vec2(eps, 0.0), t);
      float hy = wave(p + vec2(0.0, eps), t);
      return normalize(vec3(h - hx, eps * 1.5, h - hy));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 2.5;
      float t = u_time * 0.6;

      // Triangle grid
      vec2 scaled = p * 10.0;
      vec2 cell = floor(scaled);
      vec2 local = fract(scaled);
      float isUpper = step(local.x + local.y, 1.0);
      vec2 cellId = cell + vec2(isUpper * 0.5, (1.0 - isUpper) * 0.5);

      float edge;
      if (isUpper > 0.5) {
        edge = min(min(local.x, local.y), 1.0 - local.x - local.y);
      } else {
        vec2 f = 1.0 - local;
        edge = min(min(f.x, f.y), 1.0 - f.x - f.y);
      }

      vec3 normal = calcNormal(p, t);
      float cellRand = fract(sin(dot(cellId, vec2(127.1, 311.7))) * 43758.5453);
      normal.x += (cellRand - 0.5) * 0.4;
      normal = normalize(normal);

      float height = wave(p, t);
      vec3 surfacePos = vec3(p.x, height, p.y);
      vec3 viewDir = normalize(vec3(0.0, 1.0, 0.4));

      // Multiple lights
      vec3 l1 = normalize(vec3(sin(t * 0.4) * 2.5, 2.0, cos(t * 0.35) * 2.5) - surfacePos);
      vec3 l2 = normalize(vec3(-cos(t * 0.5) * 2.0, 1.8, sin(t * 0.45) * 2.0) - surfacePos);

      float spec1 = pow(max(dot(normal, normalize(l1 + viewDir)), 0.0), 40.0);
      float spec2 = pow(max(dot(normal, normalize(l2 + viewDir)), 0.0), 50.0);
      float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);

      float diff = max(dot(normal, l1), 0.0) * 0.4 + 0.35;
      float totalSpec = spec1 + spec2 * 0.8;

      vec3 baseColor = vec3(0.04, 0.04, 0.07);
      vec3 accent = vec3(0.39, 0.4, 0.95);

      vec3 color = baseColor * diff;
      color += mix(accent, vec3(1.0), 0.3) * totalSpec * 1.8;
      color += accent * rim * 0.25;

      float edgeLine = smoothstep(0.0, 0.05, edge);
      color = mix(baseColor * 0.4, color, edgeLine);
      color += accent * (1.0 - edgeLine) * totalSpec * 0.5;

      float vig = 1.0 - length(uv - 0.5) * 0.8;
      color *= smoothstep(0.0, 0.6, vig);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
  "wave-terrain": `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    float wave(vec2 p, float t) {
      float w = 0.0;
      w += sin(p.x * 0.6 + t * 1.2) * 0.6;
      w += sin(p.x * 0.3 - p.y * 0.2 + t * 0.9) * 0.9;
      w += sin(p.y * 0.4 + t * 0.7) * 0.5;
      w += sin((p.x + p.y) * 0.25 + t) * 0.7;
      w += sin((p.x - p.y) * 0.35 - t * 0.6) * 0.4;
      float ripple = sin(length(p - vec2(sin(t * 0.3) * 5.0, cos(t * 0.2) * 5.0)) * 0.5 - t * 2.0);
      w += ripple * 0.3;
      return w * 0.4;
    }

    float getHeight(vec2 p, float t) { return wave(p * 0.5, t) * 2.0; }

    void getTriangle(vec2 p, float gridSize, float t, out vec3 normal, out float edgeDist, out float avgH, out vec2 cellId) {
      vec2 cell = floor(p / gridSize);
      cellId = cell;
      vec2 local = fract(p / gridSize);
      bool upper = (local.x + local.y) < 1.0;

      vec2 p0, p1, p2;
      if (upper) { p0 = cell; p1 = cell + vec2(1.0, 0.0); p2 = cell + vec2(0.0, 1.0); }
      else { p0 = cell + vec2(1.0, 1.0); p1 = cell + vec2(0.0, 1.0); p2 = cell + vec2(1.0, 0.0); }
      p0 *= gridSize; p1 *= gridSize; p2 *= gridSize;

      float h0 = getHeight(p0, t), h1 = getHeight(p1, t), h2 = getHeight(p2, t);
      vec3 v0 = vec3(p0.x, h0, p0.y), v1 = vec3(p1.x, h1, p1.y), v2 = vec3(p2.x, h2, p2.y);
      normal = normalize(cross(v1 - v0, v2 - v0));
      if (normal.y < 0.0) normal = -normal;
      avgH = (h0 + h1 + h2) / 3.0;

      if (upper) edgeDist = min(min(local.x, local.y), 1.0 - local.x - local.y);
      else { vec2 f = 1.0 - local; edgeDist = min(min(f.x, f.y), 1.0 - f.x - f.y); }
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      float t = u_time * 0.8;
      float gridSize = 1.4;

      vec3 camPos = vec3(sin(t * 0.15) * 3.0, 3.5 + sin(t * 0.2) * 0.5, -6.0 - t * 2.5);
      vec3 lookAt = camPos + vec3(sin(t * 0.1) * 2.0, -2.5, 18.0);
      vec3 fwd = normalize(lookAt - camPos);
      vec3 rgt = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
      vec3 up = cross(fwd, rgt);

      vec2 sc = (uv - 0.5) * vec2(aspect, 1.0);
      vec3 rd = normalize(fwd * 1.5 + rgt * sc.x + up * sc.y);

      float skyT = rd.y * 0.5 + 0.5;
      vec3 sky = mix(vec3(0.04, 0.02, 0.07) * 0.5, vec3(0.02, 0.01, 0.04) * 0.05, pow(skyT, 0.7));
      float horizonGlow = exp(-abs(rd.y) * 6.0);
      float horizonGlow2 = exp(-abs(rd.y) * 15.0);
      vec3 accent = vec3(0.55, 0.36, 0.96);
      sky += accent * horizonGlow * 0.4 + accent * horizonGlow2 * 0.6;

      // Stars
      vec2 starUV = rd.xy * 200.0;
      float star = hash(floor(starUV));
      star = step(0.997, star) * (0.3 + 0.7 * sin(t * 3.0 + star * 100.0) * 0.5 + 0.5);
      sky += star * smoothstep(0.3, 0.6, rd.y) * 0.5;

      vec3 color = sky;

      float dist = 0.0;
      bool hit = false;
      vec3 hitPos;

      for (int i = 0; i < 150; i++) {
        hitPos = camPos + rd * dist;
        float h = getHeight(hitPos.xz, t);
        float d = hitPos.y - h;
        if (d < 0.005 && dist > 0.1) { hit = true; break; }
        float stepMult = 1.0 + dist * 0.01;
        dist += max(0.04, d * 0.3) * stepMult;
        if (dist > 250.0) break;
      }

      if (hit) {
        vec3 normal; float edgeDist, avgH; vec2 cellId;
        getTriangle(hitPos.xz, gridSize, t, normal, edgeDist, avgH, cellId);
        vec3 viewDir = -rd;
        float heightGrad = clamp(avgH / 2.0 * 0.5 + 0.5, 0.0, 1.0);
        float cellRand = hash(cellId);

        vec3 lightDir = normalize(vec3(0.4, 0.9, 0.3));
        float diff = max(dot(normal, lightDir), 0.0);
        float spec = pow(max(dot(normal, normalize(lightDir + viewDir)), 0.0), 80.0);

        vec3 light2Dir = normalize(vec3(sin(t * 0.4) * 2.0, 0.5, cos(t * 0.3)));
        float spec2 = pow(max(dot(normal, normalize(light2Dir + viewDir)), 0.0), 100.0);

        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);

        vec3 base = vec3(0.04, 0.04, 0.08);
        vec3 triColor = mix(base * 0.4, mix(base, accent, 0.5) * 1.3, smoothstep(0.25, 0.85, heightGrad));
        triColor *= 0.9 + cellRand * 0.2;

        color = triColor * (diff * 0.6 + 0.15);
        color += accent * spec * 2.5;
        color += vec3(0.6, 0.4, 1.0) * spec2 * 0.8;
        color += accent * fresnel * 0.5;
        color += accent * smoothstep(0.65, 0.95, heightGrad) * 0.6;

        // Pulse wave
        float pulseWave = sin(hitPos.z * 0.3 + t * 2.0) * 0.5 + 0.5;
        pulseWave *= smoothstep(0.5, 0.8, heightGrad);
        color += accent * pulseWave * 0.2;

        // Glowing edges
        float edgeGlow = 1.0 - smoothstep(0.0, 0.04, edgeDist);
        float edgeGlow2 = 1.0 - smoothstep(0.0, 0.08, edgeDist);
        float edgeBrightness = 0.4 + heightGrad * 0.6 + spec * 0.5;
        float edgePulse = sin(cellId.x * 0.5 + cellId.y * 0.3 + t * 3.0) * 0.3 + 0.7;
        vec3 edgeColor = accent * edgeBrightness * edgePulse;
        color = mix(color, edgeColor * 1.5, edgeGlow * 0.9);
        color += accent * edgeGlow2 * 0.15;

        float fog = 1.0 - exp(-dist * 0.005);
        vec3 fogColor = vec3(0.02, 0.01, 0.04) * 0.3 + accent * (horizonGlow * 0.4 + 0.1);
        color = mix(color, fogColor, fog);
      }

      vec2 vigUV = uv - 0.5;
      float vig = 1.0 - dot(vigUV, vigUV) * 1.2;
      color *= smoothstep(0.0, 0.4, vig) * 0.35 + 0.65;

      color = color / (color + 0.6);
      color = smoothstep(0.0, 1.0, color);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
  "gradient-orbs": `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }

    float fbm(vec3 p) {
      float v = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 3; i++) {
        v += amp * snoise(p);
        p *= 2.0;
        amp *= 0.5;
      }
      return v;
    }

    // Soft metaball
    float metaball(vec2 uv, vec2 center, float radius, float softness) {
      float d = length(uv - center);
      float r = radius * (1.0 + softness);
      if (d > r) return 0.0;
      float x = d / r;
      return 1.0 - x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
    }

    float orbWithGlow(vec2 uv, vec2 center, float radius, float glow) {
      float core = metaball(uv, center, radius, 0.25);
      float g1 = metaball(uv, center, radius * 1.6, 0.5) * 0.4;
      float g2 = metaball(uv, center, radius * 2.4, 0.8) * 0.2;
      float g3 = exp(-length(uv - center) * 1.2 / radius) * 0.15;
      return core + (g1 + g2 + g3) * glow;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
      float t = u_time * 0.25;

      // Noise distortion for smokey effect
      vec2 distort = vec2(
        fbm(vec3(p * 2.0, t * 0.3)),
        fbm(vec3(p * 2.0 + 100.0, t * 0.3))
      ) * 0.08;
      vec2 pD = p + distort;

      // Orange-Red-Yellow gradient
      vec3 c1 = vec3(1.0, 0.42, 0.0);
      vec3 c2 = vec3(1.0, 0.03, 0.27);
      vec3 c3 = vec3(1.0, 0.72, 0.0);
      vec3 c4 = vec3(1.0, 0.27, 0.0);
      vec3 bg = vec3(0.04, 0.04, 0.04);

      float scale = 0.7;
      float pulse = 1.0 + sin(t * 2.0) * 0.05;

      // 6 orbs with organic motion
      vec2 pos1 = vec2(sin(t * 0.7) * 0.35 + cos(t * 0.31) * 0.2, cos(t * 0.53) * 0.28 + sin(t * 0.41) * 0.15) * scale;
      vec2 pos2 = vec2(cos(t * 0.51 + 2.1) * 0.42 + sin(t * 0.27) * 0.12, sin(t * 0.63 + 1.2) * 0.32) * scale;
      vec2 pos3 = vec2(sin(t * 0.43 + 4.2) * 0.38, cos(t * 0.71 + 3.1) * 0.35 + sin(t * 0.33) * 0.12) * scale;
      vec2 pos4 = vec2(cos(t * 0.91 + 1.7) * 0.3 + sin(t * 0.19) * 0.15, sin(t * 0.83 + 2.7) * 0.28) * scale;
      vec2 pos5 = vec2(sin(t * 1.13 + 3.2) * 0.45, cos(t * 0.97 + 1.2) * 0.4) * scale;
      vec2 pos6 = vec2(cos(t * 0.79 + 5.1) * 0.5, sin(t * 1.07 + 0.8) * 0.38) * scale;

      float o1 = orbWithGlow(pD, pos1, 0.22 * pulse * scale, 1.0);
      float o2 = orbWithGlow(pD, pos2, 0.19 * pulse * scale, 1.0);
      float o3 = orbWithGlow(pD, pos3, 0.16 * pulse * scale, 1.0);
      float o4 = orbWithGlow(pD, pos4, 0.14 * pulse * scale, 1.0);
      float o5 = orbWithGlow(pD, pos5, 0.11 * pulse * scale, 1.0);
      float o6 = orbWithGlow(pD, pos6, 0.09 * pulse * scale, 1.0);

      float field = o1 + o2 + o3 + o4 + o5 + o6;

      // Weighted color mixing
      vec3 colAccum = c1 * o1 + c2 * o2 + c3 * o3 + c4 * o4 + mix(c1, c3, 0.5) * o5 + mix(c2, c4, 0.5) * o6;
      float weight = o1 + o2 + o3 + o4 + o5 + o6;
      vec3 orbCol = weight > 0.001 ? colAccum / weight : bg;

      // Smoother metaball threshold
      float edge = smoothstep(0.15, 0.6, field);
      vec3 color = mix(bg, orbCol, edge);

      // Glow bloom
      float bloom = smoothstep(0.25, 1.2, field) * 0.5;
      color += mix(c1, c2, 0.5) * bloom;

      // Hot core highlights
      float highlight = smoothstep(1.0, 2.0, field);
      color += vec3(1.0, 0.9, 0.7) * highlight * 0.2;

      // Add subtle noise texture
      float noise = fbm(vec3(p * 3.0, t * 0.1)) * 0.02;
      color += noise;

      // Vignette
      float vig = 1.0 - length(uv - 0.5) * 0.5;
      vig = smoothstep(0.0, 1.0, vig);
      color *= vig;

      // Tone map
      color = color / (color + 0.4) * 1.2;
      color = clamp(color, 0.0, 1.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
  "silk-flow": `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    vec2 warp(vec2 p, float t) {
      float n1 = snoise(p * 0.5 + t * 0.1);
      float n2 = snoise(p * 0.5 + vec2(50.0) - t * 0.15);
      return p + vec2(n1, n2) * 0.3;
    }

    float fbm(vec2 p, float t) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(0.87, 0.48, -0.48, 0.87);
      for (int i = 0; i < 3; i++) {
        v += a * (snoise(p + t * 0.1) * 0.5 + 0.5);
        p = rot * p * 2.0 + vec2(100.0);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = (uv - 0.5) * 2.0;
      p.x *= u_resolution.x / u_resolution.y;
      float t = u_time * 0.4;

      vec3 c1 = vec3(0.39, 0.4, 0.95);
      vec3 c2 = vec3(0.55, 0.36, 0.96);
      vec3 c3 = vec3(0.93, 0.29, 0.6);
      vec3 bg = vec3(0.06, 0.06, 0.14);

      vec2 wp = warp(p * 1.5, t);
      vec2 wp2 = warp(p * 1.0 + vec2(30.0), t * 1.2);

      float f1 = fbm(wp + vec2(t * 0.2, t * 0.15), t);
      float f2 = fbm(wp2 + vec2(-t * 0.15, t * 0.25), t);

      float r1 = sin(wp.y * 3.0 + f1 * 4.0 + t) * 0.5 + 0.5;
      float r2 = sin(wp2.x * 2.5 - f2 * 3.0 - t * 0.7) * 0.5 + 0.5;

      r1 = smoothstep(0.2, 0.8, r1 * f1);
      r2 = smoothstep(0.2, 0.8, r2 * f2);

      vec3 color = bg * (0.7 + (1.0 - length(p) * 0.3) * 0.3);

      color += c1 * pow(r1, 1.5) * 0.7;
      color += c2 * pow(r2, 1.5) * 0.6;
      color += (c1 + vec3(0.3)) * pow(r1, 4.0) * 0.3;

      vec2 orbPos = vec2(sin(t * 0.4) * 0.5, cos(t * 0.3) * 0.3);
      color += mix(c2, c3, 0.5) * exp(-length(p - orbPos) * 3.0) * 0.4;

      color += mix(c1, c3, 0.5) * fbm(p * 2.0, t) * 0.1;

      vec3 bloom = max(color - 0.5, 0.0);
      color += bloom * 0.4;

      float vig = 1.0 - pow(length(uv - 0.5) * 1.3, 2.0);
      color *= smoothstep(0.0, 1.0, vig);

      color = color / (color + 0.5) * 1.2;
      color = clamp(color, 0.0, 1.0);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
}

interface ShaderThumbnailProps {
  slug: string
  className?: string
}

export function ShaderThumbnail({ slug, className = "" }: ShaderThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const animationRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const fragmentShader = thumbnailShaders[slug]

  // Render single frame
  const renderFrame = useCallback(() => {
    const gl = glRef.current
    const program = programRef.current
    if (!gl || !program) return

    const elapsed = (Date.now() - startTimeRef.current) / 1000
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), elapsed)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }, [])

  // Animation loop for hover
  const animate = useCallback(() => {
    if (!isHovering) return

    const now = Date.now()
    if (now - lastFrameRef.current >= FRAME_INTERVAL) {
      renderFrame()
      lastFrameRef.current = now
    }
    animationRef.current = requestAnimationFrame(animate)
  }, [isHovering, renderFrame])

  // Initialize WebGL
  useEffect(() => {
    if (!isVisible || isInitialized || !fragmentShader) return

    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: true, // Keep last frame when paused
    })
    if (!gl) return

    glRef.current = gl

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
    programRef.current = program

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    // Set resolution
    canvas.width = canvas.clientWidth * THUMB_DPR
    canvas.height = canvas.clientHeight * THUMB_DPR
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height)

    // Render initial frozen frame
    renderFrame()
    setIsInitialized(true)

    return () => {
      cancelAnimationFrame(animationRef.current)
      gl.deleteProgram(program)
      gl.deleteShader(vShader)
      gl.deleteShader(fShader)
      gl.deleteBuffer(buffer)
    }
  }, [isVisible, isInitialized, fragmentShader, renderFrame])

  // Intersection observer for lazy init
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0]?.isIntersecting ?? false)
      },
      { threshold: 0.1, rootMargin: "50px" }
    )
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Handle hover animation
  useEffect(() => {
    if (isHovering && isInitialized) {
      lastFrameRef.current = Date.now()
      animate()
    } else {
      cancelAnimationFrame(animationRef.current)
    }
    return () => cancelAnimationFrame(animationRef.current)
  }, [isHovering, isInitialized, animate])

  // Fallback gradient if shader not found
  if (!fragmentShader) {
    const fallbackGradients: Record<string, string> = {
      "liquid-metal": "from-slate-800 via-slate-400 to-slate-700",
      "neon-horizon": "from-indigo-950 via-fuchsia-600 to-orange-500",
      "voronoi": "from-slate-900 via-purple-900 to-cyan-400",
      "pixel-art": "from-indigo-950 via-orange-500 to-yellow-400",
      "fluid-ink": "from-slate-950 via-indigo-900 to-purple-700",
      "aurora-mesh": "from-slate-950 via-indigo-950 to-purple-800",
      "wave-terrain": "from-slate-950 via-violet-950 to-purple-900",
      "gradient-orbs": "from-orange-600 via-red-500 to-yellow-500",
      "silk-flow": "from-indigo-600 via-purple-600 to-pink-500",
    }
    return (
      <div className={`bg-gradient-to-br ${fallbackGradients[slug] || "from-purple-600 to-pink-500"} ${className}`} />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ width: "100%", height: "100%" }}
    />
  )
}
