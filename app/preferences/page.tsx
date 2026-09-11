import Link from "next/link";

export default function PreferencesPage() {
  return (
    <main className="shell" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",padding:"48px 24px"}}>
      <h1 style={{fontSize:"32px",fontWeight:800,marginBottom:"16px",color:"var(--text)"}}>Preferences</h1>
      <div className="glass shadow" style={{padding:"32px",borderRadius:"16px",width:"100%",maxWidth:"600px",textAlign:"center"}}>
        <p style={{color:"var(--text-dim)",marginBottom:"24px"}}>User preferences and configurations are currently under development.</p>
        <Link href="/dashboard" className="focus-ring" style={{display:"inline-block",padding:"12px 24px",borderRadius:"999px",background:"var(--accent)",color:"#071018",fontWeight:700,textDecoration:"none"}}>
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
