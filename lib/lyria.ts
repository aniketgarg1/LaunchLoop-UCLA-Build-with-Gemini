import { GoogleGenAI } from "@google/genai";
import { delay } from "./utils";
import { saveGeneratedFile } from "./files";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

export async function generateMusic(
  musicPrompt: string,
  jobId: string
): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("No GOOGLE_AI_API_KEY — using mock music");
    await delay(2500);
    return saveMockMusic(jobId);
  }

  try {
    console.log("Lyria 3 Clip: generating music...");
    const response = await ai.models.generateContent({
      model: "lyria-3-clip-preview",
      contents: musicPrompt,
      config: {
        responseModalities: ["AUDIO"],
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    );

    if (!audioPart?.inlineData?.data) {
      throw new Error("No audio data in Lyria response");
    }

    const audioBuffer = Buffer.from(audioPart.inlineData.data, "base64");
    const filename = `music-${jobId}.mp3`;
    console.log("Lyria 3 Clip: music generated successfully");
    return saveGeneratedFile(audioBuffer, filename);
  } catch (err) {
    console.error("Lyria 3 error, falling back to mock:", err);
    return saveMockMusic(jobId);
  }
}

async function saveMockMusic(jobId: string): Promise<string> {
  const sampleRate = 22050;
  const durationSec = 16;
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

  const filename = `music-${jobId}.wav`;
  return saveGeneratedFile(buffer, filename);
}
