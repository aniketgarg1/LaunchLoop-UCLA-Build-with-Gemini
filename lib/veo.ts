import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import { delay, buildDateLine } from "./utils";
import { saveGeneratedFile, getGeneratedDir, getGeneratedUrl, ensureDirs } from "./files";
import type { ScenePlan, BriefInput } from "./types";

const execFileAsync = promisify(execFile);
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

export async function generateBaseReel(
  scenes: ScenePlan[],
  jobId: string,
  brief: BriefInput,
  voiceoverScript?: string
): Promise<string> {
  const dateLine = buildDateLine(brief);

  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("No GOOGLE_AI_API_KEY set — using mock reel");
    await delay(1500);
    return saveMockReel(scenes, jobId, dateLine, voiceoverScript);
  }

  try {
    await ensureDirs();
    const scriptParts = splitScript(voiceoverScript || "", scenes.length);

    const generateClip = async (scene: ScenePlan): Promise<string | null> => {
      console.log(`Veo scene ${scene.id}/${scenes.length}: generating (parallel)...`);

      const scriptLine = scriptParts[scene.id - 1] || "";
      const isLast = scene.id === scenes.length;

      const fullPrompt = `LIVE-ACTION footage only. Real human beings, real locations, photorealistic cinematic. NEVER animated/3D/cartoon.

TEXT OVERLAYS: "${brief.eventName}" · "${dateLine}"${scriptLine ? ` · "${scriptLine}"` : ""}${isLast ? ` · "${brief.cta}"` : ""}

${scene.prompt}`;

      try {
        let operation = await ai.models.generateVideos({
          model: "veo-3.1-generate-preview",
          prompt: fullPrompt,
          config: {
            aspectRatio: "9:16",
            personGeneration: "allow_all",
            durationSeconds: 8,
          },
        });

        const maxPolls = 40;
        let polls = 0;
        while (!operation.done && polls < maxPolls) {
          await delay(5000);
          operation = await ai.operations.getVideosOperation({ operation });
          polls++;
        }

        if (!operation.done) {
          console.warn(`Veo scene ${scene.id} timed out after ${polls} polls`);
          return null;
        }

        const generatedVideo = operation.response?.generatedVideos?.[0]?.video;
        if (!generatedVideo) {
          console.warn(
            `No video in Veo response for scene ${scene.id}. Response:`,
            JSON.stringify(operation.response, null, 2)
          );
          return null;
        }

        const clipFilename = `clip-${jobId}-s${scene.id}.mp4`;
        const clipPath = path.join(getGeneratedDir(), clipFilename);
        await ai.files.download({ file: generatedVideo, downloadPath: clipPath });
        console.log(`Veo scene ${scene.id} complete: ${clipFilename}`);
        return clipPath;
      } catch (sceneErr) {
        console.warn(`Veo scene ${scene.id} failed:`, sceneErr);
        return null;
      }
    };

    const results = await Promise.all(scenes.map(generateClip));
    const clipPaths = results.filter((p): p is string => p !== null);

    if (clipPaths.length === 0) {
      console.warn("All Veo scenes failed, falling back to mock");
      return saveMockReel(scenes, jobId, dateLine, voiceoverScript);
    }

    const filename = `reel-base-${jobId}.mp4`;

    if (clipPaths.length === 1) {
      const dest = path.join(getGeneratedDir(), filename);
      await fs.rename(clipPaths[0], dest);
    } else {
      const finalPath = path.join(getGeneratedDir(), filename);
      await concatenateClips(clipPaths, finalPath);
      for (const p of clipPaths) await fs.unlink(p).catch(() => {});
    }

    return getGeneratedUrl(filename);
  } catch (err) {
    console.error("Veo error, falling back to mock:", err);
    return saveMockReel(scenes, jobId, dateLine, voiceoverScript);
  }
}

function splitScript(script: string, numParts: number): string[] {
  if (!script) return Array(numParts).fill("");
  const sentences = script.match(/[^.!?]+[.!?]+/g) || [script];
  const parts: string[] = Array(numParts).fill("");
  const perPart = Math.ceil(sentences.length / numParts);
  for (let i = 0; i < numParts; i++) {
    parts[i] = sentences.slice(i * perPart, (i + 1) * perPart).join(" ").trim();
  }
  return parts;
}

