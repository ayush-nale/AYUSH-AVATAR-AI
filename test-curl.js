async function run() {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId: '11111111-1111-1111-1111-111111111111', message: 'hello' })
  });
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}
run();
