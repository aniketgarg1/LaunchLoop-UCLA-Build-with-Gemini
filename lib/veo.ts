import { GoogleGenAI } from "@google/genai";
import path from "path";
import { delay } from "./utils";
import { saveGeneratedFile, getGeneratedDir, getGeneratedUrl, ensureDirs } from "./files";
import type { ScenePlan } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

export async function generateReel(
  scenes: ScenePlan[],
  jobId: string,
  eventInfo?: { eventName: string; cta: string; hasQr: boolean }
): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("No GOOGLE_AI_API_KEY set — using mock reel");
    await delay(3000);
    return saveMockReel(scenes, jobId);
  }

  try {
    const combinedPrompt = scenes
      .map(
        (s) =>
          `[Scene ${s.id} - ${s.title}, ${s.durationSec}s]: ${s.prompt}`
      )
      .join("\n");

    const infoOverlay = eventInfo
      ? ` The video should feature text overlays showing "${eventInfo.eventName}" and "${eventInfo.cta}".${eventInfo.hasQr ? " The final scene should include a QR code graphic visible on screen." : ""}`
      : "";

    const fullPrompt = `Create a short vertical promo reel. CRITICAL STYLE: Live-action, photorealistic, real humans, cinematic camera work. NOT animated, NOT 3D, NOT cartoon. Real people in real environments.${infoOverlay}\n\n${combinedPrompt}`;

    let operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: fullPrompt,
      config: {
        aspectRatio: "9:16",
      },
    });

    const maxPolls = 60;
    let polls = 0;
    while (!operation.done && polls < maxPolls) {
      console.log(`Veo: polling video generation (${polls + 1}/${maxPolls})...`);
      await delay(10000);
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
      polls++;
    }

    if (!operation.done) {
      throw new Error("Veo video generation timed out");
    }

    const generatedVideo =
      operation.response?.generatedVideos?.[0]?.video;

    if (!generatedVideo) {
      throw new Error("No video in Veo response");
    }

    const filename = `reel-${jobId}.mp4`;
    await ensureDirs();
    const outputPath = path.join(getGeneratedDir(), filename);

    await ai.files.download({
      file: generatedVideo,
      downloadPath: outputPath,
    });

    return getGeneratedUrl(filename);
  } catch (err) {
    console.error("Veo API error, falling back to mock:", err);
    return saveMockReel(scenes, jobId);
  }
}

async function saveMockReel(
  scenes: ScenePlan[],
  jobId: string
): Promise<string> {
  const svg = buildMockReelSVG(scenes);
  const filename = `reel-${jobId}.svg`;
  return saveGeneratedFile(Buffer.from(svg), filename);
}

function buildMockReelSVG(scenes: ScenePlan[]): string {
  const sceneLabels = scenes
    .map(
      (s, i) =>
        `<text x="180" y="${200 + i * 120}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#a78bfa">Scene ${s.id}: ${escapeXml(s.title)}</text>
    <text x="180" y="${225 + i * 120}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#64748b">${s.durationSec}s</text>
    <rect x="60" y="${240 + i * 120}" width="240" height="2" rx="1" fill="#6366f1" opacity="0.3"/>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640">
  <defs>
    <linearGradient id="vbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0014"/>
      <stop offset="100%" style="stop-color:#1a0a3e"/>
    </linearGradient>
    <filter id="vblur"><feGaussianBlur stdDeviation="30"/></filter>
  </defs>
  <rect width="360" height="640" fill="url(#vbg)"/>
  <circle cx="180" cy="320" r="120" fill="#6366f1" opacity="0.1" filter="url(#vblur)"/>
  <text x="180" y="100" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="20" fill="white">PROMO REEL</text>
  <text x="180" y="130" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#6366f1">▶ Mock Preview</text>
  ${sceneLabels}
  <text x="180" y="600" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#475569">Video generation via Veo — coming soon</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
