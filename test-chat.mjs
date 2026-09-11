import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

async function test() {
  console.log("Signing in...");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  });
  if (error) {
    console.error("Login failed:", error.message);
    return;
  }
  
  const token = data.session.access_token;
  console.log("Logged in. Testing chat API...");
  
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      conversationId: '00000000-0000-0000-0000-000000000000',
      message: 'Hello'
    })
  });
  
  console.log("Status:", res.status);
  const reader = res.body;
  reader.on('data', chunk => {
    console.log("CHUNK:", chunk.toString());
  });
}
test();
