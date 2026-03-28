import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import { delay } from "./utils";
import { saveGeneratedFile } from "./files";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

export async function generatePoster(
  posterPrompt: string,
  logoPath?: string,
  qrCodePath?: string,
  jobId?: string
): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("No GOOGLE_AI_API_KEY set — using mock poster");
    await delay(2000);
    return saveMockPoster(posterPrompt, jobId);
  }

  try {
    const contents: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    contents.push({ text: posterPrompt });

    if (logoPath) {
      const logoData = await loadImageAsBase64(logoPath);
      if (logoData) {
        contents.push({
          text: "Use this logo prominently in the poster design:",
        });
        contents.push({
          inlineData: {
            mimeType: logoData.mimeType,
            data: logoData.data,
          },
        });
      }
    }

    if (qrCodePath) {
      const qrData = await loadImageAsBase64(qrCodePath);
      if (qrData) {
        contents.push({
          text: "Place this QR code in the bottom-right area of the poster, clearly visible and scannable:",
        });
        contents.push({
          inlineData: {
            mimeType: qrData.mimeType,
            data: qrData.data,
          },
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: contents }],
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const mimeType = part.inlineData.mimeType || "image/png";
        const ext = mimeType.includes("jpeg") ? "jpg" : "png";
        const filename = `poster-${jobId || "unknown"}.${ext}`;
        return saveGeneratedFile(buffer, filename);
      }
    }

    throw new Error("No image data in Nano Banana response");
  } catch (err) {
    console.error("Nano Banana API error, falling back to mock:", err);
    return saveMockPoster(posterPrompt, jobId);
  }
}

async function loadImageAsBase64(
  filePath: string
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".gif": "image/gif",
    };
    return {
      data: buffer.toString("base64"),
      mimeType: mimeMap[ext] || "image/png",
    };
  } catch {
    console.warn("Could not load image:", filePath);
    return null;
  }
}

async function saveMockPoster(
  posterPrompt: string,
  jobId?: string
): Promise<string> {
  const svg = buildMockPosterSVG(posterPrompt);
  const filename = `poster-${jobId || "unknown"}.svg`;
  return saveGeneratedFile(Buffer.from(svg), filename);
}

function buildMockPosterSVG(prompt: string): string {
  const title = prompt.match(/"([^"]+)"/)?.[1] || "Event";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="960" viewBox="0 0 540 960">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0014"/>
      <stop offset="50%" style="stop-color:#1a0a3e"/>
      <stop offset="100%" style="stop-color:#0a0a2e"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
  </defs>
  <rect width="540" height="960" fill="url(#bg)"/>
  <circle cx="270" cy="350" r="150" fill="#6366f1" opacity="0.15" filter="url(#blur)"/>
  <circle cx="400" cy="600" r="100" fill="#a855f7" opacity="0.1" filter="url(#blur)"/>
  <rect x="40" y="40" width="460" height="880" rx="20" fill="none" stroke="url(#glow)" stroke-width="1" opacity="0.3"/>
  <text x="270" y="280" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="#a78bfa" letter-spacing="4">PRESENTS</text>
  <text x="270" y="360" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="36" fill="white">${escapeXml(title)}</text>
  <rect x="170" y="400" width="200" height="3" rx="2" fill="url(#glow)"/>
  <text x="270" y="480" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#c4b5fd">THE FUTURE STARTS HERE</text>
  <rect x="160" y="700" width="220" height="50" rx="25" fill="url(#glow)"/>
  <text x="270" y="732" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="18" fill="white">REGISTER NOW</text>
  <!-- QR code placeholder -->
  <rect x="410" y="810" width="80" height="80" rx="8" fill="white" opacity="0.15"/>
  <text x="450" y="858" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="white" opacity="0.4">QR</text>
  <text x="270" y="920" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#64748b">Generated by LaunchLoop</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
