"use client";
import { useFrame } from "@react-three/fiber";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { useEffect, useRef, useState, MutableRefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { AvatarState, Expression } from "@/types/avatar";

export default function VRMAvatar({ 
  state, 
  expression, 
  lipSyncRef, 
  url,
  onLoad,
  onFail
}: { 
  state: AvatarState; 
  expression: Expression; 
  lipSyncRef: MutableRefObject<number>;
  url: string;
  onLoad?: () => void;
  onFail?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [vrm, setVrm] = useState<any>(null);
  const blinkState = useRef<{ value: number, target: number, timer: number }>({ value: 0, target: 0, timer: 0 });
  
  useEffect(() => {
    let disposed = false;
    const loader = new GLTFLoader();
    loader.register((parser: any) => new VRMLoaderPlugin(parser));
    loader.load(url, (gltf: any) => {
      if (disposed) return;
      const model = gltf.userData.vrm;
      if (!model) {
        console.error("The loaded GLTF file does not contain a VRM extension.");
        onFail?.();
        return;
      }
      try {
        VRMUtils.removeUnnecessaryVertices(model.scene);
        VRMUtils.combineSkeletons(model.scene);
      } catch (e) {
        console.warn("Failed to optimize VRM:", e);
      }
      model.scene.rotation.y = Math.PI;
      setVrm(model);
      onLoad?.();
    }, undefined, () => {
      if (!disposed) onFail?.();
    });
    return () => { disposed = true };
  }, [url, onLoad, onFail]);
  
  useFrame((_, delta) => {
    if (!vrm) return;
    vrm.update(delta);
    const t = performance.now() / 1000;
    if (group.current) {
      let targetRotY = 0.03 * Math.sin(t * .45);
      let targetRotX = 0.015 * Math.sin(t * .31);
      
      if (state === "speaking") {
         targetRotX -= 0.02 + Math.sin(t * 6) * 0.015; // Nodding while speaking
      }
      
      group.current.rotation.y += (targetRotY - group.current.rotation.y) * delta * 4;
      group.current.rotation.x += (targetRotX - group.current.rotation.x) * delta * 4;
      group.current.position.y = 0.02 * Math.sin(t * .8);
    }
    
    // Randomized Blink Logic
    blinkState.current.timer -= delta;
    if (blinkState.current.timer <= 0) {
      if (blinkState.current.target === 0) {
        blinkState.current.target = 1;
        blinkState.current.timer = 0.1; // Hold blink
      } else {
        blinkState.current.target = 0;
        blinkState.current.timer = 2 + Math.random() * 4; // 2-6s between blinks
      }
    }
    blinkState.current.value += (blinkState.current.target - blinkState.current.value) * delta * 15;
    
    const m = vrm.expressionManager;
    if (m) {
      // Reset all
      ['happy','sad','angry','surprised','neutral','blink','aa','ih','ou','ee','oh'].forEach(n => m.setValue(n, 0));
      
      // Semantic Mapping
      if (expression === 'happy') m.setValue('happy', 1);
      else if (expression === 'sad') m.setValue('sad', 1);
      else if (expression === 'angry') m.setValue('angry', 1);
      else if (expression === 'surprised') m.setValue('surprised', 1);
      else if (expression === 'thinking' || expression === 'confused' || expression === 'neutral') m.setValue('neutral', 1);
      
      // Apply blink and lip sync
      m.setValue('blink', blinkState.current.value);
      m.setValue('aa', state === "speaking" ? (lipSyncRef?.current || 0) : 0);
    }
  });
  
  return vrm ? <primitive ref={group} object={vrm.scene} /> : null;
}
