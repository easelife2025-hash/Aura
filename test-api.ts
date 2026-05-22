async function testAPI() {
  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Hello" })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e: any) {
    console.error("Fetch Error:", e.message);
  }
}

testAPI();
