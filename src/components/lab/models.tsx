"use client";

import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

// Procedural models: nothing to download, a handful of draw calls each.

const ACCENT = "#0b5d6e";
const STAND = "#c9d3d8";

function starShape(points = 5, outer = 0.55, inner = 0.24) {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

// The LEGO Group: a hero star (Hero Stories)
export function StarModel() {
  const geometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(starShape(), {
        depth: 0.22,
        bevelEnabled: true,
        bevelSize: 0.05,
        bevelThickness: 0.05,
        bevelSegments: 2,
      }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.3, 32]} />
        <meshStandardMaterial color={STAND} />
      </mesh>
      <mesh geometry={geometry} position={[0, 1.0, -0.11]}>
        <meshStandardMaterial color="#f2b632" roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  );
}

// SITA: an airliner on a display stand
export function PlaneModel() {
  return (
    <group>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.45, 0.5, 0.08, 32]} />
        <meshStandardMaterial color={STAND} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 12]} />
        <meshStandardMaterial color="#9aa5ae" />
      </mesh>
      <group position={[0, 0.95, 0]} rotation={[0, -0.6, 0.12]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.18, 1.4, 8, 16]} />
          <meshStandardMaterial color="#f4f6f8" roughness={0.4} />
        </mesh>
        <mesh position={[0.05, -0.02, 0]}>
          <boxGeometry args={[0.42, 0.04, 1.9]} />
          <meshStandardMaterial color={ACCENT} />
        </mesh>
        <mesh position={[-0.74, 0.26, 0]}>
          <boxGeometry args={[0.28, 0.4, 0.04]} />
          <meshStandardMaterial color={ACCENT} />
        </mesh>
        <mesh position={[-0.76, 0.04, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.7]} />
          <meshStandardMaterial color={ACCENT} />
        </mesh>
        {[-0.5, 0.5].map((z) => (
          <mesh key={z} position={[0.14, -0.13, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.28, 16]} />
            <meshStandardMaterial color="#9aa5ae" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const BARS = [0.5, 0.85, 0.65, 1.2, 1.45];
const BAR_COLORS = ["#9ad9e3", "#5cc3d3", "#2a97aa", "#13798d", ACCENT];

// RBC Capital Markets: a bar chart
export function ChartModel() {
  return (
    <group>
      <RoundedBox args={[1.5, 0.12, 0.6]} radius={0.04} position={[0, 0.06, 0]}>
        <meshStandardMaterial color={STAND} />
      </RoundedBox>
      {BARS.map((height, i) => (
        <RoundedBox key={i} args={[0.2, height, 0.2]} radius={0.03} position={[-0.56 + i * 0.28, 0.12 + height / 2, 0]}>
          <meshStandardMaterial color={BAR_COLORS[i]} />
        </RoundedBox>
      ))}
    </group>
  );
}

// PGL Esports: a broadcast monitor with a live indicator
export function ScreenModel() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.1, 32]} />
        <meshStandardMaterial color="#3a444b" />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#3a444b" />
      </mesh>
      <RoundedBox args={[1.5, 0.92, 0.1]} radius={0.04} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#20262b" />
      </RoundedBox>
      <mesh position={[0, 1.2, 0.051]}>
        <planeGeometry args={[1.36, 0.78]} />
        <meshStandardMaterial color={ACCENT} emissive="#5cc3d3" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0.52, 1.47, 0.07]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#e5484d" emissive="#e5484d" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}
