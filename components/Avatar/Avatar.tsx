"use client";
import dynamic from "next/dynamic";
import type { AvatarState, Expression, AvatarId } from "@/types/avatar";
import { MutableRefObject } from "react";
const AvatarCanvas=dynamic(()=>import("./AvatarCanvas"),{ssr:false,loading:()=> <div style={{display:"grid",placeItems:"center",width:"100%",color:"var(--muted)"}}>Loading avatar…</div>});
export default function Avatar({state,expression,lipSyncRef,avatarId}:{state:AvatarState;expression:Expression;lipSyncRef:MutableRefObject<number>;avatarId:AvatarId}){return <div style={{width:"100%",maxWidth:700,height:"100%",minHeight:300}}><AvatarCanvas state={state} expression={expression} lipSyncRef={lipSyncRef} avatarId={avatarId}/></div>}
