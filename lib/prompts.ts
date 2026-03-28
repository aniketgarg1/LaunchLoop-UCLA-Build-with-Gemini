import type { BriefInput } from "./types";
import { buildDateLine } from "./utils";

export function buildPlannerPrompt(brief: BriefInput): string {
  const hasQr = !!brief.qrCodePath;
  const dateLine = buildDateLine(brief);

  return `You are a creative director for event marketing. Given the following event brief, generate a structured creative plan for a 16-SECOND social media promo video kit.

EVENT BRIEF:
- Event name: ${brief.eventName}
- Target audience: ${brief.audience}
- Vibe/tone: ${brief.vibe}
- Call to action: ${brief.cta}
- Description: ${brief.description || "N/A"}
- Date: ${dateLine}
- QR code provided: ${hasQr ? "Yes — a real QR will be composited separately, do NOT draw any QR in your poster design" : "No"}

OUTPUT REQUIREMENTS:
Return ONLY valid JSON with this exact structure — no markdown, no explanation, no wrapping:

{
  "title": "a punchy event title (can differ from event name)",
  "tagline": "a short catchy tagline under 10 words",
  "visualStyle": "a 1-sentence description of visual aesthetic for VIDEO — must specify live-action, photorealistic, real-human style (NOT animated or 3D)",
  "posterPrompt": "a detailed image generation prompt for a SQUARE 1080x1080 event poster — bold graphic design, professional layout, modern typography, strong color palette, ${brief.vibe} aesthetic. Must include event name, date '${dateLine}' (written in this exact human-readable format), audience info, CTA text. Do NOT include any QR code in the design — a real QR code will be added separately. This is a DESIGNED POSTER (not a photograph). Square format 1:1 ratio.",
  "voiceoverScript": "a narration script of 25-32 words for a 14-second promo video — punchy, fast-paced, builds excitement, mentions date '${dateLine}', addresses ${brief.audience}, ends with CTA '${brief.cta}'",
  "musicPrompt": "a detailed description of 16-second background music — specify genre, tempo (BPM), mood, instruments, and energy arc. Will be mixed behind voiceover narration.",
  "scenes": [
    { "id": 1, "title": "short title", "prompt": "LIVE-ACTION 8-second clip: cinematic hook, dramatic establishing shot, introduce the event. Text overlay: event name + date '${dateLine}'. ${brief.vibe} energy. Photorealistic, cinematic. 9:16 vertical.", "durationSec": 8 },
    { "id": 2, "title": "short title", "prompt": "LIVE-ACTION 8-second clip: energy builds, bold CTA '${brief.cta}' + date '${dateLine}'. Real ${brief.audience} in action, celebrating, high-fiving. Photorealistic, cinematic. 9:16 vertical.", "durationSec": 8 }
  ]
}

RULES:
- Exactly 2 scenes, each 8 seconds, total 16 seconds
- Voiceover script must be 25-32 words — short and punchy to finish within 14 seconds
- ALL dates MUST use the human-readable format "${dateLine}" — NEVER raw ISO format
- ALL scene prompts MUST specify LIVE-ACTION, PHOTOREALISTIC, REAL HUMANS — never animated, cartoon, or 3D
- Poster prompt must describe a SQUARE 1080x1080 DESIGNED POSTER — NOT a photograph
- Output valid JSON ONLY`;
}
