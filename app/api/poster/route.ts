import { NextRequest, NextResponse } from "next/server";
import { loadJob, updateJobAssets } from "@/lib/jobs";
import { generatePoster, generateStoryPoster } from "@/lib/nanoBanana";

export async function POST(req: NextRequest) {
  try {
    const { jobId } = (await req.json()) as { jobId: string };

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = await loadJob(jobId);

    if (!job.plan) {
      return NextResponse.json(
        { error: "Job has no creative plan yet" },
        { status: 400 }
      );
    }

    const [posterUrl, storyPosterUrl] = await Promise.all([
      generatePoster(
        job.plan.posterPrompt,
        job.brief.logoPath,
        job.brief.qrCodePath,
        jobId
      ),
      generateStoryPoster(
        job.plan.posterPrompt,
        job.brief.logoPath,
        job.brief.qrCodePath,
        jobId
      ),
    ]);

    await updateJobAssets(jobId, {
      assets: { posterUrl, storyPosterUrl },
    });

    return NextResponse.json({ posterUrl, storyPosterUrl });
  } catch (err) {
    console.error("Poster error:", err);
    return NextResponse.json(
      { error: "Failed to generate poster" },
      { status: 500 }
    );
  }
}
