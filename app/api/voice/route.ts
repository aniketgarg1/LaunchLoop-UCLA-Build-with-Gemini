import { NextRequest, NextResponse } from "next/server";
import { loadJob, updateJobAssets } from "@/lib/jobs";
import { generateVoiceover } from "@/lib/tts";

export async function POST(req: NextRequest) {
  try {
    const { jobId } = (await req.json()) as { jobId: string };

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = await loadJob(jobId);

    if (!job.plan?.voiceoverScript) {
      return NextResponse.json(
        { error: "Job has no voiceover script yet" },
        { status: 400 }
      );
    }

    const voiceUrl = await generateVoiceover(job.plan.voiceoverScript, jobId, job.brief.vibe);

    await updateJobAssets(jobId, {
      status: "done",
      assets: { voiceUrl },
    });

    return NextResponse.json({ voiceUrl });
  } catch (err) {
    console.error("Voice error:", err);
    return NextResponse.json(
      { error: "Failed to generate voiceover" },
      { status: 500 }
    );
  }
}
