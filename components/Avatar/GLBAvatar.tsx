"use client";
import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import type { AvatarState, Expression } from "@/types/avatar";

export default function GLBAvatar({ 
  state, 
  expression, 
  lipSyncRef,
  url = "/avatar/model.glb",
  scale = 1,
  position = [0, 0, 0]
}: { 
  state: AvatarState; 
  expression: Expression; 
  lipSyncRef: React.MutableRefObject<number>;
  url?: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  const { clonedScene, nodes, initialRotations } = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    
    const nodes: Record<string, THREE.Bone> = {};
    const initialRotations = new Map<string, THREE.Euler>();
    
    clone.traverse((child) => {
      if (child.type === "Bone") {
        const bone = child as THREE.Bone;
        nodes[bone.name] = bone;
        initialRotations.set(bone.name, bone.rotation.clone());
      }
    });

    return { clonedScene: clone, nodes, initialRotations };
  }, [scene]);

  const { headBone, leftArm, rightArm, leftShoulder, rightShoulder, leftForeArm, rightForeArm } = useMemo(() => {
    return {
      headBone: nodes["Head"] || nodes["mixamorigHead"] || null,
      leftShoulder: nodes["LeftShoulder"] || nodes["mixamorigLeftShoulder"] || null,
      rightShoulder: nodes["RightShoulder"] || nodes["mixamorigRightShoulder"] || null,
      leftArm: nodes["LeftArm"] || nodes["mixamorigLeftArm"] || null,
      rightArm: nodes["RightArm"] || nodes["mixamorigRightArm"] || null,
      leftForeArm: nodes["LeftForeArm"] || nodes["mixamorigLeftForeArm"] || null,
      rightForeArm: nodes["RightForeArm"] || nodes["mixamorigRightForeArm"] || null,
    };
  }, [nodes]);

  const { morphMeshes } = useMemo<{ 
    morphMeshes: THREE.Mesh[] 
  }>(() => {
    const morphMeshes: THREE.Mesh[] = [];

    clonedScene.traverse((child) => {
      
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          morphMeshes.push(mesh);
        }
      }
    });

    return { morphMeshes };
  }, [clonedScene]);

  // Map expressions to common morph target names
  const applyExpression = (meshes: THREE.Mesh[], exp: Expression) => {
    meshes.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      if (!dict || !influences) return;

      // Reset all expression-related targets first
      const expTargets = [
        "smile", "sad", "angry", "surprised", "happy", "jawOpen",
        "mouthSmile", "mouthFrown", "browInnerUp", "browOuterUp", "browDown",
        "eyeWide", "mouthRoll", "mouthPucker", "mouthLeft", "eyeSquint"
      ];
      
      Object.keys(dict).forEach(key => {
        if (expTargets.some(t => key.toLowerCase().includes(t.toLowerCase()))) {
          influences[dict[key]] = 0;
        }
      });

      // Apply specific targets based on expression
      const applyTarget = (matchNames: string[], value: number = 1) => {
        matchNames.forEach(name => {
          const key = Object.keys(dict).find(k => k === name);
          if (key !== undefined) {
            influences[dict[key]] = value;
          }
        });
      };

      const expressionValue = exp || "neutral";
      if (expressionValue === "happy") {
        applyTarget(["mouthSmileLeft", "mouthSmileRight"], 1.0);
        applyTarget(["browInnerUp"], 0.4);
      } else if (expressionValue === "sad") {
        applyTarget(["mouthFrownLeft", "mouthFrownRight"], 1.0);
        applyTarget(["browOuterUpLeft", "browOuterUpRight"], 0.6);
      } else if (expressionValue === "angry") {
        applyTarget(["browDownLeft", "browDownRight"], 1.0);
        applyTarget(["mouthPressLeft", "mouthPressRight"], 0.5);
      } else if (expressionValue === "surprised") {
        applyTarget(["eyeWideLeft", "eyeWideRight", "jawOpen"], 0.8);
        applyTarget(["browInnerUp"], 0.8);
      } else if (expressionValue === "confused") {
        applyTarget(["browDownLeft", "browOuterUpRight"], 0.8);
        applyTarget(["mouthLeft"], 0.5);
      } else if (expressionValue === "thinking") {
        applyTarget(["browInnerUp", "browDownLeft"], 0.6);
        applyTarget(["mouthPucker"], 0.5);
        applyTarget(["eyeSquintLeft", "eyeSquintRight"], 0.4);
      }
    });
  };

  useFrame((_, delta) => {
    const t = performance.now() / 1000;

    // Head movement
    if (headBone) {
      const initial = initialRotations.get(headBone.name);
      let targetRotX = (initial ? initial.x : 0) + 0.15; 
      let targetRotY = initial ? initial.y : 0;
      let targetRotZ = initial ? initial.z : 0;
      
      // Idle slight movement
      targetRotY += Math.sin(t * 0.5) * 0.05;
      targetRotX += Math.sin(t * 0.3) * 0.02;

      if (state === "speaking") {
        targetRotX -= 0.03 + Math.sin(t * 5) * 0.015;
      }
      if (expression === "sad") targetRotX += 0.1;
      if (expression === "happy") targetRotX -= 0.05;

      // Set head rotation directly. We avoid Euler interpolation (+=) to prevent 
      // 360-degree wrap-around spins when the page loads.
      headBone.rotation.x = targetRotX;
      headBone.rotation.y = targetRotY;
      headBone.rotation.z = targetRotZ;
    }

    // Lip sync
    morphMeshes.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      if (!dict || !influences) return;

      // Find the safest, most generic mouth opening blendshape available
      const primaryKey = Object.keys(dict).find(k => k.toLowerCase() === "jawopen") ||
                         Object.keys(dict).find(k => k.toLowerCase() === "mouthopen") ||
                         Object.keys(dict).find(k => k.toLowerCase().includes("viseme_o")) ||
                         Object.keys(dict).find(k => k.toLowerCase().includes("viseme_aa"));

      // CRITICAL FIX: Smoothly reset all other lip-sync related keys to 0!
      // We only reset visemes and jaw open, NOT expression-related mouth keys!
      Object.keys(dict).forEach(k => {
        const lower = k.toLowerCase();
        if (lower.includes("viseme") || lower.includes("tongue") || lower === "jawopen" || lower === "mouthopen") {
           if (k !== primaryKey) {
             influences[dict[k]] += (0 - influences[dict[k]]) * delta * 10;
           }
        }
      });

      if (primaryKey) {
        // We now receive a perfectly contoured exponential 0-1 volume from Dashboard.
        // Map it to a smaller maximum jaw opening (0.4) so it looks like natural talking instead of a gaping mouth.
        const targetValue = state === "speaking" ? lipSyncRef.current * 0.4 : 0;
        
        // Smoothly interpolate so it doesn't snap
        const current = influences[dict[primaryKey]];
        influences[dict[primaryKey]] += (targetValue - current) * delta * 15;
      }
    });

    // Blinking
    morphMeshes.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      if (!dict || !influences) return;

      const blinkKeys = Object.keys(dict).filter(k => k.toLowerCase().includes("blink"));
      
      if (blinkKeys.length > 0) {
        // Slowed down blinking: t * 2 means it blinks about once every 3 seconds.
        const blinkAmount = Math.sin(t * 2) > 0.98 ? 1 : 0;
        blinkKeys.forEach(k => {
          // Smooth blink
          const curr = influences[dict[k]];
          influences[dict[k]] += (blinkAmount - curr) * delta * 20;
        });
      }
    });

    // Continuously enforce the dropped arm pose every frame so the engine cannot reset it.
    if (leftShoulder && initialRotations.has(leftShoulder.name)) {
      leftShoulder.rotation.copy(initialRotations.get(leftShoulder.name)!);
      leftShoulder.rotateX(0.05); // Drop shoulder down very slightly
      if (expression === "sad") leftShoulder.rotateZ(-0.2); 
      else if (expression === "angry") leftShoulder.rotateZ(0.2); 
    }
    if (rightShoulder && initialRotations.has(rightShoulder.name)) {
      rightShoulder.rotation.copy(initialRotations.get(rightShoulder.name)!);
      rightShoulder.rotateX(0.05); // Drop shoulder down very slightly
      if (expression === "sad") rightShoulder.rotateZ(0.2); 
      else if (expression === "angry") rightShoulder.rotateZ(-0.2); 
    }
    
    // The base model comes in a T-Pose, so we must manually drop the arms to the sides.
    if (leftArm && initialRotations.has(leftArm.name)) {
      leftArm.rotation.copy(initialRotations.get(leftArm.name)!);
      leftArm.rotateX(1.25); // Match reference image gap
      if (expression === "angry") leftArm.rotateZ(-0.5); 
    }
    if (rightArm && initialRotations.has(rightArm.name)) {
      rightArm.rotation.copy(initialRotations.get(rightArm.name)!);
      rightArm.rotateX(1.25); // Match reference image gap
      if (expression === "angry") rightArm.rotateZ(0.5); 
    }

  });

  // Apply static expressions when it changes
  useEffect(() => {
    applyExpression(morphMeshes, expression);
  }, [expression, morphMeshes]);

  return (
    <group ref={group} dispose={null} scale={scale as any} position={position as any}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/avatar/model.glb");
