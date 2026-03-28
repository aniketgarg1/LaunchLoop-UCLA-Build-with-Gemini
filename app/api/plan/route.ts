import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { BriefInput, JobRecord } from "@/lib/types";
import { saveJob, loadJob } from "@/lib/jobs";
import { generateCreativePlan } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BriefInput;

    if (!body.eventName || !body.audience || !body.vibe || !body.cta) {
      return NextResponse.json(
        { error: "Missing required fields: eventName, audience, vibe, cta" },
        { status: 400 }
      );
    }

    const jobId = uuidv4().slice(0, 12);

    const job: JobRecord = {
      jobId,
      brief: body,
      status: "planning",
    };
    await saveJob(job);

    const plan = await generateCreativePlan(body);

    job.plan = plan;
    job.status = "poster";
    await saveJob(job);

    return NextResponse.json({ jobId, plan });
  } catch (err) {
    console.error("Plan error:", err);
    return NextResponse.json(
      { error: "Failed to generate creative plan" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = await loadJob(jobId);
    return NextResponse.json({
      jobId: job.jobId,
      plan: job.plan,
      assets: job.assets,
      status: job.status,
    });
  } catch {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
}
