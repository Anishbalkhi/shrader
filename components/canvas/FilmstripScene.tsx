"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PROJECTS, Project } from "@/lib/data/projects";

// ── Perforation Sprocket Texture Generator ─────────────────────────────────
// Creates a clean, crisp repeating 35mm sprocket hole texture for the film borders
function createSprocketTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1024, 128);

    const count = 16;
    const step = 1024 / count;
    for (let i = 0; i < count; i++) {
      const cx = i * step + step / 2;
      const w = 38;
      const h = 58;
      const x = cx - w / 2;
      const y = (128 - h) / 2;

      // Transparent hole
      ctx.clearRect(x, y, w, h);
      // Clean, subtle border around the sprocket hole
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

// ── Texture Cache & Safe Loader ───────────────────────────────────────────
const textureCache = new Map<string, THREE.Texture>();

function useProjectTexture(playbackId: string): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(() => textureCache.get(playbackId) ?? null);

  useEffect(() => {
    if (textureCache.has(playbackId)) {
      setTexture(textureCache.get(playbackId)!);
      return;
    }

    const localUrl = `/api/mux-image/${playbackId}/w1200-h630-fsmartcrop.jpg`;
    const fallbackUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=900`;

    const loader = new THREE.TextureLoader();
    loader.load(
      localUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        textureCache.set(playbackId, tex);
        setTexture(tex);
      },
      undefined,
      () => {
        // Fallback to remote thumbnail if local is missing
        loader.load(fallbackUrl, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          textureCache.set(playbackId, tex);
          setTexture(tex);
        });
      }
    );
  }, [playbackId]);

  return texture;
}

// ── Cylindrical Arc Math ──────────────────────────────────────────────────
const CYLINDER_R = 6.4; // Radius of 3D cylinder
const ANGLE_STEP = 0.43; // radians (~24.6° between adjacent frames)

function getSlotTransform(offset: number) {
  const theta = offset * ANGLE_STEP;
  const isCenter = Math.abs(offset) < 0.1;

  // Arc math: center is closest (z=0), sides curve back into screen
  const x = CYLINDER_R * Math.sin(theta);
  const z = CYLINDER_R * (Math.cos(theta) - 1) + (isCenter ? 0.08 : 0);
  const rotY = -theta;

  const absOffset = Math.abs(offset);
  let opacity = 1;
  if (absOffset <= 0.5) opacity = 1;
  else if (absOffset <= 1.5) opacity = 0.9;
  else if (absOffset <= 2.5) opacity = 0.55;
  else if (absOffset <= 3.5) opacity = 0.25;
  else opacity = 0.1;

  return { x, z, rotY, opacity };
}

function wrapOffset(idx: number, activeIdx: number, total: number) {
  let d = idx - activeIdx;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

// ── Single 3D Film Frame ──────────────────────────────────────────────────
interface FilmFrameMeshProps {
  projectIdx: number;
  activeIdx: number;
  sprocketTex: THREE.Texture;
  onClick: (project: Project, isCenter: boolean) => void;
}

function FilmFrameMesh({ projectIdx, activeIdx, sprocketTex, onClick }: FilmFrameMeshProps) {
  const total = PROJECTS.length;
  const project = PROJECTS[projectIdx];

  const groupRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  const activeIdxRef = useRef(activeIdx);
  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

  const curOffset = useRef(wrapOffset(projectIdx, activeIdx, total));
  const texture = useProjectTexture(project.mux_playback_id);

  // Dimensions matching 35mm film frame ratio
  const FRAME_W = 3.35;
  const FRAME_H = 2.26;
  const IMG_H = 1.82;
  const SPROCKET_H = 0.22;

  // Edges geometry for clean outer border without wireframe diagonals
  const edgesGeom = useMemo(() => {
    const plane = new THREE.PlaneGeometry(FRAME_W, FRAME_H);
    return new THREE.EdgesGeometry(plane);
  }, []);

  useFrame(() => {
    const targetOffset = wrapOffset(projectIdx, activeIdxRef.current, total);
    // Smooth frame lerp
    curOffset.current = THREE.MathUtils.lerp(curOffset.current, targetOffset, 0.09);

    const { x, z, rotY, opacity } = getSlotTransform(curOffset.current);

    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z);
      groupRef.current.rotation.y = rotY;
    }

    if (matRef.current) {
      const targetOp = texture ? opacity * (project.brightness ?? 1) : 0;
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOp, 0.1);
    }
  });

  const init = getSlotTransform(wrapOffset(projectIdx, activeIdx, total));
  const isCenter = wrapOffset(projectIdx, activeIdx, total) === 0;

  return (
    <group
      ref={groupRef}
      position={[init.x, 0, init.z]}
      rotation={[0, init.rotY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        const isCurrentlyCenter = Math.abs(curOffset.current) < 0.5;
        onClick(project, isCurrentlyCenter);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* 1. Film backing mesh (solid dark) */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial color="#020202" />
      </mesh>

      {/* 2. Top Sprocket Perforations */}
      <mesh position={[0, (FRAME_H - SPROCKET_H) / 2, 0.002]}>
        <planeGeometry args={[FRAME_W, SPROCKET_H]} />
        <meshBasicMaterial map={sprocketTex} transparent opacity={0.92} />
      </mesh>

      {/* 3. Bottom Sprocket Perforations */}
      <mesh position={[0, -(FRAME_H - SPROCKET_H) / 2, 0.002]}>
        <planeGeometry args={[FRAME_W, SPROCKET_H]} />
        <meshBasicMaterial map={sprocketTex} transparent opacity={0.92} />
      </mesh>

      {/* 4. Project Thumbnail Image */}
      {texture ? (
        <mesh position={[0, 0, 0.004]}>
          <planeGeometry args={[FRAME_W - 0.08, IMG_H]} />
          <meshBasicMaterial
            ref={matRef}
            map={texture}
            transparent
            opacity={1}
            toneMapped={false}
          />
        </mesh>
      ) : (
        <mesh position={[0, 0, 0.004]}>
          <planeGeometry args={[FRAME_W - 0.08, IMG_H]} />
          <meshBasicMaterial color="#070b16" />
        </mesh>
      )}

      {/* 5. Clean Outer Border Accent (EdgesGeometry, no diagonals) */}
      <lineSegments geometry={edgesGeom} position={[0, 0, 0.006]}>
        <lineBasicMaterial
          color={isCenter ? "#ffe49e" : "#ffffff"}
          transparent
          opacity={isCenter ? 0.45 : 0.12}
        />
      </lineSegments>

      {/* 6. Subtle Specular Gloss Sheen */}
      <mesh position={[0, 0.25, 0.008]}>
        <planeGeometry args={[FRAME_W - 0.08, 0.65]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.035} />
      </mesh>
    </group>
  );
}

// ── 3D Scene Composition ──────────────────────────────────────────────────
interface FilmstripSceneProps {
  activeIdx: number;
  onSelectProject: (project: Project) => void;
  onNavigate: (newIdx: number) => void;
}

function FilmstripSceneContent({ activeIdx, onSelectProject, onNavigate }: FilmstripSceneProps) {
  const total = PROJECTS.length;
  const sprocketTex = useMemo(() => createSprocketTexture(), []);

  // Overall ribbon tilt matching shader.se
  const ribbonGroup = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (ribbonGroup.current) {
      // Subtle organic mouse parallax
      const targetRotX = -0.03 + (state.pointer.y * 0.02);
      const targetRotZ = 0.045 - (state.pointer.x * 0.015);
      ribbonGroup.current.rotation.x = THREE.MathUtils.lerp(ribbonGroup.current.rotation.x, targetRotX, 0.05);
      ribbonGroup.current.rotation.z = THREE.MathUtils.lerp(ribbonGroup.current.rotation.z, targetRotZ, 0.05);
    }
  });

  return (
    <group ref={ribbonGroup} position={[0, -0.22, 0]}>
      {PROJECTS.map((_, idx) => (
        <FilmFrameMesh
          key={idx}
          projectIdx={idx}
          activeIdx={activeIdx}
          sprocketTex={sprocketTex}
          onClick={(project, isCenter) => {
            if (isCenter) {
              onSelectProject(project);
            } else {
              onNavigate(idx);
            }
          }}
        />
      ))}
    </group>
  );
}

// ── Exported Three.js Canvas Component ─────────────────────────────────────
export function FilmstripScene({ activeIdx, onSelectProject, onNavigate }: FilmstripSceneProps) {
  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0.3, 6.2], fov: 44, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <FilmstripSceneContent
          activeIdx={activeIdx}
          onSelectProject={onSelectProject}
          onNavigate={onNavigate}
        />
      </Canvas>
    </div>
  );
}
