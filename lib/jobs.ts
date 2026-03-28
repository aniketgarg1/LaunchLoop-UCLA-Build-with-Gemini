import fs from "fs/promises";
import path from "path";
import type { JobRecord } from "./types";

const JOBS_DIR = path.join(process.cwd(), "tmp", "jobs");

async function ensureJobsDir() {
  await fs.mkdir(JOBS_DIR, { recursive: true });
}

function jobPath(jobId: string): string {
  return path.join(JOBS_DIR, `${jobId}.json`);
}

export async function saveJob(job: JobRecord): Promise<void> {
  await ensureJobsDir();
  await fs.writeFile(jobPath(job.jobId), JSON.stringify(job, null, 2));
}

export async function loadJob(jobId: string): Promise<JobRecord> {
  const data = await fs.readFile(jobPath(jobId), "utf-8");
  return JSON.parse(data) as JobRecord;
}

export async function updateJobAssets(
  jobId: string,
  updates: Partial<JobRecord>
): Promise<JobRecord> {
  const job = await loadJob(jobId);
  const updated = { ...job, ...updates };
  if (updates.assets) {
    updated.assets = { ...job.assets, ...updates.assets };
  }
  await saveJob(updated);
  return updated;
}
