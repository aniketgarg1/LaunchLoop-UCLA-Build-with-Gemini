import type { BriefInput } from "./types";

export function buildPlannerPrompt(brief: BriefInput): string {
  const hasQr = !!brief.qrCodePath;
  const dateStr = brief.eventDate || "TBA";
  const timeStr = brief.eventTime || "";
  const dateTimeLine = timeStr ? `${dateStr} at ${timeStr}` : dateStr;

  return `You are a creative director for event marketing. Given the following event brief, generate a structured creative plan for a short social media promo kit.

EVENT BRIEF:
- Event name: ${brief.eventName}
- Target audience: ${brief.audience}
- Vibe/tone: ${brief.vibe}
- Call to action: ${brief.cta}
- Description: ${brief.description || "N/A"}
- Date & time: ${dateTimeLine}
- QR code provided: ${hasQr ? "Yes — include a QR code in the poster and final video scene" : "No"}

OUTPUT REQUIREMENTS:
Return ONLY valid JSON with this exact structure — no markdown, no explanation, no wrapping:

{
  "title": "a punchy event title (can differ from event name)",
  "tagline": "a short catchy tagline under 10 words",
  "visualStyle": "a 1-sentence description of visual aesthetic — must specify live-action, photorealistic, real-human style (NOT animated or 3D)",
  "posterPrompt": "a detailed image generation prompt for a portrait event poster — must include event name, date '${dateTimeLine}', audience info, CTA text, and ${hasQr ? "a QR code in the bottom corner" : "registration details"}",
  "voiceoverScript": "a narration script under 45 words for a 10-15 second promo reel — mention the date '${dateTimeLine}'",
  "musicPrompt": "a detailed description of background music — specify genre, tempo (BPM), mood, instruments, and energy arc (e.g. 'builds from ambient to driving')",
  "scenes": [
    {
      "id": 1,
      "title": "short scene title",
      "prompt": "detailed LIVE-ACTION video prompt with REAL PEOPLE — cinematic, photorealistic. Include text overlay with event name and date '${dateTimeLine}'",
      "durationSec": 4
    },
    {
      "id": 2,
      "title": "short scene title",
      "prompt": "detailed LIVE-ACTION video prompt with REAL PEOPLE — show real humans engaged in activity. Include text overlay with key event details and audience",
      "durationSec": 5
    },
    {
      "id": 3,
      "title": "short scene title",
      "prompt": "detailed LIVE-ACTION video prompt — end with bold CTA '${brief.cta}' as on-screen text${hasQr ? " and a visible QR code" : ""}, cinematic finale with real people",
      "durationSec": 4
    }
  ]
}

RULES:
- Exactly 3 scenes
- Each scene duration must be 4 or 5 seconds
- Voiceover script must be under 45 words and mention the date
- ALL scene prompts must specify LIVE-ACTION, PHOTOREALISTIC, REAL HUMANS — never animated, cartoon, or 3D rendered
- Scene prompts should describe real people in real environments (conference rooms, campuses, stages, co-working spaces)
- Scene prompts MUST include visible text overlays with event information
- Scene 1: introduce the event with title + date as on-screen text, real people in an exciting environment
- Scene 2: show real people collaborating/building/competing with key details as text overlays
- Scene 3: strong CTA ending with "${brief.cta}" as large text${hasQr ? " and a QR code visible in frame" : ""}, real crowd or team celebration
- Poster must include the date "${dateTimeLine}" prominently
- Music prompt should describe a specific genre, tempo, mood, and energy arc suitable for a promo
- Output valid JSON ONLY`;
}
