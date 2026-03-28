import { GoogleGenAI } from "@google/genai";
import { delay } from "./utils";
import { saveGeneratedFile } from "./files";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

export async function generateVoiceover(
  script: string,
  jobId: string
): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("No GOOGLE_AI_API_KEY set — using mock voiceover");
    await delay(1800);
    return saveMockVoiceover(jobId);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [
            {
              text: `Read the following promo script in an energetic, confident, professional voice suitable for an event trailer:\n\n${script}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
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
