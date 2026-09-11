"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AvatarState, Expression } from "@/types/avatar";

export default function TemporaryHumanAvatar({ 
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
  
  // Facial features
  const mouth = useRef<THREE.Mesh>(null);
  const leftEye = useRef<THREE.Group>(null);
  const rightEye = useRef<THREE.Group>(null);
  const leftPupil = useRef<THREE.Mesh>(null);
  const rightPupil = useRef<THREE.Mesh>(null);
  const leftEyelid = useRef<THREE.Mesh>(null);
  const rightEyelid = useRef<THREE.Mesh>(null);
  const leftEyebrow = useRef<THREE.Mesh>(null);
  const rightEyebrow = useRef<THREE.Mesh>(null);

  // Animation states
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);
  const lookTarget = useRef(new THREE.Vector2(0, 0));
  const lookTimer = useRef(0);

  // --- PREMIUM MATERIALS ---
  const skinMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: "#b9866c", // Indian warm skin tone
    roughness: 0.4, 
    metalness: 0.1,
    clearcoat: 0.1,
    clearcoatRoughness: 0.6,
    transmission: 0.15, // Fake sub-surface scattering effect
    thickness: 0.5
  }), []);
  
  const stubbleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#4a332a",
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    opacity: 0.6
  }), []);

  const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#050406", 
    roughness: 0.9,
    metalness: 0.1
  }), []);

  const eyeWhiteMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#f5f5f5",
    roughness: 0.1,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  }), []);

  const pupilMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#1a1005"
  }), []);

  const eyebrowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0a070c",
    roughness: 0.9
  }), []);

  const mouthMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#2a1015",
    roughness: 0.6
  }), []);

  const jacketMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0a0a0c", // Black leather jacket
    roughness: 0.6,
    metalness: 0.4
  }), []);
  
  const shirtMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#e2e8f0", // White inner shirt
    roughness: 0.9,
    metalness: 0.1
  }), []);

  // Use a LatheGeometry to create a smooth jawline (approximated profile)
  const jawPoints = useMemo(() => {
    const pts = [];
    for ( let i = 0; i <= 10; i ++ ) {
      const v = i / 10;
      pts.push(new THREE.Vector2(Math.sin(v * Math.PI) * 0.35, -v * 0.4));
    }
    return pts;
  }, []);

  useFrame((_, delta) => {
    const t = performance.now() / 1000;

    // Breathing (Chest scale/position)
    if (chest.current) {
      const breath = Math.sin(t * 1.5) * 0.015;
      chest.current.scale.y = 1 + breath;
      chest.current.scale.z = 1 + breath * 1.2;
      chest.current.position.y = 0.4 + breath * 0.1;
    }

    // Subtle head movement & Look at
    if (head.current) {
      let targetRotX = 0;
      let targetRotY = 0;
      let targetRotZ = 0;

      // Idle movement
      targetRotY += Math.sin(t * 0.4) * 0.04;
      targetRotX += Math.sin(t * 0.3) * 0.02;

      if (state === "speaking") {
        targetRotX -= 0.03 + Math.sin(t * 5) * 0.015; // Nodding slightly
      }
      
      if (expression === "sad") targetRotX += 0.12;
      if (expression === "angry") targetRotX -= 0.08;
      if (expression === "surprised") {
        targetRotX -= 0.06;
        targetRotZ += 0.04;
      }
      if (expression === "thinking") {
        targetRotX -= 0.04;
        targetRotY += 0.12;
      }
      if (expression === "confused") {
        targetRotZ -= 0.08;
        targetRotY -= 0.08;
      }

      head.current.rotation.x += (targetRotX - head.current.rotation.x) * delta * 4;
      head.current.rotation.y += (targetRotY - head.current.rotation.y) * delta * 4;
      head.current.rotation.z += (targetRotZ - head.current.rotation.z) * delta * 4;
    }

    // Blinking
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      if (isBlinking.current) {
        isBlinking.current = false;
        blinkTimer.current = 1.5 + Math.random() * 4.5;
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

    // Eye Movement (Pupils)
    lookTimer.current -= delta;
    if (lookTimer.current <= 0) {
      if (expression === "thinking") {
        lookTarget.current.set((Math.random() > 0.5 ? 1 : -1) * 0.025, 0.03); 
      } else {
        if (Math.random() > 0.6) {
          lookTarget.current.set((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.015);
        } else {
          lookTarget.current.set(0, 0);
        }
      }
      lookTimer.current = 0.5 + Math.random() * 2.5;
    }

    if (leftPupil.current && rightPupil.current) {
      leftPupil.current.position.x += (lookTarget.current.x - leftPupil.current.position.x) * delta * 8;
      leftPupil.current.position.y += (lookTarget.current.y - leftPupil.current.position.y) * delta * 8;
      rightPupil.current.position.x += (lookTarget.current.x - rightPupil.current.position.x) * delta * 8;
      rightPupil.current.position.y += (lookTarget.current.y - rightPupil.current.position.y) * delta * 8;
    }

    // Expressions & Lip Sync
    if (leftEyebrow.current && rightEyebrow.current && mouth.current) {
      let lBrowRotZ = 0; let lBrowPosY = 0.17;
      let rBrowRotZ = 0; let rBrowPosY = 0.17;
      let mouthScaleY = 0.15; let mouthScaleX = 1; let mouthPosY = -0.16;

      switch(expression) {
        case "happy":
          lBrowPosY = 0.19; rBrowPosY = 0.19;
          mouthScaleX = 1.35; mouthScaleY = 0.25; mouthPosY = -0.15;
          break;
        case "sad":
          lBrowRotZ = -0.12; rBrowRotZ = 0.12;
          lBrowPosY = 0.18; rBrowPosY = 0.18;
          mouthScaleX = 0.85; mouthScaleY = 0.15; mouthPosY = -0.17;
          break;
        case "angry":
          lBrowRotZ = 0.18; rBrowRotZ = -0.18;
          lBrowPosY = 0.15; rBrowPosY = 0.15;
          mouthScaleX = 0.95; mouthScaleY = 0.12;
          break;
        case "surprised":
          lBrowPosY = 0.22; rBrowPosY = 0.22;
          mouthScaleX = 0.65; mouthScaleY = 0.7; mouthPosY = -0.17;
          break;
        case "thinking":
          lBrowPosY = 0.21; rBrowRotZ = 0.08; rBrowPosY = 0.16;
          mouthScaleX = 0.75; mouthScaleY = 0.15;
          break;
        case "confused":
          lBrowPosY = 0.16; rBrowRotZ = -0.08; rBrowPosY = 0.21;
          mouthScaleX = 0.85; mouthScaleY = 0.2;
          break;
        default:
          break;
      }

      if (state === "speaking") {
        mouthScaleY += lipSyncRef.current * 1.8;
        mouthScaleX -= lipSyncRef.current * 0.15;
      }

      leftEyebrow.current.rotation.z += (lBrowRotZ - leftEyebrow.current.rotation.z) * delta * 8;
      leftEyebrow.current.position.y += (lBrowPosY - leftEyebrow.current.position.y) * delta * 8;
      
      rightEyebrow.current.rotation.z += (rBrowRotZ - rightEyebrow.current.rotation.z) * delta * 8;
      rightEyebrow.current.position.y += (rBrowPosY - rightEyebrow.current.position.y) * delta * 8;

      mouth.current.scale.y += (mouthScaleY - mouth.current.scale.y) * delta * 12;
      mouth.current.scale.x += (mouthScaleX - mouth.current.scale.x) * delta * 12;
      mouth.current.position.y += (mouthPosY - mouth.current.position.y) * delta * 8;
    }
  });

  return (
    <group ref={group} position={[0, -0.6, 0]} scale={[1.3, 1.3, 1.3]}>
      
      {/* Torso / Shoulders (Leather Jacket + Shirt) */}
      <group ref={chest} position={[0, 0.4, 0]}>
        {/* Inner Shirt */}
        <mesh position={[0, -0.2, 0.02]} material={shirtMaterial}>
          <cylinderGeometry args={[0.2, 0.25, 0.5, 32]} />
        </mesh>
        {/* Jacket */}
        <mesh position={[0, -0.3, 0]} material={jacketMaterial}>
          <capsuleGeometry args={[0.42, 0.6, 16, 32]} />
        </mesh>
        {/* Jacket Collar Left */}
        <mesh position={[-0.2, 0.05, 0.15]} rotation={[0, 0, 0.3]} material={jacketMaterial}>
           <boxGeometry args={[0.15, 0.3, 0.05]} />
        </mesh>
        {/* Jacket Collar Right */}
        <mesh position={[0.2, 0.05, 0.15]} rotation={[0, 0, -0.3]} material={jacketMaterial}>
           <boxGeometry args={[0.15, 0.3, 0.05]} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 0.75, 0.02]} material={skinMaterial}>
        <cylinderGeometry args={[0.13, 0.16, 0.35, 32]} />
      </mesh>

      {/* Head Group */}
      <group ref={head} position={[0, 0.95, 0.05]}>
        
        {/* Upper Head (Cranium) */}
        <mesh position={[0, 0.08, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.3, 32, 32]} />
        </mesh>

        {/* Lower Face (Jaw/Cheeks) */}
        <mesh position={[0, 0.08, 0]} material={skinMaterial}>
          <latheGeometry args={[jawPoints, 32]} />
        </mesh>
        
        {/* Stubble/Beard Overlay */}
        <mesh position={[0, 0.075, 0]} material={stubbleMaterial}>
          <latheGeometry args={[jawPoints, 32]} />
        </mesh>

        {/* Complex Messy Hair System */}
        <group position={[0, 0.22, -0.05]}>
          {/* Main Hair Volume */}
          <mesh material={hairMaterial}>
            <sphereGeometry args={[0.34, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          </mesh>
          <mesh position={[0, 0.08, -0.15]} material={hairMaterial}>
            <sphereGeometry args={[0.28, 32, 32]} />
          </mesh>
          
          {/* Front Wavy Strands */}
          <mesh position={[0.18, 0.05, 0.28]} rotation={[0.4, 0.1, 0.5]} material={hairMaterial}>
            <capsuleGeometry args={[0.08, 0.25, 16, 16]} />
          </mesh>
          <mesh position={[-0.15, 0.08, 0.3]} rotation={[0.3, -0.1, -0.4]} material={hairMaterial}>
            <capsuleGeometry args={[0.09, 0.28, 16, 16]} />
          </mesh>
          <mesh position={[0.05, 0.12, 0.32]} rotation={[0.2, 0, 0.2]} material={hairMaterial}>
            <capsuleGeometry args={[0.07, 0.22, 16, 16]} />
          </mesh>
          
          {/* Side/Top Strands for messy look */}
          <mesh position={[0.28, 0.02, 0.1]} rotation={[0, 0, 0.8]} material={hairMaterial}>
            <capsuleGeometry args={[0.06, 0.25, 16, 16]} />
          </mesh>
          <mesh position={[-0.28, 0.05, 0.15]} rotation={[0, 0, -0.7]} material={hairMaterial}>
            <capsuleGeometry args={[0.07, 0.2, 16, 16]} />
          </mesh>
          <mesh position={[0, 0.2, 0.1]} rotation={[1.5, 0.2, 0]} material={hairMaterial}>
            <capsuleGeometry args={[0.08, 0.3, 16, 16]} />
          </mesh>
        </group>

        {/* Ears */}
        <mesh position={[-0.32, 0.02, -0.05]} rotation={[0, 0.2, 0.2]} material={skinMaterial}>
          <capsuleGeometry args={[0.04, 0.08, 16, 16]} />
        </mesh>
        <mesh position={[0.32, 0.02, -0.05]} rotation={[0, -0.2, -0.2]} material={skinMaterial}>
          <capsuleGeometry args={[0.04, 0.08, 16, 16]} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.32]} rotation={[0.2, 0, 0]} material={skinMaterial}>
          <capsuleGeometry args={[0.035, 0.07, 16, 16]} />
        </mesh>
        {/* Nose bridge */}
        <mesh position={[0, 0.05, 0.29]} rotation={[-0.2, 0, 0]} material={skinMaterial}>
          <capsuleGeometry args={[0.025, 0.08, 16, 16]} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouth} position={[0, -0.16, 0.29]} rotation={[0, 0, Math.PI/2]} material={mouthMaterial}>
          <capsuleGeometry args={[0.015, 0.07, 16, 16]} />
        </mesh>

        {/* Eyes Group */}
        <group position={[0, 0.08, 0.27]}>
          
          {/* Left Eye */}
          <group ref={leftEye} position={[-0.13, 0, 0]}>
            {/* Eye socket shadow */}
            <mesh position={[0, 0, -0.01]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial color="#7a4e40" />
            </mesh>
            <mesh material={eyeWhiteMaterial}>
              <sphereGeometry args={[0.045, 32, 32]} />
            </mesh>
            <mesh ref={leftPupil} position={[0, 0, 0.041]} material={pupilMaterial}>
              <sphereGeometry args={[0.018, 16, 16]} />
            </mesh>
            <mesh ref={leftEyelid} position={[0, 0.005, 0.045]} material={skinMaterial}>
              <boxGeometry args={[0.1, 0.1, 0.02]} />
            </mesh>
          </group>

          {/* Right Eye */}
          <group ref={rightEye} position={[0.13, 0, 0]}>
            <mesh position={[0, 0, -0.01]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial color="#7a4e40" />
            </mesh>
            <mesh material={eyeWhiteMaterial}>
              <sphereGeometry args={[0.045, 32, 32]} />
            </mesh>
            <mesh ref={rightPupil} position={[0, 0, 0.041]} material={pupilMaterial}>
              <sphereGeometry args={[0.018, 16, 16]} />
            </mesh>
            <mesh ref={rightEyelid} position={[0, 0.005, 0.045]} material={skinMaterial}>
              <boxGeometry args={[0.1, 0.1, 0.02]} />
            </mesh>
          </group>

          {/* Eyebrows (Thicker) */}
          <mesh ref={leftEyebrow} position={[-0.13, 0.17, 0.02]} rotation={[0, 0, 0.05]} material={eyebrowMaterial}>
            <capsuleGeometry args={[0.016, 0.09, 8, 8]} />
          </mesh>
          <mesh ref={rightEyebrow} position={[0.13, 0.17, 0.02]} rotation={[0, 0, -0.05]} material={eyebrowMaterial}>
            <capsuleGeometry args={[0.016, 0.09, 8, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
