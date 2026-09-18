"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree, createPortal } from "@react-three/fiber";
import { useGLTF, useTexture, useFBO } from "@react-three/drei";
import * as THREE from "three";
import { MotionValue } from "framer-motion";
import { useSpringMouse } from "../providers/MouseContext";

// ── 1. INSTANCED 3D CUBICLE GRID (Office Landscape) ──
function CubicleFarm() {
  const { scene } = useGLTF("/models/deskbox.glb") as any;
  const groupRef = useRef<THREE.Group>(null);
  const instancedMeshesRef = useRef<THREE.InstancedMesh[]>([]);
  const { getMouse } = useSpringMouse();

  const { geometries, materials } = useMemo(() => {
    const geoms: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];

    scene.traverse((child: any) => {
      if (child.isMesh && child.geometry) {
        geoms.push(child.geometry);
        const originalMat = Array.isArray(child.material) ? child.material[0] : child.material;

        let mat: THREE.MeshStandardMaterial;
        if (originalMat) {
          mat = originalMat.clone();
        } else {
          mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#dcd8d0"),
          });
        }

        mat.vertexColors = true;

        if (mat.map) {
          mat.map.colorSpace = THREE.SRGBColorSpace;
          mat.map.needsUpdate = true;
        }

        mat.roughness = 0.46;
        mat.metalness = 0.04;

        mat.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <map_fragment>",
            `#include <map_fragment>
            // Convert purple chair fabric to deep matte black / dark charcoal
            if (diffuseColor.b > diffuseColor.g * 1.05 && diffuseColor.r > diffuseColor.g * 1.05 && diffuseColor.r > 0.12) {
              float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
              diffuseColor.rgb = vec3(lum * 0.22 + 0.035);
            }
            // Neutralize bluish floor tint to dark neutral office carpet
            else if (diffuseColor.b > diffuseColor.r * 1.04 && diffuseColor.b > diffuseColor.g * 1.02) {
              float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
              diffuseColor.rgb = vec3(lum * 0.72);
            }
            // Boost CRT monitor screen face to bright glowing phosphor white
            else if (diffuseColor.r > 0.52 && diffuseColor.g > 0.58 && diffuseColor.b > 0.60) {
              diffuseColor.rgb = vec3(1.15, 1.15, 1.1);
            }
            `
          );
        };

        mat.needsUpdate = true;
        mats.push(mat);
      }
    });

    return { geometries: geoms, materials: mats };
  }, [scene]);

  const count = 42;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    instancedMeshesRef.current.forEach((mesh) => {
      if (!mesh) return;
      let index = 0;
      for (let t = 0; t < 6; t++) {
        for (let r = 0; r < 7; r++) {
          const i = index++;
          dummy.scale.set(1, 1 + (r + t) * 0.04, 1);
          dummy.position.set((t - 2) * 180 + 140, 0, (r - 5) * 140 + 730);
          dummy.rotation.set(0, (r + t) % 2 === 0 ? Math.PI : 0, 0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [dummy]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const mouse = getMouse();
      const targetRotY = Math.PI + 0.5 + mouse.x * 0.04;
      const targetRotX = mouse.y * 0.025;
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
    }
  });

  return (
    <group
      ref={groupRef}
      scale={0.02}
      position={[9, 0, -1]}
      rotation={[0, Math.PI + 0.5, 0]}
    >
      {geometries.map((geom, idx) => (
        <instancedMesh
          key={idx}
          ref={(el) => {
            if (el) instancedMeshesRef.current[idx] = el;
          }}
          args={[geom, materials[idx] || materials[0], count]}
        />
      ))}
    </group>
  );
}

// ── 2. FLOATING 3D "ABOUT US" TYPOGRAPHY CARD ──
function FloatingAboutText() {
  const textTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Warm retro glowing shadow
    ctx.shadowColor = "rgba(255, 235, 205, 0.65)";
    ctx.shadowBlur = 35;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = "italic 400 190px 'STIX Two Text', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Ambient drop shadow beneath text
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillText("About Us", canvas.width / 2, canvas.height / 2 + 10);

    // Chromatic red fringe
    ctx.fillStyle = "rgba(255, 40, 80, 0.4)";
    ctx.fillText("About Us", canvas.width / 2 - 3, canvas.height / 2);

    // Chromatic cyan fringe
    ctx.fillStyle = "rgba(40, 220, 255, 0.4)";
    ctx.fillText("About Us", canvas.width / 2 + 3, canvas.height / 2);

    // Main sharp glowing white text
    ctx.fillStyle = "#ffffff";
    ctx.fillText("About Us", canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  if (!textTexture) return null;

  return (
    <mesh position={[0, 1.48, 2.72]} rotation={[-0.26, 0, 0]}>
      <planeGeometry args={[5.2, 1.3]} />
      <meshBasicMaterial
        map={textTexture}
        transparent
        opacity={0.97}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── 3. VERTEX DEFORMATION & RETRO SHADER DEFINITIONS ──
const curlVertexShader = `
  uniform float uProgress;
  uniform float uHoverLift;
  uniform float uRadius;
  uniform float uAngle;
  uniform vec2 uPlaneSize;

  varying vec2 vUv;
  varying vec3 vNormalVec;
  varying float vCurlDist;
  varying float vIsBack;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Effective curl progress: scroll + interactive hover lift near top-right corner
    float cornerWeight = smoothstep(-0.1, 0.6, pos.x / (uPlaneSize.x * 0.5)) * 
                         smoothstep(-0.1, 0.6, pos.y / (uPlaneSize.y * 0.5));
    float effectiveLift = uHoverLift * cornerWeight * (1.0 - uProgress * 0.85);
    float rawProgress = clamp(uProgress + effectiveLift, 0.0, 1.08);
    // Ease the sweep itself (smootherstep) so the fold accelerates out of the
    // corner and settles into the far edge instead of moving at a constant
    // rate — a linear sweep reads as mechanical/rigid for a paper curl.
    float eased = rawProgress * rawProgress * rawProgress * (rawProgress * (rawProgress * 6.0 - 15.0) + 10.0);
    float progress = eased;

    // Sweep vector moves crease line from top-right corner across the plane
    vec2 sweepDir = normalize(vec2(-0.45, -1.0));
    // Roll displacement vector: curls paper in the UPPER direction (upward and back toward top-right)
    vec2 rollDir = -sweepDir;

    // Project boundary corners along the sweep direction
    float hw = uPlaneSize.x * 0.5;
    float hh = uPlaneSize.y * 0.5;
    float s_tr = dot(vec2(hw, hh), sweepDir);
    float s_bl = dot(vec2(-hw, -hh), sweepDir);
    float s_tl = dot(vec2(-hw, hh), sweepDir);
    float s_br = dot(vec2(hw, -hh), sweepDir);

    float s_min = min(min(s_tr, s_bl), min(s_tl, s_br));
    float s_max = max(max(s_tr, s_bl), max(s_tl, s_br));

    float PI = 3.14159265359;
    float rollLength = PI * uRadius;

    // The peel fold axis line moves from s_min (top-right) across to s_max (bottom-left)
    float s0 = mix(s_min - 0.08, s_max + rollLength + 0.45, progress);

    float s = dot(pos.xy, sweepDir);
    float d = s0 - s; // d > 0 means the crease has reached this vertex

    vCurlDist = d;
    vec3 n = vec3(0.0, 0.0, 1.0);
    float isBack = 0.0;

    if (d <= 0.0) {
      // Unpeeled flat plane
      pos = pos;
      n = vec3(0.0, 0.0, 1.0);
      isBack = 0.0;
    } else if (d < rollLength) {
      // Wrapping around cylinder of radius uRadius in the UPPER direction
      float alpha = d / uRadius;
      pos.z = uRadius * (1.0 - cos(alpha));
      pos.xy += rollDir * (d - uRadius * sin(alpha));

      // Normal rotated around the cylinder axis
      n = normalize(vec3(rollDir * sin(alpha), cos(alpha)));
      if (alpha > PI * 0.5) {
        isBack = 1.0;
      }
    } else {
      // Continue along cylinder roll tangent: eliminates triangle stretching at the crease boundary
      float extra = d - rollLength;
      pos.z = 2.0 * uRadius;
      pos.xy += rollDir * (rollLength + extra * 1.8);
      n = vec3(0.0, 0.0, -1.0);
      isBack = 1.0;
    }

    vNormalVec = n;
    vIsBack = isBack;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const curlFragmentShader = `
  uniform sampler2D uBannerTexture;
  uniform sampler2D uBehindTexture;
  uniform vec2 uResolution;
  uniform vec2 uPlaneSize;
  uniform float uTime;
  uniform float uRadius;

  varying vec2 vUv;
  varying vec3 vNormalVec;
  varying float vCurlDist;
  varying float vIsBack;

  // CRT Fisheye Barrel Distortion
  vec2 crtDistort(vec2 uv, float bend) {
    vec2 centered = uv - 0.5;
    float r2 = dot(centered, centered);
    return centered * (1.0 + bend * r2) + 0.5;
  }

  void main() {
    float PI = 3.14159265359;
    float rollLength = PI * uRadius;

    // ── 1. REVEALED UNDERLYING LAYER: Discard peeled fragments to cleanly reveal the 3D model scene behind it ──
    // Discarding a hair before the exact wrap/tangent branch boundary (instead
    // of exactly at it) hides the thin strip of triangles that straddle the
    // two displacement formulas in the vertex shader — those get rasterized
    // from mismatched vertex math and can flash as a stretched, wrong-looking
    // sliver of the texture right at the fold's leading edge. The revealed
    // layer behind always covers the full plane, so discarding slightly
    // early never opens a visible gap.
    if (vCurlDist >= rollLength * 0.985) {
      discard;
    }

    bool isFront = gl_FrontFacing;

    if (isFront) {
      // ── FRONT FACE: Team Photo Banner (Framed & scaled to match shader.se reference) ──
      // In source texture (group_3x2.webp, 2500x1677, aspect ~1.49):
      // - The bottom desk sits at y = 0.01
      // - The team members' heads top out at y = 0.53
      // - Everything above y = 0.55 is empty blue wall
      // Framing: pin the desk to the bottom, elevate heads to ~75% viewport height under nav menu
      float quadAspect = uPlaneSize.x / uPlaneSize.y;
      float imgAspect = 2500.0 / 1677.0;

      // Vertical framing: desk right at bottom (0.005), heads centered at ~75% of section
      float ySpan = 0.58;
      float yMin = 0.005;
      vec2 st;
      st.y = yMin + vUv.y * ySpan;

      // Horizontal framing: preserve human proportions & center team matching shader.se
      float xSpan = (ySpan / imgAspect) * quadAspect;
      xSpan = clamp(xSpan, 0.70, 0.98);
      st.x = 0.5 + (vUv.x - 0.5) * xSpan;

      vec2 distUv = crtDistort(st, 0.045);
      vec2 clampedUv = clamp(distUv, 0.001, 0.999);

      // Peripheral Chromatic Aberration
      vec2 caDir = normalize(clampedUv - 0.5);
      float caDist = length(clampedUv - 0.5);
      float caAmt = 0.0028 * caDist;

      float r = texture2D(uBannerTexture, clamp(clampedUv + caDir * caAmt, 0.0, 1.0)).r;
      float g = texture2D(uBannerTexture, clampedUv).g;
      float b = texture2D(uBannerTexture, clamp(clampedUv - caDir * caAmt, 0.0, 1.0)).b;
      vec3 col = vec3(r, g, b);

      // Vintage Swedish analog patina matching shader.se (#719392 sage/teal background)
      float blueMask = smoothstep(0.08, 0.35, col.b - col.r) * smoothstep(0.22, 0.70, col.b);
      vec3 vintageWall = vec3(0.443, 0.584, 0.576) * (col.b * 1.30);
      col = mix(col, vintageWall, blueMask * 0.75);

      // Warm analog skin & suit patina
      col.r = mix(col.r, col.r * 1.03 + 0.015, 0.5);
      col.g = mix(col.g, col.g * 1.01 + 0.008, 0.4);

      // Fine CRT Scanlines
      float scanline = sin(distUv.y * uResolution.y * 1.6) * 0.055;
      col -= scanline;

      // Dynamic Procedural Video Grain / Noise
      float grain = fract(sin(dot(distUv * 4.0 + fract(uTime * 0.02), vec2(12.9898, 78.233))) * 43758.5453);
      col += (grain - 0.5) * 0.045;

      // Subtle Radial Vignette
      float vig = smoothstep(1.2, 0.45, length((distUv - 0.5) * 1.35));
      col *= vig;

      // Subtle light specular highlight along the curl crease
      if (vCurlDist > 0.0 && vCurlDist < 3.14159 * uRadius) {
        float creaseHighlight = pow(max(dot(vNormalVec, normalize(vec3(0.4, 0.6, 0.7))), 0.0), 12.0) * 0.25;
        col += vec3(creaseHighlight);
      }

      gl_FragColor = vec4(col, 1.0);

    } else {
      // ── BACK FACE: Vintage Satin Underside of Peeling Paper ──
      vec3 paperBase = vec3(0.92, 0.89, 0.83); // Warm ivory / vintage newsprint backing

      // Ambient Occlusion shadow inside the fold
      float PI = 3.14159265359;
      float rollLength = PI * uRadius;
      float foldAO = smoothstep(0.0, rollLength * 0.8, vCurlDist) * (1.0 - smoothstep(rollLength * 0.8, rollLength + 0.6, vCurlDist));
      paperBase *= (1.0 - foldAO * 0.42);

      // Soft directional lighting on reverse side
      vec3 lightDir = normalize(vec3(-0.3, 0.7, 0.65));
      float diff = max(dot(-vNormalVec, lightDir), 0.0) * 0.28 + 0.72;
      paperBase *= diff;

      // Paper fiber texture grain
      float paperGrain = fract(sin(dot(vUv * 600.0, vec2(37.123, 91.456))) * 43758.5453);
      paperBase += (paperGrain - 0.5) * 0.04;

      gl_FragColor = vec4(paperBase, 1.0);
    }
  }
`;

const behindVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const behindFragmentShader = `
  uniform sampler2D uBehindTexture;
  uniform vec2 uResolution;
  uniform float uProgress;
  uniform float uHoverLift;
  uniform float uRadius;
  uniform float uAngle;
  uniform vec2 uPlaneSize;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  vec2 crtDistort(vec2 uv, float bend) {
    vec2 centered = uv - 0.5;
    float r2 = dot(centered, centered);
    return centered * (1.0 + bend * r2) + 0.5;
  }

  void main() {
    vec2 distUv = crtDistort(vUv, 0.045);
    vec2 clampedUv = clamp(distUv, 0.001, 0.999);

    // Peripheral Chromatic Aberration
    vec2 caDir = normalize(clampedUv - 0.5);
    float caDist = length(clampedUv - 0.5);
    float caAmt = 0.0028 * caDist;

    float r = texture2D(uBehindTexture, clamp(clampedUv + caDir * caAmt, 0.0, 1.0)).r;
    float g = texture2D(uBehindTexture, clampedUv).g;
    float b = texture2D(uBehindTexture, clamp(clampedUv - caDir * caAmt, 0.0, 1.0)).b;
    vec3 col = vec3(r, g, b);

    // Fine CRT Scanlines
    float scanline = sin(distUv.y * uResolution.y * 1.6) * 0.06;
    col -= scanline;

    // Procedural Noise / Analog Grain
    float grain = fract(sin(dot(distUv * 4.0 + fract(uTime * 0.02), vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.055;

    // Radial Vignette
    float vig = smoothstep(1.22, 0.46, length((distUv - 0.5) * 1.35));
    col *= vig;

    // ── Dynamic Cast Drop Shadow from the Curling Sheet (Top-Right toward Bottom-Left) ──
    vec2 dir = normalize(vec2(-0.45, -1.0));
    float hw = uPlaneSize.x * 0.5;
    float hh = uPlaneSize.y * 0.5;
    float s_tr = dot(vec2(hw, hh), dir);
    float s_bl = dot(vec2(-hw, -hh), dir);
    float s_tl = dot(vec2(-hw, hh), dir);
    float s_br = dot(vec2(hw, -hh), dir);
    float s_min = min(min(s_tr, s_bl), min(s_tl, s_br));
    float s_max = max(max(s_tr, s_bl), max(s_tl, s_br));

    float PI = 3.14159265359;
    float rollLength = PI * uRadius;

    float cornerWeight = smoothstep(-0.1, 0.6, vWorldPos.x / (uPlaneSize.x * 0.5)) * 
                         smoothstep(-0.1, 0.6, vWorldPos.y / (uPlaneSize.y * 0.5));
    float effectiveLift = uHoverLift * cornerWeight * (1.0 - uProgress * 0.85);
    float rawProgress = clamp(uProgress + effectiveLift, 0.0, 1.08);
    // Same smootherstep easing as the curl vertex shader — the shadow has to
    // track the actual fold position, not a linear approximation of it, or
    // it visibly drifts out of alignment with the curl for most of the scroll.
    float progress = rawProgress * rawProgress * rawProgress * (rawProgress * (rawProgress * 6.0 - 15.0) + 10.0);
    float s0 = mix(s_min - 0.08, s_max + rollLength + 0.45, progress);

    float s = dot(vWorldPos.xy, dir);
    float d = s0 - s;

    // Dynamic contact shadow directly beneath the curl cylinder
    if (d > -0.35 && d < rollLength + 0.5) {
      float contact = smoothstep(-0.35, 0.04, d) * (1.0 - smoothstep(0.04, rollLength + 0.5, d));
      col *= (1.0 - contact * 0.65);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── 4. MAIN SCENE CONTENT (FBO MANAGER + CURLING PLANES) ──
function PagePeelContent({ progress }: { progress: MotionValue<number> }) {
  const { viewport, size, gl } = useThree();
  const { getMouse } = useSpringMouse();

  // Load Team Banner texture (First section on top)
  const bannerTexture = useTexture("/textures/group_3x2.webp");
  bannerTexture.colorSpace = THREE.SRGBColorSpace;

  // Offscreen FBO for 3D Cubicles + About Us Scene (Second section revealed behind)
  const fbo = useFBO(Math.min(size.width * 1.5, 1920), Math.min(size.height * 1.5, 1080), {
    depthBuffer: true,
  });

  const offscreenScene = useMemo(() => new THREE.Scene(), []);
  const offscreenCamera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(50, size.width / size.height, 0.1, 500);
    cam.position.set(0, 3.1, 4.8);
    cam.rotation.set(-0.58, 0, 0);
    return cam;
  }, [size.width, size.height]);

  // Track progress & hover lift
  const currentProgressRef = useRef(0);
  const currentHoverRef = useRef(0);

  useEffect(() => {
    return progress.on("change", (latest) => {
      currentProgressRef.current = latest;
    });
  }, [progress]);

  // Shader Materials
  // 1. Top Deformed Curling Sheet (Team Photo Banner)
  const curlMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: curlVertexShader,
      fragmentShader: curlFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uBannerTexture: { value: bannerTexture },
        uBehindTexture: { value: fbo.texture },
        uProgress: { value: 0 },
        uHoverLift: { value: 0 },
        uRadius: { value: 0.32 },
        uAngle: { value: 0.42 }, // ~24 deg diagonal angle
        uPlaneSize: { value: new THREE.Vector2(viewport.width, viewport.height) },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uTime: { value: 0 },
      },
    });
  }, [bannerTexture, fbo.texture, viewport.width, viewport.height, size.width, size.height]);

  // 2. Underlying Revealed Layer (3D Cubicles + About Us Scene)
  const behindMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: behindVertexShader,
      fragmentShader: behindFragmentShader,
      uniforms: {
        uBehindTexture: { value: fbo.texture },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uProgress: { value: 0 },
        uHoverLift: { value: 0 },
        uRadius: { value: 0.32 },
        uAngle: { value: 0.42 },
        uPlaneSize: { value: new THREE.Vector2(viewport.width, viewport.height) },
        uTime: { value: 0 },
      },
    });
  }, [fbo.texture, viewport.width, viewport.height, size.width, size.height]);

  // Update uniforms on resize
  useEffect(() => {
    curlMaterial.uniforms.uPlaneSize.value.set(viewport.width, viewport.height);
    curlMaterial.uniforms.uResolution.value.set(size.width, size.height);
    behindMaterial.uniforms.uPlaneSize.value.set(viewport.width, viewport.height);
    behindMaterial.uniforms.uResolution.value.set(size.width, size.height);
    offscreenCamera.aspect = size.width / size.height;
    offscreenCamera.updateProjectionMatrix();
  }, [viewport.width, viewport.height, size.width, size.height, curlMaterial, behindMaterial, offscreenCamera]);

  useFrame((state, delta) => {
    const mouse = getMouse();

    // Subtle corner hover detection: lift corner when hovering near top-right
    const isHoveringCorner = mouse.x > 0.25 && mouse.y > 0.25;
    const targetHover = isHoveringCorner ? 0.09 : 0.0;
    currentHoverRef.current = THREE.MathUtils.damp(currentHoverRef.current, targetHover, 4, delta);

    // Update offscreen camera parallax
    const targetCamX = mouse.x * 0.35;
    const targetCamY = 3.1 + mouse.y * 0.2;
    offscreenCamera.position.x = THREE.MathUtils.damp(offscreenCamera.position.x, targetCamX, 3.5, delta);
    offscreenCamera.position.y = THREE.MathUtils.damp(offscreenCamera.position.y, targetCamY, 3.5, delta);
    offscreenCamera.rotation.x = THREE.MathUtils.damp(offscreenCamera.rotation.x, -0.58 + mouse.y * 0.02, 3.5, delta);
    offscreenCamera.rotation.y = THREE.MathUtils.damp(offscreenCamera.rotation.y, -mouse.x * 0.02, 3.5, delta);

    // 1. Render offscreen 3D Cubicles + Floating Typography scene into FBO
    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(offscreenScene, offscreenCamera);
    gl.setRenderTarget(null);



    // 2. Update curl and behind shader uniforms
    const time = state.clock.getElapsedTime();
    curlMaterial.uniforms.uTime.value = time;
    curlMaterial.uniforms.uProgress.value = currentProgressRef.current;
    curlMaterial.uniforms.uHoverLift.value = currentHoverRef.current;
    curlMaterial.uniforms.uPlaneSize.value.set(viewport.width, viewport.height);
    curlMaterial.uniforms.uBehindTexture.value = fbo.texture;

    behindMaterial.uniforms.uTime.value = time;
    behindMaterial.uniforms.uProgress.value = currentProgressRef.current;
    behindMaterial.uniforms.uHoverLift.value = currentHoverRef.current;
    behindMaterial.uniforms.uPlaneSize.value.set(viewport.width, viewport.height);
    behindMaterial.uniforms.uBehindTexture.value = fbo.texture;
  });

  return (
    <>
      {/* ── 3D Offscreen Scene Elements (Portal to offscreenScene) ── */}
      {createPortal(
        <>
          <color attach="background" args={["#090a0d"]} />
          <ambientLight intensity={1.35} color="#d4e0eb" />
          <directionalLight position={[2, 22, 8]} intensity={2.8} color="#ffffff" />
          <directionalLight position={[14, 12, 10]} intensity={1.5} color="#fff2e2" />
          <directionalLight position={[-14, 8, -6]} intensity={1.0} color="#9ec2de" />
          <pointLight position={[0, 6, 2]} intensity={120} color="#ffffff" distance={28} />

          {/* Dark Corporate Carpet Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
            <planeGeometry args={[800, 800]} />
            <meshStandardMaterial color="#121316" roughness={0.78} metalness={0.02} />
          </mesh>

          <CubicleFarm />
          <FloatingAboutText />
        </>,
        offscreenScene
      )}

      {/* ── Revealed Underlying Layer (Second Section: 3D Cubicles + About Us at z = -0.01) ── */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[viewport.width * 1.025, viewport.height * 1.025]} />
        <primitive object={behindMaterial} attach="material" />
      </mesh>

      {/* ── Deformed Curling Top Plane (First Section: Team Photo Banner at z = 0) ── */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[viewport.width * 1.025, viewport.height * 1.025, 180, 180]} />
        <primitive object={curlMaterial} attach="material" />
      </mesh>
    </>
  );
}

// ── 5. EXPORTED WRAPPER COMPONENT ──
interface PagePeelSceneProps {
  progress: MotionValue<number>;
}

export function PagePeelScene({ progress }: PagePeelSceneProps) {
  return (
    <div
      className="relative w-full h-full bg-[#090a0d] overflow-hidden select-none"
      style={{ height: "100%", width: "100%" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#090a0d"]} />
        <React.Suspense fallback={null}>
          <PagePeelContent progress={progress} />
        </React.Suspense>
      </Canvas>

      {/* Floating SHADER SWEDEN Corporate Badge on the revealed layer */}
      <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-12 z-20 flex items-center gap-3 bg-black/55 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded border border-white/20 shadow-xl pointer-events-none">
        <img
          src="/textures/logo.svg"
          alt="SHADER"
          className="h-4 sm:h-5 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        />
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#e8e4d8] border-l border-white/20 pl-2.5">
          Sweden
        </span>
      </div>

      {/* Authentic Outer CRT Monitor Bezel, Tube Curvature & Deep Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          boxShadow:
            "inset 0 0 90px rgba(0, 0, 0, 0.45), inset 0 0 25px rgba(0, 0, 0, 0.35), inset 0 0 6px rgba(0, 0, 0, 0.5)",
          background:
            "radial-gradient(ellipse 110% 105% at 50% 50%, transparent 62%, rgba(0, 0, 0, 0.28) 92%, rgba(0, 0, 0, 0.65) 100%)",
        }}
      />
      <div
        className="absolute pointer-events-none border border-black/25 dark:border-white/10 z-30"
        style={{
          inset: "8px",
          borderRadius: "18px",
          boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.25)",
        }}
      />
    </div>
  );
}