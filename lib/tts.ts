import { GoogleGenAI } from "@google/genai";
import { delay } from "./utils";
import { saveGeneratedFile } from "./files";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

const VOICE_MAP: Record<string, { voice: string; style: string }> = {
  energetic:    { voice: "Puck",      style: "an upbeat, high-energy, enthusiastic" },
  professional: { voice: "Charon",    style: "a polished, authoritative, professional" },
  chill:        { voice: "Aoede",     style: "a calm, relaxed, breezy" },
  playful:      { voice: "Fenrir",    style: "an excitable, fun, animated" },
  bold:         { voice: "Alnilam",   style: "a bold, commanding, firm" },
  inspiring:    { voice: "Sadachbia", style: "a lively, inspiring, motivational" },
  warm:         { voice: "Sulafat",   style: "a warm, inviting, friendly" },
  techy:        { voice: "Zephyr",    style: "a bright, modern, tech-forward" },
  luxury:       { voice: "Algieba",   style: "a smooth, refined, sophisticated" },
  casual:       { voice: "Zubenelgenubi", style: "a casual, approachable, conversational" },
};

function pickVoice(vibe: string): { voice: string; style: string } {
  const key = vibe.toLowerCase().trim();
  if (VOICE_MAP[key]) return VOICE_MAP[key];
  for (const [k, v] of Object.entries(VOICE_MAP)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return { voice: "Puck", style: "an upbeat, confident, professional" };
}

export async function generateVoiceover(
  script: string,
  jobId: string,
  vibe = "energetic"
): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("No GOOGLE_AI_API_KEY set — using mock voiceover");
    await delay(1800);
    return saveMockVoiceover(jobId);
  }

  const { voice, style } = pickVoice(vibe);
  console.log(`TTS: using voice "${voice}" (${style}) for vibe "${vibe}"`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [
            {
              text: `Read the following promo script in ${style} voice suitable for an event trailer. IMPORTANT: Speak at a brisk but clear pace so the entire script finishes well within 14 seconds — do NOT speak slowly. Leave a brief pause at the start and end:\n\n${script}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const audioData =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      throw new Error("No audio data in TTS response");
    }

    const pcmBuffer = Buffer.from(audioData, "base64");
    const wavBuffer = wrapPcmInWav(pcmBuffer, 24000, 1, 16);

    const filename = `voice-${jobId}.wav`;
    return saveGeneratedFile(wavBuffer, filename);
  } catch (err) {
    console.error("Gemini TTS error, falling back to mock:", err);
    return saveMockVoiceover(jobId);
  }
}

function wrapPcmInWav(
  pcm: Buffer,
  sampleRate: number,
  channels: number,
  bitDepth: number
): Buffer {
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;
  const dataSize = pcm.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcm]);
}

async function saveMockVoiceover(jobId: string): Promise<string> {
  const mockAudio = generateMockAudioWav();
  const filename = `voice-${jobId}.wav`;
  return saveGeneratedFile(mockAudio, filename);
}

function generateMockAudioWav(): Buffer {
  const sampleRate = 22050;
  const durationSec = 8;
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

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 220 + Math.sin(t * 2) * 50;
    const envelope =
      Math.min(t * 4, 1) * Math.max(0, 1 - (t - durationSec + 0.5) * 2);
    const raw = Math.sin(2 * Math.PI * freq * t) * 3000 * envelope;
    const clamped = Math.max(-32768, Math.min(32767, Math.round(raw)));
    buffer.writeInt16LE(clamped, 44 + i * 2);
  }

  return buffer;
}
