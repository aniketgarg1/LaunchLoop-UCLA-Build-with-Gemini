export type BriefInput = {
  eventName: string;
  audience: string;
  vibe: string;
  cta: string;
  description?: string;
  eventDate?: string;
  eventEndDate?: string;
  eventTime?: string;
  logoPath?: string;
  qrCodePath?: string;
};

export type ScenePlan = {
  id: number;
  title: string;
  prompt: string;
  durationSec: number;
};

export type CreativePlan = {
  title: string;
  tagline: string;
  visualStyle: string;
  posterPrompt: string;
  voiceoverScript: string;
  musicPrompt: string;
  scenes: ScenePlan[];
};

export type JobAssets = {
  posterUrl?: string;
  storyPosterUrl?: string;
  reelUrl?: string;
  reelMusicUrl?: string;
  voiceUrl?: string;
  musicUrl?: string;
  finalNarratedUrl?: string;
  finalMusicUrl?: string;
};

export type JobStatus =
  | "created"
  | "planning"
  | "poster"
  | "video"
  | "voice"
  | "stitching"
  | "done"
  | "error";

export type JobRecord = {
  jobId: string;
  brief: BriefInput;
  plan?: CreativePlan;
  assets?: JobAssets;
  status: JobStatus;
  error?: string;
};
