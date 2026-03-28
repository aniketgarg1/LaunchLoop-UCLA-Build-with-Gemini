export type BriefInput = {
  eventName: string;
  audience: string;
  vibe: string;
  cta: string;
  description?: string;
  eventDate?: string;
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
  reelUrl?: string;
  voiceUrl?: string;
  musicUrl?: string;
};

export type JobStatus =
  | "created"
  | "planning"
  | "poster"
  | "video"
  | "voice"
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
