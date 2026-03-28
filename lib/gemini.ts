import { GoogleGenAI } from "@google/genai";
import type { BriefInput, CreativePlan } from "./types";
import { buildPlannerPrompt } from "./prompts";
import { delay } from "./utils";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

export async function generateCreativePlan(
  brief: BriefInput
): Promise<CreativePlan> {
  const prompt = buildPlannerPrompt(brief);

  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("No GOOGLE_AI_API_KEY set — using mock plan");
    await delay(1500);
    return generateMockPlan(brief);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const plan = JSON.parse(jsonMatch[0]) as CreativePlan;

    if (!plan.title || !plan.scenes || plan.scenes.length !== 3) {
      throw new Error("Invalid plan structure from Gemini");
    }

    return plan;
  } catch (err) {
    console.error("Gemini API error, falling back to mock:", err);
    return generateMockPlan(brief);
  }
}

function generateMockPlan(brief: BriefInput): CreativePlan {
  const dateStr = brief.eventDate || "TBA";
  const timeStr = brief.eventTime || "";
  const dateTimeLine = timeStr ? `${dateStr} at ${timeStr}` : dateStr;

  return {
    title: brief.eventName,
    tagline: `Where ${brief.vibe} meets innovation`,
    visualStyle: `Live-action photorealistic cinematography with ${brief.vibe} energy, real people, dramatic lighting, and cinematic camera movements`,
    posterPrompt: `A bold vertical event poster for "${brief.eventName}". ${brief.vibe} aesthetic with dark background, neon blue and purple gradients. Large bold title text. Date: ${dateTimeLine}. Targeting ${brief.audience}. Call to action: ${brief.cta}. Premium, modern design.${brief.qrCodePath ? " Include a QR code in the bottom-right corner." : ""}`,
    voiceoverScript: `Get ready for ${brief.eventName}${dateStr !== "TBA" ? ` on ${dateStr}` : ""}. ${brief.description || `An incredible event for ${brief.audience}`}. This is your moment. ${brief.cta} — the future starts now.`,
    musicPrompt: `${brief.vibe} electronic background music, 120 BPM, building from ambient intro to driving beats, modern synth production, cinematic energy arc, suitable for a tech event promo trailer`,
    scenes: [
      {
        id: 1,
        title: "The Arrival",
        prompt: `Live-action cinematic shot: real people walking into a modern tech venue, excited energy, ${brief.vibe} atmosphere. Text overlay: "${brief.eventName}" and "${dateTimeLine}". Photorealistic, real humans, dramatic lighting. 9:16 vertical format.`,
        durationSec: 4,
      },
      {
        id: 2,
        title: "The Energy",
        prompt: `Live-action montage: real diverse ${brief.audience} collaborating at laptops, whiteboarding ideas, laughing and building together. Text overlay showing key event details. ${brief.vibe} lighting. Photorealistic, cinematic. 9:16 vertical format.`,
        durationSec: 5,
      },
      {
        id: 3,
        title: "The Call",
        prompt: `Live-action finale: real crowd cheering, hands raised, triumphant moment. Bold text overlay: "${brief.cta}". ${brief.qrCodePath ? "QR code visible on screen." : ""} ${brief.vibe} color grading. Photorealistic, cinematic. 9:16 vertical format.`,
        durationSec: 4,
      },
    ],
  };
}
