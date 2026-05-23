async function getVoices() {
  const res = await fetch('https://api.elevenlabs.io/v1/voices');
  const data = await res.json();
  data.voices.slice(0, 10).forEach(v => console.log(v.name, v.voice_id));
}
getVoices();
