"use client";
import React, { Suspense, MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import type { AvatarState, Expression, AvatarId } from "@/types/avatar";
import AvatarRenderer from "./AvatarRenderer";

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error("AvatarCanvas Error:", error); }
  render() { if (this.state.hasError) return <div style={{width:"100%",height:"100%",display:"grid",placeItems:"center",color:"var(--danger)"}}>Avatar System Error</div>; return this.props.children; }
}

export default function AvatarCanvas({ state, expression, lipSyncRef, avatarId }: { state: AvatarState; expression: Expression; lipSyncRef: MutableRefObject<number>; avatarId: AvatarId }) {
  return (
    <CanvasErrorBoundary>
      <Canvas camera={{ position: [0, 1.35, 1.8], fov: 35 }} dpr={[1, 2]}>
        <ambientLight intensity={1.5} color="#ffffff" />
        {/* Soft front key light */}
        <directionalLight position={[0, 2, 4]} intensity={2.5} color="#ffffff" />
        {/* Strong purple rim light from right/back */}
        <spotLight position={[4, 3, -2]} intensity={4} color="#a855f7" distance={15} angle={0.6} penumbra={0.8} />
        {/* Fill light from left */}
        <spotLight position={[-4, 1, 3]} intensity={2} color="#4c1d95" distance={10} angle={0.8} penumbra={1} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <AvatarRenderer state={state} expression={expression} lipSyncRef={lipSyncRef} avatarId={avatarId} />
        </Suspense>
        <OrbitControls target={[0, 1.35, 0]} enablePan={false} enableZoom={false} minAzimuthAngle={-0.2} maxAzimuthAngle={0.2} minPolarAngle={Math.PI / 2.3} maxPolarAngle={Math.PI / 2.0} />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
