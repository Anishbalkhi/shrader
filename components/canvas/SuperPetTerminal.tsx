"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpringMouse } from "../providers/MouseContext";
import { PROJECTS } from "@/lib/data/projects";

const PROJECT_SCREEN_TEXTURES = PROJECTS.map((p) => `/textures/projects/${p.uid}.jpg`);

// Signature subtle glow colors matching each project website
const PROJECT_GLOW_COLORS: Record<string, string> = {
  "ehealth-arena": "#ffe8a8",
  "select-concept": "#d4edff",
  "gamily": "#ff3ea5",
  "alamance-foods": "#ffc857",
  "son": "#e8d8c0",
  "glasbolaget": "#7ce8ff",
  "spp-dream-generator": "#7affc8",
  "ica-nissen": "#ff7582",
  "norrkopings-hamn": "#6eb2ff",
  "heip": "#a8ff66",
  "design-is-funny": "#ffea38",
};

export function SuperPetTerminal({
  scrollProgress = 0,
  controlCamera = true,
}: {
  scrollProgress?: number;
  controlCamera?: boolean;
}) {
  const { nodes, materials } = useGLTF("/models/computer.glb") as any;

  // Immediate texture to avoid suspending all 11 at once
  const initialTexture = useTexture("/textures/projects/ehealth-arena.jpg");
  initialTexture.colorSpace = THREE.SRGBColorSpace;

  // Bezel edge bloom & keyboard wash textures
  const [edgeBloomTexture, keyboardWashTexture] = useTexture([
    "/textures/screen_edge_bloom.png",
    "/textures/keyboard_glow_wash.png",
  ]);
  edgeBloomTexture.colorSpace = THREE.SRGBColorSpace;
  keyboardWashTexture.colorSpace = THREE.SRGBColorSpace;

  // Authentic rounded CRT screen geometry with smooth corner radius
  const screenGeometry = useMemo(() => {
    const w = 8.4;
    const h = 6.55;
    const r = 0.88; // corner radius
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const geo = new THREE.ShapeGeometry(shape, 32);
    const pos = geo.attributes.position;
    const uvs = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      uvs.setXY(i, (px + w / 2) / w, (py + h / 2) / h);
    }
    uvs.needsUpdate = true;
    return geo;
  }, []);

  const [texIdx, setTexIdx] = useState(0);
  const texturesRef = useRef<THREE.Texture[]>([initialTexture]);

  const screenMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const keyboardWashMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Background load remaining project website textures & cycle every 3.5s
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    PROJECT_SCREEN_TEXTURES.forEach((path, idx) => {
      if (idx === 0) return;
      loader.load(path, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        texturesRef.current[idx] = tex;
      });
    });

    const id = setInterval(() => {
      setTexIdx((prev) => (prev + 1) % PROJECT_SCREEN_TEXTURES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Update screen texture
  useEffect(() => {
    if (screenMatRef.current) {
      const tex = texturesRef.current[texIdx] || initialTexture;
      screenMatRef.current.map = tex;
      screenMatRef.current.needsUpdate = true;
    }
  }, [texIdx, initialTexture]);

  const groupRef = useRef<THREE.Group>(null);
  const screenMeshRef = useRef<THREE.Mesh>(null);
  const screenGlowRef = useRef<THREE.PointLight>(null);
  const keyboardGlowRef = useRef<THREE.PointLight>(null);
  const tableGlowRef = useRef<THREE.PointLight>(null);
  const currentGlowColor = useRef(new THREE.Color("#ffe8a8"));

  const { getMouse } = useSpringMouse();

  // Configure materials matching the authentic retro terminal
  const { logoMat, compMat, kbMat, bgMat } = useMemo(() => {
    // 1. SHADER Logo badge with rainbow glow
    const lMat = materials["commodore-logo"]?.clone() || new THREE.MeshStandardMaterial();
    lMat.metalness = 0.9;
    lMat.roughness = 0.1;
    if (lMat.map) {
      lMat.emissiveMap = lMat.map;
      lMat.emissive = new THREE.Color("#ffffff");
      lMat.emissiveIntensity = 0.45;
    }

    // 2. Vintage beige computer chassis
    const cMat = materials.computer?.clone() || new THREE.MeshStandardMaterial();
    cMat.metalness = 0.08;
    cMat.roughness = 0.55;
    cMat.side = THREE.DoubleSide;

    // 3. Charcoal keyboard keys with glossy bevel highlights
    const kMat = materials.keyboard?.clone() || new THREE.MeshStandardMaterial();
    kMat.color.set("#161616");
    kMat.metalness = 0.35;
    kMat.roughness = 0.15;

    // 4. Dark moody studio floor
    const bMat = materials.background?.clone() || new THREE.MeshStandardMaterial();
    bMat.color.set("#ffffff");
    bMat.roughness = 0.88;
    bMat.metalness = 0.05;
    bMat.side = THREE.DoubleSide;

    return { logoMat: lMat, compMat: cMat, kbMat: kMat, bgMat: bMat };
  }, [materials]);

  // Camera zoom targets
  const CAM_START = useMemo(() => new THREE.Vector3(0, 0.2, 4.5), []);
  const CAM_TARGET = useMemo(() => new THREE.Vector3(1.017, 0.351, 0.836), []);
  const LOOK_START = useMemo(() => new THREE.Vector3(0, 0.2, 0), []);
  const LOOK_TARGET = useMemo(() => new THREE.Vector3(1.878, 0.210, 0.042), []);
  const tempLookAt = useMemo(() => new THREE.Vector3(), []);

  // Dynamic CRT breathing & color transitions
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const currentProject = PROJECTS[texIdx] || PROJECTS[0];
    const targetHex = PROJECT_GLOW_COLORS[currentProject.uid] || "#ffe8a8";

    currentGlowColor.current.lerp(new THREE.Color(targetHex), 0.08);
    const pulse = 1.0 + Math.sin(time * 5.0) * 0.05;

    if (screenGlowRef.current) {
      screenGlowRef.current.color.copy(currentGlowColor.current);
      screenGlowRef.current.intensity = 1.8 * pulse;
    }
    if (keyboardGlowRef.current) {
      keyboardGlowRef.current.color.copy(currentGlowColor.current);
      keyboardGlowRef.current.intensity = 2.4 * pulse;
    }
    if (tableGlowRef.current) {
      tableGlowRef.current.color.copy(currentGlowColor.current);
      tableGlowRef.current.intensity = 1.2 * pulse;
    }
    if (keyboardWashMatRef.current) {
      keyboardWashMatRef.current.color.copy(currentGlowColor.current);
    }

    if (!groupRef.current) return;

    const s = Math.min(Math.max(scrollProgress, 0), 1);
    const eased = s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2;

    if (controlCamera) {
      // Scroll-driven camera zoom
      state.camera.position.lerpVectors(CAM_START, CAM_TARGET, eased);

      const targetFov = 50 - eased * 32;
      (state.camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(
        (state.camera as THREE.PerspectiveCamera).fov,
        targetFov,
        0.12
      );
      (state.camera as THREE.PerspectiveCamera).updateProjectionMatrix();

      tempLookAt.lerpVectors(LOOK_START, LOOK_TARGET, eased);
      state.camera.lookAt(tempLookAt);
    }

    // Mouse parallax
    const parallaxStrength = Math.max(0, 1 - s * 2.5);
    const m = getMouse ? getMouse() : { x: 0, y: 0 };
    const targetRotY = (m.x || 0) * 0.045 * parallaxStrength;
    const targetRotX = (m.y || 0) * 0.03 * parallaxStrength;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.08
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.08
    );
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Studio key light */}
      <spotLight
        position={[2.0, 6.0, 3.8]}
        target-position={[0.8, -0.4, 0]}
        intensity={3.6}
        distance={28}
        angle={0.7}
        penumbra={0.75}
        color="#fff5e6"
      />

      {/* Rim light from behind-left */}
      <directionalLight
        position={[-3, 4, -2]}
        intensity={0.9}
        color="#8570a8"
      />

      {/* SuperPET Computer Terminal */}
      <group position={[-1.42, -1.48, 0.15]} scale={0.152} rotation-y={Math.PI - 0.04}>
        {/* CRT Monitor Screen */}
        <group
          position={[-21.65, 11.12, 1.58]}
          rotation={[-0.1196, Math.PI - 0.7854, 0]}
          rotation-order="YXZ"
        >
          {/* Layer 1: Core CRT Screen nestled cleanly inside bezel opening with rounded corners */}
          <mesh
            ref={screenMeshRef}
            geometry={screenGeometry}
            position={[-0.24, -0.02, 0]}
          >
            <meshBasicMaterial
              ref={screenMatRef}
              map={initialTexture}
              toneMapped={true}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Layer 2: Subtle soft CRT edge phosphor glow */}
          <mesh
            geometry={screenGeometry}
            position={[-0.24, -0.02, 0.02]}
            scale={[1.01, 1.01, 1]}
          >
            <meshBasicMaterial
              map={edgeBloomTexture}
              transparent={true}
              opacity={0.15}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={true}
            />
          </mesh>

          {/* Gentle Forward Screen Light */}
          <pointLight
            ref={screenGlowRef}
            position={[0, 0, 3.0]}
            intensity={1.8}
            distance={20}
          />
        </group>

        {/* Focused Downward Screen Light on Keyboard */}
        <spotLight
          position={[-18.5, 9.5, 4.0]}
          target-position={[-18.5, 2.0, 13.0]}
          intensity={5.5}
          distance={20}
          angle={0.88}
          penumbra={0.7}
        />

        {/* Keyboard Specular Point Light */}
        <pointLight
          ref={keyboardGlowRef}
          position={[-18.5, 6.2, 8.0]}
          intensity={2.2}
          distance={16}
        />

        {/* Subtle Keyboard Glow Wash Layer */}
        <mesh
          position={[-18.6, 3.4, 13.8]}
          rotation={[-Math.PI / 2 + 0.32, 0, 0]}
          scale={[26, 11, 1]}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            ref={keyboardWashMatRef}
            map={keyboardWashTexture}
            transparent={true}
            opacity={0.28}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Desk forward ambient light pool */}
        <pointLight
          ref={tableGlowRef}
          position={[-18.5, 1.8, 17.5]}
          intensity={1.2}
          distance={18}
        />

        {/* 3D Model Meshes from computer.glb */}
        {nodes.logo && (
          <mesh geometry={nodes.logo.geometry} material={logoMat} />
        )}
        {nodes.computer && (
          <mesh geometry={nodes.computer.geometry} material={compMat} />
        )}
        {nodes.keyboard && (
          <mesh geometry={nodes.keyboard.geometry} material={kbMat} />
        )}
        {nodes.background && (
          <mesh geometry={nodes.background.geometry} material={bgMat} />
        )}
      </group>
    </group>
  );
}

useGLTF.preload("/models/computer.glb");
