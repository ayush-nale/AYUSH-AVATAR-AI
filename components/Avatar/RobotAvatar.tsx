"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AvatarState, Expression } from "@/types/avatar";

export default function RobotAvatar({ 
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
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);

  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#b0bec5", roughness: 0.2, metalness: 0.8
  }), []);

  const darkMetalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#37474f", roughness: 0.4, metalness: 0.6
  }), []);

  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: "#00e5ff"
  }), []);

  useFrame((_, delta) => {
    const t = performance.now() / 1000;
    
    // Idle float
    if (group.current) {
      group.current.position.y = 0.75 + Math.sin(t * 2) * 0.05;
    }

    if (head.current) {
      let targetRotX = 0; let targetRotY = 0;
      targetRotY += Math.sin(t * 0.5) * 0.05;
      if (state === "speaking") targetRotX -= 0.05 + Math.sin(t * 10) * 0.02;
      head.current.rotation.x = targetRotX;
      head.current.rotation.y = targetRotY;
    }

    if (mouth.current) {
      let mouthScaleY = 0.05;
      if (state === "speaking") {
        mouthScaleY += lipSyncRef.current * 0.8;
      }
      mouth.current.scale.y += (mouthScaleY - mouth.current.scale.y) * delta * 15;
    }

    if (leftEye.current && rightEye.current) {
       // Blink logic for robot
       const isBlinking = Math.sin(t * 15) > 0.98;
       const scaleY = isBlinking ? 0.1 : 1;

       let eyeScaleY = scaleY;
       let eyeScaleX = 1;
       let eyeRotZ = 0;
       let eyeColor = "#00e5ff"; // default cyan

       // Handle expressions
       if (expression === "happy") {
           eyeScaleY = scaleY * 0.5;
           eyeColor = "#76ff03"; // green
       } else if (expression === "sad") {
           eyeScaleY = scaleY * 0.8;
           eyeRotZ = 0.15; // tilt downwards
           eyeColor = "#2979ff"; // blue
       } else if (expression === "angry") {
           eyeScaleY = scaleY * 0.7;
           eyeRotZ = -0.15; // tilt inwards
           eyeColor = "#ff1744"; // red
       } else if (expression === "surprised") {
           eyeScaleY = scaleY * 1.5;
           eyeScaleX = 1.2;
           eyeColor = "#ffea00"; // yellow
       } else if (expression === "thinking") {
           eyeScaleY = scaleY * 0.6;
           eyeScaleX = 0.8;
           eyeColor = "#b388ff"; // purple
       } else if (expression === "confused") {
           eyeScaleY = scaleY * 0.8;
           eyeRotZ = -0.1;
           eyeColor = "#ffb300"; // orange
       }

       // Override color based on system state
       if (state === "error") {
         eyeColor = "#ff1744";
       } else if (state === "listening") {
         eyeColor = "#76ff03";
       }

       // Apply smoothed transforms
       leftEye.current.scale.y += (eyeScaleY - leftEye.current.scale.y) * delta * 30;
       rightEye.current.scale.y += (eyeScaleY - rightEye.current.scale.y) * delta * 30;
       
       leftEye.current.scale.x += (eyeScaleX - leftEye.current.scale.x) * delta * 30;
       rightEye.current.scale.x += (eyeScaleX - rightEye.current.scale.x) * delta * 30;
       
       leftEye.current.rotation.z += (eyeRotZ - leftEye.current.rotation.z) * delta * 15;
       rightEye.current.rotation.z += (-eyeRotZ - rightEye.current.rotation.z) * delta * 15;
       
       (leftEye.current.material as any).color.set(eyeColor);
       (rightEye.current.material as any).color.set(eyeColor);
    }
  });

  return (
    <group ref={group} position={[0, 0.75, 0]} scale={[0.8, 0.8, 0.8]}>
      <group ref={chest} position={[0, 0.4, 0]}>
        <mesh position={[0, -0.2, 0]} material={metalMaterial}><boxGeometry args={[0.5, 0.6, 0.3]} /></mesh>
        <mesh position={[0, 0.1, 0.16]} material={glowMaterial}><circleGeometry args={[0.08, 32]} /></mesh>
      </group>
      
      <mesh position={[0, 0.75, 0]} material={darkMetalMaterial}><cylinderGeometry args={[0.08, 0.08, 0.2, 32]} /></mesh>

      <group ref={head} position={[0, 0.95, 0]}>
        <mesh material={metalMaterial}><boxGeometry args={[0.45, 0.45, 0.45]} /></mesh>
        
        {/* Screen/Faceplate */}
        <mesh position={[0, 0, 0.23]} material={darkMetalMaterial}><planeGeometry args={[0.35, 0.3]} /></mesh>
        
        <mesh ref={leftEye} position={[-0.08, 0.05, 0.24]} material={glowMaterial}><planeGeometry args={[0.08, 0.08]} /></mesh>
        <mesh ref={rightEye} position={[0.08, 0.05, 0.24]} material={glowMaterial}><planeGeometry args={[0.08, 0.08]} /></mesh>

        <mesh ref={mouth} position={[0, -0.08, 0.24]} material={glowMaterial}><planeGeometry args={[0.2, 0.05]} /></mesh>
      </group>
    </group>
  );
}
