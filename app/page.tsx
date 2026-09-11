import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  return <main className="shell" style={{display:"grid",placeItems:"center",padding:24}}>
    <section className="glass shadow" style={{maxWidth:900,width:"100%",borderRadius:32,padding:"56px 36px",textAlign:"center"}}>
      <div style={{fontSize:13,letterSpacing:4,textTransform:"uppercase",color:"var(--accent)",fontWeight:700}}>PERSONAL DIGITAL AI</div>
      <h1 style={{fontSize:"clamp(48px,9vw,100px)",lineHeight:.95,margin:"18px 0"}} className="gradient-text">AI AYUSH</h1>
      <p style={{fontSize:"clamp(17px,2.5vw,22px)",color:"var(--muted)",maxWidth:700,margin:"0 auto 30px"}}>Your AI brain, conversation memory, voice and chest-up digital avatar — in one private web app.</p>
      <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
        <Link className="focus-ring" href={signedIn?"/dashboard":"/auth/login"} style={{padding:"13px 20px",borderRadius:999,background:"var(--accent)",color:"#071018",fontWeight:800,textDecoration:"none"}}>{signedIn?"Open AI Ayush":"Enter AI Ayush"}</Link>
        {!signedIn && <Link className="focus-ring" href="/auth/sign-up" style={{padding:"13px 20px",borderRadius:999,border:"1px solid var(--line)",color:"var(--text)",fontWeight:700,textDecoration:"none"}}>Create account</Link>}
      </div>
      <div style={{marginTop:40,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,textAlign:"left"}}>
        {["Secure Supabase Auth","Persistent chat + memory","Voice + 3D avatar","Mobile + desktop ready"].map((x)=><div key={x} className="glass" style={{padding:16,borderRadius:18,color:"var(--muted)"}}>✓ {x}</div>)}
      </div>
    </section>
  </main>;
}
