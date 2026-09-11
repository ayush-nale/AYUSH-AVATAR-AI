"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AvatarState, Expression } from "@/types/avatar";

export default function GirlAvatar({ 
  state, 
  expression, 
  lipSyncRef 
}: { 
  state: AvatarState; 
  expression: Expression; 
  lipSyncRef: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Group>(null);
  
  const mouth = useRef<THREE.Mesh>(null);
  const leftEye = useRef<THREE.Group>(null);
  const rightEye = useRef<THREE.Group>(null);
  const leftPupil = useRef<THREE.Mesh>(null);
  const rightPupil = useRef<THREE.Mesh>(null);
  const leftEyelid = useRef<THREE.Mesh>(null);
  const rightEyelid = useRef<THREE.Mesh>(null);

  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);
  const lookTarget = useRef(new THREE.Vector2(0, 0));
  const lookTimer = useRef(0);

  const skinMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: "#e8c3a9", roughness: 0.3, metalness: 0.05, clearcoat: 0.1, transmission: 0.2, thickness: 0.5
  }), []);

  const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#3d1f11", roughness: 0.8, metalness: 0.2
  }), []);

  const eyeWhiteMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#ffffff", roughness: 0.1, clearcoat: 1.0
  }), []);

  const pupilMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: "#2d1604" }), []);
  const eyebrowMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2d1604" }), []);
  const mouthMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a2b3b" }), []);
  const shirtMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f472b6", roughness: 0.9 }), []);

  const jawPoints = useMemo(() => {
    const pts = [];
    for ( let i = 0; i <= 10; i ++ ) {
      const v = i / 10;
      pts.push(new THREE.Vector2(Math.sin(v * Math.PI) * 0.32, -v * 0.35));
    }
    return pts;
  }, []);

  useFrame((_, delta) => {
    const t = performance.now() / 1000;
    if (chest.current) {
      const breath = Math.sin(t * 1.5) * 0.015;
      chest.current.scale.y = 1 + breath;
      chest.current.scale.z = 1 + breath * 1.2;
    }
    if (head.current) {
      let targetRotX = 0; let targetRotY = 0; let targetRotZ = 0;
      targetRotY += Math.sin(t * 0.4) * 0.04;
      targetRotX += Math.sin(t * 0.3) * 0.02;
      if (state === "speaking") targetRotX -= 0.03 + Math.sin(t * 5) * 0.015;
      head.current.rotation.x += (targetRotX - head.current.rotation.x) * delta * 4;
      head.current.rotation.y += (targetRotY - head.current.rotation.y) * delta * 4;
    }

    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      if (isBlinking.current) {
        isBlinking.current = false;
        blinkTimer.current = 2 + Math.random() * 4;
      } else {
        isBlinking.current = true;
        blinkTimer.current = 0.15;
      }
    }
    const eyelidTargetY = isBlinking.current ? 0.05 : 0.005;
    if (leftEyelid.current && rightEyelid.current) {
      leftEyelid.current.position.y += (eyelidTargetY - leftEyelid.current.position.y) * delta * 25;
      rightEyelid.current.position.y += (eyelidTargetY - rightEyelid.current.position.y) * delta * 25;
    }

    lookTimer.current -= delta;
    if (lookTimer.current <= 0) {
      lookTarget.current.set((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.015);
      lookTimer.current = 1 + Math.random() * 2;
    }
    if (leftPupil.current && rightPupil.current) {
      leftPupil.current.position.x += (lookTarget.current.x - leftPupil.current.position.x) * delta * 8;
      leftPupil.current.position.y += (lookTarget.current.y - leftPupil.current.position.y) * delta * 8;
      rightPupil.current.position.x += (lookTarget.current.x - rightPupil.current.position.x) * delta * 8;
      rightPupil.current.position.y += (lookTarget.current.y - rightPupil.current.position.y) * delta * 8;
    }

    if (mouth.current) {
      let mouthScaleY = 0.15; let mouthScaleX = 1;
      if (state === "speaking") {
        mouthScaleY += lipSyncRef.current * 1.5;
        mouthScaleX -= lipSyncRef.current * 0.1;
      }
      mouth.current.scale.y += (mouthScaleY - mouth.current.scale.y) * delta * 12;
      mouth.current.scale.x += (mouthScaleX - mouth.current.scale.x) * delta * 12;
    }
  });

  return (
    <group ref={group} position={[0, -0.6, 0]} scale={[1.25, 1.25, 1.25]}>
      <group ref={chest} position={[0, 0.4, 0]}>
        <mesh position={[0, -0.2, 0.02]} material={shirtMaterial}><cylinderGeometry args={[0.18, 0.22, 0.5, 32]} /></mesh>
      </group>
      <mesh position={[0, 0.75, 0.02]} material={skinMaterial}><cylinderGeometry args={[0.11, 0.13, 0.35, 32]} /></mesh>
      <group ref={head} position={[0, 0.95, 0.05]}>
        <mesh position={[0, 0.08, 0]} material={skinMaterial}><sphereGeometry args={[0.28, 32, 32]} /></mesh>
        <mesh position={[0, 0.08, 0]} material={skinMaterial}><latheGeometry args={[jawPoints, 32]} /></mesh>
        
        <group position={[0, 0.22, -0.05]}>
          <mesh material={hairMaterial}><sphereGeometry args={[0.31, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} /></mesh>
          <mesh position={[0, -0.2, -0.2]} material={hairMaterial}><capsuleGeometry args={[0.2, 0.4, 16, 16]} /></mesh>
          <mesh position={[0.2, -0.15, -0.1]} material={hairMaterial}><capsuleGeometry args={[0.08, 0.35, 16, 16]} /></mesh>
          <mesh position={[-0.2, -0.15, -0.1]} material={hairMaterial}><capsuleGeometry args={[0.08, 0.35, 16, 16]} /></mesh>
        </group>

        <mesh position={[0, -0.02, 0.3]} rotation={[0.2, 0, 0]} material={skinMaterial}><capsuleGeometry args={[0.03, 0.06, 16, 16]} /></mesh>
        <mesh ref={mouth} position={[0, -0.14, 0.28]} rotation={[0, 0, Math.PI/2]} material={mouthMaterial}><capsuleGeometry args={[0.015, 0.06, 16, 16]} /></mesh>

        <group position={[0, 0.08, 0.26]}>
          <group ref={leftEye} position={[-0.12, 0, 0]}>
            <mesh material={eyeWhiteMaterial}><sphereGeometry args={[0.045, 32, 32]} /></mesh>
            <mesh ref={leftPupil} position={[0, 0, 0.041]} material={pupilMaterial}><sphereGeometry args={[0.018, 16, 16]} /></mesh>
            <mesh ref={leftEyelid} position={[0, 0.005, 0.045]} material={skinMaterial}><boxGeometry args={[0.1, 0.1, 0.02]} /></mesh>
          </group>
          <group ref={rightEye} position={[0.12, 0, 0]}>
            <mesh material={eyeWhiteMaterial}><sphereGeometry args={[0.045, 32, 32]} /></mesh>
            <mesh ref={rightPupil} position={[0, 0, 0.041]} material={pupilMaterial}><sphereGeometry args={[0.018, 16, 16]} /></mesh>
            <mesh ref={rightEyelid} position={[0, 0.005, 0.045]} material={skinMaterial}><boxGeometry args={[0.1, 0.1, 0.02]} /></mesh>
          </group>
          <mesh position={[-0.12, 0.16, 0.02]} rotation={[0, 0, 0.1]} material={eyebrowMaterial}><capsuleGeometry args={[0.01, 0.08, 8, 8]} /></mesh>
          <mesh position={[0.12, 0.16, 0.02]} rotation={[0, 0, -0.1]} material={eyebrowMaterial}><capsuleGeometry args={[0.01, 0.08, 8, 8]} /></mesh>
        </group>
      </group>
    </group>
  );
}
