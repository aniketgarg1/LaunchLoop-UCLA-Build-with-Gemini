import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";
import archiver from "archiver";
import { loadJob } from "@/lib/jobs";
import { getGeneratedDir } from "@/lib/files";

function archiveToBuffer(archive: archiver.Archiver): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });
}

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get("jobId");
    if (!jobId) {
      return new Response("Missing jobId", { status: 400 });
    }

    const job = await loadJob(jobId);
    const assets = job.assets || {};
    const genDir = getGeneratedDir();

    const finalVideo = assets.finalNarratedUrl || assets.reelUrl;

    const files: { url?: string; name: string }[] = [
      { url: assets.posterUrl, name: "poster" },
      { url: assets.storyPosterUrl, name: "poster-story" },
      { url: finalVideo, name: "promo-reel" },
      { url: assets.voiceUrl, name: "voiceover" },
      { url: assets.musicUrl, name: "background-music" },
    ];

    const archive = archiver("zip", { zlib: { level: 5 } });
    const bufferPromise = archiveToBuffer(archive);

    let fileCount = 0;
    for (const file of files) {
      if (!file.url) continue;
      const basename = path.basename(file.url);
      const ext = path.extname(basename);
      const filePath = path.join(genDir, basename);

      try {
        await fs.access(filePath);
        archive.file(filePath, { name: `${file.name}${ext}` });
        fileCount++;
      } catch {
        // skip missing files
      }
    }

    if (fileCount === 0) {
      archive.destroy();
      return new Response("No assets available to download", { status: 404 });
    }

    archive.finalize();
    const zipBuffer = await bufferPromise;

    const slug = (job.plan?.title || job.brief.eventName)
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
      .slice(0, 40);

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="launchloop-${slug}.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (err) {
    console.error("Download ZIP error:", err);
    return new Response("Failed to create ZIP", { status: 500 });
  }
}
