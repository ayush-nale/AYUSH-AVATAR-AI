"use client";
import React, { useState } from "react";
import type { AvatarState, Expression, AvatarId } from "@/types/avatar";
import VRMAvatar from "./VRMAvatar";
import TemporaryHumanAvatar from "./TemporaryHumanAvatar";
import GirlAvatar from "./GirlAvatar";
import RobotAvatar from "./RobotAvatar";
import GLBAvatar from "./GLBAvatar";

export default function AvatarRenderer({ 
  state, 
  expression, 
  lipSyncRef,
  avatarId
}: { 
  state: AvatarState; 
  expression: Expression; 
  lipSyncRef: React.MutableRefObject<number>;
  avatarId: AvatarId;
}) {
  const [vrmFailed, setVrmFailed] = useState(false);

  if (avatarId === "robot") {
    return <RobotAvatar state={state} expression={expression} lipSyncRef={lipSyncRef} />;
  }

  if (avatarId === "xalia") {
    // Currently using the ayush model as a placeholder until user uploads girl.glb
    return <GLBAvatar state={state} expression={expression} lipSyncRef={lipSyncRef} url="/avatar/girl.glb" />;
  }

  // User provided model.glb for Ayush avatar
  return <GLBAvatar state={state} expression={expression} lipSyncRef={lipSyncRef} url="/avatar/model.glb" />;

}
