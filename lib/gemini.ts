import { GoogleGenAI } from "@google/genai";
import type { BriefInput, CreativePlan } from "./types";
import { buildPlannerPrompt } from "./prompts";
import { delay, buildDateLine } from "./utils";

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
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const plan = JSON.parse(jsonMatch[0]) as CreativePlan;

    if (!plan.title || !plan.scenes || plan.scenes.length < 1) {
      throw new Error("Invalid plan structure from Gemini");
    }

    return plan;
  } catch (err) {
    console.error("Gemini API error, falling back to mock:", err);
    return generateMockPlan(brief);
  }
}

function generateMockPlan(brief: BriefInput): CreativePlan {
  const dateLine = buildDateLine(brief);

  return {
    title: brief.eventName,
    tagline: `Where ${brief.vibe} meets innovation`,
    visualStyle: `Live-action photorealistic cinematography with ${brief.vibe} energy, real people, dramatic lighting, and cinematic camera movements`,
    posterPrompt: `A bold SQUARE 1080x1080 event poster for "${brief.eventName}". ${brief.vibe} aesthetic with dark background, neon blue and purple gradients. Large bold title text, modern typography. Date prominently displayed: "${dateLine}". Targeting ${brief.audience}. Call to action: "${brief.cta}". Premium graphic design, professional layout. Square 1:1 format. Do NOT include any QR code in the design.`,
    voiceoverScript: `Get ready for ${brief.eventName}${dateLine !== "TBA" ? `, ${dateLine}` : ""}. ${brief.description || `The event ${brief.audience} have been waiting for`}. ${brief.cta} — don't miss out.`,
    musicPrompt: `${brief.vibe} cinematic background music, 16 seconds, 120 BPM. Punchy intro building to climax with modern electronic production. Mixed behind voiceover.`,
    scenes: [
      {
        id: 1,
        title: "The Hook",
        prompt: `Live-action cinematic opening: dramatic establishing shot, ${brief.vibe} energy. Bold text overlay: "${brief.eventName}" and "${dateLine}". Photorealistic, cinematic. 9:16 vertical. 8 seconds.`,
        durationSec: 8,
      },
      {
        id: 2,
        title: "The Call",
        prompt: `Live-action epic finale: real ${brief.audience} in action, celebrating, bold CTA text overlay: "${brief.cta}" and "${dateLine}". Photorealistic, cinematic. 9:16 vertical. 8 seconds.`,
        durationSec: 8,
      },
    ],
  };
}
