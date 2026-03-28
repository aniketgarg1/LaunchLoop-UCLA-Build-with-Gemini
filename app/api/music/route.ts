import { NextRequest, NextResponse } from "next/server";
import { loadJob, updateJobAssets } from "@/lib/jobs";
import { generateMusic } from "@/lib/lyria";

// Stretch goal — music generation via Lyria

export async function POST(req: NextRequest) {
  try {
    const { jobId } = (await req.json()) as { jobId: string };

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = await loadJob(jobId);

    if (!job.plan?.musicPrompt) {
      return NextResponse.json(
        { error: "Job has no music prompt yet" },
        { status: 400 }
      );
    }

    const musicUrl = await generateMusic(job.plan.musicPrompt, jobId);

    await updateJobAssets(jobId, {
      assets: { musicUrl },
    });

    return NextResponse.json({ musicUrl });
  } catch (err) {
    console.error("Music error:", err);
    return NextResponse.json(
      { error: "Failed to generate music" },
      { status: 500 }
    );
  }
}
