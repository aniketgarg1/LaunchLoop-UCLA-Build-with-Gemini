import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import { delay } from "./utils";
import { saveGeneratedFile } from "./files";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

type PosterFormat = "square" | "story";

export async function generatePoster(
  posterPrompt: string,
  logoPath?: string,
  qrCodePath?: string,
  jobId?: string
): Promise<string> {
  return generatePosterVariant(posterPrompt, "square", logoPath, qrCodePath, jobId);
}

export async function generateStoryPoster(
  posterPrompt: string,
  logoPath?: string,
  qrCodePath?: string,
  jobId?: string
): Promise<string> {
  const storyPrompt = posterPrompt
    .replace(/SQUARE 1080x1080/gi, "VERTICAL 1080x1920 Instagram Story")
    .replace(/Square 1:1/gi, "Vertical 9:16")
    .replace(/square format/gi, "vertical story format")
    + " Format: vertical 9:16 portrait, 1080x1920 pixels, optimized for Instagram Stories.";
  return generatePosterVariant(storyPrompt, "story", logoPath, qrCodePath, jobId);
}

async function generatePosterVariant(
  prompt: string,
  format: PosterFormat,
  logoPath?: string,
  qrCodePath?: string,
  jobId?: string
): Promise<string> {
  const suffix = format === "story" ? "-story" : "";

  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn(`No GOOGLE_AI_API_KEY set — using mock ${format} poster`);
    await delay(2000);
    return saveMockPoster(prompt, format, jobId);
  }

  try {
    const contents: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    contents.push({ text: prompt });

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
          text: "CRITICAL: Place this EXACT QR code image in the bottom-right area of the poster. Do NOT generate, draw, or invent any additional QR code — the poster must contain ONLY this one QR code, placed exactly as-is with its pattern preserved perfectly so it stays scannable. Add a small white background padding behind it for visibility. There must be exactly ONE QR code in the final image.",
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
      model: "gemini-3.1-flash-image-preview",
      contents: [{ role: "user", parts: contents }],
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const mimeType = part.inlineData.mimeType || "image/png";
        const ext = mimeType.includes("jpeg") ? "jpg" : "png";
        const filename = `poster${suffix}-${jobId || "unknown"}.${ext}`;
        return saveGeneratedFile(buffer, filename);
      }
    }

    throw new Error(`No image data in response for ${format} poster`);
  } catch (err) {
    console.error(`Poster (${format}) API error, falling back to mock:`, err);
    return saveMockPoster(prompt, format, jobId);
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
  format: PosterFormat,
  jobId?: string
): Promise<string> {
  const suffix = format === "story" ? "-story" : "";
  const svg = format === "story"
    ? buildMockStoryPosterSVG(posterPrompt)
    : buildMockSquarePosterSVG(posterPrompt);
  const filename = `poster${suffix}-${jobId || "unknown"}.svg`;
  return saveGeneratedFile(Buffer.from(svg), filename);
}

function buildMockSquarePosterSVG(prompt: string): string {
  const title = prompt.match(/"([^"]+)"/)?.[1] || "Event";
  const dateMatch = prompt.match(/Date[^"]*"([^"]+)"/i) || prompt.match(/"([A-Z][a-z]+ \d+(?:-\d+)?[^"]*)"/);
  const dateText = dateMatch?.[1] || "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
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
      <feGaussianBlur stdDeviation="60"/>
    </filter>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <circle cx="540" cy="400" r="200" fill="#6366f1" opacity="0.12" filter="url(#blur)"/>
  <circle cx="750" cy="700" r="150" fill="#a855f7" opacity="0.08" filter="url(#blur)"/>
  <rect x="60" y="60" width="960" height="960" rx="30" fill="none" stroke="url(#glow)" stroke-width="1.5" opacity="0.25"/>
  <text x="540" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" fill="#a78bfa" letter-spacing="6">PRESENTS</text>
  <text x="540" y="440" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="56" fill="white">${escapeXml(title)}</text>
  <rect x="370" y="480" width="340" height="4" rx="2" fill="url(#glow)"/>
  ${dateText ? `<text x="540" y="560" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="28" fill="#c4b5fd">${escapeXml(dateText)}</text>` : ""}
  <text x="540" y="620" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="#c4b5fd" opacity="0.7">THE FUTURE STARTS HERE</text>
  <rect x="380" y="780" width="320" height="64" rx="32" fill="url(#glow)"/>
  <text x="540" y="822" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="24" fill="white">REGISTER NOW</text>
  <rect x="880" y="880" width="120" height="120" rx="12" fill="white" opacity="0.12"/>
  <text x="940" y="948" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="white" opacity="0.3">QR</text>
  <text x="540" y="1040" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#64748b">Generated by LaunchLoop · 1080×1080</text>
</svg>`;
}

function buildMockStoryPosterSVG(prompt: string): string {
  const title = prompt.match(/"([^"]+)"/)?.[1] || "Event";
  const dateMatch = prompt.match(/Date[^"]*"([^"]+)"/i) || prompt.match(/"([A-Z][a-z]+ \d+(?:-\d+)?[^"]*)"/);
  const dateText = dateMatch?.[1] || "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="960" viewBox="0 0 540 960">
  <defs>
    <linearGradient id="sbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0014"/>
      <stop offset="50%" style="stop-color:#1a0a3e"/>
      <stop offset="100%" style="stop-color:#0a0a2e"/>
    </linearGradient>
    <linearGradient id="sglow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
    <filter id="sblur">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
  </defs>
  <rect width="540" height="960" fill="url(#sbg)"/>
  <circle cx="270" cy="300" r="150" fill="#6366f1" opacity="0.12" filter="url(#sblur)"/>
  <circle cx="400" cy="600" r="100" fill="#a855f7" opacity="0.08" filter="url(#sblur)"/>
  <rect x="40" y="40" width="460" height="880" rx="20" fill="none" stroke="url(#sglow)" stroke-width="1" opacity="0.25"/>
  <text x="270" y="250" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#a78bfa" letter-spacing="5">PRESENTS</text>
  <text x="270" y="330" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="36" fill="white">${escapeXml(title)}</text>
  <rect x="170" y="360" width="200" height="3" rx="2" fill="url(#sglow)"/>
  ${dateText ? `<text x="270" y="420" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="20" fill="#c4b5fd">${escapeXml(dateText)}</text>` : ""}
  <text x="270" y="480" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#c4b5fd" opacity="0.7">THE FUTURE STARTS HERE</text>
  <rect x="160" y="700" width="220" height="50" rx="25" fill="url(#sglow)"/>
  <text x="270" y="732" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="18" fill="white">REGISTER NOW</text>
  <rect x="410" y="810" width="80" height="80" rx="8" fill="white" opacity="0.12"/>
  <text x="450" y="858" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="white" opacity="0.3">QR</text>
  <text x="270" y="920" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#64748b">Generated by LaunchLoop · Story</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
