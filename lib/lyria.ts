import { delay } from "./utils";
import { saveGeneratedFile } from "./files";

// TODO: Stretch goal — Replace with real Lyria API for music generation
// Lyria generates background music from text prompts.
// Expected flow:
//   1. Send musicPrompt to Lyria API
//   2. Receive audio buffer
//   3. Save and return URL

export async function generateMusic(
  musicPrompt: string,
  jobId: string
): Promise<string> {
  // TODO: Wire real Lyria API here
  // const response = await fetch("https://api.lyria.google/generate", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${process.env.LYRIA_API_KEY}` },
  //   body: JSON.stringify({ prompt: musicPrompt, duration: 15 }),
  // });
  // const audioBuffer = Buffer.from(await response.arrayBuffer());

  await delay(2500);

  const mockAudio = generateMockMusicWav(musicPrompt);
  const filename = `music-${jobId}.wav`;
  return saveGeneratedFile(mockAudio, filename);
}

function generateMockMusicWav(_prompt: string): Buffer {
  const sampleRate = 22050;
  const durationSec = 12;
  const numSamples = sampleRate * durationSec;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  const chordFreqs = [261.63, 329.63, 392.0];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(t * 2, 1) * Math.max(0, 1 - (t - durationSec + 1) * 1);
    let sample = 0;
    for (const freq of chordFreqs) {
      sample += Math.sin(2 * Math.PI * freq * t) * 1500;
    }
    sample += Math.sin(2 * Math.PI * 110 * t) * 2000 * (Math.sin(t * 4) > 0 ? 1 : 0.3);
    sample *= envelope;
    buffer.writeInt16LE(Math.round(Math.max(-32768, Math.min(32767, sample))), 44 + i * 2);
  }

  return buffer;
}
