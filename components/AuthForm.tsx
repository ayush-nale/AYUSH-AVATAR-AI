"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({mode}:{mode:"login"|"signup"|"forgot"}){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState(""); const [loading,setLoading]=useState(false); const [message,setMessage]=useState(""); const router=useRouter();
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setMessage("");const supabase=createClient();try{
  if(mode==="login"){const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;router.replace("/dashboard");router.refresh();}
  else if(mode==="signup"){const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name||"Ayush"},emailRedirectTo:`${window.location.origin}/auth/callback`}});if(error)throw error;setMessage(data.session?"Account created.":"Account created. Check your email to verify it.");}
  else {const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/reset-password`});if(error)throw error;setMessage("Password reset email sent.");}
 }catch(err){setMessage(err instanceof Error?err.message:"Something went wrong.")}finally{setLoading(false)}};
 const title=mode==="login"?"Welcome back":mode==="signup"?"Create AI Ayush":"Reset password";
 return <main className="shell" style={{display:"grid",placeItems:"center",padding:20}}><div className="glass shadow" style={{width:"min(460px,100%)",padding:28,borderRadius:28}}>
  <div style={{fontSize:12,letterSpacing:3,color:"var(--accent)",fontWeight:800}}>AI AYUSH</div><h1 style={{margin:"8px 0 6px",fontSize:32}}>{title}</h1><p style={{color:"var(--muted)",marginTop:0}}>{mode==="login"?"Sign in to your private AI workspace.":mode==="signup"?"Your conversations and memories stay tied to your account.":"Enter your email and we’ll send a reset link."}</p>
  <form onSubmit={submit} style={{display:"grid",gap:14}}>
   {mode==="signup"&&<label>Display name<input className="focus-ring" value={name} onChange={e=>setName(e.target.value)} placeholder="Ayush" style={field}/></label>}
   <label>Email<input className="focus-ring" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={field}/></label>
   {mode!=="forgot"&&<label>Password<input className="focus-ring" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" style={field}/></label>}
   <button className="focus-ring" disabled={loading} style={{...primary,opacity:loading?.7:1}}>{loading?"Please wait…":mode==="login"?"Sign in":mode==="signup"?"Create account":"Send reset link"}</button>
   {message&&<div role="status" style={{padding:12,borderRadius:14,background:"rgba(125,211,252,.08)",color:"var(--muted)"}}>{message}</div>}
  </form>
  <div style={{marginTop:18,color:"var(--muted)",fontSize:14,display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
   {mode==="login"?<><Link href="/auth/forgot-password" style={link}>Forgot password?</Link><Link href="/auth/sign-up" style={link}>Create account</Link></>:mode==="signup"?<Link href="/auth/login" style={link}>Already have an account?</Link>:<Link href="/auth/login" style={link}>Back to login</Link>}
  </div>
 </div></main>
}
const field={width:"100%",marginTop:6,padding:"12px 14px",borderRadius:14,border:"1px solid var(--line)",background:"#08131c",color:"var(--text)"} as const;
const primary={padding:"12px 16px",borderRadius:14,border:0,background:"var(--accent)",color:"#071018",fontWeight:800} as const;
const link={color:"var(--accent)",textDecoration:"none"};
