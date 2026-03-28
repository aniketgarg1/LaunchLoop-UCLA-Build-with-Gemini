import { NextRequest, NextResponse } from "next/server";
import { loadJob, updateJobAssets } from "@/lib/jobs";
import { generateReel } from "@/lib/veo";

export async function POST(req: NextRequest) {
  try {
    const { jobId } = (await req.json()) as { jobId: string };

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = await loadJob(jobId);

    if (!job.plan?.scenes) {
      return NextResponse.json(
        { error: "Job has no scene plan yet" },
        { status: 400 }
      );
    }

    const reelUrl = await generateReel(job.plan.scenes, jobId, {
      eventName: job.brief.eventName,
      cta: job.brief.cta,
      hasQr: !!job.brief.qrCodePath,
    });

    await updateJobAssets(jobId, {
      status: "voice",
      assets: { reelUrl },
    });

    return NextResponse.json({ reelUrl });
  } catch (err) {
    console.error("Video error:", err);
    return NextResponse.json(
      { error: "Failed to generate video reel" },
      { status: 500 }
    );
  }
}