async function concatenateClips(clipPaths: string[], outputPath: string): Promise<void> {
  const listContent = clipPaths.map((p) => `file '${p}'`).join("\n");
  const listFile = outputPath + ".txt";
  await fs.writeFile(listFile, listContent);
  try {
    await execFileAsync("ffmpeg", [
      "-y", "-f", "concat", "-safe", "0",
      "-i", listFile, "-c", "copy", outputPath,
    ]);
  } finally {
    await fs.unlink(listFile).catch(() => {});
  }
}

export async function mergeVideoAudio(
  videoPath: string,
  audioPath: string,
  outputPath: string
): Promise<void> {
  await execFileAsync("ffmpeg", [
    "-y",
    "-i", videoPath,
    "-i", audioPath,
    "-c:v", "copy",
    "-c:a", "aac",
    "-shortest",
    outputPath,
  ]);
}

export async function mergeVideoWithMixedAudio(
  videoPath: string,
  voicePath: string,
  musicPath: string,
  outputPath: string,
  musicVolume = 0.25
): Promise<void> {
  await execFileAsync("ffmpeg", [
    "-y",
    "-i", videoPath,
    "-i", voicePath,
    "-i", musicPath,
    "-filter_complex",
    `[2:a]volume=${musicVolume}[bg];[1:a][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]`,
    "-map", "0:v",
    "-map", "[aout]",
    "-c:v", "copy",
    "-c:a", "aac",
    "-shortest",
    outputPath,
  ]);
}

export async function overlayQrOnVideo(
  videoPath: string,
  qrImagePath: string,
  outputPath: string
): Promise<void> {
  const durationStr = await getVideoDuration(videoPath);
  const duration = parseFloat(durationStr) || 16;
  const showFrom = Math.max(0, duration - 5);

  await execFileAsync("ffmpeg", [
    "-y",
    "-i", videoPath,
    "-i", qrImagePath,
    "-filter_complex",
    [
      "[1:v]scale=160:160,format=rgba[qr]",
      `[0:v][qr]overlay=(W-w)/2:H-h-180:enable='between(t,${showFrom},${duration})'[vout]`,
    ].join(";"),
    "-map", "[vout]",
    "-map", "0:a?",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "23",
    "-c:a", "copy",
    outputPath,
  ]);
}

async function getVideoDuration(videoPath: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ]);
    return stdout.trim();
  } catch {
    return "16";
  }
}

async function saveMockReel(
  scenes: ScenePlan[],
  jobId: string,
  dateLine: string,
  voiceoverScript?: string
): Promise<string> {
  const svg = buildMockReelSVG(scenes, dateLine, voiceoverScript);
  const filename = `reel-base-${jobId}.svg`;
  return saveGeneratedFile(Buffer.from(svg), filename);
}

function buildMockReelSVG(scenes: ScenePlan[], dateLine: string, voiceoverScript?: string): string {
  const totalDuration = scenes.reduce((s, sc) => s + sc.durationSec, 0);
  const scriptPreview = voiceoverScript
    ? escapeXml(voiceoverScript.slice(0, 90)) + "..."
    : "";

  const startY = 180;
  const rowH = 80;

  const sceneLabels = scenes
    .map(
      (s, i) =>
        `<text x="180" y="${startY + i * rowH}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="14" fill="#6366f1">Scene ${s.id}: ${escapeXml(s.title)}</text>
    <text x="180" y="${startY + 20 + i * rowH}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#a78bfa">${s.durationSec}s — live-action</text>
    <rect x="80" y="${startY + 30 + i * rowH}" width="200" height="2" rx="1" fill="#6366f1" opacity="0.2"/>`
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
  <polygon points="160,290 160,350 210,320" fill="#6366f1" opacity="0.4"/>
  <text x="180" y="60" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="20" fill="white">PROMO REEL</text>
  <text x="180" y="85" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#a78bfa">${escapeXml(dateLine)}</text>
  <text x="180" y="115" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="white" opacity="0.4">${scenes.length} scenes · ${totalDuration}s total</text>
  ${scriptPreview ? `<text x="180" y="145" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#a78bfa" opacity="0.5">"${scriptPreview}"</text>` : ""}
  ${sceneLabels}
  <text x="180" y="580" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="white" opacity="0.3">Voiceover + music merged via FFmpeg</text>
  <text x="180" y="610" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#475569">Veo 3.1 · ${scenes.length} × 8s clips</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
