import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { loadJob, updateJobAssets } from "@/lib/jobs";
import { mergeVideoAudio, mergeVideoWithMixedAudio, overlayQrOnVideo } from "@/lib/veo";
import { getGeneratedDir, getGeneratedUrl, ensureDirs } from "@/lib/files";

export async function POST(req: NextRequest) {
  try {
    const { jobId } = (await req.json()) as { jobId: string };

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = await loadJob(jobId);
    const assets = job.assets || {};

    if (!assets.reelUrl) {
      return NextResponse.json(
        { error: "Base video must be generated first" },
        { status: 400 }
      );
    }

    await ensureDirs();
    const genDir = getGeneratedDir();

    const results: {
      finalNarratedUrl?: string;
      finalMusicUrl?: string;
      reelMusicUrl?: string;
    } = {};

    const isRealVideo = assets.reelUrl.endsWith(".mp4");
    let baseVideoFile = path.join(genDir, path.basename(assets.reelUrl));
    const hasVoice = assets.voiceUrl?.endsWith(".wav");
    const hasMusic = assets.musicUrl?.endsWith(".wav") || assets.musicUrl?.endsWith(".mp3");
    const voiceFile = hasVoice ? path.join(genDir, path.basename(assets.voiceUrl!)) : null;
    const musicFile = hasMusic ? path.join(genDir, path.basename(assets.musicUrl!)) : null;

    if (isRealVideo && job.brief.qrCodePath) {
      try {
        await fs.access(job.brief.qrCodePath);
        const qrOverlayPath = path.join(genDir, `reel-qr-${jobId}.mp4`);
        console.log("Overlaying real QR code onto video...");
        await overlayQrOnVideo(baseVideoFile, job.brief.qrCodePath, qrOverlayPath);
        baseVideoFile = qrOverlayPath;
        console.log("QR overlay complete");
      } catch (err) {
        console.warn("QR overlay failed, continuing without:", err);
      }
    }

    if (isRealVideo) {
      const narratedOut = path.join(genDir, `final-narrated-${jobId}.mp4`);
      const musicOut = path.join(genDir, `final-music-${jobId}.mp4`);

      const narratedP = (async () => {
        if (voiceFile && musicFile) {
          try {
            await mergeVideoWithMixedAudio(baseVideoFile, voiceFile, musicFile, narratedOut, 0.2);
            results.finalNarratedUrl = getGeneratedUrl(`final-narrated-${jobId}.mp4`);
          } catch (err) {
            console.error("FFmpeg narrated+music merge failed:", err);
            if (voiceFile) {
              try {
                await mergeVideoAudio(baseVideoFile, voiceFile, narratedOut);
                results.finalNarratedUrl = getGeneratedUrl(`final-narrated-${jobId}.mp4`);
              } catch (err2) {
                console.error("FFmpeg voice-only fallback failed:", err2);
              }
            }
          }
        } else if (voiceFile) {
          try {
            await mergeVideoAudio(baseVideoFile, voiceFile, narratedOut);
            results.finalNarratedUrl = getGeneratedUrl(`final-narrated-${jobId}.mp4`);
          } catch (err) {
            console.error("FFmpeg narrated merge failed:", err);
          }
        }
      })();

      const musicP = (async () => {
        if (musicFile) {
          try {
            await mergeVideoAudio(baseVideoFile, musicFile, musicOut);
            results.finalMusicUrl = getGeneratedUrl(`final-music-${jobId}.mp4`);
          } catch (err) {
            console.error("FFmpeg music merge failed:", err);
          }
        }
      })();

      await Promise.all([narratedP, musicP]);
    }

    if (!results.finalNarratedUrl) {
      results.finalNarratedUrl = assets.reelUrl;
    }
    if (!results.finalMusicUrl) {
      results.reelMusicUrl = assets.reelUrl;
      results.finalMusicUrl = assets.reelUrl;
    }

    await updateJobAssets(jobId, {
      status: "done",
      assets: results,
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error("Stitch error:", err);
    return NextResponse.json(
      { error: "Failed to stitch video and audio" },
      { status: 500 }
    );
  }
}
