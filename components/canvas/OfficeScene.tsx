"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { useSpringMouse } from "../providers/MouseContext";
import { CRTFilterOverlay } from "../ui/CRTFilterOverlay";

function CubicleFarm() {
  const { scene } = useGLTF("/models/deskbox.glb") as any;
  const groupRef = useRef<THREE.Group>(null);
  const instancedMeshesRef = useRef<THREE.InstancedMesh[]>([]);
  const { getMouse } = useSpringMouse();

  // Extract geometries and materials preserving original textures and vertex colors
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

        // Enable vertex colors so the baked colors (black chairs, glowing white monitors, dividers) render
        mat.vertexColors = true;

        if (mat.map) {
          mat.map.colorSpace = THREE.SRGBColorSpace;
          mat.map.needsUpdate = true;
        }

        mat.roughness = 0.46;
        mat.metalness = 0.04;

        // Custom GLSL color grading to match Shader.se reference colors
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

  // Generate the 6x7 = 42 cubicles grid matching Shader.se
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
          // Shader's exact grid offsets
          dummy.position.set((t - 2) * 180 + 140, 0, (r - 5) * 140 + 730);
          dummy.rotation.set(0, (r + t) % 2 === 0 ? Math.PI : 0, 0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [dummy]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const mouse = getMouse();
      // Subtle natural camera/hover parallax
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

function CameraRig() {
  const { camera } = useThree();
  const { getMouse } = useSpringMouse();

  useEffect(() => {
    camera.position.set(0, 3.1, 4.8);
    camera.rotation.set(-0.58, 0, 0);
  }, [camera]);

  useFrame((_, delta) => {
    const mouse = getMouse();
    const targetX = mouse.x * 0.35;
    const targetY = 3.1 + mouse.y * 0.2;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.5, delta);
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, -0.58 + mouse.y * 0.02, 3.5, delta);
    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, -mouse.x * 0.02, 3.5, delta);
  });

  return null;
}

export function OfficeScene() {
  return (
    <div className="relative w-full h-[88vh] min-h-[620px] max-h-[960px] bg-[#0a0b0e] overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ fov: 50, near: 0.1, far: 500, position: [0, 3.1, 4.8] }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#090a0d"]} />

        {/* Overhead Fluorescent Office Lighting & Contrast Rims */}
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
        <CameraRig />
      </Canvas>

      {/* ── Floating 3D "About Us" Title Card (Angled with Camera Perspective) ── */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20 pt-6 sm:pt-10">
        <h1
          className="font-stix text-[#ffffff] text-center tracking-[-0.015em] select-none leading-none px-4"
          style={{
            fontSize: "clamp(68px, 13vw, 195px)",
            fontWeight: 400,
            color: "#ffffff",
            textShadow:
              "0 0 35px rgba(255, 235, 205, 0.7), 0 0 75px rgba(255, 215, 140, 0.4), 0 8px 24px rgba(0,0,0,0.9)",
            filter:
              "drop-shadow(-1px 0 0 rgba(255, 30, 70, 0.55)) drop-shadow(1px 0 0 rgba(30, 220, 255, 0.55))",
            transform: "perspective(900px) rotateX(14deg)",
          }}
        >
          About Us
        </h1>
      </div>

      {/* Authentic Retro CRT Monitor Bezel, Vignette, Scanlines & Film Grain Overlay */}
      <CRTFilterOverlay />

      {/* Smooth bottom transition */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-transparent to-[#EFE9D3] pointer-events-none z-20" />
    </div>
  );
}
